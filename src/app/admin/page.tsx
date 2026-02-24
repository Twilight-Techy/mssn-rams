export const dynamic = 'force-dynamic'

import { db } from "@/db";
import { attendanceTable, eventsTable, usersTable } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import Link from "next/link";
import QRCode from "react-qr-code";

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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-h1 text-mssn-green-dark">Admin Overview</h1>
            </div>

            <div className="grid grid-cols-overview gap-8 mb-12">
                <div className="glass-card p-8">
                    <h3 className="text-secondary text-sm font-medium">Total Registered Users</h3>
                    <div className="text-4xl font-bold text-mssn-green-dark mt-2">
                        {totalUsers[0].count}
                    </div>
                </div>

                <div className="glass-card p-8">
                    <h3 className="text-secondary text-sm font-medium flex items-center gap-2">
                        Today's Attendance
                        {activeEvent.length > 0 ? <span className="badge badge-green text-xs">Active</span> : <span className="badge bg-red-100 text-red-800 text-xs">Inactive</span>}
                    </h3>
                    <div className="text-4xl font-bold text-mssn-green mt-2">
                        {totalCheckedIn}
                    </div>
                    <p className="text-sm text-secondary mt-2">
                        Checked in for <strong className="text-primary">{activeEvent[0]?.title || 'No active event'}</strong>
                    </p>
                </div>

                <div className="glass-card p-8 border-t-4 border-mssn-green-light">
                    <h3 className="text-secondary text-sm font-medium">Portions Served Today</h3>
                    <div className="text-4xl font-bold text-mssn-green-dark mt-2">
                        {totalServed} <span className="text-lg text-secondary font-normal">/ {totalCheckedIn}</span>
                    </div>

                    {totalCheckedIn > 0 && (
                        <div className="w-full h-8px bg-black-05 rounded-sm mt-4 overflow-hidden">
                            <style>{`.progress-bar-fill { width: ${(totalServed / totalCheckedIn) * 100}%; }`}</style>
                            <div className="h-full bg-mssn-green progress-bar-fill" />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-quick-actions gap-8">
                <div className="glass-card p-8">
                    <h3>Quick Actions</h3>
                    <div className="flex flex-col gap-4 mt-6">
                        <Link href="/admin/attendance" className="btn-primary no-underline">Go to Live Feed</Link>
                        <Link href="/admin/events" className="btn-outline no-underline text-center">Manage Events</Link>
                    </div>
                </div>

                <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
                    <h3 className="mb-4">Active Event QR Code</h3>
                    {activeEvent.length > 0 ? (
                        <>
                            <div className="bg-white p-4 rounded-xl shadow-sm inline-block mb-4">
                                <QRCode value={activeEvent[0].id} size={180} level="H" />
                            </div>
                            <p className="text-sm text-secondary">
                                Display this code at the venue for students to scan.
                            </p>
                        </>
                    ) : (
                        <div className="text-secondary p-8 bg-black-05 rounded-xl border border-dashed border-glass-border w-full">
                            <p>No active event.</p>
                            <Link href="/admin/events" className="text-mssn-green font-medium mt-2 inline-block">Create or activate one</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
