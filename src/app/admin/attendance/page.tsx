import { getLiveAttendance } from "@/app/actions/attendanceActions";
import LiveFeed from "./LiveFeed";

export default async function AttendancePage() {
    const rawRecords = await getLiveAttendance();

    // Convert dates to strings for safe passing to Client Component
    const safeRecords = rawRecords.map(r => ({
        ...r,
        checkInTime: r.checkInTime.toISOString(),
        servedAt: r.servedAt?.toISOString() || null
    }));

    return <LiveFeed initialRecords={safeRecords} />;
}
