export type NormalizedContact = {
  fullName?: string;
  emails?: string[];
  birthday?: { year?: number; month?: number; day?: number };
  gender?: string;
  urls?: string[];
  photoUrl?: string;
};

export function normalizePeopleConnection(person: any): NormalizedContact {
  const name =
    person.names?.find((n: any) => n.metadata?.primary)?.displayName ?? person.names?.[0]?.displayName;
  const emails = (person.emailAddresses ?? []).map((e: any) => e.value).filter(Boolean);
  const b = person.birthdays?.[0]?.date;
  const gender = person.genders?.[0]?.value;
  const urls = (person.urls ?? []).map((u: any) => u.value).filter(Boolean);
  const photoUrl = person.photos?.find((p: any) => p.metadata?.primary)?.url ?? person.photos?.[0]?.url;
  return { fullName: name, emails, birthday: b ? { year: b.year, month: b.month, day: b.day } : undefined, gender, urls, photoUrl };
}

export function normalizeVCard(fileBuffer: Buffer): NormalizedContact[] {
  const content = fileBuffer.toString('utf-8');
  const contacts: NormalizedContact[] = [];
  const vcards = content.split('BEGIN:VCARD');

  for (const vcard of vcards.slice(1)) {
    const lines = vcard.split('\n').map(line => line.trim());
    let fullName = '';
    const emails: string[] = [];
    let birthday: { year?: number; month?: number; day?: number } | undefined;

    for (const line of lines) {
      if (line.startsWith('FN:')) {
        fullName = line.substring(3);
      } else if (line.startsWith('EMAIL')) {
        const email = line.split(':')[1];
        if (email) emails.push(email);
      } else if (line.startsWith('BDAY:')) {
        const bdayStr = line.substring(5);
        // Parse YYYY-MM-DD or --MM-DD
        const parts = bdayStr.split('-');
        if (parts.length === 3) {
          birthday = {
            year: parts[0] !== '--' ? parseInt(parts[0]) : undefined,
            month: parseInt(parts[1]),
            day: parseInt(parts[2]),
          };
        }
      }
    }

    if (fullName || emails.length > 0) {
      contacts.push({ fullName, emails, birthday });
    }
  }

  return contacts;
}

export function normalizeLinkedInCsv(csvText: string): NormalizedContact[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line =>
    line.split(',').map(cell => cell.trim().replace(/"/g, ''))
  );

  const contacts: NormalizedContact[] = [];
  const nameIndex = headers.indexOf('Name') !== -1 ? headers.indexOf('Name') : headers.findIndex(h => h.toLowerCase().includes('name'));
  const emailIndex = headers.indexOf('Email') !== -1 ? headers.indexOf('Email') : headers.findIndex(h => h.toLowerCase().includes('email'));
  const companyIndex = headers.indexOf('Company') !== -1 ? headers.indexOf('Company') : headers.findIndex(h => h.toLowerCase().includes('company'));
  const titleIndex = headers.indexOf('Title') !== -1 ? headers.indexOf('Title') : headers.findIndex(h => h.toLowerCase().includes('title'));
  const urlIndex = headers.indexOf('URL') !== -1 ? headers.indexOf('URL') : headers.findIndex(h => h.toLowerCase().includes('url'));

  for (const row of rows) {
    const fullName = nameIndex !== -1 ? row[nameIndex] : '';
    const emails: string[] = emailIndex !== -1 && row[emailIndex] ? [row[emailIndex]] : [];
    const urls: string[] = [];
    if (urlIndex !== -1 && row[urlIndex]) urls.push(row[urlIndex]);

    if (fullName || emails.length > 0) {
      contacts.push({ fullName, emails, urls });
    }
  }

  return contacts;
}

export function normalizeFacebookData(json: any | any[], fileNameHint?: string): NormalizedContact[] {
  const contacts: NormalizedContact[] = [];

  // Handle array of JSON objects or single object
  const data = Array.isArray(json) ? json : [json];

  for (const item of data) {
    let fullName = '';
    const emails: string[] = [];
    let birthday: { year?: number; month?: number; day?: number } | undefined;
    const urls: string[] = [];

    // Try to extract name
    if (item.name) {
      fullName = item.name;
    } else if (item.first_name && item.last_name) {
      fullName = `${item.first_name} ${item.last_name}`;
    } else if (item.displayName) {
      fullName = item.displayName;
    }

    // Try to extract email
    if (item.email) {
      emails.push(item.email);
    } else if (item.contact_email) {
      emails.push(item.contact_email);
    }

    // Try to extract birthday
    if (item.birthday) {
      const bdayStr = item.birthday;
      // Parse MM/DD/YYYY or YYYY-MM-DD
      if (bdayStr.includes('/')) {
        const parts = bdayStr.split('/');
        if (parts.length === 3) {
          birthday = {
            month: parseInt(parts[0]),
            day: parseInt(parts[1]),
            year: parseInt(parts[2]),
          };
        }
      } else if (bdayStr.includes('-')) {
        const parts = bdayStr.split('-');
        if (parts.length === 3) {
          birthday = {
            year: parseInt(parts[0]),
            month: parseInt(parts[1]),
            day: parseInt(parts[2]),
          };
        }
      }
    }

    // Try to extract profile URL
    if (item.profileUrl) {
      urls.push(item.profileUrl);
    } else if (item.url) {
      urls.push(item.url);
    } else if (item.link) {
      urls.push(item.link);
    }

    if (fullName || emails.length > 0) {
      contacts.push({ fullName, emails, birthday, urls });
    }
  }

  return contacts;
}

export function mapToPrismaContacts(userId: string, contacts: NormalizedContact[]): any[] {
  return contacts.map(contact => {
    const data: any = {
      userId,
      fullName: contact.fullName || '',
      emails: contact.emails || [],
      categoryIds: [], // Default empty, can be set later
    };

    if (contact.birthday) {
      if (contact.birthday.year && contact.birthday.month && contact.birthday.day) {
        // Full date
        data.birthday = new Date(contact.birthday.year, contact.birthday.month - 1, contact.birthday.day);
      } else if (contact.birthday.month && contact.birthday.day) {
        // Partial date - store in interests as JSON
        data.interests = {
          partialBirthday: {
            month: contact.birthday.month,
            day: contact.birthday.day,
          },
        };
      }
    }

    if (contact.gender) {
      data.gender = contact.gender;
    }

    if (contact.urls && contact.urls.length > 0) {
      data.social_handles = {
        urls: contact.urls,
      };
    }

    return {
      where: {
        userId_fullName: {
          userId,
          fullName: contact.fullName || '',
        },
      },
      update: data,
      create: data,
    };
  });
}
