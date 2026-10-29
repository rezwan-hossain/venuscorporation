// prisma/seed.ts
//
// Development seed: realistic data that obeys the same rules the app does.
//
//   npx prisma db seed              → seed an empty database
//   npx prisma db seed -- --reset   → wipe every table first, then seed
//
// Rules kept in sync with the app (see the files named next to each step):
//   - Package.usedSlots = sum of qty over its non-CANCELLED orders (lib/slot-hold.ts)
//   - Order.total = subtotal − discount, Payment.amount = round(total) (checkout.ts)
//   - CouponUsage exists only for paid orders, and Coupon.usedCount = their count
//     (lib/order-confirmation.ts → applyCoupon)
//   - PENDING online orders hold a slot until holdExpiresAt (in the future);
//     CONFIRMED / MANUAL orders have holdExpiresAt = null
//   - BIB = package prefix + 4 digits, per package (lib/bib-package-prefix.ts)
//   - dropdown values come from lib/registration-options.ts
//
// Optional env:
//   SEED_ADMIN_EMAIL — email of the seeded ADMIN. Use your real Supabase login
//   email: signing in links that account to the seeded admin (lib/auth/syncUser.ts).

import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import type { Prisma } from "../lib/generated/prisma/client";
import { getPackageBibPrefix } from "../lib/bib-package-prefix";
import { DEFAULT_FAQS } from "../lib/faq-defaults";
import { EVENT_DESCRIPTIONS } from "./seed-descriptions";
import {
  AGE_CATEGORIES,
  BLOOD_GROUPS,
  GENDERS,
  RUNNER_CATEGORIES,
} from "../lib/registration-options";
import { SOURCES } from "../lib/traffic-source";
import { SHARE_CHANNELS, SHARE_PLACES } from "../lib/share";
import { tshirtSizes } from "../module/checkout/data/tshirtSizes";

const RESET = process.argv.includes("--reset");
const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || "admin@merchsports.test")
  .trim()
  .toLowerCase();

// ─── helpers ──────────────────────────────────────────

