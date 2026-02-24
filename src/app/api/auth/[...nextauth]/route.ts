import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;

            const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, user.email)).limit(1);

            if (existingUser.length === 0) {
                await db.insert(usersTable).values({
                    email: user.email,
                    firstName: user.name?.split(" ")[0] || "",
                    lastName: user.name?.split(" ").slice(1).join(" ") || "",
                });
            }
            return true;
        },
        async session({ session }) {
            if (session.user?.email) {
                const dbUser = await db.select().from(usersTable).where(eq(usersTable.email, session.user.email)).limit(1);
                if (dbUser[0]) {
                    (session.user as any).id = dbUser[0].id;
                    (session.user as any).role = dbUser[0].role;
                    (session.user as any).matricNumber = dbUser[0].matricNumber;
                }
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
