'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { markAttendance } from "@/app/actions/markAttendance";

export default function DeepLinkScanner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const scanPayload = searchParams.get('scan');
        if (!scanPayload) return;

        async function processScan() {
            setLoading(true);
            try {
                // Decode base64 URL payload back into JSON String using browser API
                const decodedText = atob(scanPayload!);
                const result = await markAttendance(decodedText);

                if (result.error) {
                    setError(result.error);
                } else if (result.success && result.redirect) {
                    // Clean URL on success and go to ticket
                    router.replace(result.redirect);
                }
            } catch {
                setError("Network error while processing external scan.");
            } finally {
                setLoading(false);
            }
        }

        processScan();
    }, [searchParams, router]);

    const clearError = () => {
        setError(null);
        router.replace(pathname);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="spinner mb-4"></div>
                <p className="font-medium text-lg">Processing Attendance...</p>
                <p className="text-secondary text-sm">Please wait while we verify your scan.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="modal-overlay">
                <div className="glass-card p-8 text-center modal-card">
                    <div className="mx-auto flex justify-center items-center w-16 h-16 rounded-full mb-4 bg-red-100">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--status-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h3 className="text-red-800 mb-2">Scan Failed</h3>
                    <p className="text-red-600 mb-6 font-medium">{error}</p>
                    <button onClick={clearError} className="btn-primary btn-danger w-full">Dismiss</button>
                </div>
            </div>
        );
    }

    return null;
}
