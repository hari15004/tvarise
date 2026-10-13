import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <PageStub title="Contact" note="The Let's Work enquiry flow will live here." />;
}
