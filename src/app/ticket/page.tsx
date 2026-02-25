import { getActiveTicket } from "@/app/actions/ticketActions";
import DigitalTicket from "@/components/DigitalTicket";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TicketPage() {
    const ticket = await getActiveTicket();

    if (!ticket) {
        return (
            <div className="container pt-16 text-center">
                <div className="glass-card p-12 max-w-[500px] mx-auto">
                    <h2 className="mb-4">No Active Ticket Found</h2>
                    <p className="text-secondary mb-8">
                        You haven&apos;t marked attendance for the current event, or there is no active event right now.
                    </p>
                    <Link href="/dashboard" className="btn-primary flex items-center justify-center gap-2">
                        <ArrowLeft size={18} /> Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container pb-8">
            <div className="pt-8">
                <Link href="/dashboard" className="inline-flex items-center text-secondary no-underline font-medium gap-2">
                    <ArrowLeft size={18} /> Dashboard
                </Link>
            </div>
            <DigitalTicket ticket={ticket!} />
        </div>
    );
}
