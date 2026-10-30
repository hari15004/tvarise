import type { Metadata } from "next";
import { Team } from "@/components/home/Team";
import { getHome, getTeam } from "@/lib/content";

export const metadata: Metadata = { title: "Team" };

export default async function Page() {
  const [members, home] = await Promise.all([getTeam(), getHome()]);
  return <Team index="001" members={members} heading={home.sections?.team} />;
}