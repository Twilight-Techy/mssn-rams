import { getUserProfile } from "@/app/actions/getUser";
import ProfileCompletionForm from "@/components/ProfileCompletionForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import SignOutButton from "@/components/SignOutButton";
import QRScanner from "@/components/QRScanner";
import DeepLinkScanner from "@/components/DeepLinkScanner";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
    const user = await getUserProfile();

    if (!user) {
        // Check if the user has a valid session but was deleted from DB
        const session = await getServerSession(authOptions);
        if (session) {
            // User was deleted — force sign out to prevent redirect loop
            redirect("/api/auth/force-signout");
        }
        redirect("/");
    }

    // Enforce profile completion before accessing dashboard
    if (!user.phoneNumber || !user.gender || !user.category) {
        return (
            <div className="container pt-16">
                <ProfileCompletionForm user={user} />
            </div>
        );
    }

    return (
        <div className="container pt-8">
            <Suspense fallback={null}>
                <DeepLinkScanner />
            </Suspense>
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <Image src="/logo.png" alt="MSSN Logo" width={52} height={52} className="rounded-full bg-white shadow-sm p-1" />
                    <div>
                        <h1 className="text-h2 mb-1">Assalamu Alaikum, {user.firstName}</h1>
                        <p className="text-secondary hidden sm:block">Welcome to the MSSN RAMS Dashboard</p>
                    </div>
                </div>

                <SignOutButton />
            </header>

            <main className="grid grid-cols-overview gap-8">
                {/* Attendance Action Card */}
                <div className="glass-card p-8 text-center">
                    <div className="mx-auto flex justify-center items-center w-20 h-20 rounded-full mb-6 bg-success-light">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--mssn-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                            <rect x="7" y="7" width="10" height="10" rx="1"></rect>
                        </svg>
                    </div>
                    <h3>Mark Attendance</h3>
                    <p className="text-secondary my-4 mb-8 text-sm">
                        Ready for Iftar? Scan the QR code at the venue or use the scanner below to get your digital ticket.
                    </p>
                    <QRScanner />
                </div>

                {/* View Ticket Card */}
                <div className="glass-card p-8 text-center flex flex-col">
                    <div className="mx-auto flex justify-center items-center w-20 h-20 rounded-full mb-6 bg-mssn-green-10">
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
                    <p className="text-secondary my-4 mb-8 text-sm flex-1">
                        View your active ticket for today&apos;s event to show the coordinators.
                    </p>
                    <Link href="/ticket" className="btn-outline w-full block no-underline">View Ticket</Link>
                </div>

            </main>
        </div>
    );
}
