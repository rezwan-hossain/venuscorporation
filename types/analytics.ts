// types/analytics.ts

export type AnalyticsRange = "7" | "30" | "90" | "all";

export type CountItem = { label: string; value: number };

export type DailyPoint = {
  /** Bucket start, YYYY-MM-DD in Asia/Dhaka. */
  date: string;
  registrations: number; // confirmed attendees (qty)
  revenue: number; // BDT from paid payments
};

export type PackageRow = {
  id: number;
  name: string;
  distance: string;
  eventName: string;
  price: number;
  capacity: number;
  sold: number; // confirmed qty
  held: number; // pending qty (checkout holds + unpaid manual)
  left: number;
  revenue: number; // confirmed order totals
  /** Days until sold out at the last-7-days pace; null = no recent sales / unlimited. */
  daysToSellOut: number | null;
};

export type CouponRow = {
  code: string;
  uses: number;
  discount: number;
  revenue: number;
};

export type AnswerBreakdown = {
  title: string; // e.g. "Dietary needs", or "Conference · Dietary needs" for all events
  items: CountItem[];
};

export type AnalyticsData = {
  generatedAt: string;
  bucket: "day" | "week";
  kpis: {
    revenue: number;
    paidAttendees: number; // confirmed tickets (qty), all event types
    paidOrders: number;
    avgOrderValue: number;
    conversionRate: number | null; // online paid / online settled, 0..1
    discounts: number;
    pendingOrders: number;
    refunded: number;
    cancelledOrders: number;
  };
  series: DailyPoint[];
  packages: PackageRow[];
  coupons: CouponRow[];
  breakdowns: {
    /** Paid attendees per event type (Marathon, Conference, …). */
    categories: CountItem[];
    /** Paid attendees of marathon events — the runner charts below only count these. */
    runners: number;
    tshirt: CountItem[];
    gender: CountItem[];
    ageCategory: CountItem[];
    ageGroups: CountItem[];
    bloodGroup: CountItem[];
    communities: CountItem[];
    paymentMethods: CountItem[];
    source: CountItem[];
    /** One chart per checkout question (non-marathon events), from registration.details. */
    answers: AnswerBreakdown[];
  };
};
