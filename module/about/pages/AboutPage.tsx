// module/about/pages/AboutPage.tsx
//
// /about — About Us, in the brand style (navy + gold, elegant serif).
//   1. Hero — heading, intro and a wide photo
//   2. Our story — text + photo with a "Founded 2014" badge
//   3. Numbers (navy band)
//   4. Mission & vision
//   5. Our values
//   6. Milestones (timeline)
//   7. Our team (id="team") — leaders (large cards), then everyone else
//      in one compact grid tagged by group. Real members from the database.
//   8. Closing call to action (the homepage's ContactCta)
//
// Demo content: module/about/data.ts. Team: database (admin → Team).

import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { Facebook, Github, Instagram, Linkedin, Star, Twitter, Users } from "lucide-react";

import ContactCta from "@/module/home/components/ContactCta";
import { stats } from "@/module/home/business/data-v3";
import type { TeamMember } from "@/types/team";
import { aboutHero, milestones, missionVision, story, teamGroups, values } from "../data";

// The business card's elegant serif — loaded for this page only.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-about-page-serif",
});

const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on navy
const GOLD_DARK = "#a8852f"; // gold for small text on white
const CREAM = "#faf8f3";
const container = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";
const SERIF = { fontFamily: "var(--font-about-page-serif)" } as const;

// ════════════════════════════════════════════════════════════════════════
//  Small pieces
// ════════════════════════════════════════════════════════════════════════

function GoldLabel({ children, light = false, center = false }: { children: React.ReactNode; light?: boolean; center?: boolean }) {
  const color = light ? GOLD_LIGHT : GOLD;
  return (
    <p className={`flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] ${center ? "justify-center" : ""}`} style={{ color }}>
      {center && <span className="h-px w-10" style={{ background: color }} aria-hidden />}
      {children}
      <span className="h-px w-10" style={{ background: color }} aria-hidden />
    </p>
  );
}

function Title({ children, italic, light = false, as: Tag = "h2", className = "" }: { children: React.ReactNode; italic: string; light?: boolean; as?: "h1" | "h2"; className?: string }) {
  return (
    <Tag className={`mt-4 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl ${className}`} style={{ ...SERIF, color: light ? "#fff" : NAVY }}>
      {children}{" "}
      <em className="font-medium" style={{ color: light ? GOLD_LIGHT : GOLD }}>
        {italic}
      </em>
    </Tag>
  );
}

