import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return <PageStub title="About" note="The studio story and approach will live here." />;
}
