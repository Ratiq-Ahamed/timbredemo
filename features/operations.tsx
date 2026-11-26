"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Users, Camera } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import {
  NOW,
  assetConflict,
  assetStatus,
  balance,
  contractNet,
  crewConflict,
  crewPayable,
  date,
  localDateTime,
  money,
  plannedCost,
  readiness,
  time,
} from "@/lib/demo/selectors";
import {
  Badge,
  Button,
  Empty,
  FilterBar,
  Modal,
  PageHeader,
  Panel,
  RecordLink,
  Select,
  Table,
  Tabs,
  Avatar,
} from "@/components/ui";
import { useActionForm } from "@/components/action-forms";
import { SERVICES } from "@/lib/demo/seed";
import type { FormField } from "@/components/ui";
import type { DemoState } from "@/lib/demo/types";
import { ProductionContent, Deliverables } from "./production";
import { FinanceContent } from "./finance";
export const sessionOptions = (s: DemoState, bookingId?: string) =>
  s.sessions
    .filter(
      (x) =>
        (!bookingId || x.bookingId === bookingId) && x.status !== "Cancelled",
    )
    .map((x) => ({
      value: x.id,
      label: `${x.id} · ${x.name} · ${date(x.start)}`,
    }));
export const assignmentFields = (
  s: DemoState,
  sessionId: string,
): FormField[] => [
  {
    name: "sessionId",
    label: "Session",
    type: "select",
    value: sessionId,
    options: sessionOptions(s),
  },
  {
    name: "crewId",
    label: "Crew member",
    type: "select",
    value: "F-004",
    options: s.crew
      .filter((c) => c.active)
      .map((c) => ({
        value: c.id,
        label: `${c.id} · ${c.name}${crewConflict(s, c.id, sessionId) ? " · CONFLICT" : ""}`,
      })),
  },
  {
    name: "role",
    label: "Required role",
    type: "select",
    options: ["Photographer", "Videographer"],
    value: "Photographer",
  },
  {
    name: "rate",
    label: "Agreed session rate (₹)",
    type: "number",
    value: 8000,
    required: true,
    min: 1,
  },
];
export const reservationFields = (
  s: DemoState,
  sessionId: string,
): FormField[] => [
  {
    name: "sessionId",
    label: "Session",
    type: "select",
    value: sessionId,
    options: sessionOptions(s),
  },
  {
    name: "assetId",
    label: "Equipment",
    type: "select",
    value: "CAM-001",
    options: s.assets.map((a) => ({
      value: a.id,
      label: `${a.id} · ${a.model}${assetConflict(s, a.id, sessionId) ? " · UNAVAILABLE" : ""}`,
    })),
  },
];
export function Bookings() {
  const s = useDemo((x) => x.data);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [location, setLocation] = useState("All locations");
  const forms = useActionForm();
  const rows = s.bookings.filter(
    (b) =>
      `${b.name} ${b.id}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "All statuses" || b.status === status) &&
      (location === "All locations" || b.location === location),
  );
  return (
    <>
      <PageHeader
        title="Bookings & events"
        description="From the first promise to the final photograph."
        actions={
          <Button
            onClick={() =>
              forms.open("booking.create", "New booking", [
                { name: "name", label: "Booking name", required: true },
                {
                  name: "customerId",
                  label: "Customer",
                  type: "select",
                  options: s.customers.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                },
                {
                  name: "service",
                  label: "Service",
                  type: "select",
                  options: [
                    "Wedding",
                    "Pre-wedding",
                    "Engagement",
                    "Corporate",
                  ],
                },
                {
                  name: "location",
                  label: "Service area",
                  type: "select",
                  options: s.settings.locations,
                },
                {
                  name: "contract",
                  label: "Contract value (₹)",
                  type: "number",
                  value: 150000,
                  min: 1,
                },
                {
                  name: "advance",
                  label: "Initial milestone (₹)",
                  type: "number",
                  value: 50000,
                  min: 0,
                },
                {
                  name: "dueDate",
                  label: "Delivery promise",
                  type: "date",
                  value: "2026-12-31",
                  required: true,
                },
              ])
            }
          >
            <Plus size={16} />
            New booking
          </Button>
        }
      />
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search bookings…"
        onClear={() => {
          setSearch("");
          setStatus("All statuses");
          setLocation("All locations");
        }}
      >
        <Select
          label="Booking status"
          value={status}
          onChange={setStatus}
          options={[
            "All statuses",
            "Hold",
            "Confirmed",
            "In progress",
            "Production",
            "Delivered",
            "Closed",
            "Cancelled",
          ]}
        />
        <Select
          label="Booking location"
          value={location}
          onChange={setLocation}
          options={["All locations", ...s.settings.locations]}
        />
      </FilterBar>
      <Panel>
        <Table
          headers={[
            "BOOKING",
            "SERVICE / AREA",
            "SESSIONS",
            "STATUS",
            "CONTRACT",
            "BALANCE",
            "DELIVERY DUE",
            "",
          ]}
          rows={rows.map((b) => {
            const sessions = s.sessions.filter((x) => x.bookingId === b.id);
            return [
              <RecordLink
                key="name"
                href={`/admin/events/${b.id}`}
                title={b.name}
                subtitle={b.id}
              />,
              <div key="service">
                {b.service}
                <small>{b.location}</small>
              </div>,
              `${sessions.filter((x) => readiness(s, x.id).ready || x.status === "Completed").length}/${sessions.length} ready`,
              <Badge key="status">{b.status}</Badge>,
              money(b.contract),
              money(balance(s, b)),
              date(b.dueDate),
              <Link
                key="open"
                aria-label={`Open ${b.name}`}
                href={`/admin/events/${b.id}`}
              >
                <ArrowRight size={16} />
              </Link>,
            ];
          })}
        />
      </Panel>
      {forms.modal}
    </>
  );
}
export function EventDetail({ id }: { id: string }) {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") || "Overview");
  const forms = useActionForm();
  const b = s.bookings.find((b) => b.id === id);
  if (!b)
    return (
      <Empty
        title="Booking not found"
        action={
          <Link href="/admin/events" className="button">
            Back to bookings
          </Link>
        }
      />
    );
  const sessions = s.sessions.filter((x) => x.bookingId === b.id);
  const sessionIds = new Set(sessions.map((x) => x.id));
  const assignments = s.assignments.filter((a) => sessionIds.has(a.sessionId));
  const reservations = s.reservations.filter((r) =>
    sessionIds.has(r.sessionId),
  );
  const customer = s.customers.find((c) => c.id === b.customerId)!;
  const planned = plannedCost(b);
  const sessionId = sessions[0]?.id || "";
  const addSession = () =>
    forms.open(
      "session.create",
      "Add shoot session",
      [
        {
          name: "name",
          label: "Session name",
          value: "Wedding",
          required: true,
        },
        {
          name: "start",
          label: "Start · India time",
          type: "datetime-local",
          value: "2026-12-06T06:00",
          required: true,
        },
        {
          name: "end",
          label: "End · India time",
          type: "datetime-local",
          value: "2026-12-06T14:00",
          required: true,
        },
        {
          name: "venue",
          label: "Venue",
          value: "Sample venue · Chennai",
          required: true,
        },
      ],
      { bookingId: b.id },
    );
  return (
    <>
      <Link
        href="/admin/events"
        className="text-link"
        style={{ marginBottom: 18 }}
      >
        <ArrowLeft size={13} />
        All bookings
      </Link>
      <PageHeader
        title={b.name}
        description={`${b.id} · ${b.service} · ${b.location}`}
        actions={
          <>
            <Badge>{b.status}</Badge>
            {b.status === "Hold" && (
              <Button onClick={() => execute("booking.confirm", { id: b.id })}>
                Confirm booking
              </Button>
            )}
            <Button variant="secondary" onClick={addSession}>
              <Plus size={15} />
              Add session
            </Button>
          </>
        }
      />
      <div className="detail-banner">
        <div>
          <h2>{customer.name}</h2>
          <div className="detail-meta">
            <span>{customer.email}</span>
            <span>{sessions.length} sessions</span>
            <span>Delivery by {date(b.dueDate)}</span>
          </div>
        </div>
        <div className="inline-actions" style={{ gap: 30 }}>
          <div className="detail-stat">
            <span>Agreed contract value</span>
            <strong>{money(b.contract)}</strong>
          </div>
          <div className="detail-stat">
            <span>Customer balance</span>
            <strong>{money(balance(s, b))}</strong>
          </div>
        </div>
      </div>
      {b.refundReview && (
        <p className="callout warning" style={{ marginBottom: 20 }}>
          Cancellation settlement needs review. Open custody and all financial
          history have been retained.
        </p>
      )}
      <Tabs
        items={[
          "Overview",
          "Sessions",
          "Team",
          "Gear",
          "Production",
          "Deliverables",
          "Finance",
          "History",
        ]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          window.history.replaceState(
            null,
            "",
            `?tab=${encodeURIComponent(v)}`,
          );
        }}
      />
      {tab === "Overview" && (
        <div className="detail-grid">
          <div className="stack">
            <Panel
              title="Every session, its own plan"
              caption="Readiness comes from accepted people and reserved equipment."
            >
              {sessions.length ? (
                <Table
                  headers={["SESSION", "DATE / TIME", "CREW", "GEAR", ""]}
                  rows={sessions.map((x) => {
                    const r = readiness(s, x.id);
                    return [
                      <div key="name">
                        <strong>{x.name}</strong>
                        <small>{x.venue}</small>
                      </div>,
                      <div key="date">
                        {date(x.start)}
                        <small>
                          {time(x.start)} – {time(x.end)}
                        </small>
                      </div>,
                      `${r.crew}/${r.required}`,
                      `${r.gear}/${r.gearRequired}`,
                      <Badge key="status">
                        {x.status === "Completed"
                          ? "Completed"
                          : r.ready
                            ? "Ready"
                            : "Needs attention"}
                      </Badge>,
                    ];
                  })}
                />
              ) : (
                <Empty
                  title="Plan your first session"
                  action={<Button onClick={addSession}>Add session</Button>}
                />
              )}
            </Panel>
            <Panel title="Customer milestones">
              <div className="timeline">
                {b.publicMilestones.map((m, i) => (
                  <div className="timeline-item" key={`${m}-${i}`}>
                    <i className="timeline-dot" />
                    <div>
                      <strong>{m}</strong>
                      <p>Published to the customer experience</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <div className="stack">
            <Panel
              title="Planned event contribution"
              caption="Contract value less planned direct costs"
            >
              <div className="panel-body summary-list">
                <div>
                  <span>Contract value excluding tax</span>
                  <strong>{money(contractNet(s, b))}</strong>
                </div>
                {Object.entries(b.plannedCosts).map(([name, amount]) => (
                  <div key={name}>
                    <span>{name}</span>
                    <strong>{money(amount)}</strong>
                  </div>
                ))}
                <div className="total">
                  <span>Planned contribution</span>
                  <strong>{money(contractNet(s, b) - planned)}</strong>
                </div>
                <small>
                  {contractNet(s, b)
                    ? Math.round(
                        ((contractNet(s, b) - planned) / contractNet(s, b)) *
                          100,
                      )
                    : "N/A"}
                  % planned margin · excludes overheads and tax
                </small>
              </div>
            </Panel>
            <Panel title="Internal notes">
              <div className="panel-body">
                <p className="muted small">{b.notes}</p>
                <div className="divider" />
                <Button
                  variant="ghost"
                  disabled={["Closed", "Cancelled"].includes(b.status)}
                  title="Cancellation preserves custody and financial records"
                  onClick={() =>
                    forms.open(
                      "booking.cancel",
                      "Cancel booking",
                      [
                        {
                          name: "reason",
                          label: "Cancellation reason",
                          type: "textarea",
                          required: true,
                        },
                      ],
                      { id: b.id },
                    )
                  }
                >
                  Cancel booking
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      )}
      {tab === "Sessions" && (
        <div className="stack">
          {sessions.map((x) => {
            const r = readiness(s, x.id);
            return (
              <Panel
                key={x.id}
                title={x.name}
                caption={`${date(x.start)} · ${time(x.start)} – ${time(x.end)} · ${x.venue}`}
                action={<Badge>{x.status}</Badge>}
              >
                <div className="panel-body">
                  <div
                    className="inline-actions"
                    style={{
                      justifyContent: "space-between",
                      marginBottom: 18,
                    }}
                  >
                    <span className="muted small">
                      Crew {r.crew}/{r.required} · Gear {r.gear}/
                      {r.gearRequired} · {s.settings.bufferMinutes}-minute
                      resource buffer
                    </span>
                    <div className="inline-actions">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          forms.open(
                            "assignment.create",
                            "Assign session crew",
                            assignmentFields(s, x.id),
                          )
                        }
                      >
                        <Users size={15} />
                        Assign crew
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          forms.open(
                            "reservation.create",
                            "Reserve session gear",
                            reservationFields(s, x.id),
                          )
                        }
                      >
                        <Camera size={15} />
                        Reserve gear
                      </Button>
                    </div>
                  </div>
                  <div className="inline-actions">
                    {x.requirements.map((r) => (
                      <Badge key={r.role}>
                        {r.count} × {r.role}
                      </Badge>
                    ))}
                  </div>
                  <div className="divider" />
                  <div className="inline-actions">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        forms.open(
                          "booking.reschedule",
                          "Preview & reschedule session",
                          [
                            {
                              name: "start",
                              label: "New start · India time",
                              type: "datetime-local",
                              value: localDateTime(x.start),
                              required: true,
                            },
                            {
                              name: "end",
                              label: "New end · India time",
                              type: "datetime-local",
                              value: localDateTime(x.end),
                              required: true,
                            },
                          ],
                          { id: b.id, sessionId: x.id },
                          undefined,
                          "Confirmation rechecks every crew assignment and reservation. Conflicts block the change; existing records remain intact.",
                        )
                      }
                    >
                      Reschedule & check conflicts
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={x.end > NOW || x.status === "Completed"}
                      title={
                        x.end > NOW
                          ? "Future shoots cannot be completed"
                          : "Record shoot completion separately from media receipt"
                      }
                      onClick={() => execute("session.complete", { id: x.id })}
                    >
                      Mark shoot completed
                    </Button>
                  </div>
                </div>
              </Panel>
            );
          })}
          {!sessions.length && (
            <Empty
              title="No sessions yet"
              action={<Button onClick={addSession}>Add session</Button>}
            />
          )}
        </div>
      )}
      {tab === "Team" && (
        <Panel
          title="Session crew"
          caption="Agreed rates are snapshots, independent of directory defaults."
          action={
            <Button
              disabled={!sessionId}
              onClick={() =>
                forms.open(
                  "assignment.create",
                  "Assign session crew",
                  assignmentFields(s, sessionId),
                )
              }
            >
              <Plus size={15} />
              Assign crew
            </Button>
          }
        >
          <Table
            headers={["CREW", "SESSION", "ROLE", "AGREED RATE", "RESPONSE"]}
            rows={assignments.map((a) => [
              <div className="cell-person" key="crew">
                <Avatar name={s.crew.find((c) => c.id === a.crewId)!.name} />
                {s.crew.find((c) => c.id === a.crewId)?.name}
              </div>,
              sessions.find((x) => x.id === a.sessionId)?.name,
              a.role,
              money(a.rate),
              <Badge key="status">{a.status}</Badge>,
            ])}
          />
        </Panel>
      )}
      {tab === "Gear" && (
        <Panel
          title="Reserved and issued equipment"
          caption="Reservations do not represent physical custody."
          action={
            <Button
              disabled={!sessionId}
              onClick={() =>
                forms.open(
                  "reservation.create",
                  "Reserve session gear",
                  reservationFields(s, sessionId),
                )
              }
            >
              <Plus size={15} />
              Reserve gear
            </Button>
          }
        >
          <Table
            headers={["ASSET", "SESSION", "RESERVATION", "PHYSICAL STATUS", ""]}
            rows={reservations.map((r) => [
              <RecordLink
                key="asset"
                href={`/admin/equipment/${r.assetId}`}
                title={s.assets.find((a) => a.id === r.assetId)!.model}
                subtitle={r.assetId}
              />,
              sessions.find((x) => x.id === r.sessionId)?.name,
              <Badge key="r">{r.status}</Badge>,
              <Badge key="custody">{assetStatus(s, r.assetId)}</Badge>,
              <Link key="link" href={`/admin/equipment/${r.assetId}`}>
                <ArrowRight size={15} />
              </Link>,
            ])}
          />
        </Panel>
      )}
      {tab === "Production" && <ProductionContent bookingId={b.id} />}
      {tab === "Deliverables" && <Deliverables bookingId={b.id} />}
      {tab === "Finance" && <FinanceContent bookingId={b.id} />}
      {tab === "History" && (
        <Panel title="Booking history">
          <div className="timeline">
            {s.audit
              .filter((a) => a.entityId === b.id || sessionIds.has(a.entityId))
              .map((a) => (
                <div className="timeline-item" key={a.id}>
                  <i className="timeline-dot" />
                  <div>
                    <strong>{a.message}</strong>
                    <p>
                      {a.actor} · {date(a.at)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Panel>
      )}
      {forms.modal}
    </>
  );
}
export function CrewDirectory() {
  const s = useDemo((x) => x.data);
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("All skills");
  const [sessionId, setSessionId] = useState("S-003");
  const params = useSearchParams();
  const [selected, setSelected] = useState(params.get("crew") || "");
  const forms = useActionForm();
  const c = s.crew.find((c) => c.id === selected);
  return (
    <>
      <PageHeader
        title="Crew directory"
        description="Good people. The right role. A clear plan."
      />
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search crew or skill…"
        onClear={() => {
          setSearch("");
          setSkill("All skills");
        }}
      >
        <Select
          label="Crew skill"
          value={skill}
          onChange={setSkill}
          options={["All skills", "Photographer", "Videographer", "Editor"]}
        />
        <Select
          label="Availability for session"
          value={sessionId}
          onChange={setSessionId}
          options={sessionOptions(s)}
        />
      </FilterBar>
      <Panel
        title="Your creative network"
        caption={`Availability for ${s.sessions.find((x) => x.id === sessionId)?.name} · ${date(s.sessions.find((x) => x.id === sessionId)?.start || "")}`}
      >
        <Table
          headers={[
            "CREW MEMBER",
            "SKILLS",
            "SERVICE AREA",
            "AVAILABILITY",
            "DEFAULT RATE",
            "OPEN PAYABLE",
            "",
          ]}
          rows={s.crew
            .filter(
              (c) =>
                `${c.name} ${c.skills.join(" ")}`
                  .toLowerCase()
                  .includes(search.toLowerCase()) &&
                (skill === "All skills" || c.skills.includes(skill)),
            )
            .map((c) => [
              <div className="cell-person" key="name">
                <Avatar name={c.name} />
                <button
                  className="record-link"
                  onClick={() => setSelected(c.id)}
                >
                  <strong>{c.name}</strong>
                  <small>{c.id}</small>
                </button>
              </div>,
              c.skills.join(", "),
              c.location,
              <span
                key="available"
                title={
                  crewConflict(s, c.id, sessionId) ||
                  "No overlapping assignments"
                }
              >
                <Badge>
                  {crewConflict(s, c.id, sessionId) ? "Conflict" : "Available"}
                </Badge>
              </span>,
              money(c.rate),
              money(crewPayable(s, c.id)),
              <Button
                key="open"
                variant="ghost"
                onClick={() => setSelected(c.id)}
              >
                View
                <ArrowRight size={14} />
              </Button>,
            ])}
        />
      </Panel>
      {c && (
        <Modal
          open
          onClose={() => setSelected("")}
          title={c.name}
          description={`${c.id} · ${c.location} · ${c.email}`}
          wide
        >
          <div className="stack">
            <div className="inline-actions">
              {c.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
            <p className="callout">{c.notes}</p>
            <Table
              headers={["SESSION", "WHEN", "STATUS", "AGREED RATE"]}
              rows={s.assignments
                .filter((a) => a.crewId === c.id)
                .map((a) => {
                  const x = s.sessions.find((x) => x.id === a.sessionId)!;
                  return [
                    <RecordLink
                      key="session"
                      href={`/admin/events/${x.bookingId}`}
                      title={x.name}
                      subtitle={x.id}
                    />,
                    date(x.start),
                    <Badge key="status">{a.status}</Badge>,
                    money(a.rate),
                  ];
                })}
            />
            <div className="inline-actions">
              <Button
                onClick={() =>
                  forms.open(
                    "assignment.create",
                    "Assign session crew",
                    assignmentFields(s, sessionId).map((f) =>
                      f.name === "crewId" ? { ...f, value: c.id } : f,
                    ),
                  )
                }
              >
                Assign to session
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  forms.open(
                    "crew.update",
                    "Edit crew profile",
                    [
                      {
                        name: "rate",
                        label: "Default session rate (₹)",
                        type: "number",
                        value: c.rate / 100,
                        min: 1,
                        required: true,
                      },
                      {
                        name: "notes",
                        label: "Internal notes",
                        type: "textarea",
                        value: c.notes,
                      },
                    ],
                    { id: c.id },
                  )
                }
              >
                Edit profile
              </Button>
              <strong>Open payable: {money(crewPayable(s, c.id))}</strong>
            </div>
            <p className="muted small">
              Existing agreed rates are preserved when the default rate changes.
            </p>
          </div>
        </Modal>
      )}
      {forms.modal}
    </>
  );
}
export function Calendar() {
  const s = useDemo((x) => x.data);
  const [view, setView] = useState("Month");
  const [month, setMonth] = useState(11);
  const [year, setYear] = useState(2026);
  const changeMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    setMonth(next.getMonth() + 1);
    setYear(next.getFullYear());
  };
  const [location, setLocation] = useState("All locations");
  const [crew, setCrew] = useState("All crew");
  const [service, setService] = useState("All services");
  const sessions = s.sessions
    .filter(
      (x) =>
        x.start.startsWith(`${year}-${String(month).padStart(2, "0")}`) &&
        (location === "All locations" || x.location === location) &&
        (crew === "All crew" ||
          s.assignments.some(
            (a) => a.sessionId === x.id && a.crewId === crew,
          )) &&
        (service === "All services" ||
          s.bookings.find((b) => b.id === x.bookingId)?.service === service),
    )
    .sort((a, b) => a.start.localeCompare(b.start));
  const start = new Date(year, month - 1, 1).getDay();
  const days = new Date(year, month, 0).getDate();
  return (
    <>
      <PageHeader
        title="Studio calendar"
        description="Every session, every crew member, every commitment."
      />
      <div className="filter-bar">
        <Select
          label="Calendar location"
          value={location}
          onChange={setLocation}
          options={["All locations", ...s.settings.locations]}
        />
        <Select
          label="Calendar crew"
          value={crew}
          onChange={setCrew}
          options={[
            { value: "All crew", label: "All crew" },
            ...s.crew.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Select
          label="Calendar service"
          value={service}
          onChange={setService}
          options={["All services", ...SERVICES]}
        />
        <span className="spacer" />
        <Tabs
          items={["Month", "Week", "List"]}
          value={view}
          onChange={setView}
        />
      </div>
      <Panel>
        <div className="calendar-toolbar">
          <h2>
            {new Intl.DateTimeFormat("en-IN", {
              month: "long",
              year: "numeric",
            }).format(new Date(year, month - 1, 1))}
          </h2>
          <div className="inline-actions">
            <Button
              variant="secondary"
              onClick={() => changeMonth(-1)}
              title="Previous month"
            >
              ←
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setMonth(11);
                setYear(2026);
              }}
            >
              November
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setMonth(12);
                setYear(2026);
              }}
            >
              December
            </Button>
            <Button
              variant="secondary"
              onClick={() => changeMonth(1)}
              title="Next month"
            >
              →
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMonth(11);
                setYear(2026);
                setView("Week");
              }}
            >
              Today · 24 Nov
            </Button>
          </div>
        </div>
        {view === "Month" ? (
          <div className="calendar-grid-wrap">
            <div className="calendar-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div className="calendar-weekday" key={d}>
                  {d}
                </div>
              ))}
              {Array.from({ length: start }, (_, i) => (
                <div className="calendar-day empty-day" key={`empty-${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => (
                <div className="calendar-day" key={i}>
                  <span
                    className={`calendar-number ${month === 11 && i === 23 ? "today" : ""}`}
                  >
                    {i + 1}
                  </span>
                  {sessions
                    .filter((x) => Number(x.start.slice(8, 10)) === i + 1)
                    .map((x) => (
                      <Link
                        key={x.id}
                        title={`${x.name}: ${s.bookings.find((b) => b.id === x.bookingId)?.name} · ${time(x.start)}–${time(x.end)}`}
                        href={`/admin/events/${x.bookingId}?tab=Sessions`}
                        className="calendar-event"
                      >
                        {time(x.start)} · {x.name}
                        <br />
                        {s.bookings.find((b) => b.id === x.bookingId)?.name}
                      </Link>
                    ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Table
            headers={[
              "SESSION",
              "BOOKING",
              "DATE / TIME",
              "LOCATION",
              "STATUS",
              "GEAR RESERVATIONS",
            ]}
            rows={sessions
              .filter(
                (x) =>
                  view !== "Week" ||
                  (Number(x.start.slice(8, 10)) >= (month === 11 ? 23 : 1) &&
                    Number(x.start.slice(8, 10)) <= (month === 11 ? 29 : 7)),
              )
              .map((x) => [
                <RecordLink
                  key="name"
                  href={`/admin/events/${x.bookingId}?tab=Sessions`}
                  title={x.name}
                  subtitle={x.id}
                />,
                s.bookings.find((b) => b.id === x.bookingId)?.name,
                <div key="time">
                  {date(x.start)}
                  <small>
                    {time(x.start)} – {time(x.end)}
                  </small>
                </div>,
                x.location,
                <Badge key="status">{x.status}</Badge>,
                s.reservations.filter(
                  (r) => r.sessionId === x.id && r.status === "Confirmed",
                ).length,
              ])}
          />
        )}
        <div className="panel-body inline-actions">
          <Badge tone="success">Shoot session</Badge>
          <small>
            Times shown in Asia/Kolkata · resource checks include a{" "}
            {s.settings.bufferMinutes}-minute buffer.
          </small>
        </div>
      </Panel>
    </>
  );
}
