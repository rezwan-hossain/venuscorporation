// module/legal/components/legal-ui.tsx
//
// Shared building blocks for the legal pages (Terms & Conditions, Privacy
// Policy), so both look the same:
//
//   <LegalPage>            serif font + white page
//     <LegalHeader … />    cream band: breadcrumb, title, intro, "Last updated"
//     <LegalLayout …>      contents list (sticky on desktop, folded on phones)
//       …sections…         + the page's own sections on the right
//
// Plus small pieces used inside sections: Points, Notice, ContactCard,
// ClosingPanel.

import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { CalendarDays, ChevronDown, ChevronRight, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";

import { contactDetails } from "@/config/contact";

// The brand's elegant serif (headings on the legal pages)
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-legal-serif",
});

export const NAVY = "#14245a";
export const GOLD = "#c49a3c";
export const GOLD_DARK = "#a8852f";
export const CREAM = "#faf8f3";
export const SERIF = { fontFamily: "var(--font-legal-serif)" } as const;

/** "1" → "01" */
export const sectionNumber = (i: number) => String(i + 1).padStart(2, "0");

/** One bullet: plain text, or { label, text } → "**Access:** Request a copy …",
 *  optionally with `sub` points (an indented list). */
export type Point = string | { label?: string; text: string; sub?: string[] };

/** Page wrapper: loads the serif font for everything inside. */
export function LegalPage({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} min-h-screen bg-white font-body`}>{children}</div>;
}

/** Cream header band: breadcrumb, "Title *italic*", intro, last-updated chip. */
export function LegalHeader({
  crumb,
  title,
  italic,
  intro,
  lastUpdated,
}: {
  crumb: string;
  title: string;
  italic: string;
  intro: string;
  lastUpdated: string;
}) {
  return (
    <header className="border-b pt-32 pb-12 sm:pt-40 sm:pb-16" style={{ background: CREAM, borderColor: `${GOLD}26` }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
          <Link href="/" className="font-medium hover:underline" style={{ color: GOLD_DARK }}>
            Home
          </Link>
          <ChevronRight size={14} className="text-slate-400" aria-hidden />
          <span className="text-slate-500">{crumb}</span>
        </nav>

        <h1 className="mt-5 text-5xl leading-[1.05] font-semibold sm:text-6xl" style={{ ...SERIF, color: NAVY }}>
          {title}{" "}
          <em className="font-medium" style={{ color: GOLD }}>
            {italic}
          </em>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{intro}</p>
        <p
          className="mt-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-medium text-slate-600"
          style={{ borderColor: `${GOLD}40` }}
        >
          <CalendarDays size={13} style={{ color: GOLD }} aria-hidden />
          Last updated {lastUpdated}
        </p>
      </div>
    </header>
  );
}

/** Two columns: contents list (left) + the page's sections (right). */
export function LegalLayout({
  sections,
  children,
}: {
  sections: { id: string; title: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          {/* Phones: folded */}
          <details className="group rounded-2xl border bg-white lg:hidden" style={{ borderColor: `${GOLD}40` }}>
            <summary
              className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden"
              style={{ color: NAVY }}
            >
              Contents · {sections.length} sections
              <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="border-t px-5 pt-2 pb-4" style={{ borderColor: `${GOLD}26` }}>
              <ContentsList sections={sections} />
            </div>
          </details>

          {/* Large screens: always open */}
          <nav aria-label="Contents" className="hidden lg:block">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: GOLD_DARK }}>
              Contents
            </p>
            <ContentsList sections={sections} />
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

function ContentsList({ sections }: { sections: { id: string; title: string }[] }) {
  return (
    <ol className="space-y-0.5">
      {sections.map((section, i) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className="flex gap-3 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-[#faf8f3] hover:text-[#14245a]"
          >
            <span className="w-5 shrink-0 text-xs leading-5 tabular-nums" style={{ color: GOLD }}>
              {sectionNumber(i)}
            </span>
            <span className="leading-5">{section.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Section heading: gold number — or an icon, if given — then the serif title. */
export function SectionTitle({ index, title, icon: Icon }: { index: number; title: string; icon?: LucideIcon }) {
  return (
    <h2 className="flex items-center gap-4">
      {Icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: CREAM }}>
          <Icon size={17} style={{ color: GOLD }} aria-hidden />
        </span>
      ) : (
        // Body font: inside <h2> it would get the global display font
        <span className="w-8 shrink-0 text-sm font-semibold tabular-nums" style={{ color: GOLD, fontFamily: "var(--font-body)" }}>
          {sectionNumber(index)}
        </span>
      )}
      <span className="text-2xl leading-tight font-semibold sm:text-[1.75rem]" style={{ ...SERIF, color: NAVY }}>
        {title}
      </span>
    </h2>
  );
}

/** Bullet list with gold markers. "Label: text" points show the label in navy. */
export function Points({ points }: { points: Point[] }) {
  return (
    <ul className="space-y-2.5">
      {points.map((point) => {
        const p = typeof point === "string" ? { text: point } : point;
        return (
          <li key={p.text} className="flex gap-3">
            <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} aria-hidden />
            <div>
              {p.label && (
                <strong className="font-semibold" style={{ color: NAVY }}>
                  {p.label}:{" "}
                </strong>
              )}
              {p.text}
              {p.sub && (
                <ul className="mt-2 space-y-1.5">
                  {p.sub.map((sub) => (
                    <li key={sub} className="flex gap-3">
                      <span className="mt-[0.75em] h-px w-3 shrink-0" style={{ background: GOLD }} aria-hidden />
                      {sub}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Cream notice card with an icon, e.g. "Important: …". */
export function Notice({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-2xl border p-5 sm:p-6" style={{ borderColor: `${GOLD}40`, background: CREAM }}>
      <Icon size={22} className="mt-0.5 shrink-0" style={{ color: GOLD }} aria-hidden />
      <p className="text-[15px] leading-relaxed text-slate-700">
        <strong style={{ color: NAVY }}>{label}:</strong> {children}
      </p>
    </div>
  );
}

/** Navy panel at the end of a page, e.g. "Agreement" / "Your consent". */
export function ClosingPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl p-6 text-white sm:p-8" style={{ background: `linear-gradient(135deg, #1c3175, ${NAVY} 55%, #0d1840)` }}>
      <p className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: "#dcb45c" }}>
        {label}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-white/85">{children}</p>
    </div>
  );
}

/** Email, phone and address as tappable rows (from config/contact.ts). */
export function ContactCard() {
  const rows = [
    { icon: Mail, label: "Email", value: contactDetails.email, href: `mailto:${contactDetails.email}` },
    { icon: Phone, label: "Phone", value: contactDetails.phones[0].label, href: contactDetails.phones[0].href },
    { icon: MapPin, label: "Address", value: contactDetails.address },
  ];
  return (
    <ul className="mt-4 divide-y rounded-2xl border bg-white" style={{ borderColor: `${GOLD}40` }}>
      {rows.map(({ icon: Icon, label, value, href }) => (
        <li key={label} className="flex items-start gap-4 px-5 py-4" style={{ borderColor: `${GOLD}26` }}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: CREAM }}>
            <Icon size={16} style={{ color: GOLD }} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD_DARK }}>
              {label}
            </p>
            {href ? (
              <a href={href} className="font-medium break-words hover:underline" style={{ color: NAVY }}>
                {value}
              </a>
            ) : (
              <p className="font-medium" style={{ color: NAVY }}>
                {value}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
