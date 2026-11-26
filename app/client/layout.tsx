import { CustomerShell } from "@/features/portals";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>;
}
