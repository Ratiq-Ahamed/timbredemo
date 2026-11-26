"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Landmark,
  Wallet,
  HandCoins,
  Package,
  Megaphone,
  Circle,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { useDemo } from "@/lib/demo/store";
import {
  NOW,
  assetStatus,
  collected,
  date,
  money,
  notifications,
  readiness,
  reversed,
  time,
} from "@/lib/demo/selectors";
import {
  Button,
  Metric,
  PageHeader,
  Panel,
  RecordLink,
  Select,
  Table,
  Empty,
} from "@/components/ui";
import { useActionForm } from "@/components/action-forms";
import { SERVICES } from "@/lib/demo/seed";
export default function Dashboard() {
  const s = useDemo((x) => x.data);
  const [location, setLocation] = useState("All locations");
  const [period, setPeriod] = useState("November 2026");
  const forms = useActionForm();
  const router = useRouter();
  const b = s.bookings.filter(
    (b) => location === "All locations" || b.location === location,
  );
  const ids = new Set(b.map((b) => b.id));
  const start = period === "November 2026" ? "2026-11-01" : "2026-10-01";
  const end = period === "November 2026" ? "2026-11-30" : "2026-10-31";
  const tx = s.transactions.filter(
    (t) =>
      ids.has(t.bookingId) &&
      t.at.slice(0, 10) >= start &&
      t.at.slice(0, 10) <= end &&
      t.verified &&
      !reversed(s, t.id),
  );
  const cash = tx
    .filter((t) => ["Collection", "Refund"].includes(t.kind))
    .reduce((n, t) => n + (t.kind === "Refund" ? -t.amount : t.amount), 0);
  const value = b
    .filter((b) => !["Cancelled", "Hold", "Draft"].includes(b.status))
    .reduce((n, b) => n + b.contract, 0);
  const outstanding = b
    .filter((b) => b.status !== "Cancelled")
    .reduce((n, b) => n + b.contract - collected(s, b.id), 0);
  const payable = s.assignments
    .filter(
      (a) =>
        ids.has(
          s.sessions.find((x) => x.id === a.sessionId)?.bookingId || "",
        ) && ["Accepted", "Completed"].includes(a.status),
    )
    .reduce(
      (n, a) =>
        n +
        a.rate -
        s.transactions
          .filter(
            (t) =>
              t.assignmentId === a.id &&
              t.kind === "Payout" &&
              !reversed(s, t.id),
          )
          .reduce((n, t) => n + t.amount, 0),
      0,
    );
  const upcoming = s.sessions
    .filter(
      (x) => ids.has(x.bookingId) && x.start >= NOW && x.status !== "Cancelled",
    )
    .sort((a, b) => a.start.localeCompare(b.start));
  const alerts = notifications(s)
    .filter(
      (n) =>
        location === "All locations" ||
        n.detail.includes(location) ||
        b.some((b) => n.href.includes(b.id)),
    )
    .slice(0, 4);
  const chart = [1, 8, 15, 22, 29].map((day, index) => {
    const weekTx = tx.filter(
      (t) =>
        Number(t.at.slice(8, 10)) >= day && Number(t.at.slice(8, 10)) < day + 7,
    );
    return {
      name: `${day} ${period === "November 2026" ? "Nov" : "Oct"}`,
      collections: weekTx
        .filter((t) => ["Collection", "Refund"].includes(t.kind))
        .reduce(
          (n, t) => n + (t.kind === "Refund" ? -t.amount : t.amount) / 100,
          0,
        ),
      costs: weekTx
        .filter(
          (t) =>
            ["Expense", "Payout"].includes(t.kind) && t.approval !== "Pending",
        )
        .reduce((n, t) => n + t.amount / 100, 0),
      index,
    };
  });
  const issued = s.assets.filter((a) =>
    ["Issued", "Overdue"].includes(assetStatus(s, a.id)),
  );
  const overdue = issued.filter((a) => assetStatus(s, a.id) === "Overdue");
  const draftTasks = s.tasks.filter(
    (t) => !["Done", "Approved"].includes(t.status) && ids.has(t.bookingId),
  );
  const campaigns = s.campaigns.reduce((n, c) => n + c.spend, 0);
  return (
    <>
      <PageHeader
        title="Studio overview"
        description="Here’s what needs your attention today."
        eyebrow="TUESDAY, 24 NOVEMBER 2026"
        actions={
          <>
            <Select
              label="Dashboard location"
              value={location}
              onChange={setLocation}
              options={["All locations", ...s.settings.locations]}
            />
            <Button
              onClick={() =>
                forms.open(
                  "booking.create",
                  "New booking",
                  [
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
                      options: SERVICES,
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
                      required: true,
                    },
                    {
                      name: "advance",
                      label: "Initial payment milestone (₹)",
                      type: "number",
                      value: 50000,
                      min: 0,
                      required: true,
                    },
                    {
                      name: "dueDate",
                      label: "Delivery due date",
                      type: "date",
                      value: "2026-12-31",
                      required: true,
                    },
                  ],
                  {},
                  (id) => router.push(`/admin/events/${id}`),
                )
              }
            >
              <Plus size={17} />
              New booking
            </Button>
          </>
        }
      />
      <div className="overview-context">
        <span>
          <span className="live-dot" />A little clarity for the day ahead.
        </span>
        <Select
          label="Reporting period"
          value={period}
          onChange={setPeriod}
          options={["November 2026", "October 2026"]}
        />
      </div>
      <div className="metrics-grid">
        <Metric
          label="Collections received"
          value={money(cash)}
          detail={
            <>
              <span className="positive">Verified payments</span> · selected
              period
            </>
          }
          href="/admin/finance?tab=Collections"
          icon={<CircleDollarSign size={18} />}
        />
        <Metric
          label="Confirmed booking value"
          value={money(value)}
          detail={`${b.filter((b) => !["Cancelled", "Hold", "Draft"].includes(b.status)).length} confirmed bookings · all time`}
          href="/admin/events"
          icon={<Landmark size={18} />}
        />
        <Metric
          label="Customer balance"
          value={money(outstanding)}
          detail="Outstanding across active bookings"
          href="/admin/finance?tab=Collections"
          icon={<Wallet size={18} />}
        />
        <Metric
          label="Open crew payouts"
          value={money(payable)}
          detail="Accepted & completed assignments"
          href="/admin/finance?tab=Crew payouts"
          icon={<HandCoins size={18} />}
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Money in, work moving"
          caption={`Collections and paid direct costs · ${period}`}
          className="chart-panel"
          action={
            <Link className="text-link" href="/admin/finance">
              View finance
              <ArrowUpRight size={14} />
            </Link>
          }
        >
          <div className="chart-legend">
            <span>
              <i className="legend-collections" />
              Collections
            </span>
            <span>
              <i className="legend-costs" />
              Paid direct costs
            </span>
            <span className="chart-unit">INR</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chart}
                margin={{ top: 15, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cash-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity={0.12}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 5"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
                  dy={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                  width={55}
                />
                <Tooltip
                  formatter={(v) => money(Number(v) * 100)}
                  contentStyle={{
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  name="Collections"
                  dataKey="collections"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#cash-fill)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  name="Paid direct costs"
                  dataKey="costs"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  fill="transparent"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footer">
            <span>
              <CheckCircle2 size={14} />
              Based on verified ledger entries
            </span>
            <span>Cash flow · excludes planned costs</span>
          </div>
        </Panel>
        <Panel
          title="Needs your attention"
          caption="Small actions. A smoother studio."
          className="attention-panel"
          action={
            <span className="count-badge">{notifications(s).length}</span>
          }
        >
          <div className="attention-list">
            {alerts.length ? (
              alerts.map((n) => (
                <Link href={n.href} key={n.id} className="attention-row">
                  <span className={`attention-icon ${n.tone}`}>
                    {n.id.startsWith("issue") ? (
                      <Package size={17} />
                    ) : n.id.startsWith("lead") ? (
                      <UsersIcon />
                    ) : (
                      <CalendarDays size={17} />
                    )}
                  </span>
                  <span>
                    <strong>{n.title}</strong>
                    <small>{n.detail}</small>
                  </span>
                  <ChevronRight size={15} />
                </Link>
              ))
            ) : (
              <Empty title="All caught up" />
            )}
          </div>
          <Link className="panel-bottom-link" href="/admin/calendar">
            See the studio calendar
            <ArrowRight size={15} />
          </Link>
        </Panel>
        <Panel
          title="Next up on the calendar"
          caption={`${upcoming.length} upcoming sessions · every detail in place`}
          action={
            <Link href="/admin/calendar" className="text-link">
              View calendar
              <ArrowUpRight size={14} />
            </Link>
          }
        >
          <Table
            headers={["SESSION / BOOKING", "WHEN & WHERE", "CREW", "GEAR", ""]}
            rows={upcoming.slice(0, 4).map((x) => {
              const r = readiness(s, x.id);
              const b = s.bookings.find((b) => b.id === x.bookingId)!;
              return [
                <div key="name" className="session-name">
                  <span className="date-tile">
                    <strong>{date(x.start, { month: undefined })}</strong>
                    <small>{date(x.start, { day: undefined })}</small>
                  </span>
                  <RecordLink
                    href={`/admin/events/${b.id}`}
                    title={x.name}
                    subtitle={b.name.replace(" Wedding", "")}
                  />
                </div>,
                <div key="when">
                  <strong className="table-primary">{x.location}</strong>
                  <small>
                    {time(x.start)} – {time(x.end)}
                  </small>
                </div>,
                <span
                  key="crew"
                  className={`readiness ${r.crew >= r.required ? "complete" : ""}`}
                >
                  <Circle size={10} />
                  {r.crew}/{r.required} assigned
                </span>,
                <span
                  key="gear"
                  className={`readiness ${r.gear >= r.gearRequired ? "complete" : ""}`}
                >
                  <Circle size={10} />
                  {r.gear}/{r.gearRequired} reserved
                </span>,
                <Link
                  key="go"
                  href={`/admin/events/${b.id}`}
                  aria-label={`Open ${b.name}`}
                >
                  <ArrowUpRight size={17} />
                </Link>,
              ];
            })}
          />
        </Panel>
        <Panel
          title="Equipment, accounted for"
          caption="Physical custody · all service areas"
          action={<Package size={18} className="muted" />}
        >
          <div className="custody-counts">
            <div>
              <strong>
                {
                  s.assets.filter((a) => assetStatus(s, a.id) === "Available")
                    .length
                }
              </strong>
              <span>Available now</span>
            </div>
            <div>
              <strong>{issued.length}</strong>
              <span>With crew</span>
            </div>
            <div>
              <strong className="danger-text">{overdue.length}</strong>
              <span>Overdue</span>
            </div>
          </div>
          <div className="custody-bar">
            <i
              style={{
                width: `${((s.assets.length - issued.length) / s.assets.length) * 100}%`,
              }}
            />
            <i />
          </div>
          {overdue.map((a) => (
            <Link
              href={`/admin/equipment/${a.id}`}
              className="equipment-alert"
              key={a.id}
            >
              <span className="attention-icon danger">
                <CameraIcon />
              </span>
              <div>
                <strong>{a.model}</strong>
                <small>{a.id} · return overdue</small>
              </div>
              <ChevronRight size={16} />
            </Link>
          ))}
          <Link className="panel-bottom-link" href="/admin/equipment">
            Open equipment register
            <ArrowRight size={15} />
          </Link>
        </Panel>
        <Panel
          title="Stories in the making"
          caption="Production and delivery, without the guesswork"
          action={
            <Link href="/admin/production" className="text-link">
              Production board
              <ArrowUpRight size={14} />
            </Link>
          }
        >
          <div className="production-summary">
            {["In progress", "Review", "Changes requested", "Blocked"].map(
              (status) => (
                <Link
                  key={status}
                  href={`/admin/production?status=${encodeURIComponent(status)}`}
                >
                  <strong>
                    {draftTasks.filter((t) => t.status === status).length}
                  </strong>
                  <span>{status}</span>
                  <div
                    className={`mini-track ${status === "Blocked" ? "warning" : ""}`}
                  >
                    <i
                      style={{
                        width: `${(draftTasks.filter((t) => t.status === status).length / (draftTasks.length || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </Link>
              ),
            )}
          </div>
        </Panel>
        <Panel
          title="From enquiry to a story"
          caption="Simulated campaign overview"
          action={<Megaphone size={18} className="muted" />}
        >
          <div className="marketing-mini">
            <div>
              <span>Campaign spend</span>
              <strong>{money(campaigns)}</strong>
            </div>
            <div>
              <span>Attributed enquiries</span>
              <strong>{s.leads.filter((l) => l.campaignId).length}</strong>
            </div>
            <div>
              <span>Confirmed bookings</span>
              <strong>
                {
                  s.bookings.filter(
                    (b) =>
                      b.campaignId &&
                      !["Cancelled", "Hold", "Draft"].includes(b.status),
                  ).length
                }
              </strong>
            </div>
          </div>
          <Link className="panel-bottom-link" href="/admin/marketing">
            Explore marketing
            <ArrowRight size={15} />
          </Link>
        </Panel>
      </div>
      {forms.modal}
    </>
  );
}
function UsersIcon() {
  return <Megaphone size={17} />;
}
function CameraIcon() {
  return <Package size={17} />;
}
