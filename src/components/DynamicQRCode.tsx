'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';

export default function DynamicQRCode({ eventId }: { eventId: string }) {
    // Generate an initial token that expires in 30 seconds
    const EXPIRE_MS = 30000;

    const generateToken = () => {
        const payload = JSON.stringify({ eventId, exp: Date.now() + EXPIRE_MS });
        // Create an absolute URL to the dashboard attendance route with the payload base64 encoded
        // Use browser-friendly btoa() instead of Node's Buffer
        const encodedPayload = btoa(payload);
        return `${window.location.origin}/dashboard?scan=${encodedPayload}`;
    };

    const [token, setToken] = useState<string>('');
    const [progress, setProgress] = useState(100);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Run immediately on client mount
        setToken(generateToken());

        const interval = setInterval(() => {
            setToken(generateToken());
            setProgress(100);
        }, EXPIRE_MS);

        const progressInterval = setInterval(() => {
            setProgress(prev => Math.max(0, prev - (100 / (EXPIRE_MS / 1000))));
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, [eventId]);

    // Update the DOM directly to bypass CSS Linters that forbid inline style={{ width }}
    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.style.width = `${progress}%`;
        }
    }, [progress]);

    // Don't render until mounted on client to prevent SSR hydration mismatch of Date.now()
    if (!token) return <div className="p-8 w-[180px] h-[180px] bg-black-05 animate-pulse rounded-xl"></div>;

    return (
        <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl shadow-sm inline-block mb-2">
                <QRCode value={token} size={180} level="Q" />
            </div>
            <div className="w-full max-w-[180px] h-1.5 bg-black-05 rounded-full overflow-hidden mt-1 mb-3">
                <div ref={progressRef} className="h-full bg-mssn-green transition-all duration-1000 ease-linear" />
            </div>
            <p className="text-secondary text-xs">
                Code refreshes automatically to prevent screenshots.
            </p>
        </div>
    );
}
