import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <PageStub title="Services" note="The services overview will live here." />;
}