// Fixed-seed PRNG so every run produces the same data.
let rngState = 20261008;
function rand() {
  rngState = (rngState + 0x6d2b79f5) | 0;
  let t = rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
const chance = (p: number) => rand() < p;
const hex = (len: number) =>
  Array.from({ length: len }, () => int(0, 15).toString(16)).join("");

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const now = new Date();

// The admin form stores `date` as UTC midnight and `time` as the wall-clock
// time written in UTC (app/actions/admin.ts), so 06:00 is stored as 06:00Z.
function eventDay(daysFromToday: number) {
  const d = new Date(now.getTime() + daysFromToday * DAY_MS);
  return d.toISOString().slice(0, 10);
}
/** The real instant of a Dhaka (UTC+6) wall-clock time. */
const dhakaInstant = (day: string, hhmm: string) =>
  new Date(new Date(`${day}T${hhmm}:00Z`).getTime() - 6 * HOUR_MS);

const dhakaDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" });
const dayKey = (d: Date) => dhakaDay.format(d);

const img = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const PHOTOS = [
  "1452626038306-9aae5e071dd3",
  "1530143311094-34d807799e8f",
  "1571008887538-b36bb32f4571",
  "1476480862126-209bfaa8edc8",
  "1594882645126-14020914d58d",
  "1513593771513-7b58b6c4af38",
  "1461896836934-ffe607ba8211",
  "1502904550040-7534597429ae",
  "1486218119243-13883505764c",
  "1544717305-2782549b5136",
  "1517649763962-0c623066013b",
  "1590646299178-1b26ab821e34",
  "1535131749006-b7f58c99034b",
  "1551698618-1dfe5d97d256",
  "1483721310020-03333e577078",
  "1540575467063-178a50c2df87", // 15: conference audience (business summit)
  "1560439514-4e9645039924", // 16: expo / trade show floor
  "1511795409834-ef04bbd61622", // 17: gala dinner / celebration
  "1552664730-d307ca884978", // 18: workshop / team session
];

// Bangladeshi mobile, the format checkout stores (BD_PHONE_REGEX).
const bdPhone = () => `01${int(3, 9)}${String(int(0, 99999999)).padStart(8, "0")}`;

const FIRST_NAMES_M = ["Rahim", "Karim", "Tanvir", "Sakib", "Arif", "Imran", "Fahim", "Nayeem", "Rafiq", "Mahmud", "Shuvo", "Hasan", "Rakib", "Sabbir", "Jahid", "Mehedi"];
const FIRST_NAMES_F = ["Nusrat", "Farhana", "Tasnim", "Sadia", "Ayesha", "Mim", "Riya", "Sharmin", "Lamia", "Jannat", "Sumaiya", "Tahmina"];
const LAST_NAMES = ["Hossain", "Rahman", "Ahmed", "Islam", "Chowdhury", "Khan", "Uddin", "Akter", "Sarker", "Talukder", "Mia", "Haque", "Siddique", "Kabir"];
// Answers for non-marathon registrations (saved in Registration.details).
const COMPANIES = ["Harbor Bank", "Orbit Telecom", "Crescent Foods", "Bluepeak Ltd", "Meridian Textiles", "Greenline Pharma", "Northwind Logistics"];
const JOB_TITLES = ["CEO", "Managing Director", "Head of Marketing", "Sales Manager", "Founder", "Operations Lead", "Finance Manager"];
const DIETARY = ["None", "None", "None", "Vegetarian", "Halal", "Other"];
const VISITOR_TYPES = ["Buyer", "Exhibitor", "Visitor"];
const MEALS = ["Chicken", "Beef", "Fish", "Vegetarian"];
const EXPERIENCE = ["Beginner", "Intermediate", "Advanced"];

const COMMUNITIES = ["Dhaka Runners Club", "Bangladesh Running Community", "Chattogram Striders", "Uttara Runners", "Mirpur Morning Joggers", "Run Bangladesh"];
const PAY_METHODS = ["bKash", "Nagad", "Rocket", "VISA", "MasterCard", "DBBL Nexus", "Upay"];
// Adult sizes only; kids' sizes would not match an adult birth date.
const ADULT_SIZES = tshirtSizes.map((s) => s.value).filter((v) => !v.includes("Years"));

type Person = {
  firstName: string;
  lastName: string;
  gender: (typeof GENDERS)[number];
  birthDate: Date;
};

function person(): Person {
  const gender = chance(0.62) ? "Male" : chance(0.97) ? "Female" : "Other";
  const firstName = pick(gender === "Female" ? FIRST_NAMES_F : FIRST_NAMES_M);
  const age = chance(0.15) ? int(47, 62) : int(17, 46);
  const birthDate = new Date(
    Date.UTC(now.getUTCFullYear() - age, int(0, 11), int(1, 28)),
  );
  return { firstName, lastName: pick(LAST_NAMES), gender, birthDate };
}

/** Age on the event day decides the category, like the registration form. */
function ageCategory(birthDate: Date, eventDate: Date) {
  let age = eventDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    eventDate.getUTCMonth() < birthDate.getUTCMonth() ||
    (eventDate.getUTCMonth() === birthDate.getUTCMonth() &&
      eventDate.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age--;
  return age >= 47 ? AGE_CATEGORIES[1] : AGE_CATEGORIES[0];
}

// ─── reset / guards ───────────────────────────────────

async function resetDatabase() {
  // Every table, including the ones the app protects with RESTRICT foreign
  // keys; TRUNCATE … CASCADE clears them in one statement.
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "coupon_usages", "payments", "registrations", "orders",
      "_CouponToPackages", "coupons", "packages", "events", "organizers",
      "users", "hero_sections", "gallery_images", "team_members", "faqs",
      "audit_logs", "site_settings", "page_view_daily", "page_visitors",
      "traffic_source_daily", "share_click_daily"
    RESTART IDENTITY CASCADE`);
}

async function guard() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed with NODE_ENV=production.");
  }
  if (RESET) {
    console.log("🧹 --reset: wiping all tables...");
    await resetDatabase();
    return;
  }
  const [events, users] = await Promise.all([
    prisma.event.count(),
    prisma.user.count(),
  ]);
  if (events > 0 || users > 0) {
    throw new Error(
      `Database already has data (${events} events, ${users} users). ` +
        "Run `npx prisma db seed -- --reset` to wipe it and seed again.",
    );
  }
}

// ─── content ──────────────────────────────────────────

type PackageSeed = { name: string; distance: string; price: number; availableSlots: number };
type EventSeed = {
  name: string;
  slug: string;
  day: string;
  time: string;
  address: string;
  eventType: "LIVE" | "VIRTUAL";
  category?: "MARATHON" | "CONFERENCE" | "EXHIBITION" | "SOCIAL" | "WORKSHOP"; // default MARATHON
  organizer: number; // index into ORGANIZERS
  status: "ACTIVE" | "COMPLETED";
  photo: number; // index into PHOTOS
  shortDesc: string; // one line for cards; the long text is in seed-descriptions.ts
  packages: PackageSeed[];
  orders: number; // how many orders to generate
};

const ORGANIZERS = [
  { name: "Dhaka Runners Club", email: "info@dhakarunners.example", phone: "01711000001" },
  { name: "Bengal Marathon Foundation", email: "contact@bengalmarathon.example", phone: "01711000002" },
  { name: "Chattogram Sports Alliance", email: "hello@ctgsports.example", phone: "01711000003" },
  { name: "Venus Corporation", email: "events@venuscorporation.example", phone: "01711000004" },
];

function nextDecember16() {
  const year = now.getUTCMonth() === 11 && now.getUTCDate() > 16
    ? now.getUTCFullYear() + 1
    : now.getUTCFullYear();
  return `${year}-12-16`;
}

const EVENTS: EventSeed[] = [
  {
    name: "Narsingdi Business Summit 2026",
    slug: "narsingdi-business-summit-2026",
    day: eventDay(45),
    time: "09:30",
    address: "Narsingdi Sadar, Narsingdi, Bangladesh",
    eventType: "LIVE",
    category: "CONFERENCE",
    organizer: 3,
    status: "ACTIVE",
    photo: 15,
    shortDesc: "A one-day summit for business leaders, entrepreneurs and investors from the Narsingdi region.",
    // `distance` is shown as the package tag — here it's the pass type.
    packages: [
      { name: "General Pass", distance: "Day pass", price: 1500, availableSlots: 400 },
      { name: "Business Pass", distance: "Day + networking", price: 3000, availableSlots: 200 },
      { name: "VIP Pass", distance: "All access + dinner", price: 6000, availableSlots: 50 },
    ],
    orders: 48,
  },
  {
    name: "Sundarbans Trail Run",
    slug: "sundarbans-trail-run",
    day: eventDay(75),
    time: "05:30",
    address: "Mongla, Khulna Division, Bangladesh",
    eventType: "LIVE",
    organizer: 1,
    status: "ACTIVE",
    photo: 3,
    shortDesc: "A trail race along the edge of the world's largest mangrove forest.",
    packages: [
      { name: "Trail Explorer", distance: "10K", price: 1500, availableSlots: 150 },
      { name: "Trail Warrior", distance: "21K", price: 2200, availableSlots: 100 },
      // Small enough to sell out, to show the sold-out state.
      { name: "Ultra Trail", distance: "42K", price: 3500, availableSlots: 12 },
    ],
    orders: 30,
  },
  {
    name: "Chattogram Coastal Run",
    slug: "chattogram-coastal-run",
    day: eventDay(110),
    time: "06:30",
    address: "Patenga Beach, Chattogram, Bangladesh",
    eventType: "LIVE",
    organizer: 2,
    status: "ACTIVE",
    photo: 5,
    shortDesc: "Sea breeze, sunrise and a flat, fast course along Patenga Beach.",
    packages: [
      { name: "Beach Run", distance: "5K", price: 700, availableSlots: 400 },
      { name: "Coastal 10K", distance: "10K", price: 1100, availableSlots: 250 },
      { name: "Coastal Half", distance: "21K", price: 1600, availableSlots: 150 },
    ],
    orders: 20,
  },
  {
    name: "Victory Day Virtual Run",
    slug: "victory-day-virtual-run",
    day: nextDecember16(),
    time: "07:00",
    address: "Virtual — run anywhere in Bangladesh",
    eventType: "VIRTUAL",
    organizer: 0,
    status: "ACTIVE",
    photo: 7,
    shortDesc: "Celebrate 16 December by running your distance, wherever you are.",
    packages: [
      { name: "Victory 5K", distance: "5K", price: 500, availableSlots: 1000 },
      { name: "Liberation 10K", distance: "10K", price: 700, availableSlots: 500 },
      { name: "Freedom Half", distance: "21K", price: 1000, availableSlots: 300 },
    ],
    orders: 25,
  },
  {
    name: "Old Dhaka Heritage Run",
    slug: "old-dhaka-heritage-run",
    day: eventDay(-40),
    time: "05:30",
    address: "Ahsan Manzil, Old Dhaka, Bangladesh",
    eventType: "LIVE",
    organizer: 1,
    status: "COMPLETED",
    photo: 9,
    shortDesc: "A run past Ahsan Manzil, Lalbagh Fort and the Star Mosque.",
    packages: [
      { name: "Heritage Walk", distance: "5K", price: 700, availableSlots: 300 },
      { name: "Lalbagh 10K", distance: "10K", price: 1000, availableSlots: 200 },
    ],
    orders: 36,
  },

  // ── Non-marathon events: one per category, so every checkout can be tested ──
  {
    name: "Bangladesh Trade Expo 2026",
    slug: "bangladesh-trade-expo-2026",
    day: eventDay(60),
    time: "10:00",
    address: "International Convention City Bashundhara, Dhaka",
    eventType: "LIVE",
    category: "EXHIBITION",
    organizer: 3,
    status: "ACTIVE",
    photo: 16,
    shortDesc: "Three halls of manufacturers, retailers and buyers under one roof.",
    packages: [
      { name: "Visitor Pass", distance: "1 day", price: 300, availableSlots: 2000 },
      { name: "Trade Buyer Pass", distance: "2 days + B2B meetings", price: 1500, availableSlots: 300 },
    ],
    orders: 30,
  },
  {
    name: "Venus Corporate Gala Night",
    slug: "venus-corporate-gala-night",
    day: eventDay(35),
    time: "19:00",
    address: "Radisson Blu Water Garden, Dhaka",
    eventType: "LIVE",
    category: "SOCIAL",
    organizer: 3,
    status: "ACTIVE",
    photo: 17,
    shortDesc: "An evening of dinner, music and awards for partners and friends.",
    packages: [
      { name: "Single Seat", distance: "1 guest", price: 5000, availableSlots: 200 },
      { name: "Couple", distance: "2 guests", price: 9000, availableSlots: 80 },
    ],
    orders: 20,
  },
  {
    name: "Event Planning Masterclass",
    slug: "event-planning-masterclass",
    day: eventDay(25),
    time: "15:00",
    address: "Online — Zoom",
    eventType: "VIRTUAL",
    category: "WORKSHOP",
    organizer: 3,
    status: "ACTIVE",
    photo: 18,
    shortDesc: "A live online workshop on planning and running memorable events.",
    packages: [
      { name: "Standard", distance: "Live session", price: 800, availableSlots: 150 },
      { name: "Plus", distance: "Session + toolkit", price: 1200, availableSlots: 100 },
    ],
    orders: 18,
  },
];

// ─── registration fields per category ─────────────────
//
// MARATHON → the race columns (gender, birth date, blood group, T-shirt …).
// Others   → race columns left empty; answers go in `details` (JSON),
//            matching the questions in lib/event-checkout-form.ts.
// T-shirt follows the same rule as checkout: in-person runs only;
// virtual runs save "VIRTUAL".

type Runner = { gender: string; birthDate: Date };

function registrationFields(
  category: NonNullable<EventSeed["category"]>,
  eventType: EventSeed["eventType"],
  runner: Runner,
  eventDate: Date,
) {
  if (category === "MARATHON") {
    return {
      gender: runner.gender,
      birthDate: runner.birthDate,
      ageCategory: ageCategory(runner.birthDate, eventDate),
      bloodGroup: pick(BLOOD_GROUPS),
      tshirtSize: eventType === "LIVE" ? pick(ADULT_SIZES) : "VIRTUAL",
      emergencyContactName: `${pick([...FIRST_NAMES_M, ...FIRST_NAMES_F])} ${pick(LAST_NAMES)}`,
      emergencyContactNumber: bdPhone(),
      communityName: chance(0.4) ? pick(COMMUNITIES) : null,
      runnerCategory: RUNNER_CATEGORIES[0],
      details: undefined, // nothing extra for marathons
    };
  }

  // Non-marathon: no race data, only the category's answers.
  const details =
    category === "CONFERENCE"
      ? { company: pick(COMPANIES), jobTitle: pick(JOB_TITLES), ...(eventType === "LIVE" ? { dietary: pick(DIETARY) } : {}) }
      : category === "EXHIBITION"
        ? { company: pick(COMPANIES), visitorType: pick(VISITOR_TYPES) }
        : category === "SOCIAL"
          ? { guests: chance(0.4) ? 2 : 1, ...(eventType === "LIVE" ? { meal: pick(MEALS) } : {}), ...(chance(0.3) ? { message: "Looking forward to it!" } : {}) }
          : { organisation: pick(COMPANIES), experience: pick(EXPERIENCE) }; // WORKSHOP

  return {
    gender: null,
    birthDate: null,
    ageCategory: null,
    bloodGroup: null,
    tshirtSize: null,
    emergencyContactName: null,
    emergencyContactNumber: null,
    communityName: null,
    runnerCategory: null,
    details,
  };
}

// ─── seed steps ───────────────────────────────────────

async function seedContent() {
  const organizers = [];
  for (const [i, o] of ORGANIZERS.entries()) {
    organizers.push(
      await prisma.organizer.create({
        data: { ...o, logo: img(PHOTOS[10 + i], 200) },
      }),
    );
  }

  const events = [];
  for (const e of EVENTS) {
    const event = await prisma.event.create({
      data: {
        name: e.name,
        slug: e.slug,
        date: new Date(`${e.day}T00:00:00Z`),
        time: new Date(`${e.day}T${e.time}:00Z`),
        address: e.address,
        eventType: e.eventType,
        category: e.category ?? "MARATHON",
        organizerId: organizers[e.organizer].id,
        status: e.status,
        shortDesc: e.shortDesc,
        description: EVENT_DESCRIPTIONS[e.slug] ?? `<p>${e.shortDesc}</p>`,
        bannerImage: img(PHOTOS[e.photo], 1600),
        thumbImage: img(PHOTOS[e.photo], 600),
        minPackagePrice: Math.min(...e.packages.map((p) => p.price)),
      },
    });
    // One at a time so package ids follow the listed order — BIB prefixes
    // are assigned in id order (lib/bib-package-prefix.ts).
    const packages = [];
    for (const p of e.packages) {
      packages.push(await prisma.package.create({ data: { ...p, eventId: event.id } }));
    }
    events.push({ seed: e, event, packages });
  }

  const first = events[0];
  await prisma.heroSection.create({
    data: {
      title: "Run Beyond",
      desktopImage: img(PHOTOS[1], 2400),
      mobileImage: img(PHOTOS[1], 900),
      slug: `/events/${first.event.slug}`,
      eventDate: dhakaInstant(first.seed.day, first.seed.time),
      countdownColor: "#374151",
    },
  });

  await prisma.galleryImage.createMany({
    data: PHOTOS.slice(0, 10).map((id, i) => ({
      src: img(id, 1200),
      alt: `Runners at a Merch Sports event, photo ${i + 1}`,
    })),
  });

  await prisma.teamMember.createMany({
    data: [
      { name: "Rezaul Karim", role: "Chief Executive Officer (CEO)", category: "MANAGEMENT", img: 68 },
      { name: "Shirin Akhter", role: "Managing Director (MD)", category: "MANAGEMENT", img: 49 },
      { name: "Imran Chowdhury", role: "Head of Marketing", category: "MANAGEMENT", img: 33 },
      { name: "Tanvir Hossain", role: "Founder & Race Director", category: "ADMIN", img: 12 },
      { name: "Nusrat Jahan", role: "Head of Operations", category: "ADMIN", img: 47 },
      { name: "Dr. Kamal Uddin", role: "Medical Advisor", category: "ADVISOR", img: 59 },
      { name: "Farhana Akter", role: "Running Coach", category: "ADVISOR", img: 45 },
      { name: "Sakib Rahman", role: "Course Manager", category: "ORGANIZER", img: 15 },
      { name: "Sadia Islam", role: "Volunteer Lead", category: "ORGANIZER", img: 44 },
    ].map(({ img: n, ...m }, i) => ({
      ...m,
      category: m.category as "MANAGEMENT" | "ADMIN" | "ADVISOR" | "ORGANIZER",
      bio: `${m.name.split(" ").slice(-2).join(" ")} has been part of the running community in Bangladesh for years.`,
      image: `https://i.pravatar.cc/300?img=${n}`,
      sortOrder: i,
      facebookUrl: "https://facebook.com/",
    })),
  });

  // The faqs migration inserts the defaults; only add them after a reset.
  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({
      data: DEFAULT_FAQS.map((f, i) => ({ ...f, sortOrder: i })),
    });
  }

  return events;
}

