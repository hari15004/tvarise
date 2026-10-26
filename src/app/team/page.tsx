import type { Metadata } from "next";
import { Team } from "@/components/home/Team";
import { getTeam } from "@/lib/content";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <Team index="001" members={getTeam()} />;
}