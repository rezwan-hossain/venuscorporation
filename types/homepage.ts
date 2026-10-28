// What the homepage hero shows — see HeroSource in prisma/schema.prisma.
export type HeroSource = "EVENT" | "CUSTOM";

export type HeroSectionData = {
  id: string;
  source: HeroSource;
  eventId: string | null;
  /** The featured event (EVENT heroes with a chosen event). */
  event: { id: string; name: string; slug: string } | null;
  title: string;
  subtitle: string | null;
  buttonLabel: string | null;
  slug: string | null;
  desktopImage: string | null;
  mobileImage: string | null;
  youtubeUrl: string | null;
  eventDate: string | null;
  showCountdown: boolean;
  countdownColor: string;
  showSlugButton: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** The admin hero form. Empty string = not set. */
export type HeroFormData = {
  source: HeroSource;
  eventId: string; // "" = the next upcoming event
  title: string;
  subtitle: string;
  buttonLabel: string;
  slug: string;
  desktopImage: string;
  mobileImage: string;
  youtubeUrl: string;
  eventDate: string;
  showCountdown: boolean;
  showSlugButton: boolean;
};

/** An event the hero can feature (also the admin's event dropdown). */
export type HeroEvent = {
  id: string;
  name: string;
  slug: string;
  date: string | Date;
  time: string | Date;
  address: string;
  shortDesc: string | null;
  bannerImage: string;
};
