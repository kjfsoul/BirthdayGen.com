'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Contact {
  id: string;
  fullName: string;
  birthday?: string;
}

interface UpcomingBirthday {
  contact: Contact;
  nextBirthday: Date;
  daysUntil: number;
}

export function UpcomingBirthdays() {
  const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);
  const [horizon, setHorizon] = useState(60); // days
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/contacts?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const contactsWithBirthdays = data.filter((c: Contact) => c.birthday);

          const upcoming: UpcomingBirthday[] = contactsWithBirthdays
            .map((contact: Contact) => {
              if (!contact.birthday) return null;
              const birthday = new Date(contact.birthday);
              const now = new Date();
              const currentYear = now.getFullYear();

              // Calculate next birthday
              let nextBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate());

              // If birthday has passed this year, move to next year
              if (nextBirthday < now) {
                nextBirthday = new Date(currentYear + 1, birthday.getMonth(), birthday.getDate());
              }

              const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              return {
                contact,
                nextBirthday,
                daysUntil,
              };
            })
            .filter((item): item is UpcomingBirthday => item !== null && item.daysUntil <= horizon)
            .sort((a: UpcomingBirthday, b: UpcomingBirthday) => a.daysUntil - b.daysUntil);

          setBirthdays(upcoming);
        }
      } catch (error) {
        console.error('Failed to fetch contacts', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchContacts();
    }
  }, [horizon, userId]);

  if (loading) {
    return <div>Loading upcoming birthdays...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Birthdays</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={horizon === 30 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHorizon(30)}
            >
              30 days
            </Button>
            <Button
              variant={horizon === 60 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHorizon(60)}
            >
              60 days
            </Button>
            <Button
              variant={horizon === 90 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHorizon(90)}
            >
              90 days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {birthdays.length === 0 ? (
          <p className="text-muted-foreground">No upcoming birthdays in the next {horizon} days</p>
        ) : (
          <div className="space-y-4">
            {birthdays.map(({ contact, nextBirthday, daysUntil }) => (
              <div key={contact.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h3 className="font-medium">{contact.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {nextBirthday.toLocaleDateString()} ({daysUntil} days)
                  </p>
                </div>
                <Link href={`/gifts?contactId=${contact.id}`}>
                  <Button variant="outline" size="sm">
                    Personalize Gift
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
