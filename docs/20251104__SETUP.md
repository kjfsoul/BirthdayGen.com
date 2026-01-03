# BirthdayGen.com Setup Guide

**Last Updated:** 2025-11-04
**Status:** Comprehensive setup documentation

---

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (package manager)
- Git
- Supabase account (for backend)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd BirthdayGen.com

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Generate Prisma client
pnpm run db:generate

# Run development server
pnpm run dev
```

---

## Environment Variables

Required environment variables (see `SUPABASE_SETUP.md` for details):

```bash
# Supabase
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Google Contacts (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=...
```

---

## Database Setup

See `SUPABASE_SETUP.md` for complete database setup instructions.

---

## Development Workflow

### Starting Development
```bash
pnpm run dev  # Start development server
```

### Running Tests
```bash
pnpm run lint      # Lint code
pnpm run typecheck # Type check
```

### Database Operations
```bash
pnpm run db:generate  # Generate Prisma client
pnpm run db:push      # Push schema changes
pnpm run db:migrate   # Run migrations
pnpm run db:seed      # Seed database
```

---

## Project Setup Scripts

For automated setup, see:
- `setup.md` - Project setup instructions
- `scripts/project-setup.sh` - Automated setup script

---

## Additional Resources

- **Backend Setup:** `SUPABASE_SETUP.md`
- **Feature List:** `FEATURE_LIST.md`
- **Current Goals:** `CURRENT_GOALS.md`
- **Architecture:** See `docs/` directory

---

**Note:** This consolidates setup information from `setup.md`, `SETUP_COMPLETE.md`, and `README.md` setup sections.
