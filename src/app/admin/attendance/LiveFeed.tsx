'use client'

import { useState } from 'react';
import { toggleServedStatus } from '@/app/actions/attendanceActions';
import { Search, Undo2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LiveFeed({ initialRecords }: { initialRecords: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const router = useRouter();

    const filteredRecords = initialRecords.filter(r =>
        (r.user.firstName + ' ' + r.user.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.user.matricNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggle = async (id: string, currentStatus: 'marked' | 'served') => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        await toggleServedStatus(id, currentStatus);
        setLoadingMap(prev => ({ ...prev, [id]: false }));
        // router.refresh() occurs implicitly from server action revalidatePath
    };

    return (
        <div>
            <div className="flex justify-between items-center gap-4 mb-8">
                <h1 className="text-h1 text-mssn-green-dark">Live Attendance</h1>
                <div className="relative w-300">
                    <Search size={18} className="absolute left-3 top-50 translate-y-50-rev text-secondary" />
                    <input
                        type="text"
                        placeholder="Search Name or Matric..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="glass-card p-0 overflow-hidden">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Attendee</th>
                            <th>Matric & Level</th>
                            <th>Check-in</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-secondary">No attendees found.</td></tr>
                        ) : filteredRecords.map(record => (
                            <tr key={record.id} className={record.status === 'served' ? 'bg-black-02' : 'bg-transparent'}>
                                <td>
                                    <div className="font-semibold">{record.user.firstName} {record.user.lastName}</div>
                                    <div className="text-sm text-secondary">{record.user.gender}</div>
                                </td>
                                <td>
                                    <div>{record.user.matricNumber || 'N/A'}</div>
                                    <div className="text-sm text-secondary">{record.user.level}L</div>
                                </td>
                                <td className="text-secondary text-sm">
                                    {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="text-right">
                                    {record.status === 'marked' ? (
                                        <button
                                            onClick={() => handleToggle(record.id, record.status)}
                                            disabled={loadingMap[record.id]}
                                            className="btn-primary py-2 px-4 text-sm"
                                        >
                                            {loadingMap[record.id] ? '...' : <><Check size={16} /> Serve</>}
                                        </button>
                                    ) : (
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-success font-semibold text-sm flex items-center gap-1">
                                                <Check size={14} /> SERVED
                                            </span>
                                            <button
                                                onClick={() => handleToggle(record.id, record.status)}
                                                disabled={loadingMap[record.id]}
                                                className="btn-outline py-2 px-3 text-sm border-gray text-secondary"
                                                title="Undo Serve"
                                            >
                                                {loadingMap[record.id] ? '...' : <><Undo2 size={14} /> Undo</>}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
