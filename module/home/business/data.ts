// module/home/business/data.ts
//
// DEMO CONTENT for the business portfolio homepage.
// Everything on the homepage comes from this file — no database.
// Change the text, numbers and images here; the layout updates by itself.
//
// Company names other than Merch Sports, client names and testimonials are
// placeholders — replace them with real ones before going live.

/** Unsplash photo (allowed in next.config.ts) at a given width. */
const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

// ─── Hero ─────────────────────────────────────────────

export const hero = {
  eyebrow: "Venus Corporation",
  title: "Business beyond", // first line
  highlight: "boundaries.", // second line, shown in gold
  text: "A Bangladeshi group of companies building brands, events and technology that move people — from city marathons to corporate summits and digital products.",
  primaryCta: { label: "Explore our companies", href: "#companies" },
  secondaryCta: { label: "Work with us", href: "/contact" },
  images: {
    main: photo("1486406146926-c627a92ad1ab", 1400), // skyscrapers
    side: photo("1600880292203-757bb62b4baf", 800), // team celebrating
  },
  badge: { value: "12+", label: "years building brands" },
};

// ─── Numbers ──────────────────────────────────────────

export const stats = [
  { value: "6", label: "Companies in the group" },
  { value: "250+", label: "Clients served" },
  { value: "50K+", label: "Event participants" },
  { value: "120+", label: "Team members" },
];

// ─── Clients ("Trusted by") ───────────────────────────

export const clients = ["Northwind", "Bluepeak", "Orbit Telecom", "Harbor Bank", "Greenline", "Meridian", "Crescent Foods"];

// ─── About ────────────────────────────────────────────

export const about = {
  eyebrow: "Who we are",
  title: "One group. Many ways to grow your business.",
  paragraphs: [
    "Venus Corporation brings together specialist companies under one roof — events, communication, merchandise and technology. Each runs with its own expert team, and all of them share the same standards for quality and delivery.",
    "That means one partner can plan your campaign, produce your merchandise, run your event and build the digital product behind it.",
  ],
  points: ["Specialist teams, one point of contact", "End-to-end delivery in-house", "Trusted by brands across Bangladesh"],
  image: photo("1556761175-5973dc0f32e7", 1100), // team meeting
  badge: { value: "12+", label: "Years of experience" },
};

// ─── Companies (the portfolio) ────────────────────────

export type Company = {
  name: string;
  sector: string;
  description: string;
  image: string;
  href?: string; // link to more details (optional)
};

export const companies: Company[] = [
  {
    name: "Merch Sports",
    sector: "Sports & running events",
    description: "Marathons, trail runs and virtual races for thousands of runners every year.",
    image: photo("1513593771513-7b58b6c4af38", 900),
    href: "/events",
  },
  {
    name: "Merch Communication",
    sector: "Brand & marketing",
    description: "Campaigns, brand identity and content that make companies stand out.",
    image: photo("1542744173-8e7e53415bb0", 900),
  },
  {
    name: "Venus Apparel",
    sector: "Merchandise & apparel",
    description: "Custom T-shirts, uniforms and branded merchandise, produced at scale.",
    image: photo("1441986300917-64674bd600d8", 900),
  },
  {
    name: "Venus Events",
    sector: "Corporate events",
    description: "Conferences, product launches and summits — from venue to final applause.",
    image: photo("1540575467063-178a50c2df87", 900),
  },
  {
    name: "Venus Digital",
    sector: "Software & technology",
    description: "Websites, apps and platforms — like the registration system behind our races.",
    image: photo("1573164713988-8665fc963095", 900),
  },
  {
    name: "Venus Consulting",
    sector: "Strategy & growth",
    description: "Market research, planning and advice for businesses ready to scale.",
    image: photo("1552664730-d307ca884978", 900),
  },
];

// ─── How we work ──────────────────────────────────────

export const steps = [
  { step: "01", title: "Discover", text: "We learn your goals, audience and constraints before proposing anything." },
  { step: "02", title: "Plan", text: "One clear plan and budget across every company involved." },
  { step: "03", title: "Deliver", text: "Our specialist teams execute — on time, with one point of contact." },
  { step: "04", title: "Grow", text: "We measure results and keep improving with you." },
];

// ─── Featured work ────────────────────────────────────

export const projects = [
  {
    title: "Dhaka City Marathon",
    client: "Merch Sports",
    category: "Event",
    image: photo("1530143311094-34d807799e8f", 1000),
    result: "8,000 runners · 4 distances",
  },
  {
    title: "National retail rebrand",
    client: "Crescent Foods",
    category: "Branding",
    image: photo("1460925895917-afdab827c52f", 1000),
    result: "+38% brand recall",
  },
  {
    title: "Annual leadership summit",
    client: "Harbor Bank",
    category: "Corporate event",
    image: photo("1505373877841-8d25f7d46678", 1000),
    result: "1,200 attendees",
  },
  {
    title: "Race registration platform",
    client: "Merch Sports",
    category: "Technology",
    image: photo("1551288049-bebda4e38f71", 1000),
    result: "Online payments in minutes",
  },
];

// ─── Testimonials ─────────────────────────────────────

export const testimonials = [
  {
    quote: "They planned, branded and ran our annual summit end to end. One team, zero surprises.",
    name: "Farhana Rahman",
    role: "Head of Marketing, Harbor Bank",
  },
  {
    quote: "From merchandise to the event app, everything arrived on time and looked premium.",
    name: "Tanvir Ahmed",
    role: "Brand Manager, Crescent Foods",
  },
  {
    quote: "Our first marathon sold out in weeks. The registration and payment flow just worked.",
    name: "Sakib Hasan",
    role: "Founder, Dhaka Runners Club",
  },
];

// ─── Final call to action ─────────────────────────────

export const cta = {
  title: "Let's build something beyond boundaries.",
  text: "Tell us what you're planning — a brand, an event or a product. We'll put the right team on it.",
  primary: { label: "Start a conversation", href: "/contact" },
  secondary: { label: "See our events", href: "/events" },
};
