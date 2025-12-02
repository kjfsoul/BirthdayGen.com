import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

// Import pages (we might need to adapt these if they are Server Components)
// For now, we assume they can be rendered as Client Components or we will fix errors as they arise.
// We need to import the default export from the page files.

// Lazy load pages to avoid circular dependencies and huge bundle
const Home = React.lazy(() => import('@/app/page'));
const Generator = React.lazy(() => import('@/app/generator/page'));
const Gifts = React.lazy(() => import('@/app/gifts/page'));
const Auth = React.lazy(() => import('@/app/auth/page'));
const AuthCallback = React.lazy(() => import('@/app/auth/Callback'));

// Layout wrapper
const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
            {children}
        </main>
        <Footer />
    </div>
);

function App() {
    return (
        <Router>
            <Layout>
                <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/generator" element={<Generator />} />
                        <Route path="/gifts" element={<Gifts />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        {/* Add more routes as needed */}
                    </Routes>
                </React.Suspense>
            </Layout>
        </Router>
    );
}

export default App;
