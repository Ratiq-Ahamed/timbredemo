"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "./shell";
import { Empty } from "./ui";
import Dashboard from "@/features/dashboard";
import { Customers, Leads, Marketing, Quotes } from "@/features/sales";
import {
  Bookings,
  Calendar,
  CrewDirectory,
  EventDetail,
} from "@/features/operations";
import { Equipment } from "@/features/equipment";
import { Production } from "@/features/production";
import { Finance } from "@/features/finance";
import { Galleries } from "@/features/galleries";
import { Reports, Settings } from "@/features/settings-reports";
export default function AdminApp({ slug = [] }: { slug?: string[] }) {
  const query = useSearchParams();
  let content;
  const [section, id] = slug;
  if (slug.length > 2) content = <Empty title="Page not found" />;
  else if (!section) content = <Dashboard />;
  else if (section === "events")
    content = id ? <EventDetail id={id} /> : <Bookings />;
  else if (section === "equipment") content = <Equipment assetId={id} />;
  else if (section === "galleries") content = <Galleries id={id} />;
  else if (id) content = <Empty title="Page not found" />;
  else {
    const pages: Record<string, React.ReactNode> = {
      leads: <Leads />,
      marketing: <Marketing />,
      quotes: <Quotes />,
      customers: <Customers />,
      calendar: <Calendar />,
      crew: <CrewDirectory />,
      production: <Production />,
      finance: <Finance />,
      reports: <Reports />,
      settings: <Settings />,
    };
    content = pages[section] || (
      <Empty
        title="Page not found"
        action={
          <Link href="/admin" className="button">
            Studio overview
          </Link>
        }
      />
    );
  }
  return (
    <AdminShell>
      <div key={`${slug.join("/")}?${query.toString()}`}>{content}</div>
    </AdminShell>
  );
}
