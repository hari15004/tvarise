import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam } from "@/lib/content";
import { getMemberLive } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";
import EditPanel from "./EditPanel";
import "./member.css";


export function generateStaticParams() {
  return getTeam().map((m) => ({ slug: m.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = await getMemberLive(slug);
  return { title: m ? m.name : "Team" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const m = await getMemberLive(slug);
  if (!m) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  let canEdit = false;
  if (auth.user) {
    const { data: row } = await supabase.from("members").select("slug").eq("slug", slug).maybeSingle();
    canEdit = !!row && (await supabase.from("members").select("user_id").eq("slug", slug).eq("user_id", auth.user.id).maybeSingle()).data !== null
      || (await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle()).data?.role === "admin";
  }

  const contact = m.email ? `mailto:${m.email}` : "/contact";

  return (
    <section className="member">
      {canEdit ? (
        <EditPanel
          slug={slug}
          initial={{
            name: m.name,
            role_title: m.role,
            bio: m.bio,
            skills: m.skills ?? [],
            email: m.email ?? "",
            available: !!m.available,
          }}
        />
      ) : null}
      <div className="container">
        <Link href="/#team" className="member__back">
          &larr; Team
        </Link>

        <div className="member__top">
          <div className="member__photo">
            {m.portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.portrait} alt={m.name} />
            ) : (
              <span>{m.name.charAt(0)}</span>
            )}
          </div>
          <div className="member__intro">
            {m.available ? (
              <p className="member__avail">
                <i aria-hidden="true" /> Available for work
              </p>
            ) : null}
            <h1 className="member__name">{m.name}</h1>
            <p className="member__role">{m.role}</p>
            <p className="member__line">{m.shortLine}</p>
            <a href={contact} className="btn btn--primary">
              Hire {m.name.split(" ")[0]}
            </a>
          </div>
        </div>

        <div className="member__block">
          <h2 className="member__h">About</h2>
          <p className="member__bio">{m.bio}</p>
        </div>

        {m.skills && m.skills.length > 0 ? (
          <div className="member__block">
            <h2 className="member__h">Skills</h2>
            <ul className="member__skills">
              {m.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {m.work && m.work.length > 0 ? (
          <div className="member__block">
            <h2 className="member__h">Work</h2>
            <ul className="member__work">
              {m.work.map((w) => (
                <li key={w.title} className="member__item">
                  {w.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.image} alt={w.title} />
                  ) : null}
                  <h3>{w.title}</h3>
                  <p>{w.summary}</p>
                  {w.link ? (
                    <a href={w.link} target="_blank" rel="noopener noreferrer">
                      View project &rarr;
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {m.links.length > 0 ? (
          <div className="member__block">
            <h2 className="member__h">Find me on</h2>
            <ul className="member__links">
              {m.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
