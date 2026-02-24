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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--mssn-green-dark)' }}>Live Attendance</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search Name or Matric..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '16px' }}>Attendee</th>
                            <th style={{ padding: '16px' }}>Matric & Level</th>
                            <th style={{ padding: '16px' }}>Check-in</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendees found.</td></tr>
                        ) : filteredRecords.map(record => (
                            <tr key={record.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: record.status === 'served' ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 600 }}>{record.user.firstName} {record.user.lastName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{record.user.gender}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div>{record.user.matricNumber || 'N/A'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{record.user.level}L</div>
                                </td>
                                <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    {record.status === 'marked' ? (
                                        <button
                                            onClick={() => handleToggle(record.id, record.status)}
                                            disabled={loadingMap[record.id]}
                                            className="btn-primary"
                                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                        >
                                            {loadingMap[record.id] ? '...' : <><Check size={16} /> Serve</>}
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                                            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Check size={14} /> SERVED
                                            </span>
                                            <button
                                                onClick={() => handleToggle(record.id, record.status)}
                                                disabled={loadingMap[record.id]}
                                                className="btn-outline"
                                                style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid #ccc', color: 'var(--text-secondary)' }}
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
