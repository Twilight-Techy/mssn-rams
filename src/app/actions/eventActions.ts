'use server'

import { db } from "@/db";
import { eventsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    const dateStr = formData.get("date") as string;
    const date = new Date(dateStr);

    try {
        await db.insert(eventsTable).values({
            title,
            date,
        });
        revalidatePath("/admin/events");
        return { success: true };
    } catch {
        return { error: "Failed to create event" };
    }
}

export async function toggleEventStatus(eventId: string, currentStatus: boolean) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "Unauthorized" };

    try {
        // If we are activating this one, deactivate all others first
        if (!currentStatus) {
            await db.update(eventsTable).set({ isActive: false });
        }

        await db.update(eventsTable)
            .set({ isActive: !currentStatus })
            .where(eq(eventsTable.id, eventId));

        revalidatePath("/admin/events");
        return { success: true };
    } catch {
        return { error: "Failed to toggle status" };
    }
}

export async function getEvents() {
    return await db.select().from(eventsTable).orderBy(desc(eventsTable.date));
}
