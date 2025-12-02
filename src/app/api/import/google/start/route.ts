import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getGoogleOAuthClient, getGoogleScopes, base64Url } from "@/lib/google-oauth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
// Force dynamic rendering for cookie access
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  // Verify Supabase session before proceeding
  const supabase = await createClient();

  // Debug: Check cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log('[/api/import/google/start] Cookies:', allCookies.map(c => c.name).join(', '));

  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('[/api/import/google/start] User:', user?.id, 'Error:', error?.message);

  if (!user) {
    // No logged‑in user – send them to sign‑in page
    const loginUrl = new URL('/auth', _req.url);
    return NextResponse.redirect(loginUrl);
  }

  const client = getGoogleOAuthClient();
  const scopes = getGoogleScopes();
  const stateBytes = crypto.getRandomValues(new Uint8Array(32));
  const state = base64Url(stateBytes);
  const url = client.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: true,
    prompt: "consent",
    scope: scopes,
    state,
  });
  const responseCookieStore = await cookies();
  responseCookieStore.set({ name: "oauth_state_google", value: state, httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 600 });
  return NextResponse.redirect(url, 302);
}

