"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/shell";
import { Button, Empty, Table } from "@/components/ui";
import { useDemo } from "@/lib/demo/store";
import { money, quoteTotal } from "@/lib/demo/selectors";
export default function QuotePrint() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo((x) => x.data);
  const q = s.quotes.find((q) => q.id === id);
  if (
    !q ||
    s.identity.role === "freelancer" ||
    (s.identity.role === "client" &&
      (q.customerId !== s.identity.customerId || q.status === "Draft"))
  )
    return <Empty title="Quote unavailable for this demo identity" />;
  const c = s.customers.find((c) => c.id === q.customerId)!;
  const totals = quoteTotal(q);
  return (
    <>
      <div className="print-actions">
        <Link href="/admin/quotes" className="button secondary">
          Back to quotes
        </Link>
        <Button onClick={() => window.print()}>Print / save PDF</Button>
      </div>
      <main className="print-document">
        <div className="print-title">
          <BrandMark />
          <div>
            <h1>Your proposal.</h1>
            <p className="muted small">
              {q.id} · Revision {q.version} · {q.status}
            </p>
          </div>
        </div>
        <div className="two-col">
          <div>
            <div className="eyebrow">PREPARED FOR</div>
            <h2>{c.name}</h2>
            <p className="muted small">
              {c.email}
              <br />
              {c.phone}
            </p>
          </div>
          <div>
            <div className="eyebrow">YOUR CELEBRATION</div>
            <h2>{q.name}</h2>
            <p className="muted small">
              All records are fictional · demonstration proposal
            </p>
          </div>
        </div>
        <Table
          headers={["DESCRIPTION", "QUANTITY", "RATE", "AMOUNT"]}
          rows={q.items
            .filter((i) => !i.optional || i.included)
            .map((i) => [
              i.label,
              i.quantity,
              money(i.rate),
              money(i.rate * i.quantity),
            ])}
        />
        <div
          className="summary-list"
          style={{ maxWidth: 330, marginLeft: "auto" }}
        >
          <div>
            <span>Subtotal</span>
            <strong>{money(totals.subtotal)}</strong>
          </div>
          <div>
            <span>Discount</span>
            <strong>{money(q.discount)}</strong>
          </div>
          <div>
            <span>Sample tax ({q.taxPercent}%)</span>
            <strong>{money(totals.tax)}</strong>
          </div>
          <div className="total">
            <span>Total</span>
            <strong>{money(totals.total)}</strong>
          </div>
          <div>
            <span>Initial payment milestone</span>
            <strong>{money(q.advance)}</strong>
          </div>
        </div>
        <div className="divider" />
        <h2>A few thoughtful details</h2>
        <p
          className="muted small"
          style={{ marginTop: 12, whiteSpace: "pre-wrap" }}
        >
          {q.notes}
        </p>
        <p className="callout section-gap">
          Booking confirmation follows quote acceptance and receipt of the
          verified initial payment milestone. This sample proposal is not a tax
          invoice or legally qualified digital signature.
        </p>
        <footer className="content-footer">
          <span>Timbrel Studio OS · Demo proposal</span>
          <span>Powered by Myurrix</span>
        </footer>
      </main>
    </>
  );
}
