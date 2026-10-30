import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";
import { getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.pages?.services.title ?? "Services" };
}

export default async function Page() {
  const page = (await getSite()).pages?.services;
  return (
    <PageStub
      label={page?.label ?? "Coming in a later step"}
      title={page?.title ?? "Services"}
      note={page?.note ?? "The services overview will live here."}
    />
  );
}
