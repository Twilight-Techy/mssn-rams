export const dynamic = 'force-dynamic'

import { db } from "@/db";
import { attendanceTable, eventsTable, usersTable } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import Link from "next/link";

export default async function AdminOverview() {
    // Basic stats
    const totalUsers = await db.select({ count: count() }).from(usersTable);

    // Active Event Stats
    const activeEvent = await db.select().from(eventsTable).where(eq(eventsTable.isActive, true)).limit(1);
    let totalCheckedIn = 0;
    let totalServed = 0;

    if (activeEvent.length > 0) {
        const checkedInRes = await db.select({ count: count() })
            .from(attendanceTable)
            .where(eq(attendanceTable.eventId, activeEvent[0].id));

        const servedRes = await db.select({ count: count() })
            .from(attendanceTable)
            .where(and(
                eq(attendanceTable.eventId, activeEvent[0].id),
                eq(attendanceTable.status, 'served')
            ));

        totalCheckedIn = checkedInRes[0].count;
        totalServed = servedRes[0].count;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--mssn-green-dark)' }}>Admin Overview</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>Total Registered Users</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--mssn-green-dark)', marginTop: '0.5rem' }}>
                        {totalUsers[0].count}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
                        Today's Attendance
                        {activeEvent.length > 0 ? <span style={{ fontSize: '0.8rem', background: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>Active</span> : <span style={{ fontSize: '0.8rem', background: '#FED7D7', color: '#9B2C2C', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>Inactive</span>}
                    </h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--mssn-green)', marginTop: '0.5rem' }}>
                        {totalCheckedIn}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Checked in for <strong style={{ color: 'var(--text-primary)' }}>{activeEvent[0]?.title || 'No active event'}</strong>
                    </p>
                </div>

                <div className="glass-card" style={{ padding: '2rem', borderTop: '4px solid var(--mssn-green-light)' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>Portions Served Today</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--mssn-green-dark)', marginTop: '0.5rem' }}>
                        {totalServed} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ {totalCheckedIn}</span>
                    </div>

                    {totalCheckedIn > 0 && (
                        <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
                            <div style={{ width: `${(totalServed / totalCheckedIn) * 100}%`, height: '100%', background: 'var(--mssn-green)' }} />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <Link href="/admin/attendance" className="btn-primary" style={{ textDecoration: 'none' }}>Go to Live Feed</Link>
                        <Link href="/admin/events" className="btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>Manage Events</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
