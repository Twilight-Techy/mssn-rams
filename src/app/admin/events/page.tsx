import { getEvents } from "@/app/actions/eventActions";
import EventsManager from "./EventsManager";

export default async function AdminEventsPage() {
    const events = await getEvents();

    return (
        <EventsManager events={events} />
    );
}
