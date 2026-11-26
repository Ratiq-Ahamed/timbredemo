"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Camera,
  CalendarDays,
  Check,
  Clock3,
  Home,
  MapPin,
  Package,
  Wallet,
  FileText,
  Truck,
} from "lucide-react";
import { BrandMark, RoleSwitcher } from "@/components/shell";
import {
  Avatar,
  Badge,
  Button,
  Empty,
  Metric,
  Modal,
  Panel,
  Table,
} from "@/components/ui";
import { useDemo } from "@/lib/demo/store";
import {
  assignmentPaid,
  balance,
  collected,
  crewPayable,
  date,
  money,
  NOW,
  time,
} from "@/lib/demo/selectors";
import {
  amountField,
  referenceField,
  useActionForm,
} from "@/components/action-forms";
export function FreelancerApp({ section = "" }: { section?: string }) {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const path = usePathname();
  const [selected, setSelected] = useState("");
  const forms = useActionForm();
  if (s.identity.role === "client")
    return (
      <div className="access-state">
        <h1>Freelancer workspace</h1>
        <p>Switch demo roles to view your assigned jobs.</p>
        <RoleSwitcher />
      </div>
    );
  if (!["", "jobs", "gear", "payouts"].includes(section))
    return (
      <Empty
        title="Page not found"
        action={
          <Link href="/freelancer" className="button">
            Freelancer home
          </Link>
        }
      />
    );
  const crew = s.crew.find((c) => c.id === s.identity.crewId)!;
  const assignments = s.assignments.filter((a) => a.crewId === crew.id);
  const issues = s.issues.filter((i) => i.crewId === crew.id);
  const open = issues.filter((i) => ["Issued", "Missing"].includes(i.status));
  const upcoming = assignments
    .filter(
      (a) =>
        !["Declined", "Cancelled"].includes(a.status) &&
        s.sessions.find((x) => x.id === a.sessionId)!.end >= NOW,
    )
    .sort((a, b) =>
      s.sessions
        .find((x) => x.id === a.sessionId)!
        .start.localeCompare(
          s.sessions.find((x) => x.id === b.sessionId)!.start,
        ),
    );
  const assignment = assignments.find((a) => a.id === selected);
  const job = assignment
    ? s.sessions.find((x) => x.id === assignment.sessionId)
    : undefined;
  const handover = (sessionId: string) =>
    forms.open(
      "handover.create",
      "Submit media handover",
      [
        {
          name: "reference",
          label: "Source card / drive reference",
          required: true,
          value: "CARD-DEMO-01",
        },
        {
          name: "size",
          label: "Media size (metadata)",
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
          value: "Local archive / project / card-01",
          required: true,
        },
        {
          name: "backupConfirmed",
          label: "Backup copy manually verified",
          type: "checkbox",
        },
      ],
      { sessionId },
    );
  const jobCard = (a: (typeof assignments)[number]) => {
    const x = s.sessions.find((x) => x.id === a.sessionId)!;
    const b = s.bookings.find((b) => b.id === x.bookingId)!;
    return (
      <article className="job-card" key={a.id}>
        <div
          className="inline-actions"
          style={{ justifyContent: "space-between" }}
        >
          <Badge>{a.status}</Badge>
          <small>{x.id}</small>
        </div>
        <h2>{b.name}</h2>
        <p className="muted small">
          {x.name} · {a.role}
        </p>
        <div className="job-meta">
          <div>
            <CalendarDays size={16} />
            {date(x.start, { year: "numeric" })} · {time(x.start)} –{" "}
            {time(x.end)}
          </div>
          <div>
            <MapPin size={16} />
            {x.venue}
          </div>
        </div>
        {a.status === "Proposed" && (
          <div className="inline-actions">
            <Button
              onClick={() =>
                execute("assignment.respond", { id: a.id, status: "Accepted" })
              }
            >
              <Check size={15} />
              Accept job
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                execute("assignment.respond", { id: a.id, status: "Declined" })
              }
            >
              Decline
            </Button>
          </div>
        )}
        <div className="job-card-footer">
          <div>
            <small>Agreed session rate</small>
            <strong>{money(a.rate)}</strong>
          </div>
          <Button variant="secondary" onClick={() => setSelected(a.id)}>
            Job details
            <ArrowRight size={15} />
          </Button>
        </div>
      </article>
    );
  };
  return (
    <div className="freelancer-shell">
      <header className="freelancer-top">
        <BrandMark small />
        <RoleSwitcher />
      </header>
      <main className="freelancer-content">
        {s.identity.role === "owner" && (
          <p className="callout" style={{ marginBottom: 20 }}>
            Owner preview · showing only {crew.name}’s records.
          </p>
        )}
        <div
          className="inline-actions"
          style={{ justifyContent: "space-between", marginBottom: 24 }}
        >
          <div>
            <span className="eyebrow">YOUR CREATIVE WORKSPACE</span>
            <h1>
              {section === "jobs"
                ? "Your assignments"
                : section === "gear"
                  ? "Gear in your care"
                  : section === "payouts"
                    ? "Your payouts"
                    : `Good morning, ${crew.name.split(" ")[0]}.`}
            </h1>
          </div>
          <Avatar name={crew.name} />
        </div>
        {!section && (
          <>
            <p className="muted small" style={{ marginBottom: 25 }}>
              Here’s what’s happening around your next shoot.
            </p>
            <div className="freelancer-stats">
              <Metric
                label="Upcoming assignments"
                value={upcoming.length}
                detail={`${assignments.filter((a) => a.status === "Proposed").length} awaiting your response`}
              />
              <Metric
                label="Open payable"
                value={money(crewPayable(s, crew.id))}
                detail="Your accepted session rates"
              />
            </div>
            <div className="section-title">
              <h2>Your next shoot</h2>
              <Link href="/freelancer/jobs" className="text-link">
                All jobs
                <ArrowRight size={14} />
              </Link>
            </div>
            {upcoming[0] ? (
              jobCard(upcoming[0])
            ) : (
              <Empty title="No upcoming assignments" />
            )}
            <div className="section-title">
              <h2>Needs your response</h2>
            </div>
            <div className="stack">
              {assignments.filter((a) => a.status === "Proposed").map(jobCard)}
              {open
                .filter((i) => !i.acknowledged)
                .map((i) => (
                  <Panel
                    key={i.id}
                    title={`Acknowledge ${i.assetId}`}
                    caption={s.assets.find((a) => a.id === i.assetId)?.model}
                  >
                    <div className="panel-body">
                      <Button
                        onClick={() =>
                          execute("gear.acknowledge", { id: i.id })
                        }
                      >
                        Confirm custody
                      </Button>
                    </div>
                  </Panel>
                ))}
            </div>
            <div className="section-title">
              <h2>Equipment with you</h2>
              <Link href="/freelancer/gear" className="text-link">
                {open.length} items
                <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
        {section === "jobs" && (
          <div className="stack">{assignments.map(jobCard)}</div>
        )}
        {section === "gear" && (
          <div className="stack">
            {issues.length ? (
              issues.map((i) => (
                <article className="job-card" key={i.id}>
                  <div
                    className="inline-actions"
                    style={{ justifyContent: "space-between" }}
                  >
                    <span className="inventory-icon">
                      <Camera size={22} />
                    </span>
                    <Badge>
                      {i.status === "Issued" && i.dueBack < NOW
                        ? "Overdue"
                        : i.status}
                    </Badge>
                  </div>
                  <h2>{s.assets.find((a) => a.id === i.assetId)?.model}</h2>
                  <p className="muted small">
                    {i.assetId} ·{" "}
                    {s.sessions.find((x) => x.id === i.sessionId)?.name}
                  </p>
                  <div className="job-meta">
                    <div>
                      <Clock3 size={16} />
                      Due back {date(i.dueBack)} · {time(i.dueBack)}
                    </div>
                    <div>
                      <Package size={16} />
                      {i.conditionNote}
                    </div>
                  </div>
                  {i.status === "Issued" && (
                    <div className="inline-actions">
                      {!i.acknowledged ? (
                        <Button
                          onClick={() =>
                            execute("gear.acknowledge", { id: i.id })
                          }
                        >
                          Acknowledge gear
                        </Button>
                      ) : (
                        <Badge>Custody acknowledged</Badge>
                      )}
                      <Button
                        variant="secondary"
                        disabled={i.returnRequested}
                        onClick={() =>
                          execute("gear.requestReturn", { id: i.id })
                        }
                      >
                        {i.returnRequested
                          ? "Return requested"
                          : "Request return"}
                      </Button>
                    </div>
                  )}
                  <p className="muted small" style={{ marginTop: 15 }}>
                    Studio staff verify physical receipt and condition.
                  </p>
                </article>
              ))
            ) : (
              <Empty title="No equipment in your care" />
            )}
          </div>
        )}
        {section === "payouts" && (
          <div className="stack">
            <div className="freelancer-stats">
              <Metric
                label="Agreed accepted rates"
                value={money(
                  assignments
                    .filter((a) => ["Accepted", "Completed"].includes(a.status))
                    .reduce((n, a) => n + a.rate, 0),
                )}
                detail="Only your own assignments"
              />
              <Metric
                label="Remaining payable"
                value={money(crewPayable(s, crew.id))}
                detail="Verified settlements deducted"
              />
            </div>
            {assignments
              .filter((a) => ["Accepted", "Completed"].includes(a.status))
              .map((a) => (
                <Panel
                  key={a.id}
                  title={
                    s.bookings.find(
                      (b) =>
                        b.id ===
                        s.sessions.find((x) => x.id === a.sessionId)?.bookingId,
                    )?.name
                  }
                  caption={`${s.sessions.find((x) => x.id === a.sessionId)?.name} · ${a.id}`}
                >
                  <div className="panel-body summary-list">
                    <div>
                      <span>Agreed rate</span>
                      <strong>{money(a.rate)}</strong>
                    </div>
                    <div>
                      <span>Paid</span>
                      <strong>{money(assignmentPaid(s, a))}</strong>
                    </div>
                    <div>
                      <span>Remaining</span>
                      <strong>{money(a.rate - assignmentPaid(s, a))}</strong>
                    </div>
                    <Badge>
                      {a.approved ? "Approved" : "Awaiting approval"}
                    </Badge>
                  </div>
                </Panel>
              ))}
            <Panel title="Settlement history">
              <Table
                headers={["DATE", "REFERENCE", "AMOUNT"]}
                rows={s.transactions
                  .filter((t) => t.crewId === crew.id && t.kind === "Payout")
                  .map((t) => [date(t.at), t.reference, money(t.amount)])}
              />
            </Panel>
          </div>
        )}
        {assignment && job && (
          <Modal
            open
            onClose={() => setSelected("")}
            title={s.bookings.find((b) => b.id === job.bookingId)!.name}
            description={`${job.name} · ${assignment.role}`}
          >
            <div className="stack">
              <div className="detail-labels">
                <div>
                  <small>Call time</small>
                  <p>
                    {date(job.start)} · {time(job.start)}
                  </p>
                </div>
                <div>
                  <small>Venue / directions</small>
                  <p>{job.venue}</p>
                </div>
                <div>
                  <small>Studio contact (sample)</small>
                  <p>+91 ••••• ••000</p>
                </div>
                <div>
                  <small>Your agreed rate</small>
                  <p>{money(assignment.rate)}</p>
                </div>
              </div>
              <p className="callout">
                Bring reserved equipment only. Check condition at pickup. Return
                media with a clearly labeled card or drive reference.
              </p>
              <div className="inline-actions">
                {job.end < NOW && (
                  <>
                    <Button onClick={() => handover(job.id)}>
                      Log media handover
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        execute("session.complete", { id: job.id })
                      }
                    >
                      Mark shoot complete
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  onClick={() =>
                    forms.open(
                      "expense.add",
                      "Submit expense claim",
                      [
                        amountField(1500),
                        {
                          name: "category",
                          label: "Category",
                          type: "select",
                          options: ["Travel", "Rental", "Other"],
                        },
                        referenceField(s.sequence),
                      ],
                      { bookingId: job.bookingId },
                    )
                  }
                >
                  Submit expense
                </Button>
                {assignment.status === "Accepted" && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      execute("assignment.respond", {
                        id: assignment.id,
                        status: "Declined",
                      })
                    }
                  >
                    Decline assignment
                  </Button>
                )}
              </div>
              <p className="muted small">
                All amounts and contact details are synthetic. No messages or
                payments are sent.
              </p>
            </div>
          </Modal>
        )}
        {forms.modal}
      </main>
      <nav className="mobile-bottom-nav">
        {[
          ["", "Home", Home],
          ["jobs", "Jobs", CalendarDays],
          ["gear", "Gear", Package],
          ["payouts", "Payouts", Wallet],
        ].map(([slug, label, Icon]) => {
          const I = Icon as typeof Home;
          const href = `/freelancer${slug ? `/${slug}` : ""}`;
          return (
            <Link
              key={String(slug)}
              className={path === href ? "active" : ""}
              href={href}
            >
              <I size={20} />
              {String(label)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
export function CustomerShell({ children }: { children: ReactNode }) {
  const s = useDemo((x) => x.data);
  const path = usePathname();
  return (
    <div className="client-shell">
      <header className="client-header">
        <Link href="/client">
          <BrandMark small />
        </Link>
        <nav>
          <Link className={path === "/client" ? "active" : ""} href="/client">
            Your project
          </Link>
          {s.galleries
            .filter((g) =>
              s.bookings.some(
                (b) =>
                  b.id === g.bookingId &&
                  b.customerId === s.identity.customerId,
              ),
            )
            .slice(0, 1)
            .map((g) => (
              <Link
                className={path.includes("gallery") ? "active" : ""}
                href={`/client/gallery/${g.id}`}
                key={g.id}
              >
                Your photographs
              </Link>
            ))}
        </nav>
        <RoleSwitcher />
      </header>
      {children}
    </div>
  );
}
export function CustomerHome() {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  if (s.identity.role === "freelancer")
    return (
      <div className="access-state">
        <h1>Customer experience</h1>
        <p>Switch demo roles to explore a customer’s private project.</p>
        <RoleSwitcher />
      </div>
    );
  const c = s.customers.find((c) => c.id === s.identity.customerId)!;
  const bookings = s.bookings.filter((b) => b.customerId === c.id);
  return (
    <main className="client-content">
      {s.identity.role === "owner" && (
        <p className="callout" style={{ marginBottom: 25 }}>
          Owner preview · showing only {c.name}’s customer records.
        </p>
      )}
      <div className="client-welcome">
        <div className="eyebrow">YOUR STORY, IN GOOD HANDS</div>
        <h1>Hello, {c.name}.</h1>
        <p>
          From the moments you’re planning to the memories you’ll keep.
          <br />
          Everything about your experience, right here.
        </p>
      </div>
      {bookings.map((b) => {
        const gallery = s.galleries.find(
          (g) => g.bookingId === b.id && g.status === "Published",
        );
        const quotes = s.quotes.filter(
          (q) =>
            q.customerId === c.id &&
            q.bookingId === b.id &&
            q.status !== "Draft",
        );
        return (
          <div key={b.id} className="stack">
            {gallery && (
              <Link
                className="client-gallery-teaser"
                href={`/client/gallery/${gallery.id}`}
              >
                <img
                  src={
                    (
                      gallery.media.find((m) => m.id === gallery.coverId) ||
                      gallery.media[0]
                    ).src
                  }
                  alt="Illustrative stock wedding photograph"
                />
                <div>
                  <span className="eyebrow" style={{ color: "var(--surface)" }}>
                    YOUR PHOTOGRAPHS ARE HERE
                  </span>
                  <h2>{gallery.name}</h2>
                  <p>A collection of moments, made just for this demo.</p>
                  <span className="button secondary">
                    Explore your photographs
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            )}
            <div className="two-col">
              <Panel title="Your project journey" caption={b.name}>
                <div className="timeline">
                  {b.publicMilestones.map((m, i) => (
                    <div className="timeline-item" key={i}>
                      <i className="timeline-dot" />
                      <div>
                        <strong>{m}</strong>
                        <p>Studio update</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel
                title="Payments, simply"
                caption="A record of your booking payments"
              >
                <div className="panel-body summary-list">
                  <div>
                    <span>Agreed total</span>
                    <strong>{money(b.contract)}</strong>
                  </div>
                  <div>
                    <span>Received</span>
                    <strong>{money(collected(s, b.id))}</strong>
                  </div>
                  <div className="total">
                    <span>Remaining</span>
                    <strong>{money(balance(s, b))}</strong>
                  </div>
                  <small>
                    Demo ledger only. For a real payment, contact the studio
                    directly.
                  </small>
                </div>
              </Panel>
            </div>
            <Panel
              title="Your documents & deliveries"
              caption={`Delivery promise · ${date(b.dueDate)}`}
            >
              <div className="panel-body stack">
                {quotes.map((q) => (
                  <Link
                    key={q.id}
                    className="text-link"
                    target="_blank"
                    href={`/print/quote/${q.id}`}
                  >
                    <FileText size={16} />
                    Your quote · {q.id}
                    <ArrowRight size={14} />
                  </Link>
                ))}
                {s.deliverables
                  .filter((d) => d.bookingId === b.id)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="inline-actions"
                      style={{ justifyContent: "space-between" }}
                    >
                      <span>
                        {d.name}{" "}
                        <small>
                          · {d.quantity} {d.quantity === 1 ? "item" : "files"}
                        </small>
                      </span>
                      <div className="inline-actions">
                        <Badge>{d.status}</Badge>
                        {d.status === "Ready" && (
                          <Button
                            variant="secondary"
                            disabled={d.approved}
                            onClick={() =>
                              execute("deliverable.update", { id: d.id })
                            }
                          >
                            {d.approved ? "Approved" : "Approve proof"}
                          </Button>
                        )}
                        {d.tracking && (
                          <small>
                            {d.method} · {d.tracking}
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                <p className="callout">
                  <Truck
                    size={16}
                    style={{ display: "inline", marginRight: 7 }}
                  />
                  Printed albums and physical pen-drive delivery remain
                  supported. Ask the studio to arrange pickup or courier. No
                  purchase is made in this demo.
                </p>
              </div>
            </Panel>
          </div>
        );
      })}
      <footer className="gallery-footer">
        Timbrel Studio · Your story, thoughtfully kept.
        <br />
        Fictional customer experience · Powered by Myurrix
      </footer>
    </main>
  );
}
