import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { google } from "googleapis";
import { getGoogleOAuthClient } from "@/lib/google-oauth";
import { normalizePeopleConnection } from "@/lib/contacts-import";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get("oauth_state_google")?.value ?? "";
  cookieStore.set({ name: "oauth_state_google", value: "", httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  if (!code) return new Response("Missing authorization code", { status: 400 });
  if (!state || state !== stateCookie) return new Response("Invalid OAuth state", { status: 400 });

  const client = getGoogleOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const people = google.people({ version: "v1", auth: client });
  let nextPageToken: string | undefined;
  const personFields = "names,emailAddresses,birthdays,genders,urls,photos";
  const normalized: any[] = [];
  do {
    const res = await people.people.connections.list({
      resourceName: "people/me",
      personFields,
      pageSize: 1000,
      pageToken: nextPageToken,
    });
    const connections = res.data.connections ?? [];
    for (const p of connections) normalized.push(normalizePeopleConnection(p));
    nextPageToken = res.data.nextPageToken ?? undefined;
  } while (nextPageToken);

  // TODO: Upsert `normalized` into your Contacts table (scoped to auth.uid()).
  return Response.json({ importedCount: normalized.length, sample: normalized.slice(0, 5) });
}
