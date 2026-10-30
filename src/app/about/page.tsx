import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";
import { getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.pages?.about.title ?? "About" };
}

export default async function Page() {
  const page = (await getSite()).pages?.about;
  return (
    <PageStub
      label={page?.label ?? "Coming in a later step"}
      title={page?.title ?? "About"}
      note={page?.note ?? "The studio story and approach will live here."}
    />
  );
}
