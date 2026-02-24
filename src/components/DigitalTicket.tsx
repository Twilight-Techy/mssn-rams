'use client'

import { useState, useEffect } from "react";
import { serveDigitalTicket } from "@/app/actions/ticketActions";

export default function DigitalTicket({ ticket }: { ticket: any }) {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [isServed, setIsServed] = useState(ticket.status === 'served');
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Live ticking clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleServe = async () => {
        setLoading(true);
        const res = await serveDigitalTicket(ticket.id);
        if (res?.success) {
            setIsServed(true);
            setShowConfirm(false);
        }
        setLoading(false);
    };

    return (
        <div className="glass-card" style={{
            maxWidth: '450px',
            margin: '2rem auto',
            overflow: 'hidden',
            borderTop: `6px solid ${isServed ? 'var(--text-secondary)' : 'var(--mssn-green)'}`
        }}>

            <div style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px dashed var(--glass-border)' }}>
                <p style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {ticket.event?.title || "Ramadan Iftar"}
                </p>
                <h2 style={{ fontSize: '1.8rem', color: isServed ? 'var(--text-secondary)' : 'var(--mssn-green-dark)' }}>
                    {ticket.user.firstName} {ticket.user.lastName}
                </h2>
                <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>
                    {ticket.user.level}L • {ticket.user.gender === 'brother' ? 'Brother' : 'Sister'}
                </p>
            </div>

            <div style={{ padding: '2rem', background: isServed ? 'rgba(0,0,0,0.02)' : 'rgba(56, 161, 105, 0.05)' }}>

                {/* Status Indicator */}
                <div style={{
                    background: isServed ? '#e2e8f0' : '#c6f6d5',
                    color: isServed ? '#4a5568' : '#22543d',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    display: 'inline-block',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem',
                    width: '100%',
                    textAlign: 'center'
                }}>
                    STATUS: {isServed ? 'SERVED' : 'VALID FOR IFTAR'}
                </div>

                {/* Live Clock Anti-fraud */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>CURRENT SERVER TIME</p>
                    <div style={{ fontSize: '2rem', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '2px' }}>
                        {currentTime.toLocaleTimeString('en-US', { hour12: true })}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: isServed ? 'var(--text-secondary)' : 'var(--danger)', marginTop: '4px' }}>
                        {isServed ? `Served at: ${new Date(ticket.servedAt).toLocaleTimeString()}` : 'Do not capture screenshot. Ticketing is live.'}
                    </p>
                </div>

                {/* Action Button */}
                {!isServed && (
                    <div style={{ marginTop: '2rem' }}>
                        {!showConfirm ? (
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="btn-primary w-full"
                                style={{ background: 'var(--mssn-green-dark)' }}
                            >
                                Mark as Served
                            </button>
                        ) : (
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--danger)' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: '12px', fontWeight: 600, textAlign: 'center' }}>
                                    Wait! Are you in front of a coordinator?
                                </p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setShowConfirm(false)} className="btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                                    <button onClick={handleServe} disabled={loading} className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                                        {loading ? '...' : 'Yes, Serve Me'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
