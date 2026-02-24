'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { markAttendance } from '@/app/actions/markAttendance';
import { useRouter } from 'next/navigation';

export default function QRScanner() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Only initialize scanner on the client side
        let scanner: Html5QrcodeScanner | null = null;

        if (typeof window !== 'undefined') {
            scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);
        }

        async function onScanSuccess(decodedText: string) {
            if (scanner) {
                scanner.clear(); // Stop scanning once we have a hit
            }
            setScanResult(decodedText);
            setLoading(true);
            setError(null);

            try {
                // The QR code should contain the raw eventId for now (e.g. "uuid-string")
                // We can add dynamic token validation to this action later
                const result = await markAttendance(decodedText);

                if (result.error) {
                    setError(result.error);
                    setLoading(false);
                } else if (result.success && result.redirect) {
                    router.push(result.redirect);
                }
            } catch (e) {
                setError("Network error while trying to mark attendance.");
                setLoading(false);
            }
        }

        function onScanFailure(error: any) {
            // Ignore background scan failures
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(e => console.error("Failed to clear scanner", e));
            }
        };
    }, [router]);

    return (
        <div className="text-center">
            {loading ? (
                <div className="py-12 px-4">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="font-medium">Processing attendance...</p>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 text-sm">
                            {error}
                            <button onClick={() => window.location.reload()} className="block mt-2 bg-transparent border border-red-800 rounded px-2 py-1 cursor-pointer text-red-800 w-full">Try Again</button>
                        </div>
                    )}
                    <div id="reader" className="w-full max-w-[400px] mx-auto rounded-xl overflow-hidden border-none shadow-[0_4px_20px_rgba(0,0,0,0.05)]"></div>
                    <p className="mt-4 text-secondary text-sm">Point your camera at the event QR code</p>
                </>
            )}
        </div>
    );
}
