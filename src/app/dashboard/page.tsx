import { getUserProfile } from "@/app/actions/getUser";
import ProfileCompletionForm from "@/components/ProfileCompletionForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import QRScanner from "@/components/QRScanner";

export default async function DashboardPage() {
    const user = await getUserProfile();

    if (!user) {
        redirect("/");
    }

    // Enforce profile completion before accessing dashboard
    if (!user.phoneNumber || !user.gender || !user.category) {
        return (
            <div className="container" style={{ paddingTop: '4rem' }}>
                <ProfileCompletionForm user={user} />
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Assalamu Alaikum, {user.firstName}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome to the MSSN RAMS Dashboard</p>
                </div>

                <SignOutButton />
            </header>

            <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Attendance Action Card */}
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{
                        background: 'rgba(56, 161, 105, 0.1)',
                        height: '80px', width: '80px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--mssn-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                            <rect x="7" y="7" width="10" height="10" rx="1"></rect>
                        </svg>
                    </div>
                    <h3>Mark Attendance</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem 0', fontSize: '0.95rem' }}>
                        Ready for Iftar? Scan the QR code at the venue or use the scanner below to get your digital ticket.
                    </p>
                    <QRScanner />
                </div>

                {/* View Ticket Card */}
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        background: 'rgba(11, 81, 42, 0.1)',
                        height: '80px', width: '80px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--mssn-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 7V4h16v3"></path>
                            <path d="M4 17v3h16v-3"></path>
                            <path d="M2 12h20"></path>
                            <path d="M11 2h2"></path>
                            <path d="M11 22h2"></path>
                            <path d="M8 8v8"></path>
                            <path d="M16 8v8"></path>
                        </svg>
                    </div>
                    <h3>My Iftar Ticket</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem 0', fontSize: '0.95rem', flex: 1 }}>
                        View your active ticket for today's event to show the coordinators.
                    </p>
                    <Link href="/ticket" className="btn-outline w-full" style={{ display: 'block', textDecoration: 'none' }}>View Ticket</Link>
                </div>

            </main>
        </div>
    );
}
