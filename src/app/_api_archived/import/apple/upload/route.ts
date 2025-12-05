import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeVCard, mapToPrismaContacts } from "@/lib/contacts-import";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string || 'placeholder-user-id';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.vcf')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contacts = normalizeVCard(buffer);

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts found in file' }, { status: 400 });
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
        provider: 'apple',
        status: 'completed',
        meta: { contactsImported: contacts.length },
      },
    });

    return NextResponse.json({
      success: true,
      contactsImported: contacts.length,
    });
  } catch (error) {
    console.error('Apple VCF import error:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}