async function seedUsers() {
  const admin = await prisma.user.create({
    data: {
      authId: `seed_${randomUUID()}`,
      email: ADMIN_EMAIL,
      firstName: "Site",
      lastName: "Admin",
      role: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      authId: `seed_${randomUUID()}`,
      email: "organizer@merchsports.test",
      firstName: "Event",
      lastName: "Organizer",
      role: "ORGANIZER",
    },
  });

  // Registered runners. authId has no Supabase account behind it; signing up
  // with the same email links it (lib/auth/syncUser.ts).
  const runners: (Person & { id: string; email: string; phone: string })[] = [];
  const data: Prisma.UserCreateManyInput[] = [];
  for (let i = 0; i < 70; i++) {
    const p = person();
    const id = randomUUID();
    const email = `${p.firstName}.${p.lastName}${i}@example.com`.toLowerCase();
    const phone = bdPhone();
    runners.push({ ...p, id, email, phone });
    data.push({
      id,
      authId: `seed_${randomUUID()}`,
      email,
      firstName: p.firstName,
      lastName: p.lastName,
      userName: `${p.firstName}${i}`.toLowerCase(),
      phone,
      gender: p.gender,
      birthDate: p.birthDate,
      address: pick(["Dhanmondi, Dhaka", "Uttara, Dhaka", "Mirpur, Dhaka", "Agrabad, Chattogram", "Sylhet Sadar", "Khulna Sadar"]),
      createdAt: new Date(now.getTime() - int(30, 200) * DAY_MS),
    });
  }
  await prisma.user.createMany({ data });
  return { admin, runners };
}

