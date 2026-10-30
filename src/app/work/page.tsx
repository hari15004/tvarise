import type { Metadata } from "next";
import { Work } from "@/components/home/Work";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = { title: "Work" };

export default async function Page() {
  const projects = (await getProjects()).filter((project) => !project.placeholder && !project.inProgress);
  return (
    <Work
      index="001"
      items={projects}
      heading={{ label: "All work", title: "Selected projects" }}
      showMore={false}
    />
  );
}
