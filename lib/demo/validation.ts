import type { DemoState } from "./types";
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
export function isPersistedState(value: unknown): value is DemoState {
  if (
    !record(value) ||
    value.version !== 1 ||
    !Number.isSafeInteger(value.sequence)
  )
    return false;
  const arrays = [
    "customers",
    "leads",
    "campaigns",
    "quotes",
    "bookings",
    "sessions",
    "crew",
    "assignments",
    "assets",
    "kits",
    "reservations",
    "issues",
    "movements",
    "tasks",
    "handovers",
    "deliverables",
    "galleries",
    "transactions",
    "audit",
  ];
  for (const key of arrays) {
    const rows = value[key];
    if (
      !Array.isArray(rows) ||
      !rows.every((row) => record(row) && typeof row.id === "string")
    )
      return false;
  }
  const settings = value.settings;
  const identity = value.identity;
  if (
    !record(settings) ||
    !Number.isFinite(settings.bufferMinutes) ||
    !Number.isFinite(settings.retentionDays) ||
    !Array.isArray(settings.locations) ||
    !settings.locations.every((l) => typeof l === "string")
  )
    return false;
  if (
    !record(identity) ||
    !["owner", "freelancer", "client"].includes(String(identity.role))
  )
    return false;
  const s = value as unknown as DemoState;
  return (
    Array.isArray(s.readNotifications) &&
    s.readNotifications.every((n) => typeof n === "string") &&
    s.crew.some((c) => c.id === identity.crewId) &&
    s.customers.some((c) => c.id === identity.customerId) &&
    s.quotes.every(
      (q) =>
        Array.isArray(q.items) &&
        q.items.every(
          (i) =>
            typeof i.label === "string" &&
            Number.isSafeInteger(i.rate) &&
            Number.isSafeInteger(i.quantity),
        ),
    ) &&
    s.galleries.every(
      (g) =>
        Array.isArray(g.media) &&
        g.media.every(
          (m) => typeof m.src === "string" && typeof m.id === "string",
        ) &&
        Array.isArray(g.selected) &&
        Array.isArray(g.favorites),
    ) &&
    s.bookings.every(
      (b) =>
        Number.isSafeInteger(b.contract) &&
        record(b.plannedCosts) &&
        Array.isArray(b.publicMilestones),
    ) &&
    s.leads.every((l) => Array.isArray(l.activities)) &&
    s.crew.every((c) => Array.isArray(c.skills)) &&
    s.tasks.every((t) => Array.isArray(t.comments)) &&
    s.sessions.every(
      (x) =>
        Array.isArray(x.requirements) &&
        Number.isFinite(Date.parse(x.start)) &&
        Number.isFinite(Date.parse(x.end)),
    )
  );
}
