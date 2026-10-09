import { getUpcomingEvents } from "@/app/actions/event";
import EventCard from "@/module/event/components/EventCard";

export default async function UpcomingEvents() {
  const { events } = await getUpcomingEvents(2);

  if (events.length === 0) return null;

  return (
    <section id="testimonials" className=" px-[5%] py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-widest text-gray-500">
            Upcomming
          </div>

          <h2 className="text-4xl md:text-6xl font-bold uppercase leading-tighter text-gray-900 ">
            Marathon <br />
            <span className="text-neon-lime">Event</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto space-y-10 mt-12">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
