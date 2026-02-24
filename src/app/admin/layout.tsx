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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AdminNavbar user={user} />
            <main style={{ flex: 1, padding: '2rem' }} className="container">
                {children}
            </main>
        </div>
    );
}
