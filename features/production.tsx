"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, ArrowRight, LayoutGrid, List } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { date, money } from "@/lib/demo/selectors";
import { TASK_STATES } from "@/lib/demo/seed";
import {
  Badge,
  Button,
  Field,
  FilterBar,
  Modal,
  PageHeader,
  Panel,
  Select,
  Table,
  Tabs,
} from "@/components/ui";
import { useActionForm } from "@/components/action-forms";
import { sessionOptions } from "./operations";
export function Production() {
  const [tab, setTab] = useState("Production tasks");
  return (
    <>
      <PageHeader
        title="Production & delivery"
        description="Keep the creative work moving, one clear handover at a time."
      />
      <Tabs
        items={["Production tasks", "Media handovers", "Deliverables"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Production tasks" ? (
        <ProductionContent />
      ) : tab === "Media handovers" ? (
        <Handovers />
      ) : (
        <Deliverables />
      )}
    </>
  );
}
export function ProductionContent({ bookingId }: { bookingId?: string }) {
  const s = useDemo((x) => x.data);
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") || "All statuses");
  const [search, setSearch] = useState("");
  const [assignee, setAssignee] = useState("All assignees");
  const [due, setDue] = useState("All dates");
  const [view, setView] = useState("Board");
  const [selected, setSelected] = useState(params.get("task") || "");
  const forms = useActionForm();
  const task = s.tasks.find((t) => t.id === selected);
  const rows = s.tasks.filter(
    (t) =>
      (!bookingId || t.bookingId === bookingId) &&
      `${t.title} ${s.bookings.find((b) => b.id === t.bookingId)?.name}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "All statuses" || t.status === status) &&
      (assignee === "All assignees" || t.assignee === assignee) &&
      (due === "All dates" || t.due < "2026-11-24"),
  );
  const change = (id: string, value: string) =>
    forms.open(
      "task.update",
      "Update production task",
      [
        {
          name: "status",
          label: "Task status",
          type: "select",
          options: TASK_STATES,
          value,
        },
        {
          name: "note",
          label: "Review / revision / blocked note",
          type: "textarea",
          required: ["Blocked", "Changes requested"].includes(value),
        },
      ],
      { id },
    );
  return (
    <>
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search task or booking…"
        onClear={() => {
          setSearch("");
          setStatus("All statuses");
          setAssignee("All assignees");
          setDue("All dates");
        }}
      >
        <Select
          label="Task status"
          value={status}
          onChange={setStatus}
          options={["All statuses", ...TASK_STATES]}
        />
        <Select
          label="Task assignee"
          value={assignee}
          onChange={setAssignee}
          options={[
            "All assignees",
            ...new Set(s.tasks.map((t) => t.assignee)),
          ]}
        />
        <Select
          label="Task due date"
          value={due}
          onChange={setDue}
          options={["All dates", "Overdue"]}
        />
        <Button
          variant="secondary"
          onClick={() => setView(view === "Board" ? "List" : "Board")}
        >
          {view === "Board" ? <List size={14} /> : <LayoutGrid size={14} />}
          {view === "Board" ? "List view" : "Board view"}
        </Button>
      </FilterBar>
      {view === "Board" ? (
        <div className="board">
          {(status === "All statuses"
            ? [
                "Todo",
                "In progress",
                "Review",
                "Changes requested",
                "Blocked",
                "Approved",
                "Done",
              ]
            : [status]
          ).map((col) => (
            <div className="board-column" key={col}>
              <div className="board-column-header">
                <span>{col}</span>
                <span className="count-badge">
                  {rows.filter((t) => t.status === col).length}
                </span>
              </div>
              {rows
                .filter((t) => t.status === col)
                .map((t) => (
                  <button
                    className="board-card"
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                  >
                    <Badge>{t.type}</Badge>
                    <h3 style={{ marginTop: 12 }}>
                      {s.bookings.find((b) => b.id === t.bookingId)?.name}
                    </h3>
                    <p>
                      {t.title} · v{t.version}
                    </p>
                    <p>{t.assignee}</p>
                    {t.blockedReason && t.status === "Blocked" && (
                      <p className="danger-text">{t.blockedReason}</p>
                    )}
                    <div className="board-card-footer">
                      <small>Due {date(t.due)}</small>
                      <ArrowRight size={13} />
                    </div>
                  </button>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <Panel>
          <Table
            headers={["TASK", "BOOKING", "ASSIGNEE", "DUE", "STATUS", ""]}
            rows={rows.map((t) => [
              <button
                className="record-link"
                key="task"
                onClick={() => setSelected(t.id)}
              >
                <strong>{t.title}</strong>
                <small>
                  {t.id} · v{t.version}
                </small>
              </button>,
              s.bookings.find((b) => b.id === t.bookingId)?.name,
              t.assignee,
              date(t.due),
              <Badge key="status">{t.status}</Badge>,
              <Button
                key="open"
                variant="ghost"
                onClick={() => setSelected(t.id)}
              >
                Review
              </Button>,
            ])}
          />
        </Panel>
      )}
      {task && (
        <Modal
          open
          onClose={() => setSelected("")}
          title={task.title}
          description={`${s.bookings.find((b) => b.id === task.bookingId)?.name} · ${task.id} · Version ${task.version}`}
        >
          <div className="stack">
            <div className="inline-actions">
              <Badge>{task.status}</Badge>
              <span className="muted small">
                {task.assignee} · due {date(task.due)}
              </span>
            </div>
            <Field label="Move to">
              <select
                aria-label="Move production task"
                value={task.status}
                onChange={(e) => change(task.id, e.target.value)}
              >
                {TASK_STATES.map((st) => (
                  <option key={st}>{st}</option>
                ))}
              </select>
            </Field>
            <p className="callout">
              Review → Approved → Done. Changes requested requires a comment and
              creates a new work version. Linked deliverables become ready only
              after all their tasks are approved.
            </p>
            <h3>Comments & reviews</h3>
            {task.comments.map((c, i) => (
              <p className="callout" key={i}>
                {c}
              </p>
            ))}
          </div>
        </Modal>
      )}
      {forms.modal}
    </>
  );
}
export function Handovers() {
  const s = useDemo((x) => x.data);
  const forms = useActionForm();
  return (
    <>
      <div
        className="inline-actions"
        style={{ justifyContent: "flex-end", marginBottom: 18 }}
      >
        <Button
          onClick={() =>
            forms.open("handover.create", "Record media handover", [
              {
                name: "sessionId",
                label: "Completed shoot",
                type: "select",
                value: "S-007",
                options: sessionOptions(s).filter(
                  (x) =>
                    s.sessions.find((y) => y.id === x.value)!.end <
                    "2026-11-24T04:30:00Z",
                ),
              },
              {
                name: "crewId",
                label: "Handed over by",
                type: "select",
                value: "F-002",
                options: s.crew.map((c) => ({ value: c.id, label: c.name })),
              },
              {
                name: "reference",
                label: "Source card / drive reference",
                value: "CARD-DEMO-02",
                required: true,
              },
              {
                name: "size",
                label: "Media size (metadata only)",
                value: "64 GB",
                required: true,
              },
              {
                name: "count",
                label: "File count",
                type: "number",
                value: 1200,
                min: 1,
                required: true,
              },
              {
                name: "receivedBy",
                label: "Received by",
                value: "Studio owner",
                required: true,
              },
              {
                name: "storage",
                label: "Storage location label",
                value: "Local archive / project / card-02",
                required: true,
              },
              {
                name: "backupConfirmed",
                label: "Backup copy manually verified",
                type: "checkbox",
              },
            ])
          }
        >
          <Plus size={15} />
          Record handover
        </Button>
      </div>
      <Panel
        title="Media handover log"
        caption="Metadata records only. No large files are transferred or backups automatically verified."
      >
        <Table
          headers={[
            "BATCH / SOURCE",
            "SESSION",
            "SIZE / COUNT",
            "RECIPIENT",
            "STORAGE LABEL",
            "BACKUP",
          ]}
          rows={s.handovers.map((h) => [
            <div key="ref">
              <strong>{h.reference}</strong>
              <small>
                {h.id} · {date(h.at)}
              </small>
            </div>,
            s.sessions.find((x) => x.id === h.sessionId)?.name,
            `${h.size} · ${h.count} files`,
            h.receivedBy,
            h.storage,
            <Badge key="backup">
              {h.backupConfirmed ? "Manually verified" : "Unconfirmed"}
            </Badge>,
          ])}
        />
      </Panel>
      {forms.modal}
    </>
  );
}
export function Deliverables({ bookingId }: { bookingId?: string }) {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const forms = useActionForm();
  const rows = s.deliverables.filter(
    (d) => !bookingId || d.bookingId === bookingId,
  );
  return (
    <>
      <Panel
        title="Customer deliverables"
        caption="Production, release, dispatch and receipt are separate milestones."
      >
        <Table
          headers={[
            "DELIVERABLE",
            "BOOKING",
            "PROMISED",
            "DUE",
            "STATUS",
            "APPROVAL / REFERENCE",
            "",
          ]}
          rows={rows.map((d) => [
            <div key="d">
              <strong>{d.name}</strong>
              <small>
                {d.type} · {d.id}
              </small>
            </div>,
            s.bookings.find((b) => b.id === d.bookingId)?.name,
            `${d.quantity} ${d.quantity === 1 ? "item" : "files"}`,
            date(d.due),
            <Badge key="status">{d.status}</Badge>,
            <div key="tracking">
              {d.approved ? "Customer approved" : d.tracking || "—"}
              {d.method && (
                <small>
                  {d.method} · {money(d.cost || 0)}
                </small>
              )}
            </div>,
            <div className="inline-actions" key="actions">
              {d.status === "Planned" ? (
                <Button
                  variant="ghost"
                  onClick={() =>
                    execute("deliverable.update", {
                      id: d.id,
                      status: "In production",
                    })
                  }
                >
                  Start production
                </Button>
              ) : d.status === "In production" ? (
                <Button
                  variant="ghost"
                  onClick={() =>
                    execute("deliverable.update", { id: d.id, status: "Ready" })
                  }
                >
                  Mark ready
                </Button>
              ) : d.status === "Ready" ? (
                d.type === "Digital" ? (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      execute("deliverable.update", {
                        id: d.id,
                        status: "Released",
                      })
                    }
                  >
                    Release
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      forms.open(
                        "deliverable.update",
                        "Record physical dispatch",
                        [
                          {
                            name: "method",
                            label: "Delivery method",
                            type: "select",
                            options: [
                              "Courier",
                              "Studio pickup",
                              "Pen drive handover",
                            ],
                          },
                          {
                            name: "tracking",
                            label: "Courier / pickup reference",
                            required: true,
                          },
                          {
                            name: "cost",
                            label: "Physical delivery cost (₹)",
                            type: "number",
                            value: 500,
                            min: 0,
                          },
                        ],
                        { id: d.id, status: "Dispatched" },
                      )
                    }
                  >
                    Mark dispatched
                  </Button>
                )
              ) : ["Released", "Dispatched"].includes(d.status) ? (
                <Button
                  variant="ghost"
                  onClick={() =>
                    execute("deliverable.update", {
                      id: d.id,
                      status: "Delivered",
                    })
                  }
                >
                  Confirm delivered
                </Button>
              ) : (
                <span className="muted small">Acknowledged</span>
              )}
            </div>,
          ])}
        />
      </Panel>
      {forms.modal}
    </>
  );
}
