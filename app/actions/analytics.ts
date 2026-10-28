// app/actions/analytics.ts
"use server";

// Admin dashboard analytics. Read-only. Everything is computed from existing
// order / payment / registration data — no tracking tables needed.
//
// Events have a category (lib/event-checkout-form.ts):
//   • Marathons save race fields (gender, T-shirt, blood group …) → the
//     runner charts, counted from marathon registrations only.
//   • Other categories save their checkout answers in registration.details
//     (company, dietary needs …) → one chart per question.

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { BLOOD_GROUPS } from "@/lib/registration-options";
import { tshirtSizes } from "@/module/checkout/data/tshirtSizes";
import {
  EVENT_CATEGORIES,
  getEventCategory,
  getExtraQuestions,
} from "@/lib/event-checkout-form";
import type {
  AnalyticsData,
  AnalyticsRange,
  AnswerBreakdown,
  CountItem,
  CouponRow,
  DailyPoint,
  PackageRow,
} from "@/types/analytics";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOLD_GRACE_MS = 60 * 60 * 1000; // unpaid orders younger than this are still in checkout
const ORDER_CAP = 50_000;

// YYYY-MM-DD for an instant, in Bangladesh time.
const dhakaDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayKey = (d: Date) => dhakaDay.format(d);
const addDays = (key: string, n: number) =>
  new Date(Date.parse(`${key}T00:00:00Z`) + n * DAY_MS)
    .toISOString()
    .slice(0, 10);
