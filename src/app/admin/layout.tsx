import { getUserProfile } from "@/app/actions/getUser";
import { redirect } from "next/navigation";
import AdminNavbar from "./AdminNavbar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUserProfile();

    if (!user || user.role === "user") {
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
