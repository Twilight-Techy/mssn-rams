import { getActiveTicket } from "@/app/actions/ticketActions";
import DigitalTicket from "@/components/DigitalTicket";
import Link from "next/link";
import { ArrowLeft, Ban } from "lucide-react";

export default async function TicketPage() {
    const ticket = await getActiveTicket();

    if (!ticket) {
        return (
            <div className="container">
                <div className="pt-8 pb-2">
                    <Link href="/dashboard" className="inline-flex items-center text-secondary no-underline font-medium gap-2">
                        <ArrowLeft size={18} /> Dashboard
                    </Link>
                </div>
                <div className="ticket-page">
                    <div className="glass-card p-12 max-w-[500px] mx-auto text-center">
                        <h2 className="mb-4">No Active Ticket</h2>
                        <p className="text-secondary mb-0">
                            You haven&apos;t marked attendance for the current event, or there is no active event right now.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (ticket.user.isBlacklisted) {
        return (
            <div className="container">
                <div className="pt-8 pb-2">
                    <Link href="/dashboard" className="inline-flex items-center text-secondary no-underline font-medium gap-2">
                        <ArrowLeft size={18} /> Dashboard
                    </Link>
                </div>
                <div className="ticket-page">
                    <div className="glass-card p-12 max-w-[500px] mx-auto text-center">
                        <div className="mx-auto flex justify-center items-center w-20 h-20 rounded-full mb-6 bg-danger-light">
                            <Ban size={36} className="text-danger" />
                        </div>
                        <h2 className="mb-4">Access Restricted</h2>
                        <p className="text-secondary mb-0">
                            Your account has been restricted by an administrator. You cannot view or use this ticket.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="pt-8 pb-2">
                <Link href="/dashboard" className="inline-flex items-center text-secondary no-underline font-medium gap-2">
                    <ArrowLeft size={18} /> Dashboard
                </Link>
            </div>
            <div className="ticket-page">
                <DigitalTicket ticket={ticket!} />
            </div>
        </div>
    );
}
