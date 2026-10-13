import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";

export const metadata: Metadata = { title: "Work" };

export default function Page() {
  return <PageStub title="Work" note="Selected work and the project index will live here." />;
}
