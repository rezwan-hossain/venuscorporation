import { Clock, Calendar, MapPin, Ticket, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EventProps {
  slug: string;
  title: string;
  description: string;
  shortDesc: string | null;
  time: string;
  date: string;
  location: string;
  pricing: React.ReactNode;
  image: string;
  eventType?: "LIVE" | "VIRTUAL";
  highlighted?: boolean;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED" | "COMPLETED";
}

interface EventCardProps {
  event: EventProps;
}

const EventCard = ({ event }: EventCardProps) => {
  const isCompleted = event.status === "COMPLETED";

  // Completed events stay readable, just quieter: softer card, mid-grey text,
  // greyscale photo. (No dark: styles — the site has no dark theme.)
  const tone = isCompleted
    ? {
        card: "border-gray-200 bg-gray-50",
        heading: "text-gray-600",
        desc: "text-gray-500",
        body: "text-gray-600",
        icon: "text-gray-400",
        divider: "border-gray-200",
        button: "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
        arrow: "bg-gray-700 text-white",
      }
    : {
        card: "border-gray-200 bg-white",
        heading: "text-gray-900",
        desc: "text-gray-600",
        body: "text-gray-800",
        icon: "text-gray-400",
        divider: "border-gray-200",
        button: "border-transparent bg-neon-lime text-white hover:bg-gray-900",
        arrow: "bg-gray-900 text-white",
      };

  const details = [
    { icon: Clock, text: event.time },
    { icon: Calendar, text: event.date },
    { icon: MapPin, text: event.location },
    { icon: Ticket, text: event.pricing, upper: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
      {/* Info Card */}
      <div
        className={`lg:col-span-2 border rounded-2xl p-8 md:p-10 flex flex-col justify-between transition-colors duration-200 ${tone.card}`}
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            <h2
              className={`text-3xl md:text-4xl uppercase tracking-normal leading-tight ${tone.heading}`}
            >
              {event.title}
            </h2>
            {isCompleted && (
              <span className="mt-1 shrink-0 rounded-full bg-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                Completed
              </span>
            )}
          </div>

          <p
            className={`mt-3 text-sm md:text-base leading-relaxed line-clamp-2 ${tone.desc}`}
          >
            {event.shortDesc ?? event.description ?? "No description available"}
          </p>

          <div className={`w-full border-b mt-6 mb-6 ${tone.divider}`} />

          <div className="space-y-4">
            {details.map(({ icon: Icon, text, upper }, i) => (
              <div key={i} className="flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${tone.icon}`} />
                <span
                  className={`text-sm font-medium tracking-wide ${upper ? "uppercase" : ""} ${tone.body}`}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link
            href={`/events/${event.slug}`}
            className={`inline-flex items-center gap-3 border rounded-full pl-6 pr-1.5 py-1.5 text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${tone.button}`}
          >
            {isCompleted ? "View Recap" : "Event Details"}
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center ${tone.arrow}`}
            >
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>

      {/* Image: fills the card's height on large screens instead of setting it */}
      <div className="relative hidden md:block lg:col-span-3 rounded-2xl overflow-hidden min-h-72 lg:min-h-0">
        <img
          src={event.image}
          alt={event.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-200 ${
            isCompleted ? "grayscale opacity-80" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default EventCard;
