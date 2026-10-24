// module/about/data.ts
//
// DEMO CONTENT for the About Us page (/about). No database — edit the text,
// dates and photos here. The team section uses the real team members from
// the database (admin → Team).

/** Unsplash photo (allowed in next.config.ts) at a given width. */
const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const aboutHero = {
  label: "About us",
  title: "We turn your vision into",
  italic: "unforgettable events.",
  text: "Venus Corporation is an event-management company from Dhaka. For more than twelve years we've planned and run summits, weddings, race days and celebrations across Bangladesh — with one team, from the first call to the final applause.",
  image: photo("1511578314322-379afb476865", 1400), // event hall set up
};

export const story = {
  label: "Our story",
  title: "Started with one event.",
  italic: "Built on every one since.",
  paragraphs: [
    "Venus Corporation began in 2014 with a small team and a single corporate conference in Dhaka. The client came back the next year — and brought two friends.",
    "Since then we've grown into a full event-management company: corporate events and summits, city marathons, weddings, exhibitions and private celebrations. What hasn't changed is how we work — we listen first, plan every detail, and stay on site until the last guest leaves.",
  ],
  image: photo("1556761175-5973dc0f32e7", 1100), // team meeting
  badge: { value: "2014", label: "Founded in Dhaka" },
};

export const missionVision = [
  {
    label: "Our mission",
    title: "Make every occasion effortless",
    text: "Plan and deliver events that feel personal to our clients and seamless for their guests — on time, on budget and without surprises.",
  },
  {
    label: "Our vision",
    title: "Bangladesh's most trusted event partner",
    text: "To be the first name companies and families call for the moments that matter — known for care, creativity and reliability.",
  },
];

export const values = [
  { title: "Care", text: "We treat every event as if it were our own — the guests, the details and the people behind them." },
  { title: "Craft", text: "Good events are designed. We sweat the timelines, the lighting and the little touches." },
  { title: "Reliability", text: "Clear plans, honest budgets and a team that turns up early. No surprises on the day." },
  { title: "Partnership", text: "One point of contact, trusted vendors and long-term relationships with our clients." },
];

export const milestones = [
  { year: "2014", title: "Founded in Dhaka", text: "Our first corporate conference — 300 delegates." },
  { year: "2016", title: "First business summit", text: "Two halls, 20 speakers and a new corporate events team." },
  { year: "2018", title: "Into sports", text: "The first Dhaka City Marathon, with online registration and timing." },
  { year: "2020", title: "Weddings & private events", text: "A dedicated team for weddings, anniversaries and celebrations." },
  { year: "2023", title: "Exhibitions & expos", text: "Our first trade expo — 120 stalls and 15,000 visitors." },
  { year: "2026", title: "100,000+ guests", text: "500+ events delivered across Bangladesh." },
];

/** Headings for each team group on the About page (by TeamCategory). */
export const teamGroups = [
  { category: "MANAGEMENT", title: "Management", text: "The leaders running Venus Corporation." },
  { category: "ADMIN", title: "Leadership", text: "The people steering our events and operations." },
  { category: "ADVISOR", title: "Advisors", text: "Expert guidance shaping our direction." },
  { category: "ORGANIZER", title: "Organizers", text: "The team that brings every event together on the day." },
] as const;
