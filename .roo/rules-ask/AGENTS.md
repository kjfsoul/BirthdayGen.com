# Ask Mode Rules (Non-Obvious Only)

This file contains ONLY non-obvious, project-specific documentation context rules discovered by reading the codebase.

## Documentation Context

- **Architecture Overview**: Custom Next.js + Socket.IO server in server.ts (not standard Next.js API routes). Database uses Prisma with complex RLS relationships. Tests in __tests__ folders but excluded from TS compilation.

- **Hidden Dependencies**: Socket.IO integration requires specific server setup. Supabase auth uses custom user schema with aura_quiz fields. Tailwind uses class-variance-authority for component variants.

- **Counterintuitive Structure**: server.ts is the main entry point (not next dev). Build process runs prisma generate automatically. ESLint heavily customized with most rules disabled.

- **Component Patterns**: ShadCN/UI components with custom className patterns. Dynamic imports used for performance. Analytics tracking integrated throughout UI components.
