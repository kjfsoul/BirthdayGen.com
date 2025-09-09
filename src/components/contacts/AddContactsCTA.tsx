"use client";
import { useState } from "react";
import Link from "next/link";

export default function AddContactsCTA() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mx-auto max-w-3xl my-8 rounded-2xl border p-6 text-center">
      <h2 className="text-2xl font-semibold">Add Contacts</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Import your people to unlock personalized cards & gift recommendations.
      </p>
      <div className="mt-4">
        <button
          onClick={() => { setOpen(true); console.info("contacts_cta_opened"); }}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
        >
          Get Started
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Import Contacts</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-sm">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {/* Apple VCF */}
              <div className="border rounded-xl p-3 text-left">
                <h4 className="font-medium">Apple (VCF)</h4>
                <p className="text-xs text-muted-foreground">Upload a .vcf file exported from iCloud Contacts.</p>
                <form
                  method="post"
                  action="/api/import/apple/upload"
                  encType="multipart/form-data"
                  className="mt-2"
                  onSubmit={() => console.info("apple_import_started")}
                >
                  <input name="file" type="file" accept=".vcf,.vcard" className="text-xs" required />
                  <button className="mt-2 rounded-md border px-2 py-1 text-xs hover:bg-accent" type="submit">
                    Upload VCF
                  </button>
                </form>
              </div>

              {/* Google People API (existing) */}
              <div className="border rounded-xl p-3 text-left">
                <h4 className="font-medium">Google</h4>
                <p className="text-xs text-muted-foreground">Connect your Google Contacts securely.</p>
                <Link
                  href="/api/import/google/start"
                  onClick={() => console.info("google_import_started")}
                  className="inline-block mt-2 rounded-md border px-2 py-1 text-xs hover:bg-accent"
                >
                  Connect Google
                </Link>
              </div>

              {/* Microsoft Graph (stubbed) */}
              <div className="border rounded-xl p-3 text-left">
                <h4 className="font-medium">Outlook</h4>
                <p className="text-xs text-muted-foreground">Sign in with Microsoft (coming soon).</p>
                <Link
                  href="/api/import/microsoft/start"
                  onClick={() => console.info("microsoft_import_started")}
                  className="inline-block mt-2 rounded-md border px-2 py-1 text-xs hover:bg-accent"
                >
                  Connect Outlook
                </Link>
              </div>

              {/* Social / LinkedIn CSV */}
              <div className="border rounded-xl p-3 text-left">
                <h4 className="font-medium">Social (CSV)</h4>
                <p className="text-xs text-muted-foreground">Upload a LinkedIn CSV export to import contacts.</p>
                <form
                  method="post"
                  action="#"
                  className="mt-2"
                  onSubmit={(e) => { e.preventDefault(); alert("CSV import not implemented yet."); }}
                >
                  <input name="file" type="file" accept=".csv" className="text-xs" required />
                  <button className="mt-2 rounded-md border px-2 py-1 text-xs hover:bg-accent" type="submit">
                    Upload CSV
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
