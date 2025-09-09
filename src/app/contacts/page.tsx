import { Suspense } from 'react';
import { ContactList } from '@/components/contacts/ContactList';
import { UpcomingBirthdays } from '@/components/contacts/UpcomingBirthdays';
import { ImportAppleVCF } from '@/components/contacts/ImportAppleVCF';
import { ImportGoogle } from '@/components/contacts/ImportGoogle';
import { ImportMicrosoft } from '@/components/contacts/ImportMicrosoft';
import { ImportLinkedInCSV } from '@/components/contacts/ImportLinkedInCSV';
import { ImportFacebook } from '@/components/contacts/ImportFacebook';

export const metadata = { title: "Contacts Dashboard" };

export default function ContactsPage() {
  return (
    <main className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contacts Dashboard</h1>
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
