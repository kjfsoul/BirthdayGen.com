import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { searchParams } = new URL(window.location.href);
            const code = searchParams.get('code');
            const next = searchParams.get('next') || '/contacts';

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    console.error('Error exchanging code for session:', error);
                    navigate('/auth?error=exchange_failed');
                } else {
                    navigate(next);
                }
            } else {
                // Handle implicit flow or just redirect if session exists
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    navigate(next);
                } else {
                    navigate('/auth');
                }
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Verifying authentication...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
        </div>
    );
}
