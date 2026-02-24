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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-h1 text-mssn-green-dark">Manage Events</h1>
            </div>

            <div className="grid grid-cols-admin gap-8 items-start">

                {/* Create Event Card */}
                <div className="glass-card p-8">
                    <h3 className="mb-6">Create New Event</h3>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
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
                <div className="glass-card p-0 overflow-hidden">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th className="text-right">Active Toggle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-secondary">No events created yet.</td></tr>
                            ) : events.map(event => (
                                <tr key={event.id}>
                                    <td className="font-medium">{event.title}</td>
                                    <td className="text-secondary">{new Date(event.date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${event.isActive ? 'badge-green' : 'badge-gray'}`}>
                                            {event.isActive ? 'ACTIVE NOW' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <label title="Toggle Event Status" className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                title="Toggle Active"
                                                checked={event.isActive}
                                                onChange={() => handleToggle(event.id, event.isActive)}
                                                className="toggle-input"
                                            />
                                            <span className={`toggle-slider ${event.isActive ? 'active' : ''}`}>
                                                <span className={`toggle-knob ${event.isActive ? 'active' : ''}`} />
                                            </span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 text-sm text-secondary bg-success-light">
                        <strong>Rule:</strong> Only one event can be Active at a time. The active event is the one the QR Scanner resolves to.
                    </div>
                </div>

            </div>
        </div>
    );
}
