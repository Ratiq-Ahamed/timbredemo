import type { Assignment, Booking, DemoState, Gallery, Quote } from "./types";
export const NOW = "2026-11-24T04:30:00.000Z";
export const TODAY = "2026-11-24";
export const localDateTime = (value: string) =>
  new Date(Date.parse(value) + 330 * 60000).toISOString().slice(0, 16);
export const contractNet = (s: DemoState, b: Booking) => {
  const quote = s.quotes.find((q) => q.id === b.quoteId);
  return quote ? quoteTotal(quote).net : b.contract;
};
export const money = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
export const date = (value: string, options?: Intl.DateTimeFormatOptions) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        ...options,
      }).format(new Date(value.length === 10 ? `${value}T06:00:00Z` : value))
    : "Not scheduled";
export const time = (value: string) =>
  date(value, {
    day: undefined,
    month: undefined,
    hour: "numeric",
    minute: "2-digit",
  });
export const quoteTotal = (quote: Quote) => {
  const subtotal = quote.items
    .filter((i) => !i.optional || i.included)
    .reduce((n, i) => n + i.quantity * i.rate, 0);
  const net = subtotal - quote.discount;
  return {
    subtotal,
    net,
    tax: Math.round((net * quote.taxPercent) / 100),
    total: net + Math.round((net * quote.taxPercent) / 100),
  };
};
export const overlaps = (
  a: string,
  b: string,
  c: string,
  d: string,
  buffer = 0,
) =>
  new Date(a).getTime() < new Date(d).getTime() + buffer * 60000 &&
  new Date(c).getTime() < new Date(b).getTime() + buffer * 60000;
export const reversed = (s: DemoState, id: string) =>
  s.transactions.some((t) => t.reversesId === id);
export const collected = (s: DemoState, id?: string) =>
  s.transactions
    .filter(
      (t) => (!id || t.bookingId === id) && t.verified && !reversed(s, t.id),
    )
    .reduce(
      (n, t) =>
        n +
        (t.kind === "Collection"
          ? t.amount
          : t.kind === "Refund"
            ? -t.amount
            : 0),
      0,
    );
export const balance = (s: DemoState, b: Booking) =>
  b.contract - collected(s, b.id);
export const assignmentPaid = (s: DemoState, a: Assignment) =>
  s.transactions
    .filter(
      (t) =>
        t.kind === "Payout" &&
        t.assignmentId === a.id &&
        t.verified &&
        !reversed(s, t.id),
    )
    .reduce((n, t) => n + t.amount, 0);
export const crewPayable = (s: DemoState, crewId?: string) =>
  s.assignments
    .filter(
      (a) =>
        (!crewId || a.crewId === crewId) &&
        ["Accepted", "Completed"].includes(a.status),
    )
    .reduce((n, a) => n + a.rate - assignmentPaid(s, a), 0);
export const paidCosts = (s: DemoState, bookingId?: string) =>
  s.transactions
    .filter(
      (t) =>
        ["Payout", "Expense"].includes(t.kind) &&
        t.verified &&
        t.approval !== "Pending" &&
        (!bookingId || t.bookingId === bookingId) &&
        !reversed(s, t.id),
    )
    .reduce((n, t) => n + t.amount, 0);
export const plannedCost = (b: Booking) =>
  Object.values(b.plannedCosts).reduce((n, v) => n + v, 0);
export const margin = (revenue: number, cost: number) =>
  revenue === 0 ? null : ((revenue - cost) / revenue) * 100;
export const openIssue = (s: DemoState, assetId: string) =>
  s.issues.find(
    (i) => i.assetId === assetId && ["Issued", "Missing"].includes(i.status),
  );
