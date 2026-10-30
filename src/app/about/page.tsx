import type { Metadata } from "next";
import Link from "next/link";
import { About } from "@/components/home/About";
import { Team } from "@/components/home/Team";
import { SectionHead } from "@/components/home/SectionHead";
import { getHome, getSite, getTeam } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.pages?.about.title ?? "About" };
}

export default async function Page() {
  const [home, team, site] = await Promise.all([
    getHome(),
    getTeam(),
    getSite(),
  ]);
  const about = {
    ...home,
    about: {
      ...home.about,
      text: home.about.text.toLowerCase().includes("placeholder")
        ? "Tvarise brings creativity, design and technology together to help ideas grow into useful digital experiences."
        : home.about.text,
    },
  };
  return (
    <>
      <About
        index="001"
        content={about}
      />
      {team.length > 0 && (
        <Team
          index="002"
          members={team}
          heading={home.sections?.team}
        />
      )}
      <section className="section section--quiet">
        <div className="container page-cta">
          <SectionHead
            index={team.length > 0 ? "003" : "002"}
            label="Work with us"
            title="Have an idea to build?"
          />
          <Link href={site.cta.href} className="btn btn--primary">{site.cta.label}</Link>
        </div>
      </section>
    </>
  );
}
