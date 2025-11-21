# Architect Mode Rules (Non-Obvious Only)

This file contains ONLY non-obvious, project-specific architectural constraints discovered by reading the codebase.

## Architectural Constraints

- **Server Design**: server.ts is the single entry point combining Next.js standalone + Socket.IO - not standard Next.js setup. All server logic must go here, API routes cannot handle real-time features.

- **Database Coupling**: Complex Prisma schema with RLS policies - all database operations use raw SQL or Prisma client only. No other ORMs supported. Relationships between User/Profile/Contact are tightly coupled.

- **Auth Integration**: Supabase auth with custom user schema (aura_type, aura_quiz_completed fields) - standard NextAuth patterns don't apply. Authentication state affects all data access.

- **Component Architecture**: ShadCN/UI with class-variance-authority - all variants must be predefined. Dynamic imports used extensively for performance but affect bundle splitting.

- **Build System**: Custom build process (prisma generate + next build) with 'standalone' output - file tracing includes specific paths. Not compatible with standard Next.js deployment patterns.

- **Code Quality**: ESLint heavily customized with most rules disabled - TypeScript strict mode enabled but `noImplicitAny: false`. Code review must focus on runtime safety, not lint compliance.

- **Testing Strategy**: Jest setup with @testing-library/react - tests excluded from TS compilation. Test directory structure doesn't follow standard conventions.

- **State Management**: Custom hooks (use-toast, use-mobile) built on Zustand - not standard React patterns. Analytics tracking integrated throughout component tree.
