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

// Shown in the homepage "Trusted by" strip. Without a `logo`, the name is shown
// as a wordmark. To use a real logo, add e.g. logo: "/clients/harbor-bank.png"
// (put the file in public/clients/; a wide, transparent PNG or SVG works best).
export const clients: { name: string; logo?: string }[] = [
  { name: "Harbor Bank" },
  { name: "Orbit Telecom" },
  { name: "Crescent Foods" },
  { name: "Northwind" },
  { name: "Bluepeak" },
  { name: "Greenline" },
  { name: "Meridian" },
];

// ─── About ────────────────────────────────────────────

export const about = {
  eyebrow: "Who we are",
  // The title is split at ". " — the second half shows in gold italic.
  title: "One team. Every kind of event.",
  paragraphs: [
    "Venus Corporation is an event-management company from Dhaka. We plan and run corporate summits, conferences, exhibitions, race days, weddings and private celebrations — from the first idea to the final applause.",
    "One dedicated team handles it all: concept, venue, vendors, guests and the day itself, so you can focus on your guests and the moment.",
  ],
  points: ["One planner, one point of contact", "Venues, vendors and production in-house", "Trusted by companies and families across Bangladesh"],
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
    title: "Annual leadership summit",
    client: "Harbor Bank",
    category: "Corporate event",
    image: photo("1505373877841-8d25f7d46678", 1000), // conference hall
    result: "1,200 delegates · 3 halls",
  },
  {
    title: "Garden wedding & reception",
    client: "Private client",
    category: "Wedding",
    image: photo("1519741497674-611481863552", 1000), // wedding
    result: "400 guests · 2 days",
  },
  {
    title: "Bangladesh Trade Expo",
    client: "Orbit Telecom",
    category: "Exhibition",
    image: photo("1560439514-4e9645039924", 1000), // expo floor
    result: "120 stalls · 15,000 visitors",
  },
  {
    title: "Dhaka City Marathon",
    client: "Merch Sports",
    category: "Sports event",
    image: photo("1530143311094-34d807799e8f", 1000), // marathon
    result: "8,000 runners · 4 distances",
  },
];

// ─── Testimonials ─────────────────────────────────────

export const testimonials = [
  {
    quote: "They planned and ran our annual summit end to end — 1,200 delegates, three halls, and every session on time. One team, zero surprises.",
    name: "Farhana Rahman",
    role: "Head of Marketing, Harbor Bank",
  },
  {
    quote: "From the décor to the last dance, our wedding was exactly how we imagined it. We didn't have to worry about a single thing on the day.",
    name: "Nusrat & Arif",
    role: "Wedding, Dhaka",
  },
  {
    quote: "Our first trade expo felt effortless — stalls built on time, smooth visitor flow, and exhibitors already asking about next year.",
    name: "Tanvir Ahmed",
    role: "Brand Manager, Orbit Telecom",
  },
];

// ─── Final call to action ─────────────────────────────

export const cta = {
  title: "Let's build something beyond boundaries.",
  text: "Tell us what you're planning — a brand, an event or a product. We'll put the right team on it.",
  primary: { label: "Start a conversation", href: "/contact" },
  secondary: { label: "See our events", href: "/events" },
};
