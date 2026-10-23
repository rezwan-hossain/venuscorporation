// components/layout/SiteFooter.tsx
//
// Site-wide footer, in the brand colours (deep navy + gold, elegant serif).
//   1. Brand — logo card, tagline, social links
//   2. Link columns — Explore (main pages), Services, Help, Contact
//   3. Bottom bar — copyright + motto
// (Small screens: brand block first, then the columns two by two.)
//
// The "Explore" links come from navigation.ts and the "Services" links from
// the homepage service list, so they stay in sync with the header and
// /services page.

import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";

import { navItems } from "./navigation";
import { brand, services } from "@/module/home/business/data-v3";
import CurrentYear from "../ui/CurrentYear";

// The business card's elegant serif (tagline + motto).
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-footer-serif",
});

// Look (from the business card)
const NAVY_DEEP = "#0b1433";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on navy
const SERIF = { fontFamily: "var(--font-footer-serif)" } as const;

const socialIcons = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

const helpLinks = [
  { label: "Support", href: "/contact" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/terms-and-conditions" },
];

const contact = {
  email: "info@venuscorporation.org",
  phone: { label: "+880 1862 221943", href: "tel:+8801862221943" },
  address: "House-32, Road-08, Block-H, Mirpur-2, Dhaka",
};

/** "Exhibitions & Trade Shows" → "exhibitions-trade-shows" (anchor on /services). */
const serviceSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// The logo is dark navy on a transparent background, so on the navy footer it
// sits on a white card to stay readable.
const FooterLogo = () => (
  <Link
    href="/"
    aria-label="Venus Corporation home"
    className="inline-block max-w-full rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-[1.03]"
  >
    <Image
      src="/venuscorporation-logo.png"
      alt="Venus Corporation"
      width={719}
      height={347}
      className="h-auto w-[190px] max-w-full"
      sizes="190px"
    />
  </Link>
);

/** Column heading: small gold capitals with a short line. */
const ColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT, fontFamily: "var(--font-body)" }}>
    {children}
    <span className="h-px w-6" style={{ background: `${GOLD}99` }} aria-hidden />
  </h4>
);

const linkClass = "inline-block py-0.5 text-sm text-white/60 transition-colors hover:text-[#dcb45c]";

const SiteFooter = () => {
  return (
    <footer className={`${serif.variable} relative overflow-hidden text-white`} style={{ background: NAVY_DEEP }}>
      {/* Gold hairline along the top + soft glow (decorative) */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#c49a3c]/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[40rem] max-w-full -translate-x-1/2 rounded-full opacity-10 blur-3xl" style={{ background: GOLD }} />

      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2.9fr] lg:gap-14">
          {/* ── 1. Brand ───────────────────────────────────────────── */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <FooterLogo />
            <p className="mt-6 max-w-xs text-xl leading-snug text-white/85 italic" style={SERIF}>
              {brand.tagline} — events planned with care, from first idea to final applause.
            </p>

            <div className="mt-6 flex gap-2.5">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-transparent hover:bg-[#dcb45c] hover:text-[#0b1433]"
                >
                  <social.icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* ── 2. Link columns ────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[0.8fr_1.3fr_1fr_1.5fr] md:gap-x-8">
            <nav aria-label="Footer">
              <ColumnTitle>Explore</ColumnTitle>
              <ul className="space-y-2.5">
                {navItems.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <ColumnTitle>Services</ColumnTitle>
              <ul className="space-y-2.5">
                {services.map((s) => (
                  <li key={s.name}>
                    <Link href={`/services#${serviceSlug(s.name)}`} className={linkClass}>
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ColumnTitle>Help</ColumnTitle>
              <ul className="space-y-2.5">
                {helpLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} prefetch={false} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <ColumnTitle>Contact</ColumnTitle>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href={`mailto:${contact.email}`} className="group flex items-start gap-3 text-white/70 transition-colors hover:text-[#dcb45c]">
                    <Mail size={16} className="mt-0.5 shrink-0" style={{ color: GOLD_LIGHT }} />
                    <span className="break-words">{contact.email}</span>
                  </a>
                </li>
                <li>
                  <a href={contact.phone.href} className="group flex items-start gap-3 text-white/70 transition-colors hover:text-[#dcb45c]">
                    <Phone size={16} className="mt-0.5 shrink-0" style={{ color: GOLD_LIGHT }} />
                    {contact.phone.label}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/70">
                  <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: GOLD_LIGHT }} />
                  {contact.address}
                </li>
              </ul>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#dcb45c]/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition hover:bg-[#dcb45c] hover:text-[#0b1433]"
                style={{ color: GOLD_LIGHT }}
              >
                Plan your event <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 3. Bottom bar ──────────────────────────────────────────── */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/45 sm:text-sm">
            © <CurrentYear /> {brand.name}. All rights reserved.
          </p>
          <p className="text-lg italic text-white/70" style={SERIF}>
            {brand.motto.left} <span style={{ color: GOLD_LIGHT }}>|</span> {brand.motto.right}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