type SeededEvent = Awaited<ReturnType<typeof seedContent>>[number];

async function seedCoupons(events: SeededEvent[]) {
  const coupons = [];
  for (const { seed, event, packages } of events) {
    const isPast = seed.status === "COMPLETED";
    const eventStart = new Date(`${seed.day}T00:00:00Z`);
    const from = new Date(eventStart.getTime() - 120 * DAY_MS);

    coupons.push(
      await prisma.coupon.create({
        data: {
          code: "EARLYBIRD",
          eventId: event.id,
          discountType: "PERCENTAGE",
          discountValue: 15,
          maxDiscount: 300,
          maxUses: 100,
          validFrom: from,
          validUntil: eventStart,
        },
      }),
    );
    // Fixed discount on the longest distance only.
    coupons.push(
      await prisma.coupon.create({
        data: {
          code: "RUNLONG",
          eventId: event.id,
          discountType: "FIXED",
          discountValue: 250,
          minOrderAmount: 1000,
          maxUses: 30,
          scopeType: "PACKAGE",
          packages: { connect: [{ id: packages[packages.length - 1].id }] },
          validFrom: from,
          validUntil: eventStart,
        },
      }),
    );
    if (!isPast) {
      // Expired and inactive ones, so the admin list shows every state.
      await prisma.coupon.create({
        data: {
          code: "LAUNCH50",
          eventId: event.id,
          discountType: "FIXED",
          discountValue: 50,
          validFrom: new Date(now.getTime() - 60 * DAY_MS),
          validUntil: new Date(now.getTime() - 30 * DAY_MS),
        },
      });
      await prisma.coupon.create({
        data: {
          code: "STAFF",
          eventId: event.id,
          discountType: "PERCENTAGE",
          discountValue: 100,
          maxUses: 5,
          isActive: false,
          validFrom: from,
          validUntil: eventStart,
        },
      });
    }
  }
  return coupons;
}

