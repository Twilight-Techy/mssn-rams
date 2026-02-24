'use client'

import { useState } from 'react';
import { createEvent, toggleEventStatus } from '@/app/actions/eventActions';
import { useRouter } from 'next/navigation';

export default function EventsManager({ events }: { events: any[] }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        await createEvent(formData);
        setLoading(false);
        (e.target as HTMLFormElement).reset();
    }

    async function handleToggle(id: string, currentStatus: boolean) {
        await toggleEventStatus(id, currentStatus);
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--mssn-green-dark)' }}>Manage Events</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>

                {/* Create Event Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Create New Event</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label htmlFor="title">Event Title</label>
                            <input type="text" id="title" name="title" required placeholder="e.g. Ramadan Day 1 Iftar" title="Event Title" />
                        </div>
                        <div>
                            <label htmlFor="date">Date</label>
                            <input type="date" id="date" name="date" required title="Event Date" />
                        </div>
                        <button type="submit" className="btn-primary mt-4" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Event'}
                        </button>
                    </form>
                </div>

                {/* List Events Card */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '16px' }}>Title</th>
                                <th style={{ padding: '16px' }}>Date</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Active Toggle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No events created yet.</td></tr>
                            ) : events.map(event => (
                                <tr key={event.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: 500 }}>{event.title}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(event.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            background: event.isActive ? '#C6F6D5' : '#EDF2F7',
                                            color: event.isActive ? '#22543D' : '#4A5568',
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                                        }}>
                                            {event.isActive ? 'ACTIVE NOW' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <label title="Toggle Event Status" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                            <input
                                                type="checkbox"
                                                title="Toggle Active"
                                                checked={event.isActive}
                                                onChange={() => handleToggle(event.id, event.isActive)}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <span style={{
                                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                                backgroundColor: event.isActive ? 'var(--mssn-green)' : '#ccc',
                                                transition: '.4s', borderRadius: '34px'
                                            }}>
                                                <span style={{
                                                    position: 'absolute', content: '""', height: '20px', width: '20px',
                                                    left: event.isActive ? '26px' : '3px', bottom: '3px',
                                                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                                }} />
                                            </span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ padding: '1rem', background: 'rgba(56, 161, 105, 0.05)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>Rule:</strong> Only one event can be Active at a time. The active event is the one the QR Scanner resolves to.
                    </div>
                </div>

            </div>
        </div>
    );
}
