import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <PageStub title="Team" note="The team page will live here." />;
}
