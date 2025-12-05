/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeFacebookData, mapToPrismaContacts } from "@/lib/contacts-import";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string || 'placeholder-user-id';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let jsonData: any[] = [];

    if (file.name.toLowerCase().endsWith('.zip')) {
      // Handle ZIP file
      const buffer = Buffer.from(await file.arrayBuffer());
      const zip = await JSZip.loadAsync(buffer);

      // Look for friends JSON files
      const friendsFiles = Object.keys(zip.files).filter(name =>
        name.match(/friends.*\.json/i) ||
        name.match(/friends_and_followers\/friends\.json/i)
      );

      for (const fileName of friendsFiles) {
        const fileContent = await zip.files[fileName].async('text');
        try {
          const data = JSON.parse(fileContent);
          if (Array.isArray(data)) {
            jsonData.push(...data);
          } else {
            jsonData.push(data);
          }
        } catch (error) {
          console.error(`Failed to parse ${fileName}:`, error);
        }
      }
    } else if (file.name.toLowerCase().endsWith('.json')) {
      // Handle direct JSON file
      const content = await file.text();
      try {
        const data = JSON.parse(content);
        jsonData = Array.isArray(data) ? data : [data];
      } catch {
        return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid file type. Please upload .zip or .json' }, { status: 400 });
    }

    if (jsonData.length === 0) {
      return NextResponse.json({ error: 'No contact data found in file' }, { status: 400 });
    }

    const contacts = normalizeFacebookData(jsonData, file.name);

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found' }, { status: 400 });
    }

    const upsertData = mapToPrismaContacts(userId, contacts);

    // Upsert contacts
    for (const data of upsertData) {
      await db.contact.upsert(data);
    }

    // Record import job
    await db.importJob.create({
      data: {
        userId,
        provider: 'facebook',
        status: 'completed',
        meta: { contactsImported: contacts.length },
      },
    });

    return NextResponse.json({
      success: true,
      contactsImported: contacts.length,
    });
  } catch (error) {
    console.error('Facebook import error:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}
