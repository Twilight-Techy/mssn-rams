'use server'

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function getUsers(searchQuery?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as { role?: string }).role !== 'super_admin') return [];

    const baseQuery = db.select().from(usersTable);

    if (searchQuery) {
        return await baseQuery.where(
            or(
                like(usersTable.firstName, `%${searchQuery}%`),
                like(usersTable.lastName, `%${searchQuery}%`),
                like(usersTable.email, `%${searchQuery}%`),
                like(usersTable.matricNumber, `%${searchQuery}%`)
            )
        ).limit(50);
    }

    return await baseQuery.limit(50); // Limit for performance
}

export async function updateUserRole(userId: string, newRole: "super_admin" | "admin" | "coordinator" | "user") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as { role?: string }).role !== 'super_admin') return { error: "Unauthorized" };

    try {
        await db.update(usersTable)
            .set({ role: newRole })
            .where(eq(usersTable.id, userId));
        revalidatePath("/admin/users");
        return { success: true };
    } catch {
        return { error: "Failed to update role" };
    }
}
