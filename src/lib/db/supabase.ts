/**
 * Typed Supabase Server Client
 * 
 * Provides type-safe database access for server-side operations (API routes, server components)
 * Uses Database type from schema.ts for full type safety
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from './schema';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get typed Supabase server client
 * 
 * Usage in API routes:
 * ```ts
 * const supabase = await getSupabaseClient();
 * const { data, error } = await supabase.from('contacts').select('*');
 * ```
 */
export async function getSupabaseClient(): Promise<SupabaseClient<Database>> {
  return await createServerClient() as SupabaseClient<Database>;
}

/**
 * Get current authenticated user from Supabase
 */
export async function getCurrentUser() {
  const supabase = await getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Get user ID from Supabase auth (throws if not authenticated)
 */
export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user.id;
}
