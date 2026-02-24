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
        <div className={`glass-card max-w-[450px] my-8 mx-auto overflow-hidden text-center ticket-card ${isServed ? 'ticket-served' : 'ticket-valid'}`}>
            <style>{`
                .ticket-card { border-top-width: 6px; border-top-style: solid; }
                .ticket-served { border-top-color: var(--text-secondary); }
                .ticket-valid { border-top-color: var(--mssn-green); }
            `}</style>

            <div className="p-8 text-center border-b border-dashed border-glass-border">
                <p className="uppercase text-xs tracking-widest text-secondary mb-2">
                    {ticket.event?.title || "Ramadan Iftar"}
                </p>
                <h2 className={`text-h1 ${isServed ? 'text-secondary' : 'text-mssn-green-dark'}`}>
                    {ticket.user.firstName} {ticket.user.lastName}
                </h2>
                <p className="mt-2 font-medium">
                    {ticket.user.level}L • {ticket.user.gender === 'brother' ? 'Brother' : 'Sister'}
                </p>
            </div>

            <div className={`p-8 ${isServed ? 'bg-black-02' : 'bg-success-light'}`}>

                {/* Status Indicator */}
                <div className={`py-2 px-4 rounded-full inline-block font-bold text-sm mb-6 w-full text-center ${isServed ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
                    STATUS: {isServed ? 'SERVED' : 'VALID FOR IFTAR'}
                </div>

                {/* Live Clock Anti-fraud */}
                <div className="text-center mb-8">
                    <p className="text-xs text-secondary mb-1">CURRENT SERVER TIME</p>
                    <div className="text-2xl font-mono font-semibold tracking-widest">
                        {currentTime.toLocaleTimeString('en-US', { hour12: true })}
                    </div>
                    <p className={`text-xs mt-1 ${isServed ? 'text-secondary' : 'text-danger'}`}>
                        {isServed ? `Served at: ${new Date(ticket.servedAt).toLocaleTimeString()}` : 'Do not capture screenshot. Ticketing is live.'}
                    </p>
                </div>

                {/* Action Button */}
                {!isServed && (
                    <div className="mt-8">
                        {!showConfirm ? (
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="btn-primary w-full bg-mssn-green-dark text-white hover:opacity-90 transition-opacity"
                            >
                                Mark as Served
                            </button>
                        ) : (
                            <div className="bg-white p-4 rounded-xl border border-danger">
                                <p className="text-sm text-danger mb-3 font-semibold text-center">
                                    Wait! Are you in front of a coordinator?
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowConfirm(false)} className="btn-outline flex-1 p-2.5">Cancel</button>
                                    <button onClick={handleServe} disabled={loading} className="btn-primary flex-1 p-2.5">
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
