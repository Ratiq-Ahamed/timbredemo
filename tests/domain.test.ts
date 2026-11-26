import { describe, it, expect } from "vitest";
import { createSeed } from "../lib/demo/seed";
import { runAction } from "../lib/demo/actions";
import {
  assetConflict,
  assetStatus,
  assignmentPaid,
  balance,
  crewConflict,
  crewPayable,
  downloadEligible,
  galleryAccess,
  margin,
  openIssue,
  overlaps,
  plannedCost,
  quoteTotal,
  readiness,
} from "../lib/demo/selectors";
import type { Command, DemoState, Input } from "../lib/demo/types";
import { isPersistedState } from "../lib/demo/validation";
const apply = (s: DemoState, c: Command, p: Input = {}) => {
  const r = runAction(s, c, p);
  if (!r.ok) throw new Error(r.error);
  return r.state;
};
describe("Connected synthetic dataset", () => {
  it("meets seed counts and exact anchor finances", () => {
    const s = createSeed();
    const b = s.bookings[0];
    expect(s.leads.length).toBeGreaterThanOrEqual(12);
    expect(s.assets).toHaveLength(24);
    expect(s.sessions.length).toBeGreaterThanOrEqual(12);
    expect(s.tasks.length).toBeGreaterThanOrEqual(15);
    expect(balance(s, b)).toBe(10000000);
    expect(plannedCost(b)).toBe(8250000);
    expect(b.contract - plannedCost(b)).toBe(6750000);
    expect(margin(b.contract, plannedCost(b))).toBe(45);
    expect(margin(0, 0)).toBeNull();
  });
  it("preserves original state after successful and failed actions", () => {
    const s = createSeed();
    const snapshot = structuredClone(s);
    apply(s, "collection.add", {
      bookingId: "EVT-0124",
      amount: 2500000,
      reference: "TEST",
    });
    expect(s).toEqual(snapshot);
    expect(runAction(s, "gear.issue", { assetId: "NOPE" }).ok).toBe(false);
    expect(s).toEqual(snapshot);
  });
});
describe("Sales and quote confirmation", () => {
  it("creates enquiry, logs follow-up, quotes, accepts and converts once", () => {
    let s = createSeed();
    s = apply(s, "lead.create", {
      name: "Test Pair",
      email: "test@example.test",
      service: "Wedding",
      budget: 15000000,
    });
    const lead = s.leads[0];
    s = apply(s, "lead.activity", {
      id: lead.id,
      note: "Discovery call",
      followUp: "2026-11-25",
    });
    s = apply(s, "quote.create", { leadId: lead.id });
    const q = s.quotes[0];
    s = apply(s, "quote.save", {
      id: q.id,
      discount: 500000,
      advance: 5000000,
    });
    expect(quoteTotal(s.quotes[0]).total).toBe(14500000);
    s = apply(s, "quote.status", { id: q.id, status: "Sent" });
    s = apply(s, "quote.status", { id: q.id, status: "Accepted" });
    s = apply(s, "quote.convert", { id: q.id });
    const b = s.bookings[0];
    expect(b.status).toBe("Hold");
    expect(runAction(s, "quote.convert", { id: q.id }).ok).toBe(false);
    expect(runAction(s, "booking.confirm", { id: b.id }).ok).toBe(false);
    s = apply(s, "collection.add", {
      bookingId: b.id,
      amount: 5000000,
      reference: "ADV-TEST",
    });
    s = apply(s, "booking.confirm", { id: b.id });
    expect(s.bookings[0].status).toBe("Confirmed");
    expect(s.leads[0].activities[0]).toContain("Discovery call");
    expect(runAction(s, "quote.save", { id: q.id, discount: 0 }).ok).toBe(
      false,
    );
  });
  it("deduplicates external IDs and flags repeat contacts", () => {
    let s = createSeed();
    s = apply(s, "meta.receive", { externalId: "external-1" });
    expect(s.leads).toHaveLength(15);
    expect(s.leads[0].campaignId).toBe("CMP-001");
    expect(runAction(s, "meta.receive", { externalId: "external-1" }).ok).toBe(
      false,
    );
    expect(
      runAction(s, "lead.create", {
        name: "Duplicate",
        email: s.leads[1].email,
      }).ok,
    ).toBe(false);
    expect(
      runAction(s, "lead.create", {
        name: "Repeat",
        email: s.leads[1].email,
        allowDuplicate: true,
      }).ok,
    ).toBe(true);
  });
  it("calculates optional items, tax and discount with exact rounding", () => {
    const q = createSeed().quotes[0];
    q.items.push({
      id: "extra",
      label: "Extra",
      quantity: 2,
      rate: 50000,
      optional: true,
      included: false,
    });
    q.discount = 100000;
    q.taxPercent = 18;
    expect(quoteTotal(q)).toEqual({
      subtotal: 15000000,
      net: 14900000,
      tax: 2682000,
      total: 17582000,
    });
    q.items[1].included = true;
    expect(quoteTotal(q).subtotal).toBe(15100000);
  });
});
describe("Time and resource rules", () => {
  it("uses half-open intervals and configurable buffers", () => {
    expect(
      overlaps(
        "2026-12-06T06:00+05:30",
        "2026-12-06T08:00+05:30",
        "2026-12-06T08:00+05:30",
        "2026-12-06T09:00+05:30",
      ),
    ).toBe(false);
    expect(
      overlaps(
        "2026-12-06T06:00+05:30",
        "2026-12-06T08:00+05:30",
        "2026-12-06T08:15+05:30",
        "2026-12-06T09:00+05:30",
        30,
      ),
    ).toBe(true);
  });
  it("blocks seeded camera and crew conflicts and accepts alternatives", () => {
    let s = createSeed();
    expect(crewConflict(s, "F-003", "S-003")).toContain("Already assigned");
    expect(assetConflict(s, "CAM-002", "S-003")).toContain("Reserved");
    expect(crewConflict(s, "F-004", "S-003")).toBeNull();
    expect(assetConflict(s, "CAM-001", "S-003")).toBeNull();
    expect(
      runAction(s, "assignment.create", {
        sessionId: "S-003",
        crewId: "F-003",
        role: "Photographer",
        rate: 800000,
      }).ok,
    ).toBe(false);
    s = apply(s, "assignment.create", {
      sessionId: "S-003",
      crewId: "F-004",
      role: "Photographer",
      rate: 800000,
    });
    s = apply(s, "reservation.create", {
      sessionId: "S-003",
      assetId: "CAM-001",
    });
    expect(s.reservations.at(-1)?.assetId).toBe("CAM-001");
  });
  it("decline reopens staffing without changing reservations", () => {
    let s = createSeed();
    const before = readiness(s, "S-003").crew;
    s = apply(s, "assignment.respond", { id: "A-008", status: "Declined" });
    expect(readiness(s, "S-003").crew).toBe(before - 1);
    expect(s.reservations).toEqual(createSeed().reservations);
  });
  it("reschedule conflict fails atomically", () => {
    const s = createSeed();
    expect(
      runAction(s, "booking.reschedule", {
        sessionId: "S-001",
        start: "2026-12-06T06:00+05:30",
        end: "2026-12-06T14:00+05:30",
      }).ok,
    ).toBe(false);
    expect(s.sessions[0].start).toContain("2026-12-02");
  });
});
describe("Equipment custody", () => {
  it("reserves, issues, acknowledges and quarantines returned damage", () => {
    let s = createSeed();
    s = apply(s, "reservation.create", {
      assetId: "CAM-001",
      sessionId: "S-014",
    });
    s = apply(s, "gear.issue", {
      assetId: "CAM-001",
      sessionId: "S-014",
      crewId: "F-001",
      dueBack: "2026-11-24T20:00+05:30",
      note: "Good",
    });
    const issue = s.issues.at(-1)!;
    expect(assetStatus(s, "CAM-001")).toBe("Issued");
    expect(
      runAction(s, "gear.issue", {
        assetId: "CAM-001",
        sessionId: "S-014",
        crewId: "F-001",
        dueBack: "2026-11-24T20:00+05:30",
        note: "Good",
      }).ok,
    ).toBe(false);
    s.identity.role = "freelancer";
    s = apply(s, "gear.acknowledge", { id: issue.id });
    s = apply(s, "gear.requestReturn", { id: issue.id });
    expect(s.issues.at(-1)?.acknowledged).toBe(true);
    s.identity.role = "owner";
    s = apply(s, "gear.return", {
      id: issue.id,
      condition: "Damaged",
      note: "Screen scratched",
    });
    expect(assetStatus(s, "CAM-001")).toBe("Under inspection");
    expect(openIssue(s, "CAM-001")).toBeUndefined();
    expect(openIssue(s, "LEN-006")).toBeDefined();
    expect(assetConflict(s, "CAM-001", "S-003")).toContain("inspection");
    expect(s.movements[0].description).toContain("Damaged");
  });
  it("missing gear remains with custodian and blocks reservation", () => {
    let s = createSeed();
    s = apply(s, "gear.return", {
      id: "I-001",
      condition: "Missing",
      note: "Awaiting crew investigation",
    });
    expect(openIssue(s, "CAM-005")?.crewId).toBe("F-005");
    expect(assetConflict(s, "CAM-005", "S-003")).not.toBeNull();
  });
  it("future pickup is blocked and cancellation preserves open custody", () => {
    let s = createSeed();
    expect(
      runAction(s, "gear.issue", {
        assetId: "CAM-001",
        sessionId: "S-003",
        crewId: "F-001",
        dueBack: "2026-12-07T20:00+05:30",
        note: "Good",
      }).ok,
    ).toBe(false);
    s = apply(s, "booking.cancel", {
      id: "EVT-0122",
      reason: "Customer request",
    });
    expect(openIssue(s, "LEN-006")).toBeDefined();
    expect(s.bookings.find((b) => b.id === "EVT-0122")?.refundReview).toBe(
      true,
    );
  });
});
describe("Production, selections and role scoping", () => {
  it("requires review, tracks changes, and blocks premature delivery", () => {
    let s = createSeed();
    expect(
      runAction(s, "task.update", { id: "T-001", status: "Done" }).ok,
    ).toBe(false);
    s = apply(s, "task.update", { id: "T-001", status: "Review" });
    expect(
      runAction(s, "task.update", { id: "T-001", status: "Changes requested" })
        .ok,
    ).toBe(false);
    s = apply(s, "task.update", {
      id: "T-001",
      status: "Changes requested",
      note: "Match skin tones",
    });
    expect(s.tasks[0].version).toBe(2);
    s = apply(s, "task.update", { id: "T-001", status: "Review" });
    s = apply(s, "task.update", { id: "T-001", status: "Approved" });
    expect(
      runAction(s, "deliverable.update", { id: "D-2-photo", status: "Ready" })
        .ok,
    ).toBe(false);
  });
  it("submits six stable IDs and freezes selection until reopened", () => {
    let s = createSeed();
    s.identity.role = "client";
    const g = s.galleries[0];
    expect(runAction(s, "gallery.submit", { id: g.id }).ok).toBe(false);
    for (const m of g.media.slice(0, 6))
      s = apply(s, "gallery.select", { id: g.id, mediaId: m.id });
    expect(
      runAction(s, "gallery.select", { id: g.id, mediaId: g.media[6].id }).ok,
    ).toBe(false);
    s = apply(s, "gallery.submit", { id: g.id });
    expect(s.galleries[0].selected).toEqual(
      g.media.slice(0, 6).map((m) => m.id),
    );
    expect(
      runAction(s, "gallery.select", { id: g.id, mediaId: g.media[0].id }).ok,
    ).toBe(false);
    s.identity.role = "owner";
    s = apply(s, "gallery.reopen", { id: g.id });
    s.identity.role = "client";
    expect(
      runAction(s, "gallery.select", { id: g.id, mediaId: g.media[0].id }).ok,
    ).toBe(true);
  });
  it("enforces wrong-customer, expiry, draft, revoke and payment download rules", () => {
    const s = createSeed();
    s.identity.role = "client";
    expect(galleryAccess(s, s.galleries[1])).toContain("another customer");
    expect(downloadEligible(s, s.galleries[0])).toBe(true);
    s.galleries[0].expiresAt = "2026-11-23";
    expect(galleryAccess(s, s.galleries[0])).toContain("expired");
    s.galleries[0].expiresAt = "2026-12-21";
    s.galleries[0].status = "Revoked";
    expect(
      runAction(s, "gallery.favorite", { id: "GAL-0118", mediaId: "PHOTO-001" })
        .ok,
    ).toBe(false);
    s.galleries[0].status = "Published";
    s.bookings[1].contract += 100000;
    expect(downloadEligible(s, s.galleries[0])).toBe(false);
  });
  it("prevents freelance and customer actions on other people’s records", () => {
    const s = createSeed();
    s.identity.role = "freelancer";
    expect(
      runAction(s, "assignment.respond", { id: "A-002", status: "Declined" })
        .ok,
    ).toBe(false);
    expect(
      runAction(s, "collection.add", {
        bookingId: "EVT-0124",
        amount: 1,
        reference: "BAD",
      }).ok,
    ).toBe(false);
    expect(
      runAction(s, "gallery.select", { id: "GAL-0118", mediaId: "PHOTO-001" })
        .ok,
    ).toBe(false);
    s.identity.role = "client";
    expect(
      runAction(s, "gear.return", {
        id: "I-001",
        condition: "Good",
        note: "BAD",
      }).ok,
    ).toBe(false);
  });
  it("upload failure prevents publishing until retry succeeds", () => {
    let s = createSeed();
    s = apply(s, "gallery.upload", { id: "GAL-0120" });
    expect(
      runAction(s, "gallery.update", { id: "GAL-0120", status: "Published" })
        .ok,
    ).toBe(false);
    const media = s.galleries[1].media.at(-1)!;
    s = apply(s, "gallery.retry", { id: "GAL-0120", mediaId: media.id });
    s = apply(s, "gallery.update", { id: "GAL-0120", status: "Published" });
    expect(s.galleries[1].status).toBe("Published");
  });
});
describe("Financial history", () => {
  it("records bounded refunds, rejects duplicate payouts, and retains original records", () => {
    let s = createSeed();
    s = apply(s, "collection.refund", {
      bookingId: "EVT-0124",
      amount: 100000,
      reference: "REF-TEST",
    });
    expect(balance(s, s.bookings[0])).toBe(10100000);
    expect(
      runAction(s, "collection.refund", {
        bookingId: "EVT-0124",
        amount: 5000001,
        reference: "EXCESS",
      }).ok,
    ).toBe(false);
    s = apply(s, "payout.add", {
      assignmentId: "A-003",
      amount: 100000,
      reference: "PAYOUT-UNIQUE",
    });
    expect(
      runAction(s, "payout.add", {
        assignmentId: "A-003",
        amount: 100000,
        reference: "PAYOUT-UNIQUE",
      }).ok,
    ).toBe(false);
  });
  it("keeps original accepted quote values when a linked revision is accepted", () => {
    let s = createSeed();
    s = apply(s, "quote.create", { sourceId: "Q-0124", leadId: "L-013" });
    const revision = s.quotes[0];
    s = apply(s, "quote.save", { id: revision.id, discount: 100000 });
    s = apply(s, "quote.status", { id: revision.id, status: "Sent" });
    s = apply(s, "quote.status", { id: revision.id, status: "Accepted" });
    expect(s.bookings[0].contract).toBe(14900000);
    expect(s.quotes.find((q) => q.id === "Q-0124")?.items[0].rate).toBe(
      15000000,
    );
    expect(s.bookings).toHaveLength(8);
    expect(runAction(s, "quote.convert", { id: revision.id }).ok).toBe(false);
  });
  it("part collection and reversal restore exact balances without deleting history", () => {
    let s = createSeed();
    s = apply(s, "collection.add", {
      bookingId: "EVT-0124",
      amount: 2500000,
      reference: "PART-TEST",
    });
    const t = s.transactions[0];
    expect(balance(s, s.bookings[0])).toBe(7500000);
    s = apply(s, "transaction.reverse", {
      id: t.id,
      reason: "Incorrect reference",
    });
    expect(balance(s, s.bookings[0])).toBe(10000000);
    expect(s.transactions.find((x) => x.id === t.id)).toBeDefined();
    expect(s.transactions[0].reversesId).toBe(t.id);
    expect(
      runAction(s, "transaction.reverse", { id: t.id, reason: "Again" }).ok,
    ).toBe(false);
  });
  it("rejects overpayment, zero amounts, duplicates and excessive payouts", () => {
    let s = createSeed();
    expect(
      runAction(s, "collection.add", {
        bookingId: "EVT-0124",
        amount: 10000001,
        reference: "TOO-MUCH",
      }).ok,
    ).toBe(false);
    expect(
      runAction(s, "collection.add", {
        bookingId: "EVT-0124",
        amount: 0,
        reference: "ZERO",
      }).ok,
    ).toBe(false);
    s = apply(s, "payout.add", {
      assignmentId: "A-003",
      amount: 300000,
      reference: "CREW-PART",
    });
    expect(assignmentPaid(s, s.assignments[2])).toBe(300000);
    expect(
      runAction(s, "payout.add", {
        assignmentId: "A-003",
        amount: 600000,
        reference: "CREW-EXCESS",
      }).ok,
    ).toBe(false);
    expect(crewPayable(s, "F-001")).toBeGreaterThan(0);
  });
});
describe("Hydration, timezone and access boundaries", () => {
  it("accepts seed persistence and rejects missing arrays or invalid gallery media", () => {
    const s = createSeed();
    expect(isPersistedState(s)).toBe(true);
    expect(isPersistedState({ ...s, transactions: null })).toBe(false);
    expect(
      isPersistedState({
        ...s,
        galleries: [{ ...s.galleries[0], media: null }],
      }),
    ).toBe(false);
    expect(isPersistedState(null)).toBe(false);
  });
  it("interprets datetime-local form values as India time independently of host timezone", () => {
    const s = apply(createSeed(), "session.create", {
      bookingId: "EVT-0124",
      name: "Test session",
      start: "2026-12-10T06:00",
      end: "2026-12-10T10:00",
      venue: "Sample",
    });
    expect(s.sessions.at(-1)?.start).toBe("2026-12-10T00:30:00.000Z");
    expect(s.sessions.at(-1)?.end).toBe("2026-12-10T04:30:00.000Z");
  });
  it("customer cannot complete a freelancer’s shoot and acceptance cannot self-approve payout", () => {
    let s = createSeed();
    s.identity.role = "client";
    expect(runAction(s, "session.complete", { id: "S-005" }).ok).toBe(false);
    s.identity.role = "freelancer";
    s = apply(s, "assignment.respond", { id: "A-001", status: "Accepted" });
    expect(s.assignments[0].approved).toBe(false);
  });
});
