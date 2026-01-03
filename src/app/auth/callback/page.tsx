'use client';
import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const processedRef = useRef(false);

    useEffect(() => {
        const handleAuthCallback = async () => {
            if (processedRef.current) return;
            processedRef.current = true;

            const code = searchParams?.get('code');
            const next = searchParams?.get('next') || '/contacts';

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    console.error('Error exchanging code for session:', error);
                    router.push('/auth?error=exchange_failed');
                } else {
                    router.push(next);
                }
            } else {
                // Handle implicit flow or just redirect if session exists
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    router.push(next);
                } else {
                    router.push('/auth');
                }
            }
        };

        handleAuthCallback();
    }, [router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Verifying authentication...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
        </div>
    );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
