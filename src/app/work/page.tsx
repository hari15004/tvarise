import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";
import { getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.pages?.work.title ?? "Work" };
}

export default async function Page() {
  const page = (await getSite()).pages?.work;
  return (
    <PageStub
      label={page?.label ?? "Coming in a later step"}
      title={page?.title ?? "Work"}
      note={page?.note ?? "Selected work and the project index will live here."}
    />
  );
}