// Monday of the week containing `key`.
const weekKey = (key: string) => {
  const dow = (new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7;
  return addDays(key, -dow);
};

function tally(
  values: (string | null | undefined)[],
  order?: readonly string[],
): CountItem[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    const label = v?.trim() || "Not given";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const items = [...counts].map(([label, value]) => ({ label, value }));
  if (order) {
    const rank = (l: string) => {
      const i = order.indexOf(l);
      return i === -1 ? order.length : i;
    };
    return items.sort(
      (a, b) => rank(a.label) - rank(b.label) || b.value - a.value,
    );
  }
  return items.sort((a, b) => b.value - a.value);
}

/**
 * The most common free-text answers (e.g. community or company names).
 * Groups case/spacing variants and shows the most common spelling.
 */
function topAnswers(
  values: (string | null | undefined)[],
  limit = 8,
): CountItem[] {
  const groups = new Map<string, Map<string, number>>();
  for (const value of values) {
    const raw = value?.trim();
    if (!raw) continue;
    const key = raw.toLowerCase().replace(/\s+/g, " ");
    const spellings = groups.get(key) ?? new Map<string, number>();
    spellings.set(raw, (spellings.get(raw) ?? 0) + 1);
    groups.set(key, spellings);
  }
  return [...groups.values()]
    .map((spellings) => {
      const [label] = [...spellings].sort((a, b) => b[1] - a[1])[0];
      const value = [...spellings.values()].reduce((s, n) => s + n, 0);
      return { label, value };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/** "Conference / summit" → "Conference" */
const categoryName = (category: string) =>
  getEventCategory(category).label.split(" /")[0];

export async function getAnalytics(
  eventId: string | "all",
  range: AnalyticsRange,
): Promise<{ data: AnalyticsData | null; error: string | null }> {
  const { error } = await requireAdmin();
  if (error) return { data: null, error };

  try {
    const now = new Date();
    const since =
      range === "all" ? null : new Date(now.getTime() - Number(range) * DAY_MS);
    const eventWhere = eventId === "all" ? {} : { eventId };

    const [orders, packages, recentSales, packageTotals] = await Promise.all([
      prisma.order.findMany({
        where: {
          ...eventWhere,
          isArchived: false,
          ...(since && { createdAt: { gte: since } }),
        },
        take: ORDER_CAP,
        select: {
          status: true,
          source: true,
          qty: true,
          total: true,
          discount: true,
          createdAt: true,
          couponId: true,
          event: { select: { category: true, eventType: true } },
          payment: {
            select: { status: true, amount: true, paymentMethod: true },
          },
          registration: {
            select: {
              details: true,
              gender: true,
              tshirtSize: true,
              ageCategory: true,
              bloodGroup: true,
              communityName: true,
              birthDate: true,
            },
          },
        },
      }),
      prisma.package.findMany({
        where: {
          ...eventWhere,
          ...(eventId === "all" && { event: { isArchived: false } }),
        },
        select: {
          id: true,
          name: true,
          distance: true,
          price: true,
          availableSlots: true,
          usedSlots: true,
          event: { select: { name: true } },
        },
        orderBy: [{ eventId: "asc" }, { price: "asc" }],
      }),
      // Pace for the sell-out forecast: confirmed qty per package, last 7 days.
      prisma.order.groupBy({
        by: ["packageId"],
        where: {
          ...eventWhere,
          isArchived: false,
          status: "CONFIRMED",
          createdAt: { gte: new Date(now.getTime() - 7 * DAY_MS) },
        },
        _sum: { qty: true },
      }),
      // Package table is all-time (capacity doesn't care about the range).
      prisma.order.groupBy({
        by: ["packageId", "status"],
        where: { ...eventWhere, isArchived: false },
        _sum: { qty: true, total: true },
      }),
    ]);

    // ─── KPIs ───────────────────────────────────────
    const confirmed = orders.filter((o) => o.status === "CONFIRMED");
    const paid = orders.filter((o) => o.payment?.status === "PAID");
    const revenue = paid.reduce((s, o) => s + (o.payment?.amount ?? 0), 0);

    // Conversion: of online checkouts that have finished (paid, cancelled, or
    // unpaid past the 1-hour hold), how many were paid.
    const online = orders.filter((o) => o.source === "ONLINE");
    const settled = online.filter(
      (o) =>
        o.status !== "PENDING" ||
        now.getTime() - o.createdAt.getTime() > HOLD_GRACE_MS,
    );
    const onlinePaid = settled.filter((o) => o.status === "CONFIRMED").length;

    const kpis: AnalyticsData["kpis"] = {
      revenue,
      paidAttendees: confirmed.reduce((s, o) => s + o.qty, 0),
      paidOrders: paid.length,
      avgOrderValue: paid.length ? Math.round(revenue / paid.length) : 0,
      conversionRate: settled.length ? onlinePaid / settled.length : null,
      discounts: Math.round(confirmed.reduce((s, o) => s + o.discount, 0)),
      pendingOrders: orders.filter((o) => o.status === "PENDING").length,
      refunded: orders
        .filter((o) => o.payment?.status === "REFUNDED")
        .reduce((s, o) => s + (o.payment?.amount ?? 0), 0),
      cancelledOrders: orders.filter((o) => o.status === "CANCELLED").length,
    };

    // ─── Time series (by order date, Dhaka time) ────
    const firstKey = orders.length
      ? dayKey(
          new Date(
            orders.reduce(
              (min, o) => Math.min(min, o.createdAt.getTime()),
              Infinity,
            ),
          ),
        )
      : dayKey(now);
    const startKey = since ? dayKey(since) : firstKey;
    const todayKey = dayKey(now);
    const spanDays =
      (Date.parse(`${todayKey}T00:00:00Z`) -
        Date.parse(`${startKey}T00:00:00Z`)) /
        DAY_MS +
      1;
    const bucket: AnalyticsData["bucket"] = spanDays > 92 ? "week" : "day";
    const toBucket = (key: string) => (bucket === "week" ? weekKey(key) : key);

    const points = new Map<string, DailyPoint>();
    for (
      let k = toBucket(startKey);
      k <= todayKey;
      k = addDays(k, bucket === "week" ? 7 : 1)
    ) {
      points.set(k, { date: k, registrations: 0, revenue: 0 });
    }
    for (const o of orders) {
      const p = points.get(toBucket(dayKey(o.createdAt)));
      if (!p) continue;
      if (o.status === "CONFIRMED") p.registrations += o.qty;
      if (o.payment?.status === "PAID") p.revenue += o.payment.amount;
    }
    const series = [...points.values()];

    // ─── Packages ───────────────────────────────────
    const pace = new Map(
      recentSales.map((r) => [r.packageId, (r._sum.qty ?? 0) / 7]),
    );
    const totals = new Map<
      number,
      { sold: number; held: number; revenue: number }
    >();
    for (const r of packageTotals) {
      const t = totals.get(r.packageId) ?? { sold: 0, held: 0, revenue: 0 };
      if (r.status === "CONFIRMED") {
        t.sold += r._sum.qty ?? 0;
        t.revenue += r._sum.total ?? 0;
      }
      if (r.status === "PENDING") t.held += r._sum.qty ?? 0;
      totals.set(r.packageId, t);
    }
    const packageRows: PackageRow[] = packages.map((p) => {
      const t = totals.get(p.id) ?? { sold: 0, held: 0, revenue: 0 };
      const left = Math.max(0, p.availableSlots - p.usedSlots);
      const rate = pace.get(p.id) ?? 0;
      return {
        id: p.id,
        name: p.name,
        distance: p.distance,
        eventName: p.event.name,
        price: p.price,
        capacity: p.availableSlots,
        sold: t.sold,
        held: t.held,
        left,
        revenue: Math.round(t.revenue),
        daysToSellOut: rate > 0 && left > 0 ? Math.ceil(left / rate) : null,
      };
    });

    // ─── Coupons ────────────────────────────────────
    const couponIds = [
      ...new Set(confirmed.map((o) => o.couponId).filter(Boolean)),
    ] as string[];
    const couponCodes = new Map(
      (
        await prisma.coupon.findMany({
          where: { id: { in: couponIds } },
          select: { id: true, code: true },
        })
      ).map((c) => [c.id, c.code]),
    );
    const couponMap = new Map<string, CouponRow>();
    for (const o of confirmed) {
      if (!o.couponId) continue;
      const code = couponCodes.get(o.couponId) ?? "Deleted coupon";
      const row = couponMap.get(code) ?? {
        code,
        uses: 0,
        discount: 0,
        revenue: 0,
      };
      row.uses += 1;
      row.discount += Math.round(o.discount);
      row.revenue += Math.round(o.total);
      couponMap.set(code, row);
    }
    const coupons = [...couponMap.values()].sort((a, b) => b.uses - a.uses);

    // ─── Attendees per event type (confirmed only) ──
    const categories = tally(
      confirmed.flatMap((o) =>
        Array(o.qty).fill(categoryName(o.event.category)),
      ),
      EVENT_CATEGORIES.map((c) => categoryName(c.value)),
    );

    // ─── Runner breakdowns (confirmed marathon registrations only) ───
    const marathonOrders = confirmed.filter(
      (o) => o.event.category === "MARATHON",
    );
    const regs = marathonOrders
      .map((o) => o.registration)
      .filter((r) => r !== null);
    const communities = topAnswers(regs.map((r) => r.communityName));

    // T-shirts are printed for in-person runs only (virtual runs get none)
    const tshirtSizesNeeded = marathonOrders
      .filter((o) => o.event.eventType === "LIVE")
      .map((o) => o.registration?.tshirtSize);

    // ─── Checkout answers (other categories, from registration.details) ───
    // One chart per question: select questions count every option, text
    // questions show the most common answers. Long messages and numbers
    // aren't charted.
    const answers: AnswerBreakdown[] = [];
    const usedCategories = [...new Set(confirmed.map((o) => o.event.category))];
    for (const category of usedCategories) {
      if (category === "MARATHON") continue;
      const details = confirmed
        .filter((o) => o.event.category === category)
        .map((o) => (o.registration?.details ?? {}) as Record<string, string>);

      for (const question of getExtraQuestions(category, "LIVE")) {
        const values = details.map((d) => d[question.key]);
        let items: CountItem[] = [];
        if (question.type === "select") items = tally(values, question.options);
        if (question.type === "text") items = topAnswers(values);
        if (items.length === 0) continue;

        answers.push({
          // With every event shown, say which kind of event it's from
          title:
            eventId === "all"
              ? `${categoryName(category)} · ${question.label}`
              : question.label,
          items,
        });
      }
    }

    const AGE_BANDS = ["Under 18", "18–29", "30–39", "40–49", "50–59", "60+"];
    // No birth date (non-marathon registrations) → not counted in any band.
    const ageBand = (birth: Date | null) => {
      if (!birth) return null;
      const age = Math.floor(
        (now.getTime() - birth.getTime()) / (365.25 * DAY_MS),
      );
      if (age < 18) return AGE_BANDS[0];
      if (age < 30) return AGE_BANDS[1];
      if (age < 40) return AGE_BANDS[2];
      if (age < 50) return AGE_BANDS[3];
      if (age < 60) return AGE_BANDS[4];
      return AGE_BANDS[5];
    };

    const methodCounts = tally(paid.map((o) => o.payment?.paymentMethod));

    return {
      data: {
        generatedAt: now.toISOString(),
        bucket,
        kpis,
        series,
        packages: packageRows,
        coupons,
        breakdowns: {
          categories,
          runners: marathonOrders.reduce((s, o) => s + o.qty, 0),
          tshirt: tally(
            tshirtSizesNeeded,
            tshirtSizes.map((s) => s.value),
          ),
          gender: tally(regs.map((r) => r.gender)),
          ageCategory: tally(regs.map((r) => r.ageCategory)),
          ageGroups: tally(
            regs.map((r) => ageBand(r.birthDate)),
            AGE_BANDS,
          ),
          bloodGroup: tally(
            regs.map((r) => r.bloodGroup),
            BLOOD_GROUPS,
          ),
          communities,
          paymentMethods: methodCounts,
          source: tally(
            confirmed.map((o) =>
              o.source === "MANUAL" ? "Manual (admin)" : "Online",
            ),
          ),
          answers,
        },
      },
      error: null,
    };
  } catch (err) {
    console.error("getAnalytics error:", err);
    return { data: null, error: "Failed to load analytics" };
  }
}
