"use client";
import { useState } from "react";
import {
  ArrowDownToLine,
  Check,
  Megaphone,
  RotateCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import {
  assetStatus,
  balance,
  collected,
  contractNet,
  date,
  money,
  paidCosts,
  plannedCost,
} from "@/lib/demo/selectors";
import {
  Badge,
  Button,
  Field,
  Modal,
  PageHeader,
  Panel,
  Select,
  Table,
  Tabs,
  exportCSV,
} from "@/components/ui";
import { BrandMark } from "@/components/shell";
import { useActionForm } from "@/components/action-forms";
export function Reports() {
  const s = useDemo((x) => x.data);
  const [location, setLocation] = useState("All locations");
  const [service, setService] = useState("All services");
  const [period, setPeriod] = useState("All demo dates");
  const [tab, setTab] = useState("Contribution");
  const rows = s.bookings.filter(
    (b) =>
      (location === "All locations" || b.location === location) &&
      (service === "All services" || b.service === service) &&
      (period === "All demo dates" ||
        s.sessions.some(
          (x) => x.bookingId === b.id && x.start.startsWith("2026-11"),
        )),
  );
  const exportRows = () => {
    if (tab === "Contribution")
      exportCSV(
        "event-contribution.csv",
        [
          "Booking",
          "Location",
          "Contract INR",
          "Planned cost INR",
          "Planned contribution INR",
          "Paid costs INR",
        ],
        rows.map((b) => [
          b.name,
          b.location,
          b.contract / 100,
          plannedCost(b) / 100,
          (contractNet(s, b) - plannedCost(b)) / 100,
          paidCosts(s, b.id) / 100,
        ]),
      );
    else if (tab === "Collections")
      exportCSV(
        "collections.csv",
        ["Booking", "Contract INR", "Collected INR", "Balance INR"],
        rows.map((b) => [
          b.name,
          b.contract / 100,
          collected(s, b.id) / 100,
          balance(s, b) / 100,
        ]),
      );
    else if (tab === "Delivery")
      exportCSV(
        "deliveries.csv",
        ["Booking", "Deliverable", "Due", "Status"],
        s.deliverables
          .filter((d) => rows.some((b) => b.id === d.bookingId))
          .map((d) => [d.bookingId, d.name, d.due, d.status]),
      );
    else if (tab === "Custody")
      exportCSV(
        "equipment-custody.csv",
        ["Asset", "Model", "Condition", "Status", "Location"],
        s.assets
          .filter(
            (a) =>
              location === "All locations" || a.location.includes(location),
          )
          .map((a) => [
            a.id,
            a.model,
            a.condition,
            assetStatus(s, a.id),
            a.location,
          ]),
      );
    else
      exportCSV(
        "marketing.csv",
        ["Campaign", "Spend INR", "Attributed leads", "Confirmed bookings"],
        s.campaigns.map((c) => [
          c.name,
          c.spend / 100,
          s.leads.filter(
            (l) =>
              l.campaignId === c.id &&
              (location === "All locations" || l.location === location) &&
              (service === "All services" || l.service === service),
          ).length,
          rows.filter(
            (b) =>
              b.campaignId === c.id &&
              !["Hold", "Draft", "Cancelled"].includes(b.status),
          ).length,
        ]),
      );
  };
  return (
    <>
      <PageHeader
        title="Studio reports"
        description="A grounded view of the work, the money, and the details."
        actions={
          <Button variant="secondary" onClick={exportRows}>
            <ArrowDownToLine size={15} />
            Export filtered CSV
          </Button>
        }
      />
      <div className="filter-bar">
        <Select
          label="Report service area"
          value={location}
          onChange={setLocation}
          options={["All locations", ...s.settings.locations]}
        />
        <Select
          label="Report service"
          value={service}
          onChange={setService}
          options={[
            "All services",
            ...new Set(s.bookings.map((b) => b.service)),
          ]}
        />
        <Select
          label="Report dates"
          value={period}
          onChange={setPeriod}
          options={["All demo dates", "November sessions"]}
        />
        <Button
          variant="ghost"
          onClick={() => {
            setLocation("All locations");
            setService("All services");
            setPeriod("All demo dates");
          }}
        >
          Clear all
        </Button>
      </div>
      <Tabs
        items={[
          "Contribution",
          "Collections",
          "Delivery",
          "Custody",
          "Marketing",
        ]}
        value={tab}
        onChange={setTab}
      />
      <Panel
        title={`${tab} report`}
        caption={
          tab === "Custody"
            ? "Physical stock filtered by sample stockroom; service/date filters apply to booking reports."
            : `${rows.length} matching bookings · ${location} · ${period}`
        }
      >
        {tab === "Contribution" ? (
          <Table
            headers={[
              "BOOKING",
              "CONTRACT",
              "PLANNED COST",
              "PLANNED CONTRIBUTION",
              "ACTUAL PAID COSTS",
            ]}
            rows={rows.map((b) => [
              b.name,
              money(b.contract),
              money(plannedCost(b)),
              money(contractNet(s, b) - plannedCost(b)),
              money(paidCosts(s, b.id)),
            ])}
          />
        ) : tab === "Collections" ? (
          <Table
            headers={["BOOKING", "CONTRACT", "VERIFIED COLLECTIONS", "BALANCE"]}
            rows={rows.map((b) => [
              b.name,
              money(b.contract),
              money(collected(s, b.id)),
              money(balance(s, b)),
            ])}
          />
        ) : tab === "Delivery" ? (
          <Table
            headers={["BOOKING", "DELIVERABLE", "DUE", "STATUS"]}
            rows={s.deliverables
              .filter((d) => rows.some((b) => b.id === d.bookingId))
              .map((d) => [
                s.bookings.find((b) => b.id === d.bookingId)?.name,
                d.name,
                date(d.due),
                <Badge key="status">{d.status}</Badge>,
              ])}
          />
        ) : tab === "Custody" ? (
          <Table
            headers={["ASSET", "MODEL", "CONDITION", "STATUS", "LOCATION"]}
            rows={s.assets
              .filter(
                (a) =>
                  location === "All locations" || a.location.includes(location),
              )
              .map((a) => [
                a.id,
                a.model,
                a.condition,
                <Badge key="status">{assetStatus(s, a.id)}</Badge>,
                a.location,
              ])}
          />
        ) : (
          <Table
            headers={[
              "CAMPAIGN",
              "MANUAL SPEND",
              "ATTRIBUTED ENQUIRIES",
              "CONFIRMED BOOKINGS",
            ]}
            rows={s.campaigns.map((c) => [
              c.name,
              money(c.spend),
              s.leads.filter(
                (l) =>
                  l.campaignId === c.id &&
                  (location === "All locations" || l.location === location) &&
                  (service === "All services" || l.service === service),
              ).length,
              rows.filter(
                (b) =>
                  b.campaignId === c.id &&
                  !["Hold", "Draft", "Cancelled"].includes(b.status),
              ).length,
            ])}
          />
        )}
      </Panel>
      <p className="muted small" style={{ marginTop: 15 }}>
        Reports use the shared demo store. Planned contribution is not net
        profit; campaign spend is a campaign-wide manual total.
      </p>
    </>
  );
}
export function Settings() {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const reset = useDemo((x) => x.reset);
  const [resetOpen, setResetOpen] = useState(false);
  const [integration, setIntegration] = useState("");
  const [purge, setPurge] = useState(false);
  const forms = useActionForm();
  const [buffer, setBuffer] = useState(s.settings.bufferMinutes);
  const [retention, setRetention] = useState(s.settings.retentionDays);
  const [newLocation, setNewLocation] = useState("");
  return (
    <>
      <PageHeader
        title="Workspace settings"
        description="Your demo preferences, brand, and connection status."
      />
      <div className="detail-grid">
        <div className="stack">
          <Panel
            title="Scheduling & catalogues"
            caption="Service areas are distinct from physical stockrooms."
          >
            <form
              className="panel-body form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const r = execute("settings.update", {
                  bufferMinutes: buffer,
                  retentionDays: retention,
                  location: newLocation,
                });
                if (r.ok) setNewLocation("");
              }}
            >
              <Field label="Travel / setup buffer (minutes)">
                <input
                  type="number"
                  min="0"
                  max="240"
                  value={buffer}
                  onChange={(e) => setBuffer(Number(e.target.value))}
                />
              </Field>
              <Field
                label="Sample retention policy (days)"
                hint="Policy metadata only. Nothing is deleted automatically."
              >
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={retention}
                  onChange={(e) => setRetention(Number(e.target.value))}
                />
              </Field>
              <Field label="Add demo service area">
                <input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="New illustrative service area"
                />
              </Field>
              <div className="inline-actions">
                {s.settings.locations.map((l) => (
                  <Badge key={l}>{l}</Badge>
                ))}
              </div>
              <div>
                <Button type="submit">
                  <Check size={15} />
                  Save preferences
                </Button>
              </div>
            </form>
          </Panel>
          <Panel
            title="Integrations"
            caption="No provider credentials, messages, payments or external uploads."
          >
            <div className="panel-body integrations">
              {[
                { name: "Meta lead ads", icon: Megaphone },
                { name: "WhatsApp", icon: ShieldCheck },
                { name: "Payments", icon: Wallet },
              ].map((i) => (
                <article className="integration-card" key={i.name}>
                  <i.icon size={22} />
                  <h3>{i.name}</h3>
                  <Badge>Not connected — demo</Badge>
                  <p>
                    Production access and provider setup are separately scoped.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setIntegration(i.name)}
                  >
                    Connection details
                  </Button>
                </article>
              ))}
            </div>
          </Panel>
          <Panel
            title="Audit trail"
            caption="Business mutations preserve actor and record references."
          >
            <Table
              headers={["ACTION", "RECORD", "ACTOR", "WHEN"]}
              rows={s.audit
                .slice(0, 12)
                .map((a) => [
                  a.message,
                  a.entityId || "Workspace",
                  a.actor,
                  date(a.at),
                ])}
            />
          </Panel>
        </div>
        <div className="stack">
          <Panel title="Studio identity">
            <div className="panel-body stack">
              <BrandMark />
              <p className="muted small">
                Product name: Timbrel Studio OS. Supplied “Timbrel Tales”
                artwork retained unchanged and approved for this local demo.
              </p>
              <p className="callout">
                The proposed forest, ivory and brass palette is a product design
                direction, not an official brand guideline.
              </p>
            </div>
          </Panel>
          <Panel title="Demo identities">
            <div className="panel-body stack">
              <Field label="Freelancer identity">
                <select
                  value={s.identity.crewId}
                  onChange={(e) =>
                    execute("identity.switch", {
                      role: "owner",
                      crewId: e.target.value,
                    })
                  }
                >
                  {s.crew.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} · {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Customer identity">
                <select
                  value={s.identity.customerId}
                  onChange={(e) =>
                    execute("identity.switch", {
                      role: "owner",
                      customerId: e.target.value,
                    })
                  }
                >
                  {s.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <small>
                Choose an identity here, then switch workspaces. This is
                simulated record scoping, not authentication.
              </small>
            </div>
          </Panel>
          <Panel title="Retention preview">
            <div className="panel-body stack">
              <p className="muted small">
                Gallery expiry and archive deletion are independent. This
                preview does not delete files or records.
              </p>
              <Button variant="secondary" onClick={() => setPurge(true)}>
                Preview retention policy
              </Button>
            </div>
          </Panel>
          <Panel title="Restore the demo">
            <div className="panel-body stack">
              <p className="muted small">
                Return all records, identities, selections and notifications to
                their original state.
              </p>
              <Button variant="secondary" onClick={() => setResetOpen(true)}>
                <RotateCcw size={15} />
                Reset demo data
              </Button>
              <small>
                Fixed clock · 24 Nov 2026, 10:00 IST
                <br />
                All changes stay in this browser.
              </small>
            </div>
          </Panel>
        </div>
      </div>
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Restore the original demo?"
        description="This removes all local demo changes and restores the exact initial scenario."
      >
        <div className="dialog-footer">
          <Button variant="secondary" onClick={() => setResetOpen(false)}>
            Keep my changes
          </Button>
          <Button
            onClick={() => {
              reset();
              window.location.assign(
                new URL("/admin", window.location.origin).href,
              );
            }}
          >
            <RotateCcw size={15} />
            Reset demo
          </Button>
        </div>
      </Modal>
      <Modal
        open={Boolean(integration)}
        onClose={() => setIntegration("")}
        title={`${integration} · not connected`}
      >
        <div className="stack">
          <Badge>Simulation only</Badge>
          <p>
            Live {integration} requires approved account access, provider
            configuration, consent where applicable, and server-side validation.
            No production connection is created by this demo.
          </p>
          {integration === "Meta lead ads" && (
            <Button
              onClick={() =>
                execute("meta.receive", { externalId: "meta-demo-2026-001" })
              }
            >
              Receive sample lead
            </Button>
          )}
          <p className="callout">
            Manual records, local CSV exports, and the existing Pixieset gallery
            link remain available.
          </p>
        </div>
      </Modal>
      <Modal
        open={purge}
        onClose={() => setPurge(false)}
        title="Retention preview"
        description="No deletion is performed."
      >
        <p className="callout">
          Proposed policy: {s.settings.retentionDays} days.{" "}
          {s.galleries.filter((g) => g.status === "Expired").length} galleries
          are explicitly expired in this demo. Access expiry alone never
          confirms archival deletion. Production retention needs agreed storage
          responsibilities, reminders and recovery rules.
        </p>
      </Modal>
      {forms.modal}
    </>
  );
}
