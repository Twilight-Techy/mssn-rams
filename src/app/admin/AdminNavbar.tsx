'use client'

import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function AdminNavbar({ user }: { user: any }) {
    const isSuperAdmin = user.role === "super_admin";
    const isAdmin = user.role === "admin" || isSuperAdmin;

    return (
        <nav style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 50 }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>MSSN RAMS <span style={{ color: 'var(--mssn-green)' }}>Admin</span></h2>

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', fontWeight: 500 }}>
                        <Link href="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Overview</Link>
                        <Link href="/admin/attendance" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Live Attendance</Link>
                        {isAdmin && (
                            <Link href="/admin/events" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Events</Link>
                        )}
                        {isSuperAdmin && (
                            <Link href="/admin/users" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Users</Link>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: '12px' }}>
                        {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <SignOutButton />
                </div>
            </div>
        </nav>
    );
}
