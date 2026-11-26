import Link from "next/link";
export default function NotFound() {
  return (
    <main className="access-state">
      <span className="eyebrow">404 · PAGE NOT FOUND</span>
      <h1>Let’s get you back to the studio.</h1>
      <p>This page is unavailable. Your demo records are still here.</p>
      <Link className="button" href="/admin">
        Open studio overview →
      </Link>
    </main>
  );
}
