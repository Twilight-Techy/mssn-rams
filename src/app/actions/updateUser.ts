'use server'

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "Not authenticated" };

    const category = formData.get("category") as "student" | "others";
    const isMuslim = formData.get("isMuslim") === "true";
    const matricNumber = formData.get("matricNumber") as string;
    const level = formData.get("level") as string;
    const gender = formData.get("gender") as "brother" | "sister";
    const department = formData.get("department") as "Electronics and Computer Engineering" | "Mechanical Engineering" | "Aerospace Engineering" | "Chemical and Polymer Engineering" | "Others" | null;
    const phoneNumber = formData.get("phoneNumber") as string;

    try {
        await db.update(usersTable)
            .set({
                category,
                isMuslim,
                matricNumber: matricNumber || null,
                level: level || null,
                gender,
                department: department || null,
                phoneNumber,
            })
            .where(eq(usersTable.email, session.user.email));

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile", error);
        return { error: "Failed to update profile" };
    }
}
