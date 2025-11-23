'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ContactList } from '@/components/contacts/ContactList';
import { UpcomingBirthdays } from '@/components/contacts/UpcomingBirthdays';
import { ImportAppleVCF } from '@/components/contacts/ImportAppleVCF';
import { ImportGoogle } from '@/components/contacts/ImportGoogle';
import { ImportMicrosoft } from '@/components/contacts/ImportMicrosoft';
import { ImportLinkedInCSV } from '@/components/contacts/ImportLinkedInCSV';
import { ImportFacebook } from '@/components/contacts/ImportFacebook';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

function ContactsPageContent() {
  return (
    <main className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contacts Dashboard</h1>
        <Link href="/contacts/autopopulate">
          <Button className="gap-2" size="lg">
            <Sparkles className="h-5 w-5" />
            Auto-Populate
          </Button>
        </Link>
      </div>

      {/* Imports Panel */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Import Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Suspense fallback={<div className="p-4 border rounded">Loading Apple Import...</div>}>
            <ImportAppleVCF />
          </Suspense>
          <Suspense fallback={<div className="p-4 border rounded">Loading Google Import...</div>}>
            <ImportGoogle />
          </Suspense>
          <Suspense fallback={<div className="p-4 border rounded">Loading Microsoft Import...</div>}>
            <ImportMicrosoft />
          </Suspense>
          <Suspense fallback={<div className="p-4 border rounded">Loading LinkedIn Import...</div>}>
            <ImportLinkedInCSV />
          </Suspense>
          <Suspense fallback={<div className="p-4 border rounded">Loading Facebook Import...</div>}>
            <ImportFacebook />
          </Suspense>
        </div>
      </section>

      {/* Upcoming Birthdays */}
      <section className="space-y-4">
        <Suspense fallback={<div className="p-4 border rounded">Loading Upcoming Birthdays...</div>}>
          <UpcomingBirthdays />
        </Suspense>
      </section>

      {/* Contact List */}
      <section className="space-y-4">
        <Suspense fallback={<div className="p-4 border rounded">Loading Contacts...</div>}>
          <ContactList />
        </Suspense>
      </section>
    </main>
  );
}

function ContactsPageContentWithSearchParams() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (!searchParams) return;

    const searchParamsObj = new URLSearchParams(searchParams.toString());
    const importedCount = searchParamsObj.get('importedCount');
    const error = searchParamsObj.get('error');

    if (importedCount) {
      toast({
        title: 'Import Successful',
        description: `${importedCount} contacts were imported.`,
      });
    }

    if (error) {
      toast({
        title: 'Import Failed',
        description: 'There was an error importing your contacts. Please try again.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  return <ContactsPageContent />;
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactsPageContentWithSearchParams />
    </Suspense>
  );
}