const SOCIALS = [
  { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
  { key: "twitter", icon: Twitter, label: "X / Twitter" },
  { key: "instagram", icon: Instagram, label: "Instagram" },
  { key: "facebook", icon: Facebook, label: "Facebook" },
  { key: "github", icon: Github, label: "GitHub" },
] as const;

/** One team member: photo, name, role, bio, social links.
 *  `compact`: smaller card without the bio; `tag`: small group label. */
function MemberCard({ member, compact = false, tag }: { member: TeamMember; compact?: boolean; tag?: string }) {
  const socials = member.socials ?? {};
  const links = SOCIALS.filter((s) => socials[s.key]?.trim());

  return (
    <article className="group">
      <div className={`relative aspect-[4/5] overflow-hidden bg-white shadow-sm ring-1 ring-[#c49a3c]/20 transition duration-500 group-hover:shadow-xl group-hover:shadow-[#14245a]/15 ${compact ? "rounded-2xl" : "rounded-[1.75rem]"}`}>
        {member.image ? (
          // Soft black-and-white so every photo matches; colour on hover.
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes={compact ? "(min-width: 1024px) 18vw, 45vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"}
            className="object-cover grayscale-[85%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ color: `${GOLD}99` }}>
            <Users size={48} aria-hidden />
          </div>
        )}
        {/* Social links slide up over the photo on hover (always visible on touch) */}
        {links.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-linear-to-t from-[#0d1840]/80 to-transparent p-4 pt-10 transition duration-500 sm:translate-y-full sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
            {links.map(({ key, icon: Icon, label }) => (
              <a
                key={key}
                href={socials[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on ${label}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-[#dcb45c] hover:text-[#0d1840]"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        )}
      </div>
      {tag && (
        <p className={`${compact ? "mt-4" : "mt-5"} text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400`}>{tag}</p>
      )}
      <h4 className={`${tag ? "mt-1" : compact ? "mt-4" : "mt-5"} leading-tight font-semibold ${compact ? "text-xl" : "text-2xl"}`} style={{ ...SERIF, color: NAVY }}>
        {member.name}
      </h4>
      {member.role && (
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD_DARK }}>
          {member.role}
        </p>
      )}
      {member.bio && !compact && <p className="mt-3 hidden line-clamp-3 text-sm leading-relaxed sm:block">{member.bio}</p>}
    </article>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Page
// ════════════════════════════════════════════════════════════════════════

export default function AboutPage({ members }: { members: TeamMember[] }) {
  const groups = teamGroups.map((g) => ({ ...g, members: members.filter((m) => m.category === g.category) })).filter((g) => g.members.length > 0);
  // First non-empty group (normally Management) gets the large cards.
  const [leaders, ...others] = groups;

  return (
    <div className={`${serif.variable} bg-white text-slate-600`}>
      {/* ── 1. Hero (light, so the fixed header's dark text stays readable) ── */}
      <section className="pt-32 sm:pt-40 lg:pt-44" style={{ background: `linear-gradient(${CREAM} 70%, #fff 70%)` }}>
        <div className={container}>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <GoldLabel>{aboutHero.label}</GoldLabel>
              <Title as="h1" italic={aboutHero.italic} className="!text-5xl sm:!text-6xl lg:!text-7xl">
                {aboutHero.title}
              </Title>
            </div>
            <p className="text-lg leading-relaxed lg:col-span-4 lg:pb-3">{aboutHero.text}</p>
          </div>
          <div className="relative mt-14 aspect-[16/9] overflow-hidden rounded-[2rem] shadow-2xl shadow-[#14245a]/15 sm:aspect-[21/9]" style={{ background: NAVY }}>
            <Image src={aboutHero.image} alt="An event hall set up by Venus Corporation" fill priority sizes="(min-width: 1280px) 1216px, 92vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" />
          </div>
        </div>
      </section>

      {/* ── 2. Our story ─────────────────────────────────────────────── */}
      <section className={`${container} grid items-center gap-14 py-24 lg:grid-cols-12 lg:gap-16 lg:py-32`}>
        <div className="relative pr-6 pb-6 lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]" style={{ background: NAVY }}>
            <Image src={story.image} alt="The Venus Corporation team planning an event" fill sizes="(min-width: 1024px) 38vw, 92vw" className="object-cover" />
          </div>
          <div
            className="absolute right-0 bottom-0 flex h-36 w-36 flex-col items-center justify-center rounded-full text-center shadow-xl"
            style={{ background: NAVY_DEEP, outline: `1px solid ${GOLD}80`, outlineOffset: "-8px" }}
          >
            <span className="text-4xl leading-none font-semibold lining-nums" style={{ ...SERIF, color: GOLD_LIGHT }}>
              {story.badge.value}
            </span>
            <span className="mt-1 max-w-[6.5rem] text-[10px] leading-tight font-semibold uppercase tracking-[0.2em] text-white/80">{story.badge.label}</span>
          </div>
        </div>
        <div className="lg:col-span-7">
          <GoldLabel>{story.label}</GoldLabel>
          <Title italic={story.italic}>{story.title}</Title>
          {story.paragraphs.map((p, i) => (
            <p key={p} className={`mt-6 leading-relaxed ${i === 0 ? "text-xl text-slate-700" : "text-lg"}`} style={i === 0 ? SERIF : undefined}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* ── 3. Numbers ───────────────────────────────────────────────── */}
      <section style={{ background: NAVY }}>
        <dl className={`${container} grid grid-cols-2 py-14 lg:grid-cols-4`}>
          {stats.map((s, i) => (
            <div key={s.label} className={`px-4 py-4 text-center ${i % 2 === 1 ? "border-l" : ""} ${i === 2 ? "lg:border-l" : ""}`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <dd className="text-5xl leading-none font-semibold text-white lining-nums" style={SERIF}>
                {s.value}
              </dd>
              <dt className="mt-2 text-base italic" style={{ ...SERIF, color: GOLD_LIGHT }}>
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ── 4. Mission & vision ──────────────────────────────────────── */}
      <section className={`${container} grid gap-6 py-24 md:grid-cols-2 lg:py-28`}>
        {missionVision.map((m, i) => (
          <div key={m.label} className="relative overflow-hidden rounded-[2rem] border p-9 sm:p-11" style={i === 0 ? { background: CREAM, borderColor: `${GOLD}33` } : { background: NAVY, borderColor: NAVY }}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: i === 0 ? GOLD : GOLD_LIGHT }}>
              {m.label}
            </p>
            <h3 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl" style={{ ...SERIF, color: i === 0 ? NAVY : "#fff" }}>
              {m.title}
            </h3>
            <p className={`mt-4 leading-relaxed ${i === 0 ? "" : "text-white/70"}`}>{m.text}</p>
            <Star size={120} fill={i === 0 ? `${GOLD}14` : "rgba(255,255,255,0.04)"} strokeWidth={0} className="pointer-events-none absolute -right-6 -bottom-6" aria-hidden />
          </div>
        ))}
      </section>

      {/* ── 5. Values ────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-28" style={{ background: CREAM }}>
        <div className={container}>
          <div className="text-center">
            <GoldLabel center>What we believe</GoldLabel>
            <Title italic="values.">Our</Title>
          </div>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <li key={v.title} className="group rounded-[1.75rem] border bg-white p-7 transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#14245a]/10" style={{ borderColor: `${GOLD}33` }}>
                <span className="text-5xl leading-none italic lining-nums" style={{ ...SERIF, color: GOLD }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-2xl font-semibold" style={{ ...SERIF, color: NAVY }}>
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 6. Milestones ────────────────────────────────────────────── */}
      <section className={`${container} py-24 lg:py-32`}>
        <div className="text-center">
          <GoldLabel center>Our journey</GoldLabel>
          <Title italic="along the way.">Milestones</Title>
        </div>
        <ol className="relative mx-auto mt-16 max-w-4xl">
          {/* Centre line (left line on small screens) */}
          <span aria-hidden className="absolute top-0 bottom-0 left-[0.6rem] w-px md:left-1/2" style={{ background: `${GOLD}55` }} />
          {milestones.map((m, i) => {
            const right = i % 2 === 1;
            return (
              <li key={m.year} className="relative mb-12 pl-12 last:mb-0 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                <span
                  aria-hidden
                  className="absolute top-1.5 left-0 h-5 w-5 rounded-full border-4 border-white shadow md:left-1/2 md:-translate-x-1/2"
                  style={{ background: i === milestones.length - 1 ? GOLD : NAVY }}
                />
                <div className={right ? "md:col-start-2" : "md:text-right"}>
                  <p className="text-4xl leading-none font-semibold lining-nums" style={{ ...SERIF, color: GOLD }}>
                    {m.year}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold" style={{ ...SERIF, color: NAVY }}>
                    {m.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed">{m.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ── 7. Our team ──────────────────────────────────────────────── */}
      <section id="team" className="scroll-mt-24 py-24 lg:py-32" style={{ background: CREAM }}>
        <div className={container}>
          <div className="text-center">
            <GoldLabel center>Our team</GoldLabel>
            <Title italic="every event.">The people behind</Title>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed">Planners, producers and problem-solvers — meet the team that makes it all happen.</p>
          </div>

          {groups.length === 0 ? (
            <p className="mt-14 text-center text-slate-400">Team members coming soon.</p>
          ) : (
            <>
              {/* Leadership row: the first group (Management), larger cards */}
              <div className="mt-16">
                <div className="mb-8 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-end" style={{ borderColor: `${GOLD}40` }}>
                  <h3 className="text-3xl font-semibold" style={{ ...SERIF, color: NAVY }}>
                    {leaders.title}
                  </h3>
                  <p className="text-sm">{leaders.text}</p>
                </div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
                  {leaders.members.map((m) => (
                    <li key={m.id}>
                      <MemberCard member={m} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Everyone else: one compact grid, each card tagged with its group */}
              {others.length > 0 && (
                <div className="mt-20">
                  <div className="mb-8 flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-end" style={{ borderColor: `${GOLD}40` }}>
                    <h3 className="text-3xl font-semibold" style={{ ...SERIF, color: NAVY }}>
                      The <em className="font-medium" style={{ color: GOLD }}>team</em>
                    </h3>
                    <p className="text-sm">{others.map((g) => g.title).join(" · ")}</p>
                  </div>
                  <ul className="flex flex-wrap justify-center gap-x-4 gap-y-10 sm:gap-x-5 [&>li]:w-[calc(50%-0.5rem)] sm:[&>li]:w-[calc(33.333%-0.85rem)] lg:[&>li]:w-[calc(20%-1rem)]">
                    {others.flatMap((g) =>
                      g.members.map((m) => (
                        <li key={m.id}>
                          <MemberCard member={m} compact tag={g.title.replace(/s$/, "")} />
                        </li>
                      )),
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── 8. Call to action ───────────────────────────────────────── */}
      <ContactCta />
    </div>
  );
}