export const assetStatus = (s: DemoState, assetId: string) => {
  const asset = s.assets.find((a) => a.id === assetId);
  const issue = openIssue(s, assetId);
  if (issue) return issue.dueBack < NOW ? "Overdue" : "Issued";
  if (asset && !["Good", "Fair"].includes(asset.condition))
    return asset.condition;
  return s.reservations.some(
    (r) => r.assetId === assetId && r.status === "Confirmed" && r.end > NOW,
  )
    ? "Reserved"
    : "Available";
};
export function crewConflict(s: DemoState, crewId: string, sessionId: string) {
  const session = s.sessions.find((x) => x.id === sessionId);
  if (!session) return "Session not found";
  const person = s.crew.find((x) => x.id === crewId);
  if (!person?.active) return "Crew member is inactive";
  const clash = s.assignments.find(
    (a) =>
      a.crewId === crewId &&
      !["Declined", "Cancelled"].includes(a.status) &&
      a.sessionId !== sessionId &&
      (() => {
        const other = s.sessions.find((x) => x.id === a.sessionId);
        return (
          other &&
          other.status !== "Cancelled" &&
          overlaps(
            session.start,
            session.end,
            other.start,
            other.end,
            s.settings.bufferMinutes,
          )
        );
      })(),
  );
  return clash
    ? `Already assigned to ${s.sessions.find((x) => x.id === clash.sessionId)?.name}. Includes ${s.settings.bufferMinutes}-minute travel/setup buffer.`
    : null;
}
export function assetConflict(
  s: DemoState,
  assetId: string,
  sessionId: string,
) {
  const session = s.sessions.find((x) => x.id === sessionId);
  const asset = s.assets.find((x) => x.id === assetId);
  if (!session || !asset) return "Asset or session not found";
  if (!["Good", "Fair"].includes(asset.condition))
    return `Unavailable: ${asset.condition}`;
  if (openIssue(s, assetId))
    return "Asset is physically issued; return must be verified first";
  const clash = s.reservations.find(
    (r) =>
      r.assetId === assetId &&
      r.sessionId !== sessionId &&
      r.status === "Confirmed" &&
      overlaps(
        session.start,
        session.end,
        r.start,
        r.end,
        s.settings.bufferMinutes,
      ),
  );
  return clash
    ? `Reserved for ${s.sessions.find((x) => x.id === clash.sessionId)?.name}. Includes ${s.settings.bufferMinutes}-minute travel/setup buffer.`
    : null;
}
export function readiness(s: DemoState, sessionId: string) {
  const session = s.sessions.find((x) => x.id === sessionId);
  if (!session)
    return { crew: 0, required: 0, gear: 0, gearRequired: 0, ready: false };
  const required = session.requirements.reduce((n, r) => n + r.count, 0);
  const crew = session.requirements.reduce(
    (n, r) =>
      n +
      Math.min(
        r.count,
        s.assignments.filter(
          (a) =>
            a.sessionId === sessionId &&
            a.role === r.role &&
            ["Accepted", "Completed"].includes(a.status),
        ).length,
      ),
    0,
  );
  const gear =
    s.reservations.filter(
      (r) =>
        r.sessionId === sessionId &&
        ["Confirmed", "Fulfilled"].includes(r.status) &&
        !assetConflict(s, r.assetId, sessionId),
    ).length +
    s.issues.filter((i) => i.sessionId === sessionId && i.status === "Issued")
      .length;
  return {
    crew,
    required,
    gear: Math.min(gear, session.gearRequired),
    gearRequired: session.gearRequired,
    ready: crew >= required && gear >= session.gearRequired,
  };
}
export const canViewBooking = (s: DemoState, id: string) =>
  s.identity.role === "owner" ||
  (s.identity.role === "client"
    ? s.bookings.some(
        (b) => b.id === id && b.customerId === s.identity.customerId,
      )
    : s.assignments.some(
        (a) =>
          a.crewId === s.identity.crewId &&
          s.sessions.find((x) => x.id === a.sessionId)?.bookingId === id,
      ));
export const galleryAccess = (s: DemoState, g: Gallery) => {
  if (
    s.identity.role === "client" &&
    !s.bookings.some(
      (b) => b.id === g.bookingId && b.customerId === s.identity.customerId,
    )
  )
    return "This gallery belongs to another customer.";
  if (g.status !== "Published")
    return `Gallery ${g.status.toLowerCase()}. Contact the studio for access.`;
  if (g.expiresAt < TODAY)
    return "This gallery has expired. Your studio archive is separate from gallery access.";
  return null;
};
export const downloadEligible = (s: DemoState, g: Gallery) =>
  !galleryAccess(s, g) &&
  (!g.paymentLock ||
    balance(
      s,
      s.bookings.find((b) => b.id === g.bookingId)!,
    ) <= 0);
export function notifications(s: DemoState) {
  return [
    ...s.issues
      .filter(
        (i) => ["Issued", "Missing"].includes(i.status) && i.dueBack < NOW,
      )
      .map((i) => ({
        id: `issue-${i.id}`,
        title: `${i.assetId} is overdue`,
        detail: `With ${s.crew.find((c) => c.id === i.crewId)?.name}`,
        href: `/admin/equipment/${i.assetId}`,
        tone: "danger",
      })),
    ...s.sessions
      .filter(
        (x) =>
          x.start >= NOW &&
          x.status !== "Cancelled" &&
          !readiness(s, x.id).ready,
      )
      .map((x) => ({
        id: `session-${x.id}`,
        title: `${x.name}: readiness gaps`,
        detail: `${date(x.start)} · Crew and gear`,
        href: `/admin/events/${x.bookingId}?tab=Sessions`,
        tone: "warning",
      })),
    ...s.leads
      .filter(
        (l) =>
          l.followUp &&
          l.followUp <= TODAY &&
          !["Won", "Lost"].includes(l.stage),
      )
      .map((l) => ({
        id: `lead-${l.id}`,
        title: `Follow up with ${l.name}`,
        detail: `${l.service} · ${date(l.followUp)}`,
        href: `/admin/leads?lead=${l.id}`,
        tone: "info",
      })),
    ...s.tasks
      .filter((t) => t.due < TODAY && !["Done", "Approved"].includes(t.status))
      .map((t) => ({
        id: `task-${t.id}`,
        title: `${t.title} is overdue`,
        detail: s.bookings.find((b) => b.id === t.bookingId)?.name || "",
        href: `/admin/production?task=${t.id}`,
        tone: "warning",
      })),
  ];
}
