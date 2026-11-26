"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RotateCcw, Check } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import {
  assignmentPaid,
  balance,
  collected,
  contractNet,
  date,
  margin,
  money,
  paidCosts,
  plannedCost,
  reversed,
} from "@/lib/demo/selectors";
import {
  Badge,
  Button,
  ExportButton,
  FilterBar,
  Metric,
  PageHeader,
  Panel,
  RecordLink,
  Select,
  Table,
  Tabs,
  exportCSV,
} from "@/components/ui";
import {
  amountField,
  methodField,
  referenceField,
  useActionForm,
} from "@/components/action-forms";
export function Finance() {
  return (
    <>
      <PageHeader
        title="Finance"
        description="Clear collections, fair settlements, and a view of every event’s economics."
      />
      <FinanceContent />
    </>
  );
}
export function FinanceContent({ bookingId }: { bookingId?: string }) {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const params = useSearchParams();
  const [tab, setTab] = useState(
    ["Collections", "Crew payouts", "Expenses", "Event contribution"].includes(
      params.get("tab") || "",
    )
      ? params.get("tab")!
      : "Collections",
  );
  const [selected, setSelected] = useState(bookingId || "All bookings");
  const [search, setSearch] = useState("");
  const forms = useActionForm();
  const bookings = s.bookings.filter(
    (b) => selected === "All bookings" || b.id === selected,
  );
  const ids = new Set(bookings.map((b) => b.id));
  const tx = s.transactions.filter(
    (t) =>
      ids.has(t.bookingId) &&
      `${t.reference} ${t.id} ${s.bookings.find((b) => b.id === t.bookingId)?.name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const bookingFields = [
    {
      name: "bookingId",
      label: "Booking",
      type: "select" as const,
      value: selected === "All bookings" ? "EVT-0124" : selected,
      options: s.bookings
        .filter((b) => b.status !== "Cancelled")
        .map((b) => ({
          value: b.id,
          label: `${b.name} · due ${money(balance(s, b))}`,
        })),
    },
  ];
  const collection = () =>
    forms.open(
      "collection.add",
      "Record verified collection",
      [
        ...bookingFields,
        amountField(),
        methodField,
        referenceField(s.sequence),
      ],
      {},
      undefined,
      "This records a synthetic ledger entry. No real payment is processed.",
    );
  const totalBalance = bookings
    .filter((b) => b.status !== "Cancelled")
    .reduce((n, b) => n + balance(s, b), 0);
  const totalCollected = bookings.reduce((n, b) => n + collected(s, b.id), 0);
  const assignments = s.assignments.filter((a) =>
    ids.has(s.sessions.find((x) => x.id === a.sessionId)?.bookingId || ""),
  );
  const exportLedger = () =>
    exportCSV(
      "timbrel-finance.csv",
      [
        "ID",
        "Booking",
        "Kind",
        "Amount INR",
        "Verified",
        "Reference",
        "Reversal of",
      ],
      tx.map((t) => [
        t.id,
        t.bookingId,
        t.kind,
        t.amount / 100,
        t.verified ? "Yes" : "No",
        t.reference,
        t.reversesId || "",
      ]),
    );
  return (
    <>
      <div className="metrics-grid">
        <Metric
          label="Contract value"
          value={money(
            bookings
              .filter((b) => b.status !== "Cancelled")
              .reduce((n, b) => n + b.contract, 0),
          )}
          detail="Active commercial commitments"
        />
        <Metric
          label="Verified collections"
          value={money(totalCollected)}
          detail="Net of refunds and reversals"
        />
        <Metric
          label="Customer balance"
          value={money(totalBalance)}
          detail="Contract less net verified collections"
        />
        <Metric
          label="Paid direct costs"
          value={money(bookings.reduce((n, b) => n + paidCosts(s, b.id), 0))}
          detail="Approved expenses and crew payouts"
        />
      </div>
      <Tabs
        items={[
          "Collections",
          "Crew payouts",
          "Expenses",
          "Event contribution",
        ]}
        value={tab}
        onChange={setTab}
      />
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search transaction or booking…"
        onClear={() => {
          setSearch("");
          setSelected(bookingId || "All bookings");
        }}
      >
        {!bookingId && (
          <Select
            label="Finance booking"
            value={selected}
            onChange={setSelected}
            options={[
              { value: "All bookings", label: "All bookings" },
              ...s.bookings.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />
        )}
        <span className="spacer" />
        <ExportButton onClick={exportLedger} />
        {tab === "Collections" && (
          <>
            <Button
              variant="secondary"
              onClick={() =>
                forms.open(
                  "collection.refund",
                  "Record customer refund",
                  [
                    ...bookingFields,
                    amountField(5000),
                    methodField,
                    {
                      name: "reference",
                      label: "Refund reference / reason",
                      required: true,
                    },
                  ],
                  {},
                  undefined,
                  "A synthetic refund ledger entry only. No real transfer is initiated.",
                )
              }
            >
              Record refund
            </Button>
            <Button onClick={collection}>
              <Plus size={15} />
              Record collection
            </Button>
          </>
        )}
        {tab === "Expenses" && (
          <Button
            onClick={() =>
              forms.open("expense.add", "Record expense claim", [
                ...bookingFields,
                amountField(2500),
                {
                  name: "category",
                  label: "Category",
                  type: "select",
                  options: [
                    "Travel",
                    "Editing",
                    "Printing",
                    "Rental",
                    "Advertising allocation",
                    "Other",
                  ],
                },
                referenceField(s.sequence),
                methodField,
              ])
            }
          >
            <Plus size={15} />
            Add expense
          </Button>
        )}
      </FilterBar>
      {tab === "Collections" && (
        <div className="stack">
          <Panel
            title="Customer balances"
            caption="Verified collections only. Booking status does not settle customer balances."
          >
            <Table
              headers={[
                "BOOKING",
                "CONTRACT",
                "RECEIVED",
                "BALANCE",
                "INITIAL MILESTONE",
                "",
              ]}
              rows={bookings
                .filter((b) =>
                  b.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((b) => [
                  <RecordLink
                    key="b"
                    href={`/admin/events/${b.id}?tab=Finance`}
                    title={b.name}
                    subtitle={b.id}
                  />,
                  money(b.contract),
                  money(collected(s, b.id)),
                  <strong key="balance">{money(balance(s, b))}</strong>,
                  <Badge key="advance">
                    {collected(s, b.id) >= b.advance
                      ? "Advance met"
                      : "Awaiting advance"}
                  </Badge>,
                  <Button
                    key="record"
                    variant="ghost"
                    disabled={balance(s, b) <= 0}
                    onClick={() =>
                      forms.open(
                        "collection.add",
                        "Record verified collection",
                        [
                          amountField(),
                          methodField,
                          referenceField(s.sequence),
                        ],
                        { bookingId: b.id },
                      )
                    }
                  >
                    Record payment
                    <Plus size={14} />
                  </Button>,
                ])}
            />
          </Panel>
          <Panel title="Collections & reversal ledger">
            <Table
              headers={[
                "TRANSACTION",
                "BOOKING",
                "TYPE",
                "AMOUNT",
                "STATUS",
                "REFERENCE",
                "",
              ]}
              rows={tx
                .filter((t) =>
                  ["Collection", "Refund", "Reversal"].includes(t.kind),
                )
                .map((t) => [
                  <div key="id">
                    <strong>{t.id}</strong>
                    <small>{date(t.at)}</small>
                  </div>,
                  s.bookings.find((b) => b.id === t.bookingId)?.name,
                  <Badge key="kind">{t.kind}</Badge>,
                  money(t.amount),
                  <Badge key="status">
                    {reversed(s, t.id)
                      ? "Reversed"
                      : t.verified
                        ? "Verified"
                        : "Pending"}
                  </Badge>,
                  <div key="ref">
                    {t.reference}
                    <small>
                      {t.method}
                      {t.reversesId ? ` · reverses ${t.reversesId}` : ""}
                    </small>
                  </div>,
                  t.kind !== "Reversal" && !reversed(s, t.id) ? (
                    <Button
                      key="reverse"
                      variant="ghost"
                      onClick={() =>
                        forms.open(
                          "transaction.reverse",
                          "Reverse transaction",
                          [
                            {
                              name: "reason",
                              label: "Reversal reason",
                              type: "textarea",
                              required: true,
                            },
                          ],
                          { id: t.id },
                        )
                      }
                    >
                      <RotateCcw size={13} />
                      Reverse
                    </Button>
                  ) : (
                    "—"
                  ),
                ])}
            />
          </Panel>
        </div>
      )}
      {tab === "Crew payouts" && (
        <Panel
          title="Crew settlements"
          caption="Agreed session rates are separate from expense claims."
        >
          <Table
            headers={[
              "CREW / ASSIGNMENT",
              "BOOKING / SESSION",
              "AGREED RATE",
              "PAID",
              "REMAINING",
              "APPROVAL",
              "",
            ]}
            rows={assignments
              .filter((a) =>
                `${s.crew.find((c) => c.id === a.crewId)?.name} ${a.id}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((a) => {
                const session = s.sessions.find((x) => x.id === a.sessionId)!;
                return [
                  <div key="crew">
                    <strong>
                      {s.crew.find((c) => c.id === a.crewId)?.name}
                    </strong>
                    <small>
                      {a.id} · {a.status}
                    </small>
                  </div>,
                  <div key="session">
                    {s.bookings.find((b) => b.id === session.bookingId)?.name}
                    <small>
                      {session.name} · {date(session.start)}
                    </small>
                  </div>,
                  money(a.rate),
                  money(assignmentPaid(s, a)),
                  money(a.rate - assignmentPaid(s, a)),
                  <Badge key="approval">
                    {a.approved ? "Approved" : "Pending"}
                  </Badge>,
                  <div className="inline-actions" key="actions">
                    {!a.approved ? (
                      <Button
                        variant="ghost"
                        disabled={!["Accepted", "Completed"].includes(a.status)}
                        title="Assignment acceptance required"
                        onClick={() => execute("payout.approve", { id: a.id })}
                      >
                        Approve
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled={
                          assignmentPaid(s, a) >= a.rate ||
                          !["Accepted", "Completed"].includes(a.status)
                        }
                        onClick={() =>
                          forms.open(
                            "payout.add",
                            "Record crew payout",
                            [
                              amountField(
                                Math.min(
                                  3000,
                                  (a.rate - assignmentPaid(s, a)) / 100,
                                ),
                              ),
                              methodField,
                              referenceField(s.sequence),
                            ],
                            { assignmentId: a.id },
                          )
                        }
                      >
                        Record payout
                      </Button>
                    )}
                  </div>,
                ];
              })}
          />
        </Panel>
      )}
      {tab === "Expenses" && (
        <Panel
          title="Expense claims & approvals"
          caption="Approved claims become actual costs. Customer collections are unaffected."
        >
          <Table
            headers={[
              "EXPENSE",
              "BOOKING",
              "CATEGORY",
              "AMOUNT",
              "APPROVAL",
              "",
            ]}
            rows={tx
              .filter((t) => t.kind === "Expense")
              .map((t) => [
                <div key="ref">
                  <strong>{t.reference}</strong>
                  <small>
                    {t.id} · {date(t.at)}
                  </small>
                </div>,
                s.bookings.find((b) => b.id === t.bookingId)?.name,
                t.category,
                money(t.amount),
                <Badge key="approval">
                  {reversed(s, t.id) ? "Reversed" : t.approval || "Approved"}
                </Badge>,
                <div className="inline-actions" key="actions">
                  {t.approval === "Pending" ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          execute("expense.approve", {
                            id: t.id,
                            status: "Approved",
                          })
                        }
                      >
                        <Check size={13} />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          execute("expense.approve", {
                            id: t.id,
                            status: "Rejected",
                          })
                        }
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    !reversed(s, t.id) && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          forms.open(
                            "transaction.reverse",
                            "Reverse expense",
                            [
                              {
                                name: "reason",
                                label: "Reason",
                                type: "textarea",
                                required: true,
                              },
                            ],
                            { id: t.id },
                          )
                        }
                      >
                        Reverse
                      </Button>
                    )
                  )}
                </div>,
              ])}
          />
        </Panel>
      )}
      {tab === "Event contribution" && (
        <div className="stack">
          <div className="callout">
            Planned contribution = contract value excluding tax − planned direct
            costs. Actual paid costs and cash received are shown separately.
            Contribution does not include overheads or depreciation.
          </div>
          <Panel>
            <Table
              headers={[
                "BOOKING",
                "CONTRACT",
                "PLANNED COSTS",
                "PLANNED CONTRIBUTION",
                "MARGIN",
                "ACTUAL PAID COSTS",
                "COLLECTED",
              ]}
              rows={bookings
                .filter((b) =>
                  b.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((b) => [
                  <RecordLink
                    key="b"
                    href={`/admin/events/${b.id}`}
                    title={b.name}
                    subtitle={b.id}
                  />,
                  money(contractNet(s, b)),
                  money(plannedCost(b)),
                  money(contractNet(s, b) - plannedCost(b)),
                  margin(contractNet(s, b), plannedCost(b)) === null
                    ? "N/A"
                    : `${margin(contractNet(s, b), plannedCost(b))!.toFixed(0)}%`,
                  money(paidCosts(s, b.id)),
                  money(collected(s, b.id)),
                ])}
            />
          </Panel>
        </div>
      )}
      {forms.modal}
    </>
  );
}
