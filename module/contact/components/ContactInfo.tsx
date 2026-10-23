// module/contact/components/ContactInfo.tsx
//
// The navy contact card on /contact: call, email, WhatsApp, office address
// and social links, with the gold swoosh in the corner.

import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";

import { contactDetails } from "../contact-details";

const NAVY = "#14245a";
const NAVY_DEEP = "#0d1840";
const GOLD = "#c49a3c";
const GOLD_LIGHT = "#dcb45c"; // brighter gold for text on navy
const SERIF = { fontFamily: "var(--font-contact-serif)" } as const;

const socialIcons = { Facebook, Instagram, YouTube: Youtube } as const;

/** One row: gold icon circle · small label · value(s). */
function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: GOLD_LIGHT }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">{label}</p>
        <div className="mt-1 space-y-0.5 text-white">{children}</div>
      </div>
    </div>
  );
}

const linkClass = "block break-words transition-colors hover:text-[#dcb45c]";

const ContactInfo = () => {
  const d = contactDetails;
  return (
    <aside className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl shadow-[#14245a]/25 sm:p-10" style={{ background: NAVY }}>
      {/* Gold swoosh, bottom right (decorative) */}
      <svg viewBox="0 0 400 160" className="pointer-events-none absolute right-0 bottom-0 w-72 max-w-[80%]" aria-hidden>
        <path d="M40 160 C175 132 280 82 400 34" fill="none" stroke={GOLD} strokeWidth="2.5" opacity="0.8" />
        <path d="M120 160 C225 138 305 104 400 66" fill="none" stroke={GOLD} strokeWidth="1.25" opacity="0.5" />
        <path d="M235 160 C305 142 352 122 400 100 L400 160 Z" fill={NAVY_DEEP} />
      </svg>

      <div className="relative">
        <h2 className="text-3xl leading-tight font-semibold" style={SERIF}>
          Talk to us <em className="font-medium" style={{ color: GOLD_LIGHT }}>directly</em>
        </h2>
        <p className="mt-2 text-sm text-white/65">Prefer a call or a chat? We&apos;re happy to help.</p>

        <div className="mt-8 space-y-6">
          <InfoRow icon={<Phone size={18} />} label="Call us">
            {d.phones.map((p) => (
              <a key={p.href} href={p.href} className={linkClass}>
                {p.label}
              </a>
            ))}
          </InfoRow>

          <InfoRow icon={<Mail size={18} />} label="Email us">
            <a href={`mailto:${d.email}`} className={linkClass}>
              {d.email}
            </a>
          </InfoRow>

          <InfoRow icon={<MessageCircle size={18} />} label="WhatsApp">
            <a href={d.whatsapp.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {d.whatsapp.label}
            </a>
          </InfoRow>

          <InfoRow icon={<MapPin size={18} />} label="Office">
            <p>{d.address}</p>
          </InfoRow>
        </div>

        {/* Social */}
        <div className="mt-9 flex items-center gap-3 border-t border-white/10 pt-7">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">Follow</span>
          {d.social.map((s) => {
            const Icon = socialIcons[s.label as keyof typeof socialIcons];
            return (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-transparent hover:bg-[#dcb45c] hover:text-[#0d1840]"
              >
                {Icon && <Icon size={17} />}
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default ContactInfo;
