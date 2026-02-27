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

export async function toggleBlacklist(userId: string, blacklist: boolean) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user?.email || !['super_admin', 'admin', 'coordinator'].includes(role || '')) {
        return { error: "Unauthorized" };
    }

    try {
        await db.update(usersTable)
            .set({ isBlacklisted: blacklist })
            .where(eq(usersTable.id, userId));
        revalidatePath("/admin/users");
        return { success: true };
    } catch {
        return { error: "Failed to update blacklist status" };
    }
}

export async function updateUserDetails(userId: string, data: { firstName: string, lastName: string, matricNumber: string, gender: string, classification: string, level: string, category: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as { role?: string }).role !== 'super_admin') return { error: "Unauthorized" };

    try {
        await db.update(usersTable)
            .set({
                firstName: data.firstName,
                lastName: data.lastName,
                matricNumber: data.matricNumber,
                gender: data.gender ? (data.gender.toLowerCase() as "brother" | "sister") : null,
                classification: (data.classification as any) || null,
                level: data.level || null,
                category: data.category ? (data.category.toLowerCase() as "student" | "others") : null
            })
            .where(eq(usersTable.id, userId));
        revalidatePath("/admin/users");
        return { success: true };
    } catch {
        return { error: "Failed to update user details" };
    }
}

export async function deleteUser(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as { role?: string }).role !== 'super_admin') return { error: "Unauthorized" };

    try {
        await db.delete(usersTable).where(eq(usersTable.id, userId));
        revalidatePath("/admin/users");
        return { success: true };
    } catch {
        return { error: "Failed to delete user, they might have associated records like tickets or attendance." };
    }
}
