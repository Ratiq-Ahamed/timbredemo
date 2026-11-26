import { FreelancerApp } from "@/features/portals";
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  return <FreelancerApp section={slug?.join("/")} />;
}
