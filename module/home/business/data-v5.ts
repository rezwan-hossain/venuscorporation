// module/home/business/data-v5.ts
//
// Extra DEMO CONTENT for homepage variation 5 ("invitation" style).
// Everything else (services, numbers, steps, gallery, testimonials, brand)
// comes from data-v3.ts, so editing that file updates v3, v4 and v5.
// No database.

/** Unsplash photo (allowed in next.config.ts) at a given width. */
const photo = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

// ─── Hero: "Now showing" summit hero ──────────────────

export const summitHero = {
  // Background video (muted, looping). Put the file in public/videos/ and
  // set its path here, e.g. "/videos/hero-summit.mp4". Use a 21:9, 5–10 s
  // clip, under ~5 MB. Leave it null to show the poster photo only.
  video: null as string | null,
  // Shown while the video loads, and instead of it when `video` is null.
  poster: photo("1540575467063-178a50c2df87", 2000), // summit audience

  kicker: "Now showing · Business Summit",
  title: "Business summits that move industries forward",
  text: "Corporate stages, delegates and keynotes — planned and delivered end to end.",
  primaryCta: { label: "Plan your event", href: "/contact" },
  watchCta: { label: "Watch our events", href: "#moments" }, // href = fallback if the video can't open

  // Showreel that "Watch our events" plays in a full-screen player.
  // Paste any YouTube link (youtube.com/watch?v=…, youtu.be/…, /shorts/…)
  // or a video file path (e.g. "/videos/showreel.mp4" in public/videos/).
  // DEMO: a placeholder YouTube video — replace with your own showreel.
  // Set to null to make the button jump to "Signature moments" instead.
  showreel: {
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    title: "Venus Corporation showreel",
  } as { url: string; title: string } | null,

  // The white bar under the hero: the next event on the calendar
  nextEvent: {
    name: "Dhaka Business Summit 2026",
    venue: "Bangabandhu International Conference Center",
    date: "12 Dec 2026",
    href: "/contact",
    linkLabel: "Summit details",
  },
};

// ─── (previous hero) The invitation card ──────────────
// Still used for the "Request a proposal" buttons further down the page.

export const invitation = {
  background: photo("1464366400600-7168b8af9bc3", 2000), // decorated reception hall
  intro: "You are invited to experience", // small line above the title
  title: "Your vision,",
  highlight: "our expertise.",
  text: "Corporate galas, weddings, conferences, exhibitions and race days — planned with care and delivered beautifully.",
  primaryCta: { label: "Request a proposal", href: "/contact" },
  secondaryCta: { label: "Our services", href: "#services" },
};

// ─── Signature moments (three tall cards) ─────────────

export const signature = [
  {
    title: "Garden wedding for 400 guests",
    category: "Wedding",
    caption: "Floral design, live music and a seamless evening timeline.",
    image: photo("1519741497674-611481863552", 900),
  },
  {
    title: "Leadership summit, three halls",
    category: "Corporate",
    caption: "Live streaming, translation and 1,200 delegates on schedule.",
    image: photo("1505373877841-8d25f7d46678", 900),
  },
  {
    title: "City marathon race day",
    category: "Sports",
    caption: "Routes, timing, 8,000 runners and a finish-line festival.",
    image: photo("1530143311094-34d807799e8f", 900),
  },
];

// ─── Frequently asked questions ───────────────────────

export const faqs = [
  {
    q: "How early should we book?",
    a: "For weddings and large corporate events, 3–6 months ahead is ideal. Smaller private events can often be arranged in 2–4 weeks — ask us about your date.",
  },
  {
    q: "Can you work with our budget?",
    a: "Yes. We start from your budget, show you clearly where it goes, and suggest options so nothing is spent without your approval.",
  },
  {
    q: "Do you handle venues and vendors?",
    a: "We do — venue booking, catering, décor, sound, lighting, photography and permits, all through partners we trust.",
  },
  {
    q: "Do you organise events outside Dhaka?",
    a: "Yes, across Bangladesh — from Chattogram beach events to Sundarbans trail runs. Travel and logistics are part of our plan.",
  },
  {
    q: "What happens on the event day?",
    a: "A dedicated coordinator and on-site team run the schedule, vendors and guests, so you can simply enjoy the occasion.",
  },
];

// ─── Final call to action (RSVP card) ─────────────────

export const rsvp = {
  label: "Kindly reply",
  title: "Tell us about your occasion",
  text: "Share the date, the number of guests and what you have in mind. We'll reply within one working day with ideas and a clear quote.",
  primary: { label: "Request a proposal", href: "/contact" },
  phone: { label: "+880 1862 221943", href: "tel:+8801862221943" },
};
