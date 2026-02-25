'use server';

import { db } from "@/db";
import { attendanceTable, eventsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function markAttendance(eventId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { error: "You must be logged in to mark attendance." };
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
        return { error: "User profile incomplete. Please complete your profile first." };
    }

    let parsedEventId = eventId;

    // Attempt to parse dynamic QR JSON for anti-fraud
    try {
        const data = JSON.parse(eventId);
        if (data.eventId && data.exp) {
            // Check if the QR code was generated more than 30 seconds ago (plus a small buffer)
            if (Date.now() > data.exp) {
                return { error: "This QR code has expired. Please scan the live screen again." };
            }
            parsedEventId = data.eventId;
        } else {
            return { error: "Invalid QR code format." };
        }
    } catch {
        // Fallback for extreme cases or testing, but in production we should reject non-JSON.
        // For maximum security, we enforce the dynamic format:
        return { error: "Invalid or outdated QR format. Please scan the current live screen." };
    }

    try {
        // 1. Check if event exists and is active
        const event = await db.select().from(eventsTable).where(and(eq(eventsTable.id, parsedEventId), eq(eventsTable.isActive, true))).limit(1);

        if (event.length === 0) {
            return { error: "This event is not active or does not exist." };
        }

        // 2. Idempotency Check (Has the user already marked attendance?)
        const existingRecord = await db.select()
            .from(attendanceTable)
            .where(and(
                eq(attendanceTable.userId, userId),
                eq(attendanceTable.eventId, parsedEventId)
            ))
            .limit(1);

        if (existingRecord.length > 0) {
            return { success: true, message: "Attendance already marked for this event.", redirect: "/ticket" };
        }

        // 3. Mark Attendance
        await db.insert(attendanceTable).values({
            userId: userId,
            eventId: parsedEventId,
        });

        revalidatePath("/dashboard");
        revalidatePath("/ticket");

        return { success: true, redirect: "/ticket" };

    } catch (error) {
        console.error("Failed to mark attendance", error);
        return { error: "A server error occurred." };
    }
}
