/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleOAuthClient } from '@/lib/google-oauth';
import { normalizePeopleConnection, NormalizedContact } from '@/lib/contacts-import';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
// Force dynamic rendering so request‑level cookies are available
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '';
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get('oauth_state_google')?.value ?? '';
  cookieStore.set({ name: 'oauth_state_google', value: '', httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });

  if (!code) return new Response('Missing authorization code', { status: 400 });
  if (!state || state !== stateCookie) return new Response('Invalid OAuth state', { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there is no Supabase session, redirect the user to the sign‑in page
  if (!user) {
    console.warn('Google import callback: no Supabase session – redirecting to /auth');
    const loginUrl = new URL('/auth', req.url);
    return NextResponse.redirect(loginUrl);
  }
  const userId = user.id;

  const client = getGoogleOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const people = google.people({ version: 'v1', auth: client });
  let nextPageToken: string | undefined;
  const personFields = 'names,emailAddresses,birthdays,genders,urls,photos';
  const normalized: NormalizedContact[] = [];
  do {
    const res = await people.people.connections.list({
      resourceName: 'people/me',
      personFields,
      pageSize: 1000,
      pageToken: nextPageToken,
    });
    const connections = res.data.connections ?? [];
    for (const p of connections) normalized.push(normalizePeopleConnection(p));
    nextPageToken = res.data.nextPageToken ?? undefined;
  } while (nextPageToken);

  let importedCount = 0;
  try {
    if (normalized.length > 0) {
      const existingContacts = await db.contact.findMany({
        where: { userId },
        select: { fullName: true },
      });
      const existingNames = new Set(existingContacts.map(c => c.fullName));

      const contactsToCreate = normalized.filter(c => c.fullName && !existingNames.has(c.fullName));

      if (contactsToCreate.length > 0) {
        const createData = contactsToCreate.map(contact => {
          const data: any = {
            userId,
            fullName: contact.fullName || 'N/A',
            emails: contact.emails || [],
            gender: contact.gender,
          };
          if (contact.birthday?.year && contact.birthday.month && contact.birthday.day) {
            data.birthday = new Date(
              contact.birthday.year,
              contact.birthday.month - 1,
              contact.birthday.day
            );
          }
          return data;
        });

        const result = await db.contact.createMany({
          data: createData,
          skipDuplicates: true,
        });
        importedCount = result.count;
      }
    }
  } catch (error) {
    console.error('Error importing google contacts', error);
    // Preserve the original redirect target but add an error flag
    const redirectUrl = new URL('/contacts', req.url);
    redirectUrl.searchParams.set('error', 'google-import-failed');
    return NextResponse.redirect(redirectUrl);

  }

  const redirectUrl = new URL('/contacts', req.url);
  redirectUrl.searchParams.set('importedCount', importedCount.toString());
  return NextResponse.redirect(redirectUrl);
}
