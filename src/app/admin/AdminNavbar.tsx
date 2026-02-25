'use client'

import Link from "next/link";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";

export default function AdminNavbar({ user }: { user: { role: string } }) {
    const isSuperAdmin = user.role === "super_admin";
    const isAdmin = user.role === "admin" || isSuperAdmin;

    return (
        <nav className="bg-white border-b py-4 sticky top-0 z-50">
            <div className="container flex justify-between items-center admin-nav">
                <div className="flex items-center gap-8 admin-nav-left">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="MSSN Logo" width={32} height={32} className="rounded-full bg-white shadow-sm" />
                        <h2 className="text-lg m-0">MSSN RAMS <span className="text-mssn-green">Admin</span></h2>
                    </div>

                    <div className="flex gap-6 font-medium text-sm admin-nav-links">
                        <Link href="/admin" className="text-secondary no-underline">Overview</Link>
                        <Link href="/admin/attendance" className="text-secondary no-underline">Live Attendance</Link>
                        {isAdmin && (
                            <Link href="/admin/events" className="text-secondary no-underline">Events</Link>
                        )}
                        {isSuperAdmin && (
                            <Link href="/admin/users" className="text-secondary no-underline">Users</Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 admin-nav-right">
                    <span className="badge badge-gray">
                        {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <SignOutButton />

                </div>
            </div>
        </nav>
    );
}
