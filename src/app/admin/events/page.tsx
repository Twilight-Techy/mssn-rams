import { getEvents } from "@/app/actions/eventActions";
import EventsManager from "./EventsManager";
import { getUserProfile } from "@/app/actions/getUser";
import { redirect } from "next/navigation";

export default async function AdminEventsPage() {
    const currentUser = await getUserProfile();

    // Only admin and super_admin can manage events
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
        redirect("/admin");
    }

    const events = await getEvents();

    return (
        <EventsManager events={events} />
    );
}
