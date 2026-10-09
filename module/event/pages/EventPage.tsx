import { HeroText } from "@/components/ui/HeroText";
import EventCard from "../components/EventCard";
import { EventData } from "@/types/event";

type EventsPageProps = {
  upcomingEvents: EventData[];
  previousEvents: EventData[];
  error?: string;
};

const EventsPage = ({
  upcomingEvents,
  previousEvents,
  error,
}: EventsPageProps) => {
  return (
    <div className="min-h-screen bg-background  px-4 md:px-8 py-4 md:py-8">
      <div className="mt-42 ">
        <HeroText title="Events" />
      </div>
      <div className="max-w-7xl mx-auto space-y-10 mt-12">
        <div className="text-center mb-16">
          <div className="text-lg uppercase tracking-widest text-gray-500"></div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            upcoming <br />
            <span className="text-neon-lime">events</span>
          </h2>
        </div>

        {upcomingEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {previousEvents?.length ? (
        <div className="max-w-7xl mx-auto space-y-10 mt-20">
          <div className="text-center mb-16">
            <div className="text-lg uppercase tracking-widest text-gray-500">
              our
            </div>

            <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
              previous <br />
              <span className="text-neon-lime">events</span>
            </h2>
          </div>

          {previousEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default EventsPage;