async function seedOrders(
  events: SeededEvent[],
  coupons: Awaited<ReturnType<typeof seedCoupons>>,
  admin: { id: string },
  runners: Awaited<ReturnType<typeof seedUsers>>["runners"],
) {
  const couponsByEvent = new Map<string, typeof coupons>();
  for (const c of coupons) {
    couponsByEvent.set(c.eventId, [...(couponsByEvent.get(c.eventId) ?? []), c]);
  }
  const couponPackages = new Map<string, number[]>();
  for (const c of await prisma.coupon.findMany({ include: { packages: true } })) {
    couponPackages.set(c.id, c.packages.map((p) => p.id));
  }
  const usageCount = new Map<string, number>(); // couponId → paid usages
  const usedBy = new Set<string>(); // `${couponId}:${userId}` (maxUsesPerUser = 1)

  let totalOrders = 0;

  for (const { seed, event, packages } of events) {
    const isPast = seed.status === "COMPLETED";
    const eventDate = new Date(`${seed.day}T00:00:00Z`);
    const prefixes = new Map<number, string>();
    for (const p of packages) prefixes.set(p.id, await getPackageBibPrefix(p.id, event.id));
    const bibCounter = new Map<number, number>();
    const usedSlots = new Map<number, number>(packages.map((p) => [p.id, 0]));
    const eventRunners = [...runners].sort(() => rand() - 0.5);

    // Orders are placed over the 60 days before the event (or before today).
    const windowEnd = Math.min(now.getTime(), eventDate.getTime() - DAY_MS);
    const windowStart = windowEnd - 60 * DAY_MS;

    for (let i = 0; i < seed.orders; i++) {
      // ── who and what ──
      const isManual = chance(0.12);
      const isGuest = !isManual && chance(0.2);
      const pkg = pick(packages);
      const qty = chance(0.08) ? 2 : 1;
      if (usedSlots.get(pkg.id)! + qty > pkg.availableSlots) continue;

      // ── status ──
      // Past event: everything settled. Upcoming: mostly paid, some open
      // checkouts (still holding a slot) and some abandoned ones.
      let status: "CONFIRMED" | "PENDING" | "CANCELLED" = "CONFIRMED";
      if (!isPast && !isManual) {
        const r = rand();
        status = r < 0.72 ? "CONFIRMED" : r < 0.86 ? "PENDING" : "CANCELLED";
      }
      if (isManual && !isPast && chance(0.25)) status = "PENDING";

      const createdAt =
        status === "PENDING" && !isManual
          ? new Date(now.getTime() - int(1, 20) * HOUR_MS) // hold still open
          : new Date(windowStart + rand() * (windowEnd - windowStart - DAY_MS));

      // ── buyer ──
      let userId: string;
      let runner: Person & { email: string | null; phone: string };
      if (isGuest || isManual) {
        const p = person();
        const guestUuid = randomUUID();
        const hasEmail = chance(0.8);
        const email = hasEmail
          ? `${p.firstName}.${p.lastName}.${hex(4)}@example.com`.toLowerCase()
          : null;
        const phone = bdPhone();
        const user = await prisma.user.create({
          data: {
            authId: `guest_${guestUuid}`,
            email: email ?? `guest_${guestUuid}@guest.invalid`,
            firstName: p.firstName,
            lastName: isManual ? p.lastName : null,
            phone: isManual ? phone : null,
            isGuest: true,
            createdAt,
          },
        });
        userId = user.id;
        runner = { ...p, email, phone };
      } else {
        const r = eventRunners[i % eventRunners.length];
        userId = r.id;
        runner = r;
      }

      // ── price and coupon (same maths as checkout.ts) ──
      const subtotal = pkg.price * qty;
      let discount = 0;
      let couponId: string | null = null;
      const couponPool = (couponsByEvent.get(event.id) ?? []).filter(
        (c) =>
          c.isActive &&
          c.validFrom <= createdAt &&
          createdAt <= c.validUntil &&
          (c.scopeType === "EVENT" || couponPackages.get(c.id)!.includes(pkg.id)) &&
          (!c.minOrderAmount || subtotal >= c.minOrderAmount) &&
          (c.maxUses === null || (usageCount.get(c.id) ?? 0) < c.maxUses) &&
          !usedBy.has(`${c.id}:${userId}`),
      );
      if (!isManual && couponPool.length > 0 && chance(0.3)) {
        const c = pick(couponPool);
        discount =
          c.discountType === "PERCENTAGE"
            ? Math.min((subtotal * c.discountValue) / 100, c.maxDiscount ?? Infinity)
            : c.discountValue;
        discount = Math.min(discount, subtotal);
        couponId = c.id;
      }
      const total = subtotal - discount;

      // ── order + registration + payment ──
      const confirmed = status === "CONFIRMED";
      const category = seed.category ?? "MARATHON";
      let bibNumber: string | null = null;
      if (confirmed && category === "MARATHON") {
        const n = (bibCounter.get(pkg.id) ?? 0) + 1;
        bibCounter.set(pkg.id, n);
        bibNumber = `${prefixes.get(pkg.id)}${String(n).padStart(4, "0")}`;
      }
      const spOrderId = `MSP${hex(12).toUpperCase()}`;
      const gatewayReached = !isManual && (confirmed || status === "CANCELLED" || chance(0.5));

      const order = await prisma.order.create({
        data: {
          userId,
          eventId: event.id,
          packageId: pkg.id,
          qty,
          subtotal,
          discount,
          total,
          status,
          couponId,
          source: isManual ? "MANUAL" : "ONLINE",
          createdById: isManual ? admin.id : null,
          adminNote: isManual ? pick(["Cash at booth", "Sponsor complimentary slot", "Paid by bank transfer", "Corporate team entry"]) : null,
          trafficSource: isManual ? null : pick(SOURCES),
          trafficCampaign: !isManual && chance(0.3) ? pick(["early_bird", "race_week", "club_partners"]) : null,
          // Open checkout → hold expires 24h after it was placed. Abandoned →
          // released by the system (kept non-null so it stays reclaimable).
          // Paid / manual → null (see lib/slot-hold.ts).
          holdExpiresAt:
            !isManual && status !== "CONFIRMED"
              ? new Date(createdAt.getTime() + 24 * HOUR_MS)
              : null,
          createdAt,
          updatedAt: createdAt,
          registration: {
            create: {
              eventId: event.id,
              bibNumber,
              fullName: `${runner.firstName} ${runner.lastName}`,
              email: runner.email,
              phone: runner.phone,
              // Race fields for marathons, `details` for other categories.
              ...registrationFields(category, seed.eventType, runner, eventDate),
              createdAt,
            },
          },
          payment: {
            create: {
              amount: Math.round(total),
              currency: "BDT",
              status: confirmed ? "PAID" : status === "CANCELLED" ? "FAILED" : "PENDING",
              paymentGateway: isManual ? "MANUAL" : gatewayReached ? "shurjopay" : null,
              paymentMethod: isManual ? "MANUAL" : confirmed ? pick(PAY_METHODS) : gatewayReached ? "shurjopay" : null,
              paymentId: gatewayReached ? spOrderId : null,
              transactionId: !isManual && confirmed ? spOrderId : null,
              createdAt,
            },
          },
        },
      });

      if (status !== "CANCELLED") usedSlots.set(pkg.id, usedSlots.get(pkg.id)! + qty);

      // Coupon usage is recorded only once payment succeeds.
      if (couponId && confirmed && discount > 0) {
        await prisma.couponUsage.create({
          data: { couponId, userId, orderId: order.id, discount, usedAt: createdAt },
        });
        usageCount.set(couponId, (usageCount.get(couponId) ?? 0) + 1);
        usedBy.add(`${couponId}:${userId}`);
      }
      totalOrders++;
    }

    for (const [packageId, used] of usedSlots) {
      await prisma.package.update({ where: { id: packageId }, data: { usedSlots: used } });
    }
  }

  for (const [couponId, count] of usageCount) {
    await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: count } });
  }
  return totalOrders;
}

