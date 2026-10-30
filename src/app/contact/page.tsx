import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/home/SectionHead";
import { ContactForm } from "./ContactForm";
import { getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.pages?.contact.title ?? "Contact" };
}

export default async function Page() {
  const site = await getSite();
  return (
    <section className="section contact-page">
      <div className="container">
        <SectionHead
          index="001"
          label="Contact"
          title="Tell us what you want to build."
          text="Share a little about your project. We’ll help you figure out a good next step."
        />
        <div className="contact-page__grid">
          <div className="contact-page__details">
            <h2>Start a conversation</h2>
            <p>Prefer email? Send us a note and we’ll take it from there.</p>
            <a className="contact-page__email" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
            {site.social.length > 0 && (
              <div className="contact-page__social">
                <h3>{site.socialLabel}</h3>
                <ul>
                  {site.social.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label} ↗</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href="/services" className="contact-page__services">Explore our services →</Link>
          </div>
          <ContactForm email={site.contactEmail} />
        </div>
      </div>
    </section>
  );
}
