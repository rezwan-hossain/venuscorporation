// app/events/(list)/page.tsx — the events list at /events.
// In the (list) folder group so its loading.tsx doesn't cover /events/<slug>.

import EventPage from "@/module/event/pages/EventPage";
import { getAllEvents } from "@/app/actions/event";
import { getUpcomingEvents, getPreviousEvents } from "@/app/actions/event";

export default async function page() {
  // const { events, error } = await getAllEvents();
  const [
    { events: upcomingEvents = [], error: upcomingError },
    { events: previousEvents = [], error: previousError },
  ] = await Promise.all([getUpcomingEvents(6), getPreviousEvents(6)]);

  // return <EventPage events={events} error={error} />;
  return (
    <EventPage
      upcomingEvents={upcomingEvents}
      previousEvents={previousEvents}
      error={upcomingError || previousError}
    />
  );
}
