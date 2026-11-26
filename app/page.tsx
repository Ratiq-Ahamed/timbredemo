"use client";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  LayoutDashboard,
  Images,
  ArrowUpRight,
} from "lucide-react";
import { BrandMark } from "@/components/shell";
import { useDemo } from "@/lib/demo/store";
export default function Entry() {
  const router = useRouter();
  const execute = useDemo((s) => s.execute);
  return (
    <main className="entry">
      <div className="entry-photo">
        <img src="/demo-media/wedding-02.webp" alt="Sample wedding ceremony" />
        <div className="entry-photo-copy">
          <span>FOR THE ART. AND EVERYTHING AROUND IT.</span>
          <h2>
            Every detail.
            <br />
            Every beautiful moment.
          </h2>
          <p>A little more clarity behind every story you create.</p>
        </div>
        <small>Licensed stock · illustrative sample photography</small>
      </div>
      <div className="entry-content">
        <BrandMark />
        <div className="entry-heading">
          <div className="eyebrow">WELCOME TO YOUR STUDIO</div>
          <h1>
            The art is yours.
            <br />
            The details, together.
          </h1>
          <p>
            Your enquiries, people, equipment and deliveries.
            <br />
            One thoughtfully connected workspace.
          </p>
        </div>
        <div className="entry-options">
          {[
            {
              role: "owner",
              title: "Owner workspace",
              description: "The whole studio. One clear view.",
              href: "/admin",
              icon: LayoutDashboard,
            },
            {
              role: "freelancer",
              title: "Freelancer workspace",
              description: "Your next shoot, gear and payouts.",
              href: "/freelancer",
              icon: Camera,
            },
            {
              role: "client",
              title: "Customer experience",
              description: "Your story, beautifully delivered.",
              href: "/client",
              icon: Images,
            },
          ].map((r) => (
            <button
              key={r.role}
              onClick={() => {
                execute("identity.switch", { role: r.role });
                router.push(r.href);
              }}
            >
              <r.icon size={23} />
              <span>
                <strong>{r.title}</strong>
                <small>{r.description}</small>
              </span>
              <ArrowRight size={20} />
            </button>
          ))}
        </div>
        <div className="entry-disclosure">
          <span className="demo-dot" />
          Interactive demo · fictional data · no live services
        </div>
        <footer>
          <span>
            Powered by <strong>Myurrix</strong>
          </span>
          <a
            href="https://timbrelstudio.mypixieset.com/"
            target="_blank"
            rel="noreferrer"
          >
            Visit studio website
            <ArrowUpRight size={13} />
          </a>
        </footer>
      </div>
    </main>
  );
}
