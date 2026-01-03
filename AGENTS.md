# AGENTS.md

## 🧬 Project DNA

**Project Name:** BirthdayGen.com **Framework Identity:** Next.js 14 App Router
(React 18+) **Operational Mode:** STRICT

> [!IMPORTANT]
> This project is a **Next.js 14 App Router** application. It is **NOT** a Vite
> Single Page App (SPA). It is **NOT** a Create React App (CRA). Any attempt to
> introduce `vite`, `vite.config.ts`, `react-router-dom`, or `index.html` is a
> critical violation of Project DNA.

## 🛠️ Technology Stack

### Core Framework

- **Next.js 14+** (App Router)
- **TypeScript** (Strict Mode)
- **React 18+** (Server Components by default)

### Styling & UI

- **Tailwind CSS** (v3+)
- **shadcn/ui** (Radix Primitives)
- **Lucide React** (Icons)
- **Animations:** Framer Motion (optional), CSS Native

### Database & Auth

- **Supabase** (Postgres + Auth)
- **Supabase SSR** (`@supabase/ssr`) for Next.js Middleware/Server Actions
- **Prisma** (ORM)

### Testing

- **Jest** (Unit/Integration)
- **React Testing Library** (Component Testing)
- **Configuration:** `next/jest` + `jsdom`

## 📜 Rules of Engagement

### 1. The "Zero-Zombie" Policy

- **NO** `vite.config.ts` or `vite.config.js`.
- **NO** `index.html` in root (Next.js uses `src/app/layout.tsx`).
- **NO** `react-router-dom` imports (`useLocation`, `useNavigate`, `Link` from
  `react-router`).
  - **USE:** `next/navigation` (`usePathname`, `useRouter`) and `next/link`.

### 2. Implementation Standards

- **Routing:** All routes must exist in `src/app/`. Use file-system routing.
- **Components:** Default to Server Components. Add `'use client'` explicitly
  only when hooks/interactivity are required.
- **Data Fetching:** Prefer Server Components + server-side data fetching over
  `useEffect` client fetching where possible.
- **Middleware:** Use `src/middleware.ts` for route protection and Supabase
  session management.

### 3. Testing Standards

- **Framework:** Use Jest + RTL.
- **Execution:** `npm test` must pass before major merges.
- **Mocks:** Mock external services (Supabase, OpenAI, Redis) in `jest.setup.ts`
  or individual test files. Avoid testing implementation details.

### 4. Dependency Management

- **Installing:** Use `npm install`.
- **Cleaning:** If build fails, run `rm -rf .next node_modules && npm install`.

## 🚨 Emergency Protocols

If you detect `vite` dependencies or `react-router-dom` in `package.json`:

1. **STOP.**
2. **PURGE** the offending dependencies.
3. **RESTORE** Next.js configuration.
4. **REPORT** the violation immediately.

---

_Verified & Codified by Agent Antigravity during The Restoration._
