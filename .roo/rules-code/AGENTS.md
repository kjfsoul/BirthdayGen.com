# Code Mode Rules (Non-Obvious Only)

This file contains ONLY non-obvious, project-specific coding rules discovered by reading the codebase.

## Critical Project-Specific Patterns

- **Server Architecture**: Custom server.ts file combines Next.js standalone with Socket.IO - not standard Next.js setup. All server logic including Socket.IO must be in server.ts, not in API routes.

- **Dev Workflow**: `npm run dev` uses nodemon with tsx to run server.ts directly, not Next.js dev server. Server watches both server.ts and src/ files with custom extensions.

- **Database**: PostgreSQL with Prisma ORM. All database operations use raw SQL or Prisma client - no other ORMs supported. Schema includes complex relations with RLS (Row Level Security) policies.

- **Testing**: Uses Jest with @testing-library/react for React components. Tests are in `__tests__` folders but excluded from TypeScript compilation (see tsconfig.json excludes). Run tests with `npx jest <file>`.

- **Styling**: Tailwind CSS with custom config, ShadCN/UI components. Uses tailwindcss-animate plugin. All components use className with class-variance-authority for variants.

- **ESLint**: Most rules disabled in eslint.config.mjs except core Next.js requirements. TypeScript strict mode enabled but `noImplicitAny: false`. Many React/TypeScript rules turned off.

- **Build Process**: `npm run build` runs `prisma generate && next build`. Output configured for 'standalone' deployment with custom file tracing includes for autosend and API routes.

- **Environment Variables**: Requires DATABASE_URL for Prisma. Uses Supabase for auth and database. Socket.IO integration requires proper server setup.
