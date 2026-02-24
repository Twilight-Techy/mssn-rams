'use client';

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="btn-outline flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold"
        >
            <LogOut size={18} />
            Sign Out
        </button>
    );
}
