'use server';

import { db } from "@/db";
import { attendanceTable, eventsTable, usersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function getActiveTicket() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const userId = (session.user as { id?: string }).id;
    if (!userId) return null;

    // Find the currently active event
    const activeEvent = await db.select().from(eventsTable).where(eq(eventsTable.isActive, true)).limit(1);
    if (activeEvent.length === 0) return null;

    // Find user's attendance for this event
    const ticketRecord = await db.select({
        id: attendanceTable.id,
        status: attendanceTable.status,
        checkInTime: attendanceTable.checkInTime,
        servedAt: attendanceTable.servedAt,
        user: {
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            level: usersTable.level,
            gender: usersTable.gender,
            matricNumber: usersTable.matricNumber,
            isMuslim: usersTable.isMuslim,
            category: usersTable.category
        },
        event: {
            title: eventsTable.title,
            date: eventsTable.date,
        }
    })
        .from(attendanceTable)
        .innerJoin(usersTable, eq(attendanceTable.userId, usersTable.id))
        .innerJoin(eventsTable, eq(attendanceTable.eventId, eventsTable.id))
        .where(and(
            eq(attendanceTable.userId, userId),
            eq(attendanceTable.eventId, activeEvent[0].id)
        ))
        .limit(1);

    return ticketRecord[0] || null;
}

export async function serveDigitalTicket(attendanceId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "Unauthorized" };

    try {
        await db.update(attendanceTable)
            .set({ status: 'served', servedAt: new Date() })
            .where(eq(attendanceTable.id, attendanceId));

        revalidatePath('/ticket');
        return { success: true };
    } catch {
        return { error: "Failed to mark as served." }
    }
}
