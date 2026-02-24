'use server';

import { db } from "@/db";
import { attendanceTable, eventsTable, usersTable } from "@/db/schema";
import { eq, and, desc, like, or } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function getLiveAttendance(searchQuery?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    // Find active event
    const activeEvent = await db.select().from(eventsTable).where(eq(eventsTable.isActive, true)).limit(1);
    if (activeEvent.length === 0) return [];

    let whereCondition = eq(attendanceTable.eventId, activeEvent[0].id);

    if (searchQuery) {
        whereCondition = and(
            whereCondition,
            or(
                like(usersTable.firstName, `%${searchQuery}%`),
                like(usersTable.lastName, `%${searchQuery}%`),
                like(usersTable.matricNumber, `%${searchQuery}%`)
            )
        ) as any;
    }

    const query = db.select({
        id: attendanceTable.id,
        status: attendanceTable.status,
        checkInTime: attendanceTable.checkInTime,
        servedAt: attendanceTable.servedAt,
        user: {
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            matricNumber: usersTable.matricNumber,
            gender: usersTable.gender,
            level: usersTable.level
        }
    })
        .from(attendanceTable)
        .innerJoin(usersTable, eq(attendanceTable.userId, usersTable.id))
        .where(whereCondition);

    const results = await query.orderBy(desc(attendanceTable.checkInTime));
    return results;
}

export async function toggleServedStatus(attendanceId: string, currentStatus: 'marked' | 'served') {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "Unauthorized" };

    try {
        const isCurrentlyServed = currentStatus === 'served';
        await db.update(attendanceTable)
            .set({
                status: isCurrentlyServed ? 'marked' : 'served',
                servedAt: isCurrentlyServed ? null : new Date(),
                servedBy: isCurrentlyServed ? null : (session.user as any).id
            })
            .where(eq(attendanceTable.id, attendanceId));

        revalidatePath('/admin/attendance');
        return { success: true };
    } catch (e) {
        return { error: "Failed to update record" };
    }
}
