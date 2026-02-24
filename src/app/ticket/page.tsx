import { getActiveTicket } from "@/app/actions/ticketActions";
import DigitalTicket from "@/components/DigitalTicket";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TicketPage() {
    const ticket = await getActiveTicket();

    if (!ticket) {
        return (
            <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                <div className="glass-card" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '1rem' }}>No Active Ticket Found</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        You haven't marked attendance for the current event, or there is no active event right now.
                    </p>
                    <Link href="/dashboard" className="btn-primary">
                        <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '2rem' }}>
            <div style={{ paddingTop: '2rem' }}>
                <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                    <ArrowLeft size={18} style={{ marginRight: '6px' }} /> Dashboard
                </Link>
            </div>
            <DigitalTicket ticket={ticket!} />
        </div>
    );
}
