'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check authentication (skip for login page)
        if (pathname !== '/admin/login') {
            const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
            if (!isAuthenticated) {
                router.push('/admin/login');
            }
        }
    }, [pathname, router]);

    // Don't show layout on login page
    if (pathname === '/admin/login') {
        return children;
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: '📊' },
        { name: 'Bookings', href: '/admin/bookings', icon: '📅' },
        { name: 'Rooms', href: '/admin/rooms', icon: '🏨' },
        { name: 'Rates', href: '/admin/rates', icon: '💰' },
        { name: 'Guests', href: '/admin/guests', icon: '👥' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-neutral-200 z-40">
                {/* Logo */}
                <div className="p-6 border-b border-neutral-200">
                    <h1 className="text-2xl font-display font-bold text-neutral-900">
                        Omkar Hotel
                    </h1>
                    <p className="text-sm text-neutral-600 mt-1">Admin Dashboard</p>
                </div>

                {/* Navigation */}
                <nav className="p-4">
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                ? 'bg-brand-primary text-white'
                                                : 'text-neutral-700 hover:bg-neutral-100'
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <span>🚪</span>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64">
                {/* Top Bar */}
                <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
                    <div className="px-8 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-neutral-900">
                                {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-neutral-600">
                                {new Date().toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-semibold">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
