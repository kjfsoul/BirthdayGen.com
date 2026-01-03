import { Metadata } from 'next';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching

export const metadata: Metadata = { title: "Auto-send Cards & Gifts — Coming Soon" };

export default async function AutosendPage() {
  // TODO: Add dynamic server-side data fetching here when ready
  // Example:
  // const data = await prisma.something.findMany();
  // const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Auto-send Cards & Gifts</h1>
      <p className="text-muted-foreground mt-2">Coming soon.</p>
    </main>
  );
}
