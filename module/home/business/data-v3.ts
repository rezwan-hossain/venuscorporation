// module/home/business/data-v3.ts
//
// DEMO CONTENT for homepage variation 3 — Venus Corporation as an EVENT
// MANAGEMENT company, based on the business card:
//   "Venus Corporation · Business Beyond Boundaries · Event Management"
//   Services: Corporate Events, Sports Events, Weddings, Conferences &
//   Seminars, Exhibitions & Trade Shows, Private & Social Events
//   "Your Vision | Our Expertise"
//
// Everything on the v3 homepage comes from this file — no database.
// Numbers, client names and testimonials are placeholders: replace them
// with real ones before going live.

import { contactDetails } from "@/config/contact";

/** Unsplash photo (allowed in next.config.ts) at a given width. */
const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

// ─── Brand ────────────────────────────────────────────

export const brand = {
  name: "Venus Corporation",
  tagline: "Business Beyond Boundaries",
  division: "Event Management",
  motto: { left: "Your Vision", right: "Our Expertise" },
};

// ─── Hero ─────────────────────────────────────────────

export const hero = {
  title: "Your vision,", // first line
  highlight: "our expertise.", // second line, in gold italic
  text: "From boardroom conferences to once-in-a-lifetime weddings, we plan, design and run events that people remember — down to the last detail.",
  primaryCta: { label: "Plan your event", href: "/contact" },
  secondaryCta: { label: "Explore our services", href: "#services" },
  images: {
    main: photo("1519225421980-715cb0215aed", 1200), // elegant long table
    top: photo("1475721027785-f74eccf877e2", 700), // speaker microphone
    bottom: photo("1511285560929-80b456fea0bc", 700), // wedding couple
  },
};

// ─── Services (from the card) ─────────────────────────

export type Service = {
  name: string;
  text: string;
  includes: string[]; // what we handle
  image: string;
  href?: string; // optional link to more
};

export const services: Service[] = [
  {
    name: "Corporate Events",
    text: "Annual meetings, launches, award nights and team events that reflect your brand.",
    includes: ["Venue & production", "Branding & staging", "Guest management"],
    image: photo("1540575467063-178a50c2df87", 900),
  },
  {
    name: "Sports Events",
    text: "City marathons, trail runs and tournaments — routes, timing, registration and race day.",
    includes: ["Online registration", "Race-day operations", "Medals & merchandise"],
    image: photo("1513593771513-7b58b6c4af38", 900),
    href: "/events",
  },
  {
    name: "Weddings",
    text: "Elegant, stress-free weddings — from the first concept to the final dance.",
    includes: ["Décor & theme design", "Catering & venue", "Day-of coordination"],
    image: photo("1511285560929-80b456fea0bc", 900),
  },
  {
    name: "Conferences & Seminars",
    text: "Professional programmes with speakers, AV, registration and hospitality handled.",
    includes: ["Speaker & agenda management", "Audio-visual & streaming", "Delegate registration"],
    image: photo("1475721027785-f74eccf877e2", 900),
  },
  {
    name: "Exhibitions & Trade Shows",
    text: "Stands, floor plans and visitor flow that turn footfall into business.",
    includes: ["Stand design & build", "Exhibitor coordination", "Visitor registration"],
    image: photo("1560439514-4e9645039924", 900),
  },
  {
    name: "Private & Social Events",
    text: "Birthdays, anniversaries, family gatherings and celebrations, beautifully hosted.",
    includes: ["Themes & décor", "Entertainment", "Catering & hospitality"],
    image: photo("1511795409834-ef04bbd61622", 900),
  },
];

// ─── Numbers ──────────────────────────────────────────

export const stats = [
  { value: "500+", label: "Events delivered" },
  { value: "100K+", label: "Guests hosted" },
  { value: "12+", label: "Years of experience" },
  { value: "150+", label: "Corporate clients" },
];

// ─── How we plan your event ───────────────────────────

export const steps = [
  { title: "Consultation", text: "We listen to your vision, guests, budget and date." },
  { title: "Concept & design", text: "A theme, layout and plan built around your goals." },
  { title: "Planning & logistics", text: "Venue, vendors, permits and timelines — all handled." },
  { title: "Event day", text: "Our on-site team runs everything so you can enjoy it." },
  { title: "Wrap-up", text: "Teardown, photos, feedback and a full report." },
];

// ─── Why choose us ────────────────────────────────────

export const reasons = [
  { title: "One team, start to finish", text: "A dedicated planner is your single point of contact." },
  { title: "Trusted vendor network", text: "Venues, caterers, AV and décor partners we've worked with for years." },
  { title: "Transparent budgets", text: "Clear quotes up front, with no surprise costs later." },
  { title: "Calm on the day", text: "Rehearsed plans and backup options for every detail." },
];

// ─── Gallery ──────────────────────────────────────────

export const gallery = [
  { image: photo("1465495976277-4387d4b0b4c6", 800), label: "Wedding" },
  { image: photo("1505373877841-8d25f7d46678", 800), label: "Conference" },
  { image: photo("1464366400600-7168b8af9bc3", 800), label: "Reception" },
  { image: photo("1530143311094-34d807799e8f", 800), label: "Trail run" },
  { image: photo("1530103862676-de8c9debad1d", 800), label: "Birthday" },
  { image: photo("1505236858219-8359eb29e329", 800), label: "Launch night" },
];

// ─── Testimonials ─────────────────────────────────────

export const testimonials = [
  {
    quote: "Our wedding was exactly how we imagined it — and we didn't have to worry about a single thing on the day.",
    name: "Nusrat & Arif",
    role: "Wedding, Dhaka",
  },
  {
    quote: "1,200 delegates, three halls, live streaming — and it all ran to the minute. We've booked them again for next year.",
    name: "Farhana Rahman",
    role: "Head of Marketing, Harbor Bank",
  },
  {
    quote: "They handled registration, the route and race day for our marathon. Runners are still talking about it.",
    name: "Sakib Hasan",
    role: "Founder, Dhaka Runners Club",
  },
];

// ─── Final call to action ─────────────────────────────

export const cta = {
  title: "Let's plan your next event",
  text: "Tell us the occasion, the date and the number of guests — we'll come back with ideas and a clear quote.",
  primary: { label: "Plan your event", href: "/contact" },
  secondary: { label: "Call us", href: contactDetails.phones[0].href },
  // Used by the homepage's closing section (contact details: config/contact.ts)
  phone: contactDetails.phones[0].label,
  email: contactDetails.email,
  promises: ["Free first consultation", "Reply within one working day", "Clear, itemised quote"],
  background: photo("1464366400600-7168b8af9bc3", 2000), // decorated reception hall
};
