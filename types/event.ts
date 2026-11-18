// types/event.ts
export type EventPackage = {
  id: number;
  name: string;
  distance: string;
  price: number;
  availableSlots: number;
  usedSlots: number;
  status: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  eventId: string;
};

export type Organizer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  logo: string | null;
};

export type EventData = {
  id: string;
  name: string;
  slug: string;
  date: Date;
  time: Date;
  address: string;
  eventType: "LIVE" | "VIRTUAL";
  description: string;
  shortDesc: string | null;
  terms: string | null; // event terms & conditions (HTML)
  partners: unknown; // JSON — read with cleanPartners() (lib/event-partners.ts)
  bannerImage: string;
  thumbImage: string | null;
  minPackagePrice: number | null;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED" | "COMPLETED";
  organizer: Organizer;
  packages: EventPackage[];
};
