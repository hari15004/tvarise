import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.pages?.contact.title ?? "Contact" };
}

export default function Page() {
  return (
    <section className="section contact-page">
      <div className="container">
        <ContactForm />
      </div>
    </section>
  );
}
