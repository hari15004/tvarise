import { Hero } from "@/components/hero/Hero";
import { Services } from "@/components/home/Services";
import { Work } from "@/components/home/Work";
import { Building } from "@/components/home/Building";
import { Process } from "@/components/home/Process";
import { Team } from "@/components/home/Team";
import { About } from "@/components/home/About";
import { FinalCta } from "@/components/home/FinalCta";
import {
  getBuildingItems,
  getFeaturedProjects,
  getHome,
  getServices,
  getSite,
  getTeam,
} from "@/lib/content";

export default async function Home() {
  const [site, home, services, projects, building, team] = await Promise.all([
    getSite(),
    getHome(),
    getServices(),
    getFeaturedProjects(),
    getBuildingItems(),
    getTeam(),
  ]);

  // Section numbers (001, 002, ...) skip sections that are hidden for lack of content.
  let n = 0;
  const next = (show: boolean) => (show ? String(++n).padStart(3, "0") : "");

  const servicesIdx = next(services.length > 0);
  const workIdx = next(projects.length > 0);
  const buildingIdx = next(building.length > 0);
  const processIdx = next(home.process.length > 0);
  const teamIdx = next(team.length > 0);
  const aboutIdx = next(true);
  const ctaIdx = next(true);

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
      />
      <Services index={servicesIdx} items={services} heading={home.sections?.services} />
      <Work index={workIdx} items={projects} heading={home.sections?.work} />
      <Building index={buildingIdx} items={building} heading={home.sections?.building} />
      <Process
        index={processIdx}
        steps={home.process}
        placeholder={Boolean(home.placeholder)}
        heading={home.sections?.process}
      />
      <Team index={teamIdx} members={team} heading={home.sections?.team} />
      <About index={aboutIdx} content={home} />
      <FinalCta
        index={ctaIdx}
        title={home.cta.title}
        text={home.cta.text}
        ctaLabel={site.cta.label}
        ctaHref={site.cta.href}
        wordmark={site.name}
        label={home.cta.label ?? "Let's work"}
      />
    </>
  );
}
