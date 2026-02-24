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
        <div style={{ textAlign: 'center' }}>
            {loading ? (
                <div style={{ padding: '3rem 1rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                    <p style={{ fontWeight: 500 }}>Processing attendance...</p>
                </div>
            ) : (
                <>
                    {error && (
                        <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                            <button onClick={() => window.location.reload()} style={{ display: 'block', marginTop: '10px', background: 'transparent', border: '1px solid #B91C1C', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', color: '#B91C1C', width: '100%' }}>Try Again</button>
                        </div>
                    )}
                    <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Point your camera at the event QR code</p>
                </>
            )}
        </div>
    );
}
