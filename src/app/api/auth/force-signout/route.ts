import { NextResponse } from "next/server";

// This route clears the NextAuth session cookie and redirects to the home page.
// Used when a user's DB record is deleted while they still have a valid session.
export async function GET(request: Request) {
    const url = new URL("/", request.url);
    const response = NextResponse.redirect(url);

    // Clear all NextAuth session cookies
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    response.cookies.delete("next-auth.csrf-token");
    response.cookies.delete("__Secure-next-auth.csrf-token");
    response.cookies.delete("next-auth.callback-url");
    response.cookies.delete("__Host-next-auth.csrf-token");

    return response;
}
