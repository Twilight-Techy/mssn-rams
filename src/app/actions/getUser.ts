import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function getUserProfile() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return null;
    }

    const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, session.user.email))
        .limit(1);

    return user[0] || null;
}
