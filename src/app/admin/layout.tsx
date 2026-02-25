import { getUserProfile } from "@/app/actions/getUser";
import { redirect } from "next/navigation";
import AdminNavbar from "./AdminNavbar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUserProfile();

    if (!user) {
        const session = await getServerSession(authOptions);
        if (session) {
            redirect("/api/auth/force-signout");
        }
        redirect("/");
    }

    if (user.role === "user") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex flex-col">
            <AdminNavbar user={user} />
            <main className="flex-1 p-8 container">
                {children}
            </main>
        </div>
    );
}
