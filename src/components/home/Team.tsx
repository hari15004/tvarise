import Link from "next/link";
import type { TeamMember } from "@/lib/types";
import { SectionHead } from "./SectionHead";

// Only published members are passed in (see getTeam). A new member = a new content file.
export function Team({ index, members }: { index: string; members: TeamMember[] }) {
  if (members.length === 0) return null;

  return (
    <section id="team" className="section" aria-label="Team">
      <div className="container">
        <SectionHead index={index} label="Team" title="The people behind it" />
        <ul className="team">
          {members.map((member, i) => (
            <li key={member.slug} className="team-card" data-spotlight>
              <div className="team-card__media" data-clip>
                {member.portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="team-card__img" src={member.portrait} alt={member.name} data-parallax />
                ) : (
                  <div className="team-card__img team-card__img--empty" data-parallax>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                )}
              </div>
              <div className="team-card__body" data-reveal>
                <h3 className="team-card__name">
                  <Link href={`/team/${member.slug}`} className="team-card__link">
                    {member.name}
                  </Link>
                </h3>
                <p className="team-card__role">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
