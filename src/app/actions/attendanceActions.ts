'use server';

import { db } from "@/db";
import { attendanceTable, eventsTable, usersTable } from "@/db/schema";
import { eq, and, desc, like, or, SQL } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function getLiveAttendance(searchQuery?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    // Find active event
    const activeEvent = await db.select().from(eventsTable).where(eq(eventsTable.isActive, true)).limit(1);
    if (activeEvent.length === 0) return [];

    let whereCondition: SQL | undefined = eq(attendanceTable.eventId, activeEvent[0].id);

    if (searchQuery) {
        whereCondition = and(
            whereCondition,
            or(
                like(usersTable.firstName, `%${searchQuery}%`),
                like(usersTable.lastName, `%${searchQuery}%`),
                like(usersTable.matricNumber, `%${searchQuery}%`)
            )
        );
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
                servedBy: (session.user as { id?: string }).id || null
            })
            .where(eq(attendanceTable.id, attendanceId));

        revalidatePath('/admin/attendance');
        return { success: true };
    } catch {
        return { error: "Failed to update record" };
    }
}

export async function searchUsersForAttendance(query: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as { role?: string }).role === 'user') return [];

    if (!query || query.length < 2) return [];

    const results = await db.select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        matricNumber: usersTable.matricNumber,
        level: usersTable.level,
        gender: usersTable.gender
    })
        .from(usersTable)
        .where(
            or(
                like(usersTable.firstName, `%${query}%`),
                like(usersTable.lastName, `%${query}%`),
                like(usersTable.matricNumber, `%${query}%`),
                like(usersTable.email, `%${query}%`)
            )
        )
        .limit(10);

    return results;
}

export async function markManualAttendance(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as { role?: string }).role === 'user') return { error: "Unauthorized" };

    try {
        const activeEvent = await db.select().from(eventsTable).where(eq(eventsTable.isActive, true)).limit(1);
        if (activeEvent.length === 0) return { error: "No active event right now." };

        const eventId = activeEvent[0].id;

        // Idempotency Check
        const existingRecord = await db.select()
            .from(attendanceTable)
            .where(and(
                eq(attendanceTable.userId, userId),
                eq(attendanceTable.eventId, eventId)
            ))
            .limit(1);

        if (existingRecord.length > 0) {
            return { error: "User is already marked present for this event." };
        }

        await db.insert(attendanceTable).values({
            userId: userId,
            eventId: eventId,
        });

        revalidatePath('/admin/attendance');
        return { success: true };
    } catch (error) {
        console.error("Failed manual attendance", error);
        return { error: "Server error" };
    }
}

export async function registerOfflineUser(data: { firstName: string, lastName: string, email: string, matricNumber: string, gender: 'Brother' | 'Sister', level: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as { role?: string }).role === 'user') return { error: "Unauthorized" };

    try {
        // 1. Check if email already exists
        const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, data.email)).limit(1);

        let userId = '';

        if (existingUser.length > 0) {
            // User already exists in DB. Instead of failing, just use their ID to mark them present!
            userId = existingUser[0].id;
        } else {
            // 2. Create the shell account for Magic Linking later
            const newUser = await db.insert(usersTable).values({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                matricNumber: data.matricNumber || null,
                gender: data.gender === 'Brother' ? 'brother' : 'sister',
                level: data.level || null,
            }).returning({ id: usersTable.id });

            userId = newUser[0].id;
        }

        // 3. Automatically mark them present for the active event
        const attendanceResult = await markManualAttendance(userId);

        if (attendanceResult.error) {
            return { error: attendanceResult.error }; // "Already marked present" etc.
        }

        revalidatePath('/admin/attendance');
        return { success: true };

    } catch (e) {
        console.error("Failed offline registration", e);
        return { error: "Database error during registration" };
    }
}
