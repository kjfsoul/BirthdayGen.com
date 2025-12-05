export const metadata = { title: "Terms of Service — BirthdayGen" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using BirthdayGen, you accept and agree to be bound by the terms
          and provision of this agreement.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use BirthdayGen for personal, non-commercial
          transitory viewing only.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on BirthdayGen are provided on an &apos;as is&apos; basis. BirthdayGen makes no
          warranties, expressed or implied, and hereby disclaims and negates all other warranties
          including without limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual property or other
          violation of rights.
        </p>

        <h2>4. Limitations</h2>
        <p>
          In no event shall BirthdayGen or its suppliers be liable for any damages (including,
          without limitation, damages for loss of data or profit, or due to business interruption)
          arising out of the use or inability to use BirthdayGen.
        </p>

        <h2>5. Privacy Policy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy, which also governs
          your use of BirthdayGen, to understand our practices.
        </p>

        <h2>6. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us.
        </p>
      </div>
    </main>
  );
}
