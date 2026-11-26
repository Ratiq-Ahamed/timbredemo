"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UsersRound,
  Megaphone,
  FileText,
  ContactRound,
  CalendarCheck2,
  Camera,
  Package,
  Clapperboard,
  Images,
  Wallet,
  ChartNoAxesCombined,
  Settings2,
  Search,
  Bell,
  ChevronDown,
  Menu,
  ArrowUpRight,
  CircleHelp,
  LogOut,
  ArrowRight,
  Check,
} from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { notifications } from "@/lib/demo/selectors";
import { Avatar, Badge, Button, IconButton, Modal, Empty } from "./ui";
export function BrandMark({ small = false }: { small?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`brandmark ${small ? "compact" : ""}`}>
      {!failed ? (
        <img
          src="/brand/timbrel-logo.png"
          alt="Timbrel Tales"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="brand-initial">T</span>
      )}
      <div>
        <strong>Timbrel Studio</strong>
        <span>STUDIO OPERATING SYSTEM</span>
      </div>
    </div>
  );
}
const groups = [
  {
    label: "WORKSPACE",
    items: [
      ["", "Overview", LayoutDashboard],
      ["calendar", "Calendar", CalendarDays],
    ],
  },
  {
    label: "SALES & GROWTH",
    items: [
      ["leads", "Leads", UsersRound],
      ["marketing", "Marketing", Megaphone],
      ["quotes", "Quotes & packages", FileText],
      ["customers", "Customers", ContactRound],
    ],
  },
  {
    label: "STUDIO OPERATIONS",
    items: [
      ["events", "Bookings & events", CalendarCheck2],
      ["crew", "Crew", Camera],
      ["equipment", "Equipment", Package],
      ["production", "Production", Clapperboard],
    ],
  },
  {
    label: "DELIVERY & FINANCE",
    items: [
      ["galleries", "Galleries", Images],
      ["finance", "Finance", Wallet],
      ["reports", "Reports", ChartNoAxesCombined],
    ],
  },
] as const;
export function RoleSwitcher() {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="workspace-switch" onClick={() => setOpen(true)}>
        <span className="demo-dot" />
        <span>Demo workspace</span>
        <ChevronDown size={14} />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Explore the studio"
        description="Shared demo data. This switch simulates record access; it is not authentication."
      >
        <div className="role-choices">
          {[
            {
              role: "owner",
              title: "Owner workspace",
              desc: "Your studio, in one connected view.",
              href: "/admin",
              icon: LayoutDashboard,
            },
            {
              role: "freelancer",
              title: "Freelancer workspace",
              desc: "Own jobs, equipment and payouts.",
              href: "/freelancer",
              icon: Camera,
            },
            {
              role: "client",
              title: "Customer experience",
              desc: "Project milestones and private gallery.",
              href: "/client",
              icon: Images,
            },
          ].map((r) => (
            <button
              key={r.role}
              className="role-choice"
              onClick={() => {
                execute("identity.switch", { role: r.role });
                setOpen(false);
                router.push(r.href);
              }}
            >
              <r.icon size={23} />
              <span>
                <strong>{r.title}</strong>
                <small>{r.desc}</small>
              </span>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
        <p className="muted small">
          Current role: {s.identity.role}. All names and business records are
          fictional.
        </p>
      </Modal>
    </>
  );
}
export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 1024) setCollapsed(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [alerts, setAlerts] = useState(false);
  const [help, setHelp] = useState(false);
  const allAlerts = notifications(s);
  const unread = allAlerts.filter((n) => !s.readNotifications.includes(n.id));
  const matches = [
    ...s.leads.map((l) => ({
      id: l.id,
      title: l.name,
      kind: "Lead",
      href: `/admin/leads?lead=${l.id}`,
    })),
    ...s.bookings.map((b) => ({
      id: b.id,
      title: b.name,
      kind: "Booking",
      href: `/admin/events/${b.id}`,
    })),
    ...s.assets.map((a) => ({
      id: a.id,
      title: a.model,
      kind: "Equipment",
      href: `/admin/equipment/${a.id}`,
    })),
    ...s.customers.map((c) => ({
      id: c.id,
      title: c.name,
      kind: "Customer",
      href: `/admin/customers?customer=${c.id}`,
    })),
    ...s.crew.map((c) => ({
      id: c.id,
      title: c.name,
      kind: "Crew",
      href: `/admin/crew?crew=${c.id}`,
    })),
  ]
    .filter((x) =>
      `${x.title} ${x.id}`.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 10);
  if (s.identity.role !== "owner")
    return (
      <div className="access-state">
        <BrandMark />
        <h1>Owner workspace</h1>
        <p>Switch to the owner demo role to view studio operations.</p>
        <Button onClick={() => execute("identity.switch", { role: "owner" })}>
          Enter owner workspace
          <ArrowRight size={16} />
        </Button>
        <RoleSwitcher />
      </div>
    );
  return (
    <div className={`admin-shell ${collapsed ? "nav-collapsed" : ""}`}>
      {mobile && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <Link href="/admin" className="brand-home">
          <BrandMark />
        </Link>
        <div className="sidebar-workspace">
          <span className="workspace-icon">T</span>
          <div>
            <strong>Studio workspace</strong>
            <small>Chennai, Tamil Nadu</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <nav>
          {groups.map((g) => (
            <div className="nav-group" key={g.label}>
              <div className="nav-label">{g.label}</div>
              {g.items.map(([slug, label, Icon]) => {
                const href = `/admin${slug ? `/${slug}` : ""}`;
                const active = slug ? path.startsWith(href) : path === "/admin";
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-label={label}
                    title={label}
                    className={active ? "nav-item active" : "nav-item"}
                    onClick={() => setMobile(false)}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    {slug === "leads" && (
                      <small>
                        {s.leads.filter((l) => l.stage === "New").length}
                      </small>
                    )}
                    {slug === "equipment" &&
                      unread.some((n) => n.id.startsWith("issue")) && (
                        <span className="nav-alert" />
                      )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link
            href="/admin/settings"
            className={`nav-item ${path === "/admin/settings" ? "active" : ""}`}
          >
            <Settings2 size={18} />
            Settings
          </Link>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <CircleHelp size={18} />
            Demo guide
            <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-user">
            <Avatar name="Studio Owner" />
            <div>
              <strong>Studio owner</strong>
              <small>Owner · full access</small>
            </div>
            <Link href="/" aria-label="Back to demo entry">
              <LogOut size={16} />
            </Link>
          </div>
          <span className="powered">
            Thoughtfully built by <strong>Myurrix</strong>
          </span>
        </div>
      </aside>
      <div className="admin-main">
        <div className="topbar">
          <div className="topbar-left">
            <IconButton
              label="Toggle navigation"
              onClick={() => {
                if (window.innerWidth >= 1024) setCollapsed(!collapsed);
                else setMobile(!mobile);
              }}
            >
              <Menu size={19} />
            </IconButton>
            <span className="breadcrumb-root">Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>
              {path === "/admin"
                ? "Overview"
                : path.split("/")[2]?.replaceAll("-", " ")}
            </strong>
          </div>
          <div className="topbar-right">
            <button
              className="global-search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
              <span>Search anything…</span>
              <kbd>⌕</kbd>
            </button>
            <RoleSwitcher />
            <IconButton
              label={`Notifications, ${unread.length} unread`}
              onClick={() => setAlerts(true)}
            >
              <span className="notification-icon">
                <Bell size={19} />
                {unread.length > 0 && <i />}
              </span>
            </IconButton>
            <Avatar name="Studio Owner" small />
          </div>
        </div>
        <main className="page-content">
          {children}
          <footer className="content-footer">
            <span>Timbrel Studio OS</span>
            <span>
              Demo data · 24 November 2026
              <span className="footer-divider">/</span>Powered by Myurrix
            </span>
          </footer>
        </main>
      </div>
      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Search your studio"
      >
        <label className="search-field large">
          <Search size={18} />
          <input
            autoFocus
            aria-label="Search studio records"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lead, customer, booking, equipment or crew"
          />
        </label>
        <div className="search-results">
          {matches.length ? (
            matches.map((m) => (
              <Link
                key={`${m.kind}-${m.id}`}
                href={m.href}
                onClick={() => setSearchOpen(false)}
              >
                <div>
                  <strong>{m.title}</strong>
                  <small>
                    {m.kind} · {m.id}
                  </small>
                </div>
                <ArrowRight size={16} />
              </Link>
            ))
          ) : (
            <Empty
              title="No matches"
              description="Try a name, asset code or booking ID."
            />
          )}
        </div>
      </Modal>
      <Modal
        open={alerts}
        onClose={() => setAlerts(false)}
        title="Studio notifications"
        description="Derived from the same records as your dashboard."
      >
        <div className="notification-list">
          {allAlerts.map((n) => (
            <div className="notification-row" key={n.id}>
              <Link href={n.href} onClick={() => setAlerts(false)}>
                <strong>{n.title}</strong>
                <small>{n.detail}</small>
              </Link>
              {s.readNotifications.includes(n.id) ? (
                <Check size={16} />
              ) : (
                <IconButton
                  label={`Mark ${n.title} read`}
                  onClick={() => execute("notification.read", { id: n.id })}
                >
                  <Check size={16} />
                </IconButton>
              )}
            </div>
          ))}
        </div>
      </Modal>
      <Modal
        open={help}
        onClose={() => setHelp(false)}
        title="Your 12-minute studio walkthrough"
      >
        <ol className="guide-list">
          <li>
            Receive a sample campaign lead, then create and accept a quote.
          </li>
          <li>
            Open Rahul & Priya: test crew F-003 and camera CAM-002 conflicts.
          </li>
          <li>
            Use today’s Studio Collective shoot to reserve and issue gear.
          </li>
          <li>Switch to freelancer: accept a job and acknowledge equipment.</li>
          <li>Move production through review and approve a deliverable.</li>
          <li>
            Open Kavin & Meera’s customer gallery and select six photographs.
          </li>
          <li>Record ₹25,000 against Rahul & Priya, then reverse it.</li>
        </ol>
        <Badge>All integrations are simulated</Badge>
      </Modal>
    </div>
  );
}
