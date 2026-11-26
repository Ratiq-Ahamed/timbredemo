"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  LayoutGrid,
  List,
  Download,
  Send,
  Pencil,
  FileText,
} from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { date, money, quoteTotal } from "@/lib/demo/selectors";
import { SERVICES, STAGES } from "@/lib/demo/seed";
import {
  Avatar,
  Badge,
  Button,
  Field,
  FilterBar,
  Metric,
  Modal,
  PageHeader,
  Panel,
  Select,
  Table,
  Tabs,
  downloadText,
} from "@/components/ui";
import { useActionForm } from "@/components/action-forms";
import type { Input, Quote, QuoteItem } from "@/lib/demo/types";
export function Leads() {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const params = useSearchParams();
  const [selected, setSelected] = useState(params.get("lead") || "");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("Board");
  const [stage, setStage] = useState("Active stages");
  const [source, setSource] = useState("All sources");
  const [owner, setOwner] = useState("All owners");
  const [dateFilter, setDateFilter] = useState("All dates");
  const [importOpen, setImportOpen] = useState(false);
  const [csv, setCsv] = useState(
    "name,email,service,location\nAsha & Hari,asha@example.test,Wedding,Chennai",
  );
  const [importReport, setImportReport] = useState("");
  const forms = useActionForm();
  const router = useRouter();
  const lead = s.leads.find((l) => l.id === selected);
  const rows = s.leads.filter(
    (l) =>
      `${l.name} ${l.id} ${l.service}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (stage === "All stages" ||
        (stage === "Active stages" && !["Won", "Lost"].includes(l.stage)) ||
        l.stage === stage) &&
      (source === "All sources" || l.source === source) &&
      (owner === "All owners" || l.owner === owner) &&
      (dateFilter === "All dates" || l.followUp <= "2026-11-24"),
  );
  const add = () =>
    forms.open("lead.create", "New enquiry", [
      { name: "name", label: "Customer name", required: true },
      { name: "email", label: "Email", type: "email" },
      {
        name: "phone",
        label: "Phone (fictional demo only)",
        hint: "Use synthetic data. No messages are sent.",
      },
      { name: "service", label: "Service", type: "select", options: SERVICES },
      { name: "eventDate", label: "Event date (optional)", type: "date" },
      {
        name: "location",
        label: "Service area",
        type: "select",
        options: s.settings.locations,
      },
      {
        name: "source",
        label: "Source",
        type: "select",
        options: ["Manual", "Meta", "Instagram", "Referral", "Website"],
      },
      {
        name: "budget",
        label: "Estimated budget (₹)",
        type: "number",
        value: 150000,
        min: 0,
      },
      { name: "owner", label: "Owner", value: "Studio owner", required: true },
      {
        name: "followUp",
        label: "Next follow-up",
        type: "date",
        value: "2026-11-24",
      },
      {
        name: "allowDuplicate",
        label: "Confirmed legitimate repeat enquiry",
        type: "checkbox",
      },
    ]);
  const setLeadStage = (id: string, value: string) => {
    if (value === "Lost")
      forms.open(
        "lead.update",
        "Mark lead lost",
        [
          {
            name: "reason",
            label: "Loss reason",
            type: "textarea",
            required: true,
          },
        ],
        { id, stage: value },
      );
    else execute("lead.update", { id, stage: value });
  };
  const parsed = parseCSV(csv);
  const headers = parsed[0] || [];
  const [mapping, setMapping] = useState({
    name: "name",
    email: "email",
    service: "service",
    location: "location",
  });
  const importRows = parsed.slice(1).filter((r) => r.some(Boolean));
  const importValid = importRows.filter(
    (r) =>
      r[headers.indexOf(mapping.name)] &&
      (!r[headers.indexOf(mapping.email)] ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r[headers.indexOf(mapping.email)])),
  );
  return (
    <>
      <PageHeader
        title="Leads & enquiries"
        description="Every new story starts with a conversation."
        actions={
          <>
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              <Download size={15} />
              Import CSV
            </Button>
            <Button onClick={add}>
              <Plus size={16} />
              New enquiry
            </Button>
          </>
        }
      />
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search name, service or enquiry ID…"
        onClear={() => {
          setSearch("");
          setStage("Active stages");
          setSource("All sources");
          setOwner("All owners");
          setDateFilter("All dates");
        }}
      >
        <Select
          label="Lead stage"
          value={stage}
          onChange={setStage}
          options={["Active stages", "All stages", ...STAGES]}
        />
        <Select
          label="Lead source"
          value={source}
          onChange={setSource}
          options={[
            "All sources",
            "Manual",
            "Meta",
            "Instagram",
            "Referral",
            "Website",
          ]}
        />
        <Select
          label="Lead owner"
          value={owner}
          onChange={setOwner}
          options={["All owners", ...new Set(s.leads.map((l) => l.owner))]}
        />
        <Select
          label="Follow-up date"
          value={dateFilter}
          onChange={setDateFilter}
          options={["All dates", "Due today / overdue"]}
        />
      </FilterBar>
      <div className="inline-actions" style={{ marginBottom: 20 }}>
        <span className="muted small">{rows.length} enquiries</span>
        <span className="spacer" />
        <Button
          variant={view === "Board" ? "secondary" : "ghost"}
          onClick={() => setView("Board")}
        >
          <LayoutGrid size={15} />
          Board
        </Button>
        <Button
          variant={view === "List" ? "secondary" : "ghost"}
          onClick={() => setView("List")}
        >
          <List size={15} />
          List
        </Button>
      </div>
      {view === "Board" ? (
        <div className="board">
          {(stage === "Active stages"
            ? STAGES.slice(0, 5)
            : stage === "All stages"
              ? STAGES
              : [stage]
          ).map((col) => (
            <div className="board-column" key={col}>
              <div className="board-column-header">
                <span>{col}</span>
                <span className="count-badge">
                  {rows.filter((l) => l.stage === col).length}
                </span>
              </div>
              {rows
                .filter((l) => l.stage === col)
                .map((l) => (
                  <button
                    className="board-card"
                    key={l.id}
                    onClick={() => setSelected(l.id)}
                  >
                    <h3>{l.name}</h3>
                    <p>
                      {l.service} · {l.location}
                    </p>
                    <p>
                      {date(l.eventDate)} · {money(l.budget)}
                    </p>
                    <div className="board-card-footer">
                      <Badge>{l.source}</Badge>
                      <small>Follow-up {date(l.followUp)}</small>
                    </div>
                  </button>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <Panel>
          <Table
            headers={[
              "ENQUIRY",
              "SERVICE / DATE",
              "SOURCE",
              "BUDGET",
              "STAGE",
              "FOLLOW-UP",
              "",
            ]}
            rows={rows.map((l) => [
              <button
                key="name"
                className="record-link"
                onClick={() => setSelected(l.id)}
              >
                <strong>{l.name}</strong>
                <small>{l.id}</small>
              </button>,
              <div key="service">
                {l.service}
                <small>{date(l.eventDate)}</small>
              </div>,
              <Badge key="source">{l.source}</Badge>,
              money(l.budget),
              <Select
                key="stage"
                label={`Stage for ${l.name}`}
                value={l.stage}
                onChange={(v) => setLeadStage(l.id, v)}
                options={STAGES}
              />,
              date(l.followUp),
              <Button
                key="open"
                variant="ghost"
                onClick={() => setSelected(l.id)}
              >
                Open
                <ArrowRight size={14} />
              </Button>,
            ])}
          />
        </Panel>
      )}
      {lead && (
        <Modal
          open
          onClose={() => setSelected("")}
          title={lead.name}
          description={`${lead.id} · ${lead.service} · ${lead.location}`}
        >
          <div className="stack">
            <div className="detail-labels">
              <div>
                <small>Contact</small>
                <p>{lead.email}</p>
              </div>
              <div>
                <small>Event / budget</small>
                <p>
                  {date(lead.eventDate)} · {money(lead.budget)}
                </p>
              </div>
              <div>
                <small>Assigned to</small>
                <p>{lead.owner}</p>
              </div>
              <div>
                <small>Next follow-up</small>
                <p>{date(lead.followUp)}</p>
              </div>
            </div>
            <Select
              label="Enquiry stage"
              value={lead.stage}
              onChange={(v) => setLeadStage(lead.id, v)}
              options={STAGES}
            />
            {lead.lossReason && (
              <p className="callout">Loss reason: {lead.lossReason}</p>
            )}
            <div className="inline-actions">
              <Button
                onClick={() => {
                  const r = execute("quote.create", { leadId: lead.id });
                  if (r.ok) router.push(`/admin/quotes?quote=${r.id}`);
                }}
              >
                <FileText size={15} />
                Create quote
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  forms.open(
                    "lead.activity",
                    "Log activity & follow-up",
                    [
                      {
                        name: "note",
                        label: "Call / message / note",
                        type: "textarea",
                        required: true,
                      },
                      {
                        name: "followUp",
                        label: "Next follow-up",
                        type: "date",
                        value: lead.followUp,
                      },
                    ],
                    { id: lead.id },
                  )
                }
              >
                Log follow-up
              </Button>
            </div>
            <h3>Activity history</h3>
            <div className="timeline">
              {lead.activities.map((a, i) => (
                <div className="timeline-item" key={i}>
                  <i className="timeline-dot" />
                  <div>
                    <strong>{a}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import enquiries"
        description="Small local CSV only. Preview, map columns, and review duplicate/error results."
        wide
      >
        <div className="stack">
          <input
            aria-label="Choose CSV file"
            type="file"
            accept=".csv,text/csv"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 1000000) {
                  setImportReport("File too large. Maximum 1 MB.");
                  return;
                }
                setCsv(await file.text());
                setImportReport("");
              }
            }}
          />
          <Field label="CSV contents">
            <textarea
              rows={5}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
            />
          </Field>
          <div className="form-grid">
            {Object.keys(mapping).map((key) => (
              <Field key={key} label={`Map ${key}`}>
                <select
                  value={mapping[key as keyof typeof mapping]}
                  onChange={(e) =>
                    setMapping({ ...mapping, [key]: e.target.value })
                  }
                >
                  {headers.map((h, i) => (
                    <option key={i}>{h}</option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
          <p className="callout">
            {importRows.length} rows · {importValid.length} structurally valid ·{" "}
            {importRows.length - importValid.length} errors. Existing contacts
            are checked during import; no automatic merge.
          </p>
          <Table
            headers={["NAME", "EMAIL", "SERVICE", "LOCATION"]}
            rows={importRows
              .slice(0, 5)
              .map((r) =>
                Object.values(mapping).map((k) => r[headers.indexOf(k)] || "—"),
              )}
          />
          {importReport && (
            <p className="callout" role="status">
              {importReport}
            </p>
          )}
          <div className="inline-actions">
            <Button
              variant="secondary"
              onClick={() =>
                downloadText(
                  "lead-template.csv",
                  "name,email,service,location\nDemo Customer,demo@example.test,Wedding,Chennai",
                  "text/csv",
                )
              }
            >
              Download template
            </Button>
            <Button
              disabled={!importRows.length || !headers.includes(mapping.name)}
              onClick={() => {
                let added = 0;
                const failures: string[] = [];
                importRows.slice(0, 200).forEach((r, i) => {
                  const values: Input = {};
                  for (const [k, col] of Object.entries(mapping))
                    values[k] = r[headers.indexOf(col)] || "";
                  const out = execute("lead.import", {
                    ...values,
                    source: "Manual",
                  });
                  if (out.ok) added++;
                  else failures.push(`Row ${i + 2}: ${out.error}`);
                });
                setImportReport(
                  `${added} imported; ${failures.length} rejected. ${failures.join(" ")}`,
                );
              }}
            >
              Import {Math.min(importRows.length, 200)} rows
            </Button>
          </div>
        </div>
      </Modal>
      {forms.modal}
    </>
  );
}
export function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (c === '"') {
      if (quoted && content[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && content[i + 1] === "\n") i++;
      row.push(value.trim());
      rows.push(row);
      row = [];
      value = "";
    } else value += c;
  }
  if (value || row.length) {
    row.push(value.trim());
    rows.push(row);
  }
  return rows;
}
export function Marketing() {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const forms = useActionForm();
  const [explain, setExplain] = useState(false);
  const spend = s.campaigns.reduce((n, c) => n + c.spend, 0);
  const attributed = s.leads.filter((l) => l.campaignId);
  const booked = s.bookings.filter(
    (b) => b.campaignId && !["Cancelled", "Hold", "Draft"].includes(b.status),
  );
  return (
    <>
      <PageHeader
        title="Marketing & attribution"
        description="Connect your campaign spend to the stories you book."
        actions={
          <>
            <Button variant="secondary" onClick={() => setExplain(true)}>
              Connect Meta
            </Button>
            <Button
              onClick={() =>
                execute("meta.receive", { externalId: "meta-demo-2026-001" })
              }
            >
              <Plus size={15} />
              Receive sample lead
            </Button>
          </>
        }
      />
      <div
        className="callout section-gap"
        style={{ marginBottom: 24, marginTop: 0 }}
      >
        <Badge tone="info">Simulated Meta data</Badge> Campaign metrics are
        sample records. Replaying the sample external ID will not create
        duplicates.
      </div>
      <div className="metrics-grid">
        <Metric
          label="Campaign spend"
          value={money(spend)}
          detail="1–30 November · manual spend"
        />
        <Metric
          label="Attributed enquiries"
          value={attributed.length}
          detail={`${s.leads.length - attributed.length} unattributed enquiries`}
        />
        <Metric
          label="Confirmed bookings"
          value={booked.length}
          detail="Cancelled and held bookings excluded"
        />
        <Metric
          label="Cost per enquiry"
          value={attributed.length ? money(spend / attributed.length) : "N/A"}
          detail="Spend ÷ attributed enquiries"
        />
      </div>
      <Panel
        title="Campaign performance"
        caption="Sample acquisition cohort · November 2026. Booked value is not cash collected."
      >
        <Table
          headers={[
            "CAMPAIGN",
            "SPEND",
            "ENQUIRIES",
            "BOOKINGS",
            "BOOKED VALUE",
            "COST / BOOKING",
            "",
          ]}
          rows={s.campaigns.map((c) => {
            const leads = s.leads.filter((l) => l.campaignId === c.id);
            const bookings = booked.filter((b) => b.campaignId === c.id);
            return [
              <div key="name">
                <strong>{c.name}</strong>
                <small>
                  {c.channel} · {c.id}
                </small>
              </div>,
              money(c.spend),
              leads.length,
              bookings.length,
              money(bookings.reduce((n, b) => n + b.contract, 0)),
              bookings.length ? money(c.spend / bookings.length) : "N/A",
              <Button
                key="edit"
                variant="ghost"
                onClick={() =>
                  forms.open(
                    "campaign.spend",
                    "Edit manual campaign spend",
                    [
                      {
                        name: "spend",
                        label: "Spend (₹)",
                        type: "number",
                        value: c.spend / 100,
                        min: 0,
                        required: true,
                      },
                    ],
                    { id: c.id },
                  )
                }
              >
                <Pencil size={14} />
                Edit spend
              </Button>,
            ];
          })}
        />
      </Panel>
      <div className="two-col section-gap">
        <Panel title="Enquiry sources">
          <Table
            headers={["SOURCE", "ENQUIRIES", "WON"]}
            rows={[...new Set(s.leads.map((l) => l.source))].map((src) => [
              src,
              s.leads.filter((l) => l.source === src).length,
              s.leads.filter((l) => l.source === src && l.stage === "Won")
                .length,
            ])}
          />
        </Panel>
        <Panel
          title="Source funnel"
          caption="Current stage counts from the CRM"
        >
          <div className="panel-body summary-list">
            {STAGES.map((stage) => (
              <div key={stage}>
                <span>{stage}</span>
                <strong>
                  {s.leads.filter((l) => l.stage === stage).length}
                </strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Modal
        open={explain}
        onClose={() => setExplain(false)}
        title="Meta connection · demonstration"
      >
        <div className="stack">
          <Badge>Not connected — demo</Badge>
          <p>
            This prototype receives synthetic lead records only. Live intake
            requires authorized Page/ad account access, permissions, webhooks,
            retrieval, and retry/reconciliation.
          </p>
          <p className="callout">
            Use “Receive sample lead” to demonstrate attribution, or import
            enquiries manually from the Leads page. Personal WhatsApp history is
            not accessed.
          </p>
          <Link
            href="/admin/leads"
            className="button"
            onClick={() => setExplain(false)}
          >
            Open manual intake
            <ArrowRight size={15} />
          </Link>
        </div>
      </Modal>
      {forms.modal}
    </>
  );
}
export function Customers() {
  const s = useDemo((x) => x.data);
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(params.get("customer") || "");
  const forms = useActionForm();
  const c = s.customers.find((c) => c.id === selected);
  return (
    <>
      <PageHeader
        title="Customers"
        description="The people behind your favourite stories."
      />
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search customers…"
      />
      <Panel>
        <Table
          headers={["CUSTOMER", "CONTACT", "SERVICE AREA", "BOOKINGS", ""]}
          rows={s.customers
            .filter((c) =>
              `${c.name} ${c.email}`
                .toLowerCase()
                .includes(search.toLowerCase()),
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
              <div key="contact">
                {c.email}
                <small>{c.phone}</small>
              </div>,
              c.location,
              s.bookings.filter((b) => b.customerId === c.id).length,
              <Button
                key="open"
                variant="ghost"
                onClick={() => setSelected(c.id)}
              >
                View customer
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
          description={`${c.email} · ${c.phone}`}
        >
          <div className="stack">
            <h3>Related bookings</h3>
            {s.bookings
              .filter((b) => b.customerId === c.id)
              .map((b) => (
                <Link
                  className="callout"
                  key={b.id}
                  href={`/admin/events/${b.id}`}
                >
                  <strong>{b.name}</strong>
                  <p>
                    {b.id} · {b.status}
                  </p>
                </Link>
              ))}
            <h3>Internal notes</h3>
            <p className="callout">{c.notes || "No internal notes yet."}</p>
            <Button
              variant="secondary"
              onClick={() =>
                forms.open(
                  "customer.notes",
                  "Edit customer notes",
                  [
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
              Edit notes
            </Button>
            <h3>Activity</h3>
            {s.audit
              .filter(
                (a) =>
                  a.entityId === c.id ||
                  s.bookings.some(
                    (b) => b.id === a.entityId && b.customerId === c.id,
                  ),
              )
              .slice(0, 5)
              .map((a) => (
                <p key={a.id} className="muted small">
                  {a.message} · {date(a.at)}
                </p>
              ))}
          </div>
        </Modal>
      )}
      {forms.modal}
    </>
  );
}
export function Quotes() {
  const s = useDemo((x) => x.data);
  const params = useSearchParams();
  const [selected, setSelected] = useState(params.get("quote") || "");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Quotes");
  const forms = useActionForm();
  const q = s.quotes.find((q) => q.id === selected);
  return (
    <>
      <PageHeader
        title="Quotes & packages"
        description="Thoughtful proposals. Clear commitments."
        actions={
          <Button
            onClick={() =>
              forms.open(
                "quote.create",
                "Create a quote",
                [
                  {
                    name: "leadId",
                    label: "Choose an enquiry",
                    type: "select",
                    options: s.leads.map((l) => ({
                      value: l.id,
                      label: `${l.name} · ${l.service}`,
                    })),
                  },
                ],
                {},
                (id) => setSelected(id || ""),
              )
            }
          >
            <Plus size={16} />
            New quote
          </Button>
        }
      />
      <Tabs
        items={["Quotes", "Package catalogue"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Quotes" ? (
        <>
          <FilterBar
            search={search}
            onSearch={setSearch}
            placeholder="Search quotes…"
          />
          <Panel>
            <Table
              headers={[
                "QUOTE / CUSTOMER",
                "REVISION",
                "TOTAL",
                "INITIAL MILESTONE",
                "STATUS",
                "",
              ]}
              rows={s.quotes
                .filter((q) =>
                  `${q.name} ${q.id}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((q) => [
                  <button
                    className="record-link"
                    key="name"
                    onClick={() => setSelected(q.id)}
                  >
                    <strong>{q.name}</strong>
                    <small>{q.id}</small>
                  </button>,
                  `v${q.version}`,
                  money(quoteTotal(q).total),
                  money(q.advance),
                  <Badge key="status">{q.status}</Badge>,
                  <Button
                    key="edit"
                    variant="ghost"
                    onClick={() => setSelected(q.id)}
                  >
                    Open quote
                    <ArrowRight size={14} />
                  </Button>,
                ])}
            />
          </Panel>
        </>
      ) : (
        <div className="report-grid">
          {PACKAGES.map((p) => (
            <Panel key={p.name} title={p.name} caption={p.description}>
              <div className="panel-body">
                <div
                  className="stat-value"
                  style={{ fontSize: 25, marginBottom: 15 }}
                >
                  {money(p.rate)}
                </div>
                <p className="muted small">
                  Sample package · before tax. Prices are copied into each
                  quote.
                </p>
              </div>
            </Panel>
          ))}
        </div>
      )}
      {q && (
        <QuoteEditor key={q.id} quote={q} onClose={() => setSelected("")} />
      )}
      {forms.modal}
    </>
  );
}
export const PACKAGES = [
  {
    name: "Signature wedding collection",
    description: "Four sessions · photography, film and album",
    rate: 15000000,
  },
  {
    name: "Intimate celebrations",
    description: "One session · photography and highlight film",
    rate: 6500000,
  },
  {
    name: "Portrait stories",
    description: "A relaxed portrait session · edited collection",
    rate: 3500000,
  },
];
function QuoteEditor({
  quote: q,
  onClose,
}: {
  quote: Quote;
  onClose: () => void;
}) {
  const execute = useDemo((x) => x.execute);
  const router = useRouter();
  const [items, setItems] = useState<QuoteItem[]>(structuredClone(q.items));
  const [discount, setDiscount] = useState(q.discount / 100);
  const [advance, setAdvance] = useState(q.advance / 100);
  const [tax, setTax] = useState(q.taxPercent > 0);
  const [notes, setNotes] = useState(q.notes);
  const [error, setError] = useState("");
  const draft = q.status === "Draft";
  const current = {
    ...q,
    items,
    discount: Math.round(discount * 100),
    advance: Math.round(advance * 100),
    taxPercent: tax ? 18 : 0,
  };
  const total = quoteTotal(current);
  const update = (i: number, p: Partial<QuoteItem>) =>
    setItems(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const save = () => {
    const r = execute("quote.save", {
      id: q.id,
      items: JSON.stringify(items),
      discount: current.discount,
      advance: current.advance,
      taxPercent: current.taxPercent,
      notes,
    });
    if (!r.ok) setError(r.error);
    else setError("");
    return r.ok;
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={q.name}
      description={`${q.id} · Revision ${q.version} · ${q.status}`}
      wide
    >
      <div className="detail-grid">
        <div className="stack">
          {draft && (
            <Field label="Add from package catalogue">
              <select
                defaultValue=""
                onChange={(e) => {
                  const p = PACKAGES.find((p) => p.name === e.target.value);
                  if (p)
                    setItems([
                      ...items,
                      {
                        id: `QI-${q.id}-${items.length}`,
                        label: p.name,
                        quantity: 1,
                        rate: p.rate,
                        optional: false,
                        included: true,
                      },
                    ]);
                  e.target.value = "";
                }}
              >
                <option value="" disabled>
                  Select a package…
                </option>
                {PACKAGES.map((p) => (
                  <option key={p.name}>{p.name}</option>
                ))}
              </select>
            </Field>
          )}
          <div className="quote-items">
            {items.map((item, i) => (
              <div className="quote-item" key={item.id}>
                <Field label="Description">
                  <input
                    disabled={!draft}
                    value={item.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                  />
                </Field>
                <Field label="Qty">
                  <input
                    disabled={!draft}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      update(i, { quantity: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Rate (₹)">
                  <input
                    disabled={!draft}
                    type="number"
                    min="0"
                    value={item.rate / 100}
                    onChange={(e) =>
                      update(i, {
                        rate: Math.round(Number(e.target.value) * 100),
                      })
                    }
                  />
                </Field>
                <button
                  aria-label={`Remove ${item.label}`}
                  disabled={!draft || items.length === 1}
                  onClick={() => setItems(items.filter((_, j) => i !== j))}
                >
                  ×
                </button>
                <label className="quote-optional">
                  <input
                    disabled={!draft}
                    type="checkbox"
                    checked={item.optional}
                    onChange={(e) => update(i, { optional: e.target.checked })}
                  />
                  Optional extra
                  {item.optional && (
                    <>
                      <input
                        aria-label={`Include ${item.label}`}
                        disabled={!draft}
                        type="checkbox"
                        checked={item.included}
                        onChange={(e) =>
                          update(i, { included: e.target.checked })
                        }
                      />
                      Include in total
                    </>
                  )}
                </label>
              </div>
            ))}
          </div>
          {draft && (
            <Button
              variant="secondary"
              onClick={() =>
                setItems([
                  ...items,
                  {
                    id: `QI-${q.id}-${items.length}`,
                    label: "Additional service",
                    quantity: 1,
                    rate: 100000,
                    optional: false,
                    included: true,
                  },
                ])
              }
            >
              <Plus size={15} />
              Add line item
            </Button>
          )}
          <Field label="Terms & notes">
            <textarea
              disabled={!draft}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>
        <div className="stack">
          <Panel title="Quote summary">
            <div className="panel-body summary-list">
              <div>
                <span>Subtotal</span>
                <strong>{money(total.subtotal)}</strong>
              </div>
              <Field label="Discount (₹)">
                <input
                  aria-label="Discount in rupees"
                  disabled={!draft}
                  min="0"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </Field>
              <label className="inline-actions small">
                <input
                  disabled={!draft}
                  type="checkbox"
                  checked={tax}
                  onChange={(e) => setTax(e.target.checked)}
                />
                Apply sample tax (18%)
              </label>
              <div>
                <span>Sample tax</span>
                <strong>{money(total.tax)}</strong>
              </div>
              <div className="total">
                <span>Total</span>
                <strong>{money(total.total)}</strong>
              </div>
              <Field label="Initial milestone (₹)">
                <input
                  disabled={!draft}
                  min="0"
                  type="number"
                  value={advance}
                  onChange={(e) => setAdvance(Number(e.target.value))}
                />
              </Field>
              <small>Verified advance required to confirm the booking.</small>
            </div>
          </Panel>
          {!draft && (
            <p className="callout">
              Issued commercial values are locked. Create a new revision to
              change them.
            </p>
          )}
        </div>
      </div>
      {error && <p className="inline-error">{error}</p>}
      <div className="dialog-footer" style={{ flexWrap: "wrap" }}>
        {draft ? (
          <>
            <Button variant="secondary" onClick={save}>
              Save draft
            </Button>
            <Button
              onClick={() => {
                if (save())
                  execute("quote.status", { id: q.id, status: "Sent" });
              }}
            >
              <Send size={15} />
              Mark sent · demo
            </Button>
          </>
        ) : q.status === "Sent" ? (
          <>
            <Button
              variant="secondary"
              onClick={() =>
                execute("quote.status", { id: q.id, status: "Declined" })
              }
            >
              Decline
            </Button>
            <Button
              onClick={() =>
                execute("quote.status", { id: q.id, status: "Accepted" })
              }
            >
              Accept quote · demo
            </Button>
          </>
        ) : q.status === "Accepted" ? (
          q.bookingId ? (
            <Link href={`/admin/events/${q.bookingId}`} className="button">
              Open linked booking
              <ArrowRight size={15} />
            </Link>
          ) : (
            <Button
              onClick={() => {
                const r = execute("quote.convert", { id: q.id });
                if (r.ok) router.push(`/admin/events/${r.id}`);
              }}
            >
              Create held booking
              <ArrowRight size={15} />
            </Button>
          )
        ) : null}
        <Link
          className="button secondary"
          target="_blank"
          href={`/print/quote/${q.id}`}
        >
          Print preview
        </Link>
        {!draft && (
          <Button
            variant="secondary"
            onClick={() => {
              const r = execute("quote.create", {
                sourceId: q.id,
                leadId: q.leadId,
              });
              if (r.ok) {
                onClose();
                router.push(`/admin/quotes?quote=${r.id}`);
                router.refresh();
              }
            }}
          >
            New revision
          </Button>
        )}
      </div>
    </Modal>
  );
}
