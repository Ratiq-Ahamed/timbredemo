"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ScanLine,
  Plus,
  Package,
  Printer,
  Wrench,
} from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { assetStatus, date, money, NOW, openIssue } from "@/lib/demo/selectors";
import {
  Badge,
  Button,
  Empty,
  Field,
  FilterBar,
  Modal,
  PageHeader,
  Panel,
  RecordLink,
  Select,
  Table,
  Tabs,
} from "@/components/ui";
import { useActionForm } from "@/components/action-forms";
import { reservationFields, sessionOptions } from "./operations";
import type { DemoState, Issue } from "@/lib/demo/types";
import type { FormField } from "@/components/ui";
export const issueFields = (s: DemoState, assetId = "CAM-001"): FormField[] => [
  {
    name: "assetId",
    label: "Asset / scanned code",
    value: assetId,
    required: true,
    hint: "Manual fallback. Only stable asset IDs are accepted.",
  },
  {
    name: "sessionId",
    label: "Current-day shoot",
    type: "select",
    value: "S-014",
    options: sessionOptions(s).filter(
      (x) =>
        s.sessions.find((y) => y.id === x.value)?.start.slice(0, 10) ===
        "2026-11-24",
    ),
  },
  {
    name: "crewId",
    label: "Named custodian",
    type: "select",
    value: "F-001",
    options: s.crew.map((c) => ({ value: c.id, label: `${c.id} · ${c.name}` })),
  },
  {
    name: "dueBack",
    label: "Due back · India time",
    type: "datetime-local",
    value: "2026-11-24T20:00",
    required: true,
  },
  {
    name: "note",
    label: "Condition at issue",
    type: "textarea",
    value: "Good · body, battery and accessories checked",
    required: true,
  },
];
const returnFields: FormField[] = [
  {
    name: "condition",
    label: "Inspection outcome",
    type: "select",
    options: ["Good", "Damaged", "Missing"],
    value: "Good",
  },
  {
    name: "note",
    label: "Condition / inspection note",
    type: "textarea",
    required: true,
  },
];
export function Equipment({ assetId }: { assetId?: string }) {
  const s = useDemo((x) => x.data);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [location, setLocation] = useState("All locations");
  const [tab, setTab] = useState("Inventory");
  const [scan, setScan] = useState(false);
  const [scanCode, setScanCode] = useState("");
  const [qr, setQR] = useState<{ id: string; src: string } | null>(null);
  const forms = useActionForm();
  const asset = s.assets.find((a) => a.id === assetId);
  const printQR = async (id: string) => {
    const QR = await import("qrcode");
    setQR({
      id,
      src: await QR.toDataURL(`timbrel-asset:${id}`, { width: 320, margin: 2 }),
    });
  };
  const issue = (code = "CAM-001") =>
    forms.open(
      "gear.issue",
      "Issue equipment",
      issueFields(s, code),
      {},
      undefined,
      "Reserve gear first. Pickup is allowed for today’s shoot only. No camera access is required.",
    );
  const returnItem = (i: Issue) =>
    forms.open(
      "gear.return",
      `Inspect return · ${i.assetId}`,
      returnFields,
      { id: i.id },
      undefined,
      "Inspect one item at a time. Other issued items remain with the custodian; damaged returns enter quarantine.",
    );
  const service = (id: string) =>
    forms.open(
      "gear.maintenance",
      "Inspection & maintenance",
      [
        {
          name: "condition",
          label: "New condition",
          type: "select",
          options: ["Good", "Maintenance", "Under inspection", "Retired"],
          value: s.assets.find((a) => a.id === id)?.condition || "Good",
        },
        {
          name: "note",
          label: "Inspection / service note",
          type: "textarea",
          required: true,
        },
      ],
      { id },
    );
  const common = (
    <>
      <Modal
        open={scan}
        onClose={() => setScan(false)}
        title="Scan or enter an asset code"
        description="Demo scan uses a sample ID. The camera is not accessed."
      >
        <div className="stack">
          <Field label="Manual asset code">
            <input
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              placeholder="CAM-001"
            />
          </Field>
          <Button variant="secondary" onClick={() => setScanCode("CAM-001")}>
            <ScanLine size={16} />
            Simulate scan CAM-001
          </Button>
          <Button
            onClick={() => {
              setScan(false);
              issue(scanCode);
            }}
          >
            Continue to issue
            <ArrowRight size={15} />
          </Button>
          <p className="callout">
            Opaque asset identifiers only. QR codes contain no customer data or
            access credentials.
          </p>
        </div>
      </Modal>
      {qr && (
        <Modal
          open
          onClose={() => setQR(null)}
          title={`Equipment label · ${qr.id}`}
        >
          <div className="qr-preview">
            <img src={qr.src} alt={`QR code for asset ${qr.id}`} />
            <strong>{qr.id}</strong>
            <p className="muted small">
              Timbrel Studio · asset identifier only
            </p>
          </div>
          <Button
            onClick={() => {
              const w = window.open("", "_blank", "width=500,height=600");
              if (w) {
                w.document.write(
                  `<html><title>Asset label ${qr.id}</title><body style="text-align:center;font-family:Arial;padding:50px"><img width="250" src="${qr.src}"/><h2>${qr.id}</h2><p>Timbrel Studio · Equipment</p></body></html>`,
                );
                w.document.close();
                w.onload = () => w.print();
              }
            }}
          >
            <Printer size={15} />
            Print label
          </Button>
        </Modal>
      )}
      {forms.modal}
    </>
  );
  if (assetId && !asset)
    return (
      <Empty
        title="Equipment not found"
        action={
          <Link href="/admin/equipment" className="button">
            Equipment register
          </Link>
        }
      />
    );
  if (asset) {
    const issueRecord = openIssue(s, asset.id);
    return (
      <>
        <Link
          href="/admin/equipment"
          className="text-link"
          style={{ marginBottom: 18 }}
        >
          <ArrowLeft size={13} />
          Equipment register
        </Link>
        <PageHeader
          title={asset.model}
          description={`${asset.id} · ${asset.category} · ${asset.serial}`}
          actions={
            <>
              <Button variant="secondary" onClick={() => printQR(asset.id)}>
                <Printer size={15} />
                QR label
              </Button>
              <Button
                onClick={() =>
                  forms.open(
                    "reservation.create",
                    "Reserve equipment",
                    reservationFields(s, "S-014").map((f) =>
                      f.name === "assetId" ? { ...f, value: asset.id } : f,
                    ),
                  )
                }
              >
                <Plus size={15} />
                Reserve
              </Button>
            </>
          }
        />
        <div className="detail-grid">
          <div className="stack">
            <Panel>
              <div className="asset-hero">
                <Camera size={90} />
              </div>
              <div className="panel-body">
                <div
                  className="inline-actions"
                  style={{ justifyContent: "space-between", marginBottom: 20 }}
                >
                  <h2>Asset profile</h2>
                  <Badge>{assetStatus(s, asset.id)}</Badge>
                </div>
                <dl className="detail-labels">
                  <div>
                    <dt>Serial number</dt>
                    <dd>{asset.serial}</dd>
                  </div>
                  <div>
                    <dt>Condition</dt>
                    <dd>{asset.condition}</dd>
                  </div>
                  <div>
                    <dt>Sample home location</dt>
                    <dd>{asset.location}</dd>
                  </div>
                  <div>
                    <dt>Purchase value</dt>
                    <dd>
                      {money(asset.value)} · {date(asset.purchased)}
                    </dd>
                  </div>
                </dl>
                <div className="divider" />
                <div className="inline-actions">
                  {issueRecord ? (
                    <Button onClick={() => returnItem(issueRecord)}>
                      Inspect return
                    </Button>
                  ) : (
                    <Button onClick={() => issue(asset.id)}>
                      Issue equipment
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => service(asset.id)}>
                    <Wrench size={15} />
                    Service / inspection
                  </Button>
                </div>
              </div>
            </Panel>
            <Panel title="Upcoming reservations">
              <Table
                headers={["SESSION", "WHEN", "STATUS"]}
                rows={s.reservations
                  .filter((r) => r.assetId === asset.id)
                  .map((r) => {
                    const session = s.sessions.find(
                      (x) => x.id === r.sessionId,
                    )!;
                    return [
                      <RecordLink
                        key="session"
                        href={`/admin/events/${session.bookingId}?tab=Gear`}
                        title={session.name}
                        subtitle={session.id}
                      />,
                      date(r.start),
                      <Badge key="status">{r.status}</Badge>,
                    ];
                  })}
              />
            </Panel>
          </div>
          <div className="stack">
            <Panel title="Current custody">
              <div className="panel-body">
                {issueRecord ? (
                  <div className="summary-list">
                    <div>
                      <span>Custodian</span>
                      <strong>
                        {s.crew.find((c) => c.id === issueRecord.crewId)?.name}
                      </strong>
                    </div>
                    <div>
                      <span>Due back</span>
                      <strong>{date(issueRecord.dueBack)}</strong>
                    </div>
                    <div>
                      <span>Acknowledged</span>
                      <strong>
                        {issueRecord.acknowledged
                          ? "Yes"
                          : "Awaiting acknowledgement"}
                      </strong>
                    </div>
                    {issueRecord.returnRequested && (
                      <p className="callout warning">
                        Crew requested return. Verify physical receipt and
                        condition.
                      </p>
                    )}
                    <p className="callout">{issueRecord.conditionNote}</p>
                  </div>
                ) : (
                  <p className="muted small">
                    On hand · no open custodian record.
                  </p>
                )}
              </div>
            </Panel>
            <Panel title="Movement & service history">
              <div className="timeline">
                {s.movements
                  .filter((m) => m.assetId === asset.id)
                  .map((m) => (
                    <div className="timeline-item" key={m.id}>
                      <i className="timeline-dot" />
                      <div>
                        <strong>{m.description}</strong>
                        <p>
                          {date(m.at)} · {m.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                {!s.movements.some((m) => m.assetId === asset.id) && (
                  <p className="muted small">No movements recorded yet.</p>
                )}
              </div>
            </Panel>
          </div>
        </div>
        {common}
      </>
    );
  }
  const rows = s.assets.filter(
    (a) =>
      `${a.model} ${a.id} ${a.serial}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "All statuses" ||
        (status === "Issued"
          ? Boolean(openIssue(s, a.id))
          : assetStatus(s, a.id) === status)) &&
      (location === "All locations" || a.location === location),
  );
  return (
    <>
      <PageHeader
        title="Equipment register"
        description="Every asset. A named custodian. A complete history."
        actions={
          <>
            <Button variant="secondary" onClick={() => setScan(true)}>
              <ScanLine size={16} />
              Scan / enter code
            </Button>
            <Button onClick={() => issue()}>
              <Plus size={16} />
              Issue gear
            </Button>
          </>
        }
      />
      <div className="metrics-grid">
        <Link href="/admin/equipment" className="metric">
          <div className="metric-top">Serialised assets</div>
          <div className="metric-value">{s.assets.length}</div>
          <div className="metric-detail">
            Kits are templates, not additional stock
          </div>
        </Link>
        {["Available", "Issued", "Overdue"].map((st) => (
          <button
            className="metric"
            style={{ textAlign: "left" }}
            onClick={() => setStatus(st)}
            key={st}
          >
            <div className="metric-top">
              {st === "Available"
                ? "Available now"
                : st === "Issued"
                  ? "With crew"
                  : "Overdue returns"}
            </div>
            <div
              className={`metric-value ${st === "Overdue" ? "danger-text" : ""}`}
            >
              {
                s.assets.filter((a) =>
                  st === "Issued"
                    ? Boolean(openIssue(s, a.id))
                    : assetStatus(s, a.id) === st,
                ).length
              }
            </div>
            <div className="metric-detail">
              View matching equipment
              <ArrowRight
                size={10}
                style={{ display: "inline", marginLeft: 8 }}
              />
            </div>
          </button>
        ))}
      </div>
      <Tabs
        items={[
          "Inventory",
          "Reservations",
          "Issue & return",
          "Maintenance",
          "Kits",
          "Audit trail",
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Inventory" && (
        <>
          <FilterBar
            search={search}
            onSearch={setSearch}
            placeholder="Search model, asset ID or serial…"
            onClear={() => {
              setSearch("");
              setStatus("All statuses");
              setLocation("All locations");
            }}
          >
            <Select
              label="Equipment status"
              value={status}
              onChange={setStatus}
              options={[
                "All statuses",
                "Available",
                "Reserved",
                "Issued",
                "Overdue",
                "Maintenance",
                "Under inspection",
                "Lost",
              ]}
            />
            <Select
              label="Equipment stockroom"
              value={location}
              onChange={setLocation}
              options={[
                "All locations",
                ...new Set(s.assets.map((a) => a.location)),
              ]}
            />
            <span className="filter-count">{rows.length} assets</span>
          </FilterBar>
          <Panel>
            <Table
              headers={[
                "ASSET / MODEL",
                "CONDITION",
                "PHYSICAL / RESERVATION",
                "CURRENT CUSTODIAN",
                "NEXT RESERVATION",
                "",
              ]}
              rows={rows.map((a) => {
                const issue = openIssue(s, a.id);
                const reservation = s.reservations
                  .filter(
                    (r) =>
                      r.assetId === a.id &&
                      r.status === "Confirmed" &&
                      r.end > NOW,
                  )
                  .sort((a, b) => a.start.localeCompare(b.start))[0];
                return [
                  <div className="cell-person" key="name">
                    <span className="inventory-icon">
                      {a.category === "Camera" ? (
                        <Camera size={22} />
                      ) : (
                        <Package size={21} />
                      )}
                    </span>
                    <RecordLink
                      href={`/admin/equipment/${a.id}`}
                      title={a.model}
                      subtitle={`${a.id} · ${a.category}`}
                    />
                  </div>,
                  <Badge key="condition">{a.condition}</Badge>,
                  <Badge key="status">{assetStatus(s, a.id)}</Badge>,
                  issue ? (
                    <div key="custodian">
                      {s.crew.find((c) => c.id === issue.crewId)?.name}
                      <small>Due {date(issue.dueBack)}</small>
                    </div>
                  ) : (
                    "On hand"
                  ),
                  reservation ? date(reservation.start) : "—",
                  <Link key="link" href={`/admin/equipment/${a.id}`}>
                    <ArrowRight size={15} />
                  </Link>,
                ];
              })}
            />
          </Panel>
        </>
      )}
      {tab === "Reservations" && (
        <Panel
          title="Session reservations"
          action={
            <Button
              onClick={() =>
                forms.open(
                  "reservation.create",
                  "Reserve equipment",
                  reservationFields(s, "S-014"),
                )
              }
            >
              <Plus size={15} />
              Reserve
            </Button>
          }
        >
          <Table
            headers={["ASSET", "SESSION", "WINDOW", "STATUS"]}
            rows={s.reservations.map((r) => [
              <RecordLink
                key="asset"
                href={`/admin/equipment/${r.assetId}`}
                title={r.assetId}
                subtitle={s.assets.find((a) => a.id === r.assetId)?.model}
              />,
              <RecordLink
                key="session"
                href={`/admin/events/${s.sessions.find((x) => x.id === r.sessionId)?.bookingId}`}
                title={s.sessions.find((x) => x.id === r.sessionId)?.name || ""}
              />,
              `${date(r.start)} – ${date(r.end)}`,
              <Badge key="status">{r.status}</Badge>,
            ])}
          />
        </Panel>
      )}
      {tab === "Issue & return" && (
        <Panel
          title="Custody transactions"
          caption="Return individual lines to support partial returns; other items stay outstanding."
        >
          <Table
            headers={[
              "ASSET",
              "CUSTODIAN",
              "SESSION",
              "DUE BACK",
              "STATUS",
              "ACKNOWLEDGED",
              "",
            ]}
            rows={s.issues.map((i) => [
              <RecordLink
                key="asset"
                href={`/admin/equipment/${i.assetId}`}
                title={i.assetId}
                subtitle={s.assets.find((a) => a.id === i.assetId)?.model}
              />,
              s.crew.find((c) => c.id === i.crewId)?.name,
              s.sessions.find((x) => x.id === i.sessionId)?.name,
              date(i.dueBack),
              <Badge key="status">
                {i.status === "Issued" && i.dueBack < NOW
                  ? "Overdue"
                  : i.status}
              </Badge>,
              i.acknowledged ? "Yes" : "Pending",
              ["Issued", "Missing"].includes(i.status) ? (
                <Button
                  key="return"
                  variant="secondary"
                  onClick={() => returnItem(i)}
                >
                  {i.returnRequested
                    ? "Return requested · inspect"
                    : "Inspect return"}
                </Button>
              ) : (
                <span key="done" className="muted small">
                  Inspection recorded
                </span>
              ),
            ])}
          />
        </Panel>
      )}
      {tab === "Maintenance" && (
        <Panel
          title="Inspection & maintenance"
          caption="Release only after physical inspection; damaged equipment cannot be reserved."
        >
          <Table
            headers={["ASSET", "CONDITION", "LOCATION", ""]}
            rows={s.assets
              .filter((a) => !["Good", "Fair"].includes(a.condition))
              .map((a) => [
                <RecordLink
                  key="asset"
                  href={`/admin/equipment/${a.id}`}
                  title={a.model}
                  subtitle={a.id}
                />,
                <Badge key="condition">{a.condition}</Badge>,
                a.location,
                <Button
                  key="service"
                  variant="secondary"
                  onClick={() => service(a.id)}
                >
                  <Wrench size={15} />
                  Inspect / release
                </Button>,
              ])}
          />
        </Panel>
      )}
      {tab === "Kits" && (
        <div className="report-grid">
          {s.kits.map((k) => (
            <Panel
              key={k.id}
              title={k.name}
              caption={`${k.id} · reusable reservation template`}
            >
              <div className="panel-body stack">
                {k.assetIds.map((id) => (
                  <RecordLink
                    key={id}
                    href={`/admin/equipment/${id}`}
                    title={s.assets.find((a) => a.id === id)!.model}
                    subtitle={`${id} · ${assetStatus(s, id)}`}
                  />
                ))}
                <small>
                  Components count once in inventory. Reserve each serialised
                  asset against the shoot.
                </small>
              </div>
            </Panel>
          ))}
        </div>
      )}
      {tab === "Audit trail" && (
        <Panel title="Movements & inspection records">
          <Table
            headers={["ASSET", "MOVEMENT", "WHEN", "RECORDED BY"]}
            rows={s.movements.map((m) => [
              <Link key="asset" href={`/admin/equipment/${m.assetId}`}>
                {m.assetId}
              </Link>,
              m.description,
              date(m.at),
              m.actor,
            ])}
          />
        </Panel>
      )}
      {common}
    </>
  );
}
