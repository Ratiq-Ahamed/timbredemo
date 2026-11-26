import { CustomerGallery } from "@/features/galleries";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerGallery id={id} />;
}
