'use client';

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="btn-outline"
            style={{ padding: '10px 16px', display: 'flex', gap: '8px', fontSize: '0.9rem' }}
        >
            <LogOut size={18} />
            Sign Out
        </button>
    );
}
