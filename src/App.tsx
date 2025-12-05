import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Debug component to log route changes
function RouteDebugger() {
    const location = useLocation();
    useEffect(() => {
        console.log('🔄 Route changed to:', location.pathname);
    }, [location]);
    return null;
}

// Lazy load pages for code splitting
const Home = React.lazy(() => import('@/app/page'));
const Generator = React.lazy(() => import('@/app/generator/page'));
const Gifts = React.lazy(() => import('@/app/gifts/page'));
const Auth = React.lazy(() => import('@/app/auth/page'));
const AuthCallback = React.lazy(() => import('@/app/auth/Callback'));
const ForgotPassword = React.lazy(() => import('@/app/auth/forgot-password/page'));
const UpdatePassword = React.lazy(() => import('@/app/auth/update-password/page'));
const AuthCodeError = React.lazy(() => import('@/app/auth/auth-code-error/page'));
const Contacts = React.lazy(() => import('@/app/contacts/page'));
const AutoPopulate = React.lazy(() => import('@/app/contacts/autopopulate/page'));
const CardPage = React.lazy(() => import('@/app/cards/[cardId]/page'));

function App() {
    return (
        <Router>
            <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <div className="flex flex-col min-h-screen">
                    <Header />
                    <RouteDebugger />
                    <main className="flex-grow">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                            <Route path="/auth/update-password" element={<UpdatePassword />} />
                            <Route path="/auth/auth-code-error" element={<AuthCodeError />} />

                            {/* Protected Routes */}
                            <Route path="/generator" element={
                                <ProtectedRoute>
                                    <Generator />
                                </ProtectedRoute>
                            } />
                            <Route path="/gifts" element={
                                <ProtectedRoute>
                                    <Gifts />
                                </ProtectedRoute>
                            } />
                            <Route path="/contacts" element={
                                <ProtectedRoute>
                                    <Contacts />
                                </ProtectedRoute>
                            } />
                            <Route path="/contacts/autopopulate" element={
                                <ProtectedRoute>
                                    <AutoPopulate />
                                </ProtectedRoute>
                            } />
                            <Route path="/cards/:cardId" element={
                                <ProtectedRoute>
                                    <CardPage />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </React.Suspense>
        </Router>
    );
}

export default App;
