# Stripe & Environment Variable Strategy

## Environment Variables (Vercel + Vite)
To ensure compatibility between Vercel's `NEXT_PUBLIC_` variables and Vite:
1.  `vite.config.ts` has been configured with `envPrefix: ['VITE_', 'NEXT_PUBLIC_']`.
2.  This allows `NEXT_PUBLIC_` variables to be accessed via `import.meta.env.NEXT_PUBLIC_...`.

## Single Supabase Project Stripe Strategy
Since we are limited to a single Supabase project, we use a "Stripe Mode" strategy to separate Test and Live payments.

### 1. Supabase Secrets
Store **BOTH** keys in the single Supabase project:
```bash
npx supabase secrets set \
  STRIPE_TEST_KEY="sk_test_..." \
  STRIPE_LIVE_KEY="sk_live_..."
```

### 2. Edge Function Logic
In `supabase/functions/create-checkout/index.ts` (when created):
```typescript
serve(async (req) => {
  const { isTestMode, ...data } = await req.json()

  const stripeKey = isTestMode
    ? Deno.env.get('STRIPE_TEST_KEY')
    : Deno.env.get('STRIPE_LIVE_KEY')

  const stripe = new Stripe(stripeKey, { ... })
  // ...
})
```

### 3. Frontend Control
The frontend determines the mode based on the Vercel environment.

**Vercel Env Vars:**
- `VITE_STRIPE_MODE` = `live` (Production)
- `VITE_STRIPE_MODE` = `test` (Preview/Dev)

**Frontend Code:**
```typescript
const isTestMode = import.meta.env.VITE_STRIPE_MODE === 'test';

const { data, error } = await supabase.functions.invoke('create-checkout', {
  body: {
    priceId: '...',
    isTestMode: isTestMode
  }
})
```

### 4. Data Management
**Warning:** Test and Live users will coexist in the same `auth.users` table.
- **Action:** periodically manually delete "Test" users from the Supabase dashboard.
