import type {
  ActionResult,
  Command,
  DemoState,
  Input,
  QuoteItem,
} from "./types";
import {
  NOW,
  TODAY,
  assetConflict,
  assignmentPaid,
  balance,
  collected,
  crewConflict,
  galleryAccess,
  openIssue,
  quoteTotal,
  reversed,
} from "./selectors";
import { SERVICES, STAGES, TASK_STATES } from "./seed";
import {
  QUOTE_TRANSITIONS,
  TASK_TRANSITIONS,
  DELIVERABLE_TRANSITIONS,
} from "./statuses";
const text = (p: Input, key: string, fallback = "") =>
  String(p[key] ?? fallback).trim();
const number = (p: Input, key: string, fallback = 0) => {
  const n = Number(p[key] ?? fallback);
  if (!Number.isFinite(n)) throw new Error(`${key} must be a number`);
  return n;
};
const requireValue = (value: string, label: string) => {
  if (!value) throw new Error(`${label} is required`);
  return value;
};
const positive = (n: number) => {
  if (!Number.isSafeInteger(n) || n <= 0)
    throw new Error("Amount must be a positive whole number of paise");
  return n;
};
const validDate = (v: string) => {
  const value = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(v)
    ? `${v}+05:30`
    : v;
  if (!value || !Number.isFinite(Date.parse(value)))
    throw new Error("A valid date is required");
  return value.length === 10 ? value : new Date(value).toISOString();
};
const find = <T extends { id: string }>(
  items: T[],
  id: string,
  label: string,
): T => {
  const item = items.find((i) => i.id === id);
  if (!item) throw new Error(`${label} not found`);
  return item;
};
export function runAction(
  original: DemoState,
  command: Command,
  p: Input = {},
): ActionResult {
  try {
    const s = structuredClone(original);
    const id = (prefix: string) => `${prefix}-${++s.sequence}`;
    const actor =
      s.identity.role === "owner"
        ? "Studio owner"
        : s.identity.role === "freelancer"
          ? find(s.crew, s.identity.crewId, "Crew").name
          : find(s.customers, s.identity.customerId, "Customer").name;
    const owner = () => {
      if (s.identity.role !== "owner")
        throw new Error("This action requires the owner demo role");
    };
    const ownCrew = (crewId: string) => {
      if (
        s.identity.role !== "owner" &&
        (s.identity.role !== "freelancer" || crewId !== s.identity.crewId)
      )
        throw new Error("You can only change your own assigned records");
    };
    const ownGallery = (galleryId: string) => {
      const g = find(s.galleries, galleryId, "Gallery");
      if (s.identity.role === "freelancer")
        throw new Error("Gallery access is unavailable for this role");
      const reason = galleryAccess(s, g);
      if (reason) throw new Error(reason);
      return g;
    };
    let entityId = text(p, "id");
    let message = "Changes saved";
    if (command === "identity.switch") {
      const role = text(p, "role");
      if (!["owner", "freelancer", "client"].includes(role))
        throw new Error("Unknown demo role");
      s.identity.role = role as DemoState["identity"]["role"];
      if (p.crewId)
        s.identity.crewId = find(s.crew, text(p, "crewId"), "Crew").id;
      if (p.customerId)
        s.identity.customerId = find(
          s.customers,
          text(p, "customerId"),
          "Customer",
        ).id;
      return { ok: true, state: s, message: "Demo workspace changed" };
    }
    if (command === "notification.read") {
      owner();
      if (!s.readNotifications.includes(entityId))
        s.readNotifications.push(entityId);
      return { ok: true, state: s, message: "Notification marked read" };
    }
    if (["lead.create", "lead.import", "meta.receive"].includes(command)) {
      owner();
      const externalId = text(p, "externalId", "meta-demo-2026-001");
      if (
        command === "meta.receive" &&
        s.leads.some((l) => l.externalId === externalId)
      )
        throw new Error(
          "This external lead ID was already received. No duplicate was created.",
        );
      const name =
        command === "meta.receive"
          ? "Aditi & Roshan"
          : requireValue(text(p, "name"), "Name");
      const email = text(p, "email");
      const phone = text(p, "phone");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error("Enter a valid email address");
      const norm = (v: string) => v.toLowerCase().replace(/[\s()+-]/g, "");
      if (
        command !== "meta.receive" &&
        !p.allowDuplicate &&
        s.leads.some(
          (l) =>
            (email && norm(l.email) === norm(email)) ||
            (phone && !phone.includes("•") && norm(l.phone) === norm(phone)),
        )
      )
        throw new Error(
          "Possible duplicate contact. Review the existing lead or confirm this is a repeat event.",
        );
      const service = text(p, "service", "Wedding");
      if (!SERVICES.includes(service))
        throw new Error("Choose a valid service");
      const budget = number(p, "budget", 15000000);
      if (budget < 0) throw new Error("Budget cannot be negative");
      const eventDate = text(p, "eventDate");
      if (eventDate) validDate(eventDate);
      entityId = id("L");
      s.leads.unshift({
        id: entityId,
        name,
        email: email || `${entityId.toLowerCase()}@example.test`,
        phone: phone || "+91 ••••• ••000",
        service,
        eventDate,
        location: text(p, "location", "Chennai"),
        source:
          command === "meta.receive" ? "Meta" : text(p, "source", "Manual"),
        ...(command === "meta.receive"
          ? { campaignId: "CMP-001", externalId }
          : {}),
        stage: "New",
        budget,
        owner: text(p, "owner", "Studio owner"),
        followUp: text(p, "followUp", TODAY),
        activities: [`Enquiry received · ${TODAY}`],
      });
      message =
        command === "meta.receive"
          ? "Sample Meta lead received"
          : "Lead created";
    } else if (command === "lead.update" || command === "lead.activity") {
      owner();
      const l = find(s.leads, entityId, "Lead");
      if (command === "lead.activity") {
        const note = requireValue(text(p, "note"), "Activity");
        l.activities.unshift(`${note} · ${TODAY}`);
        if (p.followUp) l.followUp = validDate(text(p, "followUp"));
        message = "Follow-up logged";
      } else {
        const stage = text(p, "stage", l.stage);
        if (!STAGES.includes(stage)) throw new Error("Invalid lead stage");
        if (stage === "Lost")
          l.lossReason = requireValue(text(p, "reason"), "Loss reason");
        l.stage = stage;
        if (p.followUp) l.followUp = validDate(text(p, "followUp"));
        l.activities.unshift(`Stage changed to ${stage} · ${TODAY}`);
      }
    } else if (command === "campaign.spend") {
      owner();
      const spend = number(p, "spend");
      if (spend < 0 || !Number.isSafeInteger(spend))
        throw new Error("Spend must be a nonnegative amount");
      find(s.campaigns, entityId, "Campaign").spend = spend;
    } else if (command === "quote.create") {
      owner();
      const source = p.sourceId
        ? find(s.quotes, text(p, "sourceId"), "Quote")
        : s.quotes
            .filter((q) => q.leadId === text(p, "leadId"))
            .sort((a, b) => b.version - a.version)[0] || null;
      const l = find(s.leads, text(p, "leadId", source?.leadId), "Lead");
      let c = s.customers.find(
        (c) =>
          c.email.toLowerCase() === l.email.toLowerCase() || c.name === l.name,
      );
      if (!c) {
        c = {
          id: id("C"),
          name: l.name,
          email: l.email,
          phone: l.phone,
          location: l.location,
          notes: "",
        };
        s.customers.push(c);
      }
      entityId = id("Q");
      const items = source
        ? structuredClone(source.items)
        : [
            {
              id: id("QI"),
              label: "Signature wedding collection",
              quantity: 1,
              rate: l.budget || 15000000,
              optional: false,
              included: true,
            },
          ];
      s.quotes.unshift({
        id: entityId,
        leadId: l.id,
        customerId: c.id,
        name: `${l.name} · ${l.service}`,
        version: source
          ? Math.max(
              ...s.quotes
                .filter((q) => q.leadId === l.id)
                .map((q) => q.version),
            ) + 1
          : 1,
        status: "Draft",
        items,
        discount: source?.discount || 0,
        taxPercent: source?.taxPercent || 0,
        advance: source?.advance ?? Math.round(items[0].rate / 3),
        notes:
          source?.notes || "Delivery scope and payment milestones as agreed.",
        ...(source?.bookingId ? { bookingId: source.bookingId } : {}),
      });
      if (!source?.bookingId) l.stage = "Quoted";
      message = "Draft quote created";
    } else if (command === "quote.save") {
      owner();
      const q = find(s.quotes, entityId, "Quote");
      if (q.status !== "Draft")
        throw new Error(
          "Only draft revisions can be edited. Create a new revision.",
        );
      if (p.items) {
        const raw: unknown = JSON.parse(text(p, "items"));
        if (!Array.isArray(raw) || !raw.length)
          throw new Error("Add at least one quote item");
        q.items = raw.map((v: QuoteItem) => {
          if (
            !v.label ||
            !Number.isSafeInteger(v.quantity) ||
            v.quantity < 1 ||
            !Number.isSafeInteger(v.rate) ||
            v.rate < 0
          )
            throw new Error(
              "Items need a description, positive whole quantity, and nonnegative rate",
            );
          return {
            id: v.id || id("QI"),
            label: v.label,
            quantity: v.quantity,
            rate: v.rate,
            optional: Boolean(v.optional),
            included: Boolean(v.included),
          };
        });
      }
      q.discount = number(p, "discount", q.discount);
      q.taxPercent = number(p, "taxPercent", q.taxPercent);
      q.advance = number(p, "advance", q.advance);
      q.notes = text(p, "notes", q.notes);
      const totals = quoteTotal(q);
      if (
        q.discount < 0 ||
        !Number.isSafeInteger(q.discount) ||
        !Number.isSafeInteger(q.advance) ||
        !Number.isSafeInteger(totals.total) ||
        totals.net < 0 ||
        q.taxPercent < 0 ||
        q.taxPercent > 100 ||
        q.advance < 0 ||
        q.advance > totals.total
      )
        throw new Error(
          "Check discount, tax, and advance against the quote total",
        );
    } else if (command === "quote.status") {
      const q = find(s.quotes, entityId, "Quote");
      const status = text(p, "status");
      if (
        s.identity.role !== "owner" &&
        !(
          s.identity.role === "client" &&
          q.customerId === s.identity.customerId &&
          ["Accepted", "Declined"].includes(status)
        )
      )
        throw new Error("Quote response is unavailable for this identity");
      const allowed = QUOTE_TRANSITIONS;
      if (!allowed[q.status]?.includes(status))
        throw new Error("This quote transition is not allowed");
      q.status = status;
      if (status === "Accepted") {
        s.quotes
          .filter(
            (other) =>
              other.id !== q.id &&
              other.leadId === q.leadId &&
              ["Accepted", "Sent"].includes(other.status),
          )
          .forEach((other) => (other.status = "Superseded"));
        if (q.bookingId) {
          const b = find(s.bookings, q.bookingId, "Booking");
          if (b.status === "Cancelled")
            throw new Error(
              "Cancelled bookings cannot receive commercial revisions",
            );
          b.quoteId = q.id;
          b.contract = quoteTotal(q).total;
          b.advance = q.advance;
          b.publicMilestones.push(`Quote revision ${q.version} accepted`);
        }
      }
      message =
        status === "Sent"
          ? "Quote marked sent · simulation"
          : `Quote ${status.toLowerCase()}`;
    } else if (command === "quote.convert") {
      owner();
      const q = find(s.quotes, entityId, "Quote");
      if (q.status !== "Accepted")
        throw new Error("Accept this quote before conversion");
      if (q.bookingId)
        throw new Error("This quote already has a linked booking");
      const l = find(s.leads, q.leadId, "Lead");
      const bookingId = id("EVT");
      s.bookings.unshift({
        id: bookingId,
        name: `${l.name} ${l.service}`,
        customerId: q.customerId,
        quoteId: q.id,
        campaignId: l.campaignId,
        service: l.service,
        location: l.location,
        status: "Hold",
        contract: quoteTotal(q).total,
        advance: q.advance,
        plannedCosts: {},
        dueDate: l.eventDate || "2026-12-31",
        publicMilestones: ["Booking on hold · awaiting advance"],
        notes: q.notes,
      });
      q.bookingId = bookingId;
      l.stage = "Won";
      entityId = bookingId;
      message = "Booking created on hold. Record verified advance to confirm.";
    } else if (command === "booking.confirm") {
      owner();
      const b = find(s.bookings, entityId, "Booking");
      if (b.status !== "Hold" && b.status !== "Draft")
        throw new Error("Only a held booking can be confirmed");
      if (b.quoteId && find(s.quotes, b.quoteId, "Quote").status !== "Accepted")
        throw new Error("An accepted quote is required");
      if (collected(s, b.id) < b.advance)
        throw new Error(
          "Verified collections must meet the initial payment milestone",
        );
      b.status = "Confirmed";
      b.publicMilestones = ["Booking confirmed"];
      message = "Booking confirmed";
    } else if (command === "booking.create") {
      owner();
      const c = find(s.customers, text(p, "customerId"), "Customer");
      const contract = positive(number(p, "contract"));
      const advance = number(p, "advance", Math.round(contract / 3));
      if (advance < 0 || advance > contract)
        throw new Error("Advance must be between zero and contract value");
      entityId = id("EVT");
      s.bookings.unshift({
        id: entityId,
        name: requireValue(text(p, "name"), "Booking name"),
        customerId: c.id,
        service: text(p, "service", "Wedding"),
        location: text(p, "location", "Chennai"),
        status: "Hold",
        contract,
        advance,
        plannedCosts: {},
        dueDate: validDate(text(p, "dueDate")),
        publicMilestones: ["Booking on hold · awaiting advance"],
        notes: text(p, "notes"),
      });
      message = "Booking created on hold";
    } else if (command === "booking.cancel") {
      owner();
      const b = find(s.bookings, entityId, "Booking");
      if (b.status === "Cancelled")
        throw new Error("Booking already cancelled");
      b.status = "Cancelled";
      b.refundReview = true;
      for (const x of s.sessions.filter((x) => x.bookingId === b.id)) {
        x.status = "Cancelled";
        s.reservations
          .filter((r) => r.sessionId === x.id && r.start > NOW)
          .forEach((r) => (r.status = "Cancelled"));
        s.assignments
          .filter((a) => a.sessionId === x.id && x.start > NOW)
          .forEach((a) => (a.status = "Cancelled"));
      }
      b.publicMilestones.push(
        "Booking cancelled · studio reviewing settlement",
      );
      message = "Booking cancelled; custody preserved and refund review opened";
    } else if (command === "booking.reschedule") {
      owner();
      const session = find(s.sessions, text(p, "sessionId"), "Session");
      const start = validDate(text(p, "start"));
      const end = validDate(text(p, "end"));
      if (Date.parse(start) >= Date.parse(end))
        throw new Error("End must be after start");
      session.start = start;
      session.end = end;
      for (const a of s.assignments.filter(
        (a) =>
          a.sessionId === session.id &&
          !["Declined", "Cancelled"].includes(a.status),
      )) {
        const conflict = crewConflict(s, a.crewId, session.id);
        if (conflict) throw new Error(conflict);
      }
      for (const r of s.reservations.filter(
        (r) => r.sessionId === session.id && r.status === "Confirmed",
      )) {
        const conflict = assetConflict(s, r.assetId, session.id);
        if (conflict) throw new Error(conflict);
        r.start = start;
        r.end = end;
      }
      entityId = session.bookingId;
      message = "Session rescheduled; assigned resources rechecked";
    } else if (command === "session.create") {
      owner();
      const b = find(s.bookings, text(p, "bookingId"), "Booking");
      if (b.status === "Cancelled")
        throw new Error("Cannot add a session to a cancelled booking");
      const start = validDate(text(p, "start"));
      const end = validDate(text(p, "end"));
      if (Date.parse(start) >= Date.parse(end))
        throw new Error("End must be after start");
      entityId = id("S");
      s.sessions.push({
        id: entityId,
        bookingId: b.id,
        name: requireValue(text(p, "name"), "Session name"),
        start,
        end,
        location: b.location,
        venue: requireValue(text(p, "venue"), "Venue"),
        status: "Planned",
        requirements: [
          { role: "Photographer", count: 1 },
          { role: "Videographer", count: 1 },
        ],
        gearRequired: 3,
      });
      message = "Session added";
    } else if (command === "session.complete") {
      const session = find(s.sessions, entityId, "Session");
      if (
        s.identity.role !== "owner" &&
        (s.identity.role !== "freelancer" ||
          !s.assignments.some(
            (a) =>
              a.sessionId === session.id &&
              a.crewId === s.identity.crewId &&
              ["Accepted", "Completed"].includes(a.status),
          ))
      )
        throw new Error("This session is not assigned to you");
      if (Date.parse(session.end) > Date.parse(NOW))
        throw new Error("A future session cannot be completed");
      session.status = "Completed";
      s.assignments
        .filter((a) => a.sessionId === session.id && a.status === "Accepted")
        .forEach((a) => (a.status = "Completed"));
      message = "Session completed; media receipt remains separate";
    } else if (command === "assignment.create") {
      owner();
      const session = find(s.sessions, text(p, "sessionId"), "Session");
      const c = find(s.crew, text(p, "crewId"), "Crew");
      const role = text(p, "role", "Photographer");
      if (session.status === "Cancelled")
        throw new Error("Session is cancelled");
      if (!c.skills.includes(role))
        throw new Error(`Crew member does not have the required ${role} skill`);
      const conflict = crewConflict(s, c.id, session.id);
      if (conflict) throw new Error(conflict);
      if (
        s.assignments.some(
          (a) =>
            a.sessionId === session.id &&
            a.crewId === c.id &&
            !["Declined", "Cancelled"].includes(a.status),
        )
      )
        throw new Error("This person is already assigned to the session");
      const rate = positive(number(p, "rate", c.rate));
      entityId = id("A");
      s.assignments.push({
        id: entityId,
        sessionId: session.id,
        crewId: c.id,
        role,
        rate,
        status: "Proposed",
        approved: false,
      });
      message = "Assignment proposed; waiting for acceptance";
    } else if (command === "assignment.respond") {
      const a = find(s.assignments, entityId, "Assignment");
      ownCrew(a.crewId);
      const status = text(p, "status");
      if (
        !["Accepted", "Declined"].includes(status) ||
        !["Proposed", "Accepted", "Declined"].includes(a.status)
      )
        throw new Error("Assignment response is unavailable");
      a.status = status;
      if (status === "Declined") a.approved = false;
      message = `Assignment ${status.toLowerCase()}`;
    } else if (command === "reservation.create") {
      owner();
      const assetId = text(p, "assetId");
      const session = find(s.sessions, text(p, "sessionId"), "Session");
      if (session.status === "Cancelled")
        throw new Error("Session is cancelled");
      const conflict = assetConflict(s, assetId, session.id);
      if (conflict) throw new Error(conflict);
      if (
        s.reservations.some(
          (r) =>
            r.assetId === assetId &&
            r.sessionId === session.id &&
            r.status === "Confirmed",
        )
      )
        throw new Error("Asset already reserved for this session");
      entityId = id("R");
      s.reservations.push({
        id: entityId,
        assetId,
        sessionId: session.id,
        start: session.start,
        end: session.end,
        status: "Confirmed",
      });
      message = "Gear reserved";
    } else if (command === "gear.issue") {
      owner();
      const asset = find(s.assets, text(p, "assetId"), "Asset");
      const session = find(s.sessions, text(p, "sessionId"), "Session");
      const crew = find(s.crew, text(p, "crewId"), "Crew");
      if (session.start.slice(0, 10) !== TODAY)
        throw new Error(
          "Demo pickup policy: issue equipment for a current-day session only",
        );
      if (
        !s.assignments.some(
          (a) =>
            a.sessionId === session.id &&
            a.crewId === crew.id &&
            a.status === "Accepted",
        )
      )
        throw new Error(
          "Choose an accepted custodian assigned to this session",
        );
      const conflict = assetConflict(s, asset.id, session.id);
      if (conflict) throw new Error(conflict);
      const reservation = s.reservations.find(
        (r) =>
          r.assetId === asset.id &&
          r.sessionId === session.id &&
          r.status === "Confirmed",
      );
      if (!reservation)
        throw new Error("Reserve the asset for this session before issuing it");
      const dueBack = validDate(text(p, "dueBack"));
      if (
        Date.parse(dueBack) <= Date.parse(NOW) ||
        Date.parse(dueBack) < Date.parse(session.end)
      )
        throw new Error("Due back must be after the session");
      entityId = id("I");
      s.issues.push({
        id: entityId,
        assetId: asset.id,
        sessionId: session.id,
        crewId: crew.id,
        issuedAt: NOW,
        dueBack,
        status: "Issued",
        acknowledged: false,
        returnRequested: false,
        conditionNote: requireValue(text(p, "note"), "Condition note"),
      });
      reservation.status = "Fulfilled";
      s.movements.unshift({
        id: id("M"),
        assetId: asset.id,
        description: `Issued to ${crew.name} · ${session.name}`,
        at: NOW,
        actor,
      });
      message = "Equipment issued to named custodian";
    } else if (
      command === "gear.acknowledge" ||
      command === "gear.requestReturn"
    ) {
      const issue = find(s.issues, entityId, "Issue");
      ownCrew(issue.crewId);
      if (issue.status !== "Issued")
        throw new Error("This issue is no longer open");
      if (command === "gear.acknowledge") issue.acknowledged = true;
      else issue.returnRequested = true;
      message =
        command === "gear.acknowledge"
          ? "Custody acknowledged"
          : "Return requested; studio inspection required";
    } else if (command === "gear.return") {
      owner();
      const issue = find(s.issues, entityId, "Issue");
      if (!["Issued", "Missing"].includes(issue.status))
        throw new Error("This item was already returned");
      const condition = text(p, "condition", "Good");
      if (!["Good", "Damaged", "Missing"].includes(condition))
        throw new Error("Choose a valid return condition");
      issue.status = condition === "Good" ? "Returned" : condition;
      issue.conditionNote = requireValue(text(p, "note"), "Inspection note");
      if (condition !== "Missing") issue.returnedAt = NOW;
      const asset = find(s.assets, issue.assetId, "Asset");
      asset.condition =
        condition === "Damaged"
          ? "Under inspection"
          : condition === "Missing"
            ? "Lost"
            : "Good";
      s.movements.unshift({
        id: id("M"),
        assetId: asset.id,
        description: `Return inspection: ${condition} · ${issue.conditionNote}`,
        at: NOW,
        actor,
      });
      message =
        condition === "Damaged"
          ? "Damaged item returned and quarantined"
          : condition === "Missing"
            ? "Item remains outstanding with its custodian"
            : "Return verified";
    } else if (command === "gear.maintenance") {
      owner();
      const asset = find(s.assets, entityId, "Asset");
      if (openIssue(s, asset.id))
        throw new Error(
          "Verify physical return before changing maintenance status",
        );
      const condition = text(p, "condition", "Good");
      if (
        !["Good", "Maintenance", "Under inspection", "Retired"].includes(
          condition,
        )
      )
        throw new Error("Invalid maintenance state");
      asset.condition = condition;
      s.movements.unshift({
        id: id("M"),
        assetId: asset.id,
        description: `${condition} · ${requireValue(text(p, "note"), "Service note")}`,
        at: NOW,
        actor,
      });
      message = "Inspection / service record saved";
    } else if (command === "task.update") {
      owner();
      const task = find(s.tasks, entityId, "Task");
      const status = text(p, "status", task.status);
      if (!TASK_STATES.includes(status)) throw new Error("Invalid task status");
      const transitions = TASK_TRANSITIONS;
      if (status !== task.status && !transitions[task.status]?.includes(status))
        throw new Error(
          `Cannot move directly from ${task.status} to ${status}`,
        );
      if (status === "Blocked")
        task.blockedReason = requireValue(text(p, "note"), "Blocked reason");
      if (status === "Changes requested") {
        requireValue(text(p, "note"), "Revision comment");
        task.version++;
      }
      task.status = status;
      if (p.note) task.comments.unshift(`${text(p, "note")} · ${actor}`);
      message = "Production task updated";
    } else if (command === "handover.create") {
      const session = find(s.sessions, text(p, "sessionId"), "Session");
      const crewId =
        s.identity.role === "freelancer"
          ? s.identity.crewId
          : text(p, "crewId", "F-001");
      ownCrew(crewId);
      if (
        s.identity.role === "freelancer" &&
        !s.assignments.some(
          (a) =>
            a.sessionId === session.id &&
            a.crewId === crewId &&
            ["Accepted", "Completed"].includes(a.status),
        )
      )
        throw new Error("Session not assigned to you");
      if (Date.parse(session.end) > Date.parse(NOW))
        throw new Error("Media handover requires a completed shoot");
      entityId = id("H");
      s.handovers.push({
        id: entityId,
        bookingId: session.bookingId,
        sessionId: session.id,
        crewId,
        reference: requireValue(text(p, "reference"), "Card / drive reference"),
        size: requireValue(text(p, "size"), "Media size"),
        count: positive(number(p, "count")),
        receivedBy: requireValue(text(p, "receivedBy"), "Recipient"),
        storage: requireValue(text(p, "storage"), "Storage label"),
        backupConfirmed: Boolean(p.backupConfirmed),
        at: NOW,
      });
      message = "Media handover recorded";
    } else if (command === "deliverable.update") {
      const d = find(s.deliverables, entityId, "Deliverable");
      if (s.identity.role === "client") {
        if (
          !s.bookings.some(
            (b) =>
              b.id === d.bookingId && b.customerId === s.identity.customerId,
          ) ||
          d.status !== "Ready"
        )
          throw new Error("Approval unavailable");
        d.approved = true;
        message = "Customer approval recorded";
      } else {
        owner();
        const status = text(p, "status", d.status);
        const transitions = DELIVERABLE_TRANSITIONS;
        if (!transitions[d.status]?.includes(status))
          throw new Error("Invalid deliverable transition");
        if (
          status === "Ready" &&
          s.tasks.some(
            (t) =>
              t.deliverableId === d.id &&
              !["Approved", "Done"].includes(t.status),
          )
        )
          throw new Error("Approve all linked production tasks first");
        if (status === "Dispatched") {
          d.tracking = requireValue(text(p, "tracking"), "Dispatch reference");
          d.method = text(p, "method", "Courier");
          d.cost = number(p, "cost");
        }
        if (status === "Delivered") d.acknowledgedAt = NOW;
        d.status = status;
        find(s.bookings, d.bookingId, "Booking").publicMilestones.push(
          `${d.name} · ${status.toLowerCase()}`,
        );
        message = "Deliverable updated";
      }
    } else if (command === "gallery.update") {
      owner();
      const g = find(s.galleries, entityId, "Gallery");
      if (p.status) {
        const status = text(p, "status");
        if (!["Draft", "Published", "Revoked", "Expired"].includes(status))
          throw new Error("Invalid gallery state");
        if (status === "Published") {
          if (!g.media.length || g.media.some((m) => m.status !== "Ready"))
            throw new Error("Resolve all uploads before publishing");
          g.publishedAt = TODAY;
        }
        g.status = status;
      }
      if (p.expiresAt)
        g.expiresAt = validDate(text(p, "expiresAt")).slice(0, 10);
      if (p.coverId) g.coverId = find(g.media, text(p, "coverId"), "Photo").id;
      if (p.paymentLock !== undefined) g.paymentLock = Boolean(p.paymentLock);
      if (p.externalUrl !== undefined) {
        const url = text(p, "externalUrl");
        if (url && !/^https:\/\//i.test(url))
          throw new Error("External gallery URL must use HTTPS");
        g.externalUrl = url;
      }
      message = "Gallery settings updated";
    } else if (command === "gallery.favorite" || command === "gallery.select") {
      const g = ownGallery(entityId);
      const media = find(g.media, text(p, "mediaId"), "Photo");
      if (media.status !== "Ready") throw new Error("This photo is not ready");
      const key = command === "gallery.favorite" ? "favorites" : "selected";
      if (key === "selected" && g.submitted)
        throw new Error("Selection submitted. Ask the studio to reopen it.");
      if (g[key].includes(media.id))
        g[key] = g[key].filter((x) => x !== media.id);
      else {
        if (key === "selected" && g.selected.length >= g.target)
          throw new Error(`Choose up to ${g.target} photographs`);
        g[key].push(media.id);
      }
      message = key === "favorites" ? "Favorites updated" : "Selection updated";
    } else if (command === "gallery.submit") {
      const g = ownGallery(entityId);
      if (g.submitted) throw new Error("Selection already submitted");
      if (g.selected.length !== g.target)
        throw new Error(
          `Select exactly ${g.target} photographs before submitting`,
        );
      g.submitted = true;
      message = "Album selection submitted to the studio";
    } else if (command === "gallery.reopen") {
      owner();
      find(s.galleries, entityId, "Gallery").submitted = false;
      message = "Selection reopened for customer changes";
    } else if (command === "gallery.upload") {
      owner();
      const g = find(s.galleries, entityId, "Gallery");
      if (g.status !== "Draft")
        throw new Error("Uploads are only available in draft galleries");
      const source = g.media[0];
      g.media.push({
        id: id("PHOTO"),
        src: source.src,
        label: "DEMO_upload_retry.jpg",
        section: "Wedding",
        status: "Failed",
      });
      message = "Simulated upload interrupted. Retry the failed item.";
    } else if (command === "gallery.retry") {
      owner();
      const g = find(s.galleries, entityId, "Gallery");
      const m = find(g.media, text(p, "mediaId"), "Photo");
      if (m.status !== "Failed")
        throw new Error("Only failed uploads can be retried");
      m.status = "Ready";
      message = "Simulated upload verified";
    } else if (command === "collection.add") {
      owner();
      const b = find(s.bookings, text(p, "bookingId"), "Booking");
      const amount = positive(number(p, "amount"));
      if (amount > balance(s, b))
        throw new Error("Collection exceeds the outstanding balance");
      const ref = requireValue(text(p, "reference"), "Reference");
      if (
        s.transactions.some(
          (t) => t.reference === ref && t.kind === "Collection",
        )
      )
        throw new Error("This collection reference already exists");
      entityId = id("TX");
      s.transactions.unshift({
        id: entityId,
        bookingId: b.id,
        kind: "Collection",
        amount,
        at: NOW,
        method: text(p, "method", "UPI"),
        reference: ref,
        verified: true,
      });
      message = "Verified collection recorded";
    } else if (command === "payout.approve") {
      owner();
      const a = find(s.assignments, entityId, "Assignment");
      if (!["Accepted", "Completed"].includes(a.status))
        throw new Error("Accept assignment before approving payout");
      a.approved = true;
      message = "Payout approved";
    } else if (command === "payout.add") {
      owner();
      const a = find(s.assignments, text(p, "assignmentId"), "Assignment");
      if (!a.approved || !["Accepted", "Completed"].includes(a.status))
        throw new Error("Payout needs an accepted assignment and approval");
      const amount = positive(number(p, "amount"));
      if (amount > a.rate - assignmentPaid(s, a))
        throw new Error("Payout exceeds remaining approved rate");
      const session = find(s.sessions, a.sessionId, "Session");
      if (
        s.transactions.some(
          (t) => t.kind === "Payout" && t.reference === text(p, "reference"),
        )
      )
        throw new Error("This payout reference already exists");
      entityId = id("TX");
      s.transactions.unshift({
        id: entityId,
        bookingId: session.bookingId,
        crewId: a.crewId,
        assignmentId: a.id,
        kind: "Payout",
        amount,
        at: NOW,
        method: text(p, "method", "Bank transfer"),
        reference: requireValue(text(p, "reference"), "Reference"),
        verified: true,
      });
      message = "Partial / final payout recorded";
    } else if (command === "collection.refund") {
      owner();
      const b = find(s.bookings, text(p, "bookingId"), "Booking");
      const amount = positive(number(p, "amount"));
      if (amount > collected(s, b.id))
        throw new Error("Refund exceeds net verified collections");
      const reference = requireValue(
        text(p, "reference"),
        "Refund reference / reason",
      );
      if (
        s.transactions.some(
          (t) => t.kind === "Refund" && t.reference === reference,
        )
      )
        throw new Error("This refund reference already exists");
      entityId = id("TX");
      s.transactions.unshift({
        id: entityId,
        bookingId: b.id,
        kind: "Refund",
        amount,
        at: NOW,
        method: text(p, "method", "Bank transfer"),
        reference,
        verified: true,
      });
      message = "Refund recorded; original collections retained";
    } else if (command === "expense.add") {
      const bookingId = text(p, "bookingId");
      find(s.bookings, bookingId, "Booking");
      if (s.identity.role === "client")
        throw new Error("Expenses are internal");
      if (
        s.identity.role === "freelancer" &&
        !s.assignments.some(
          (a) =>
            a.crewId === s.identity.crewId &&
            s.sessions.find((x) => x.id === a.sessionId)?.bookingId ===
              bookingId,
        )
      )
        throw new Error("Booking not assigned to you");
      entityId = id("TX");
      s.transactions.unshift({
        id: entityId,
        bookingId,
        crewId:
          s.identity.role === "freelancer" ? s.identity.crewId : undefined,
        kind: "Expense",
        amount: positive(number(p, "amount")),
        at: NOW,
        method: text(p, "method", "UPI"),
        reference: requireValue(
          text(p, "reference"),
          "Expense / receipt reference",
        ),
        verified: false,
        category: text(p, "category", "Other"),
        approval: "Pending",
      });
      message = "Expense submitted for approval";
    } else if (command === "expense.approve") {
      owner();
      const t = find(s.transactions, entityId, "Expense");
      if (t.kind !== "Expense" || t.approval !== "Pending")
        throw new Error("Expense is not pending");
      t.approval = text(p, "status", "Approved");
      t.verified = t.approval === "Approved";
      message = `Expense ${t.approval.toLowerCase()}`;
    } else if (command === "transaction.reverse") {
      owner();
      const t = find(s.transactions, entityId, "Transaction");
      if (t.kind === "Reversal" || reversed(s, t.id))
        throw new Error("Transaction already reversed");
      const reason = requireValue(text(p, "reason"), "Reversal reason");
      entityId = id("TX");
      s.transactions.unshift({
        id: entityId,
        bookingId: t.bookingId,
        crewId: t.crewId,
        assignmentId: t.assignmentId,
        kind: "Reversal",
        amount: t.amount,
        at: NOW,
        method: t.method,
        reference: reason,
        verified: true,
        reversesId: t.id,
        category: t.category,
      });
      message = "Reversal recorded; original transaction retained";
    } else if (command === "customer.notes") {
      owner();
      find(s.customers, entityId, "Customer").notes = text(p, "notes");
    } else if (command === "crew.update") {
      owner();
      const c = find(s.crew, entityId, "Crew");
      if (p.rate !== undefined) c.rate = positive(number(p, "rate"));
      if (p.notes !== undefined) c.notes = text(p, "notes");
      message = "Crew profile updated; agreed assignment rates unchanged";
    } else if (command === "settings.update") {
      owner();
      const buffer = number(p, "bufferMinutes", s.settings.bufferMinutes);
      const retention = number(p, "retentionDays", s.settings.retentionDays);
      if (buffer < 0 || buffer > 240 || retention < 1 || retention > 365)
        throw new Error(
          "Buffer must be 0–240 minutes and retention 1–365 days",
        );
      s.settings.bufferMinutes = buffer;
      s.settings.retentionDays = retention;
      if (p.location) {
        const location = text(p, "location");
        if (!s.settings.locations.includes(location))
          s.settings.locations.push(location);
      }
      message = "Demo settings saved";
    } else throw new Error("Unknown demo action");
    s.audit.unshift({ id: id("AUD"), at: NOW, actor, entityId, message });
    return { ok: true, state: s, id: entityId, message };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "The action could not be completed",
    };
  }
}
