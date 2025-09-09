import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { getGoogleOAuthClient, getGoogleScopes, base64Url } from "@/lib/google-oauth";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
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
  const cookieStore = await cookies();
  cookieStore.set({ name: "oauth_state_google", value: state, httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 600 });
  return Response.redirect(url, 302);
}