async function seedAnalytics(events: SeededEvent[]) {
  const upcoming = events.filter((e) => e.seed.status === "ACTIVE");
  const pageViews: Prisma.PageViewDailyCreateManyInput[] = [];
  const traffic: Prisma.TrafficSourceDailyCreateManyInput[] = [];
  const shares: Prisma.ShareClickDailyCreateManyInput[] = [];

  for (let d = 29; d >= 0; d--) {
    const day = dayKey(new Date(now.getTime() - d * DAY_MS));
    const pages = [
      { path: "/", eventId: null as string | null, base: 220 },
      ...upcoming.map((e, i) => ({
        path: `/events/${e.event.slug}`,
        eventId: e.event.id,
        base: 140 - i * 30,
      })),
      { path: "other", eventId: null, base: 90 },
    ];
    let siteViews = 0;
    let maxUniques = 0;
    let sumUniques = 0;
    for (const p of pages) {
      const views = Math.max(1, Math.round(p.base * (0.6 + rand() * 0.8)));
      const uniques = Math.max(1, Math.round(views * (0.55 + rand() * 0.3)));
      pageViews.push({ day, path: p.path, eventId: p.eventId, views, uniques });
      siteViews += views;
      sumUniques += uniques;
      maxUniques = Math.max(maxUniques, uniques);
    }
    // Whole-site row ("*"): views add up; a visitor counts once per day.
    pageViews.push({
      day,
      path: "*",
      eventId: null,
      views: siteViews,
      uniques: Math.max(maxUniques, Math.round(sumUniques * 0.7)),
    });

    for (const source of SOURCES) {
      if (chance(0.35) && source !== "Direct" && source !== "Facebook") continue;
      const weight = source === "Facebook" ? 90 : source === "Direct" ? 70 : source === "Google" ? 45 : 12;
      traffic.push({ day, source, campaign: "", visits: Math.round(weight * (0.5 + rand())) });
      if (source === "Facebook" && chance(0.5)) {
        traffic.push({ day, source, campaign: "race_week", visits: int(5, 40) });
      }
    }

    for (const e of upcoming) {
      for (const place of SHARE_PLACES) {
        for (const channel of SHARE_CHANNELS) {
          if (chance(0.55)) continue;
          const clicks = int(1, place === "event" ? 12 : 5);
          shares.push({ day, eventId: e.event.id, place, channel, clicks, sharers: int(1, clicks) });
        }
      }
    }
  }

  await prisma.pageViewDaily.createMany({ data: pageViews });
  await prisma.trafficSourceDaily.createMany({ data: traffic });
  await prisma.shareClickDaily.createMany({ data: shares });
}

// ─── main ─────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");
  await guard();

  const events = await seedContent();
  console.log(`✅ ${events.length} events, packages, hero, gallery, team, FAQs`);

  const { admin, runners } = await seedUsers();
  console.log(`✅ Admin (${ADMIN_EMAIL}), organizer and ${runners.length} runners`);

  const coupons = await seedCoupons(events);
  const orders = await seedOrders(events, coupons, admin, runners);
  console.log(`✅ ${orders} orders with registrations, payments and coupon usage`);

  await seedAnalytics(events);
  console.log("✅ 30 days of page views, traffic sources and share clicks");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
