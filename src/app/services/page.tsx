import type { Metadata } from "next";
import Link from "next/link";
import { Services } from "@/components/home/Services";
import { SectionHead } from "@/components/home/SectionHead";
import { getHome, getServices, getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.pages?.services.title ?? "Services" };
}

export default async function Page() {
  const [services, home, site] = await Promise.all([getServices(), getHome(), getSite()]);
  const heading = home.sections?.services;

  return (
    <>
      <section className="section page-intro">
        <div className="container">
          <SectionHead
            index="001"
            label={heading?.label ?? "Services"}
            title={heading?.title ?? "What we do"}
            text="Creative, design and technology services to help your next idea take shape."
          />
        </div>
      </section>
      <Services index="002" items={services} heading={{ label: "How we can help", title: "Made around your next move" }} />
      <section className="section section--quiet">
        <div className="container page-cta">
          <h2>Have a project in mind?</h2>
          <p>Tell us what you are working on and we can figure out the right next step together.</p>
          <Link href={site.cta.href} className="btn btn--primary">{site.cta.label}</Link>
        </div>
      </section>
    </>
  );
}
