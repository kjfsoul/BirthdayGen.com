# 🚀 Welcome to Z.ai Code Scaffold
# 🎉 BirthdayGen

A modern Next.js (App Router) + TypeScript + Tailwind + shadcn/ui app for creating and automating personalized celebration cards. Backend is **Supabase Postgres** with **Prisma** as the ORM; auth is **Supabase Auth**. This README is optimized for rapid onboarding and LLM handoff. Need to do this for an update.

---

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- **State/Data:** TanStack Query, Zustand (where applicable)
- **Backend:** Supabase Postgres (+ Storage, RLS, Edge Functions)
- **ORM:** Prisma (mapped to Supabase DB)
- **Auth:** Supabase Auth (Email/Password, Google)
- **Tooling:** tsx, Prisma Studio, ESLint/Prettier
- **Optional:** Socket.IO, n8n/CrewAI integrations

---

## Project Layout (high level)

This scaffold provides a robust foundation built with:

### 🎯 Core Framework
- **⚡ Next.js 15** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Axios** - Promise-based HTTP client

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation Node.js and TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution

### 🎨 Advanced UI Features
- **📊 TanStack Table** - Headless UI for building tables and datagrids
- **🖱️ DND Kit** - Modern drag and drop toolkit for React
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing

### 🌍 Internationalization & Utilities
- **🌍 Next Intl** - Internationalization library for Next.js
- **📅 Date-fns** - Modern JavaScript date utility library
- **🪝 ReactUse** - Collection of essential React hooks for modern development

## 🎯 Why This Scaffold?

- **🏎️ Fast Development** - Pre-configured tooling and best practices
- **🎨 Beautiful UI** - Complete shadcn/ui component library with advanced interactions
- **🔒 Type Safety** - Full TypeScript configuration with Zod validation
- **📱 Responsive** - Mobile-first design principles with smooth animations
- **🗄️ Database Ready** - Prisma ORM configured for rapid backend development
- **🔐 Auth Included** - NextAuth.js for secure authentication flows
- **📊 Data Visualization** - Charts, tables, and drag-and-drop functionality
- **🌍 i18n Ready** - Multi-language support with Next Intl
- **🚀 Production Ready** - Optimized build and deployment settings
- **🤖 AI-Friendly** - Structured codebase perfect for AI assistance

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

## Environment
Add these variables for Google Contacts import (People API):

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH_REDIRECT_URI=https://yourdomain.com/api/import/callback/google
GOOGLE_PEOPLE_SCOPES=https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/contacts.other.readonly
GOOGLE_OAUTH_CLIENT_JSON_PATH=/path/to/client_secret.json
```

## 🤖 Powered by Z.ai

This scaffold is optimized for use with [Z.ai](https://chat.z.ai) - your AI assistant for:

- **💻 Code Generation** - Generate components, pages, and features instantly
- **🎨 UI Development** - Create beautiful interfaces with AI assistance
- **🔧 Bug Fixing** - Identify and resolve issues with intelligent suggestions
- **📝 Documentation** - Auto-generate comprehensive documentation
- **🚀 Optimization** - Performance improvements and best practices

Ready to build something amazing? Start chatting with Z.ai at [chat.z.ai](https://chat.z.ai) and experience the future of AI-powered development!

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and configurations
```

## 🦶 Footer

The footer is a responsive, accessible component that displays site navigation links organized into three sections: Tools, Community, and Company. Links are sourced from a centralized config file (`src/config/footerLinks.ts`) for easy maintenance.

### Editing Footer Links

To modify footer links, edit `src/config/footerLinks.ts`. The config uses a typed structure:

```typescript
export type FooterSection = { title: string; items: { label: string; href: string }[] };
```

Add, remove, or update sections and links as needed. The footer component automatically renders the updated configuration.

### Internationalization

Footer titles support Next Intl. Add translation keys to your messages files (e.g., `tools`, `community`, `company`) for multi-language support.

## 🧭 Header Navigation

The header provides sticky navigation with clear information scent and a focused primary CTA. It includes:

- **Logo**: Links to home page
- **Primary Nav**: Card Maker, Party Planner, Gift Guide, Blog
- **Secondary Nav**: Community, Showcase (in mobile drawer)
- **Auth**: Sign in, Sign up free (primary CTA)
- **Search**: Optional search functionality

### Navigation Rules

- Primary navigation focuses on core value props (making cards, planning parties, finding gifts)
- Blog link drives content discovery and SEO
- Mobile drawer preserves all navigation while maintaining clean desktop design
- Active route highlighting provides clear user orientation

## 📧 Newsletter Subscription

Newsletter signup is handled via `src/app/api/subscribe/route.ts` with Supabase backend integration.

### API Endpoint

- **Route**: `POST /api/subscribe`
- **Body**: `{ email: string, referral?: string }`
- **Response**: `{ ok: boolean, message: string }`

### Implementation Notes

- Email validation with regex
- TODO: Implement proper database storage (currently logs to console)
- Rate limiting and honeypot protection recommended for production

## 📊 Analytics Events

Key user events are tracked via `src/lib/analytics.ts`:

- `page_view`: Page visits
- `nav_click`: Navigation link clicks
- `cta_click`: Call-to-action button clicks
- `subscribe_submit`: Newsletter subscription attempts
- `signup_open`: Authentication modal opens

### Usage

```typescript
import { trackEvent } from '@/lib/analytics'

trackEvent({ event: 'cta_click', href: '/generator' })
```

Events log to console in development; integrate with analytics service in production.

## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag and drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Axios + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Internationalization**: Multi-language support with Next Intl
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Essential Hooks**: 100+ useful React hooks with ReactUse for common patterns

## 📱 Contacts Dashboard & Imports

The Contacts Dashboard at `/contacts` provides comprehensive contact management with multiple import options.

### Import Methods

- **Apple**: Export VCF from iCloud → upload to parse and import contacts
- **Google**: Click Connect (uses existing People API integration)
- **Outlook**: Sign in with Microsoft (stubbed for future Graph API)
- **LinkedIn**: Export connections CSV → upload with header mapping
- **Facebook**: Download "Your Information" as JSON or ZIP → upload to parse friends data

### Features

- Search and filter contacts by name, email, category
- Category management with CRUD operations
- Upcoming birthdays with gift personalization links
- Secure user-scoped data with Supabase RLS

### Environment Variables

Add placeholders for future Facebook Graph integration:

```
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_REDIRECT_URI=https://birthdaygen.com/api/import/facebook/callback
```

## 🤝 Get Started with Z.ai

1. **Clone this scaffold** to jumpstart your project
2. **Visit [chat.z.ai](https://chat.z.ai)** to access your AI coding assistant
3. **Start building** with intelligent code generation and assistance
4. **Deploy with confidence** using the production-ready setup

---

Built with ❤️ for the developer community. Supercharged by [Z.ai](https://chat.z.ai) 🚀
