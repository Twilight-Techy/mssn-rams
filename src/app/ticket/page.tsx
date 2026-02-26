import { getActiveTicket } from "@/app/actions/ticketActions";
import DigitalTicket from "@/components/DigitalTicket";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
