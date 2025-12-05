'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * Wraps protected routes and redirects to /auth if no session exists.
 * Shows a loading spinner while checking session state.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Show loading spinner while checking session
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Redirect to auth if no session
    if (!session) {
        // Pass the current location so we can redirect back after login
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Session exists, render children
    return <>{children}</>;
}

export default ProtectedRoute;
