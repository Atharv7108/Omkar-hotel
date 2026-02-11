'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);

    // Check if redirected due to session expiry
    useEffect(() => {
        if (searchParams.get('expired') === 'true') {
            setSessionExpired(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSessionExpired(false);
        setIsLoading(true);

        // Mock authentication - in production, this would call an API
        // Default credentials: admin@omkarhotel.com / admin123
        if (formData.email === 'admin@omkarhotel.com' && formData.password === 'admin123') {
            // Store auth session with timestamp for expiry tracking
            const session = {
                authenticated: true,
                loginTime: Date.now(),
                lastActivity: Date.now(),
            };
            localStorage.setItem('adminSession', JSON.stringify(session));
            router.push('/admin');
        } else {
            setError('Invalid email or password');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Session Expired Alert */}
                {sessionExpired && (
                    <div className="mb-6 bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-amber-300 font-medium">Session Expired</p>
                            <p className="text-amber-300/70 text-sm">Your session expired due to inactivity. Please log in again.</p>
                        </div>
                    </div>
                )}

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src="/logo.png" alt="Omkar Hotel Logo" className="w-20 h-20 object-contain" />
                    </div>
                    <h1 className="text-4xl font-serif text-[#C9A66B] tracking-[0.15em] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        OMKAR
                    </h1>
                    <p className="text-[#C9A66B]/70 text-sm tracking-[0.3em] uppercase">HOTEL</p>
                    <p className="text-white/80 mt-3">Admin Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-neutral-900/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-neutral-700">
                    <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                        Sign In
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
                                placeholder="admin@omkarhotel.com"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-field bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-white text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-gold flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-900"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In →</span>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-white/10 rounded-lg">
                        <p className="text-xs text-white/70 text-center mb-2">Demo Credentials:</p>
                        <p className="text-sm text-white font-mono text-center">
                            admin@omkarhotel.com / admin123
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <a href="/" className="text-white/80 hover:text-white text-sm transition-colors">
                        ← Back to Website
                    </a>
                </div>
            </div>
        </div>
    );
}
