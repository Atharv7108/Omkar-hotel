'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Mock authentication - in production, this would call an API
        // Default credentials: admin@omkarhotel.com / admin123
        if (formData.email === 'admin@omkarhotel.com' && formData.password === 'admin123') {
            // Store auth token in localStorage (in production, use httpOnly cookies)
            localStorage.setItem('adminAuth', 'true');
            router.push('/admin');
        } else {
            setError('Invalid email or password');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        Omkar Hotel
                    </h1>
                    <p className="text-white/80">Admin Dashboard</p>
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
