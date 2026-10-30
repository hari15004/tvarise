import { Hero } from "@/components/hero/Hero";
import { Services } from "@/components/home/Services";
import { Work } from "@/components/home/Work";
import { Building } from "@/components/home/Building";
import { Process } from "@/components/home/Process";
import { Team } from "@/components/home/Team";
import { About } from "@/components/home/About";
import { FinalCta } from "@/components/home/FinalCta";
import {
  getFeaturedProjects,
  getHome,
  getProjects,
  getServices,
  getSite,
  getTeam,
} from "@/lib/content";
import type { ReactNode } from "react";

export default async function Home() {
  const [site, home, services, projects, allProjects, team] = await Promise.all([
    getSite(),
    getHome(),
    getServices(),
    getFeaturedProjects(),
    getProjects(),
    getTeam(),
  ]);
  const building = allProjects.filter((project) => project.inProgress && !project.placeholder);

  // Section numbers (001, 002, ...) skip sections that are hidden for lack of content.
  let n = 0;
  const next = (show: boolean) => (show ? String(++n).padStart(3, "0") : "");

  const sectionOrder = home.sectionOrder ?? [
    "services",
    "work",
    "process",
    "team",
    "building",
    "about",
    "cta",
  ];
  const sectionContent: Record<string, ReactNode | null> = {};
  const addSection = (key: string, show: boolean, render: (index: string) => ReactNode) => {
    const enabled = home.sectionVisibility?.[key as keyof NonNullable<typeof home.sectionVisibility>] !== false;
    sectionContent[key] = show && enabled ? render(next(true)) : null;
  };
  addSection("services", services.length > 0, (index) => (
    <Services index={index} items={services} heading={home.sections?.services} />
  ));
  addSection("work", projects.length > 0, (index) => (
    <Work index={index} items={projects} heading={home.sections?.work} />
  ));
  addSection("building", true, (index) => (
    <Building index={index} items={building} heading={home.sections?.building} />
  ));
  addSection("process", home.process.length > 0, (index) => (
    <Process
      index={index}
      steps={home.process}
      placeholder={Boolean(home.placeholder)}
      heading={home.sections?.process}
    />
  ));
  addSection("team", team.length > 0, (index) => (
    <Team index={index} members={team} heading={home.sections?.team} />
  ));
  addSection("about", true, (index) => <About index={index} content={home} />);
  addSection("cta", true, (index) => (
    <FinalCta
      index={index}
      title={home.cta.title}
      text={home.cta.text}
      ctaLabel={site.cta.label}
      ctaHref={site.cta.href}
      wordmark={site.name}
      label={home.cta.label ?? "Let's work"}
    />
  ));

  return (
    <>
      <Hero
        title={site.heroTitle}
        sub={site.heroSubtitle}
        ctaLabel={site.cta.label}
        ctaHref={site.cta.href}
        bigName={site.name}
        tags={services.map((s) => s.title)}
        placeholder={Boolean(site.placeholder)}
        tagline={site.heroTagline}
        workLabel={site.heroWorkLabel}
        scrollLabel={site.scrollLabel}
      />
      {sectionOrder.map((section) => sectionContent[section] ?? null)}
    </>
  );
}
