import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          console.log('[Supabase Server] Setting cookies:', cookiesToSet.map(c => c.name).join(', '));
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                secure: false, // process.env.NODE_ENV === 'production',
                path: '/',
                sameSite: 'lax',
              })
            )
          } catch (e) {
            console.error('[Supabase Server] Error setting cookies:', e);
          }
        },
      },
    }
  )
}
