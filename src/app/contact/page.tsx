import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";
import { getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.pages?.contact.title ?? "Contact" };
}

export default async function Page() {
  const page = (await getSite()).pages?.contact;
  return (
    <PageStub
      label={page?.label ?? "Coming in a later step"}
      title={page?.title ?? "Contact"}
      note={page?.note ?? "The Let's Work enquiry flow will live here."}
    />
  );
}
