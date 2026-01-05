'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        { name: 'Dashboard', href: '/admin', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )},
        { name: 'Bookings', href: '/admin/bookings', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )},
        { name: 'Rooms', href: '/admin/rooms', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )},
        { name: 'Rates', href: '/admin/rates', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )},
        { name: 'Guests', href: '/admin/guests', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )},
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        router.push('/admin/login');
    };

    const currentPage = navigation.find((item) => item.href === pathname)?.name || 'Dashboard';

    return (
        <div className="admin-root min-h-screen bg-slate-50">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 transition-all duration-300 flex flex-col ${
                sidebarCollapsed ? 'w-20' : 'w-64'
            } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                {/* Logo */}
                <div className="py-6 px-4 border-b border-white/10">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <span className="text-white font-bold text-base">O</span>
                            </div>
                            <div>
                                <h1 className="text-white font-semibold text-sm">Omkar Hotel</h1>
                                <p className="text-slate-400 text-[10px]">Admin Panel</p>
                            </div>
                        </div>
                    )}
                    {sidebarCollapsed && (
                        <div className="w-full flex justify-center">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <span className="text-white font-bold text-base">O</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <p className={`text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 ${sidebarCollapsed ? 'hidden' : ''}`}>Menu</p>
                    <ul className="space-y-1.5">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                            isActive
                                                ? 'bg-teal-500/20 text-teal-400'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                        title={sidebarCollapsed ? item.name : undefined}
                                    >
                                        <span className={`flex-shrink-0 ${isActive ? 'text-teal-400' : 'group-hover:text-white'}`}>
                                            {item.icon}
                                        </span>
                                        {!sidebarCollapsed && (
                                            <span className="font-medium text-sm">{item.name}</span>
                                        )}
                                        {isActive && !sidebarCollapsed && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Collapse Toggle & Logout */}
                <div className="p-4 border-t border-white/10 space-y-2 mt-auto">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                        {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? 'Logout' : undefined}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!sidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
                    <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <button 
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">{currentPage}</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Quick actions */}
                            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>New Booking</span>
                            </button>
                            {/* Notifications */}
                            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            {/* Date */}
                            <div className="hidden md:block text-sm text-slate-500 px-3 py-1.5 bg-slate-50 rounded-lg">
                                {new Date().toLocaleDateString('en-IN', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                })}
                            </div>
                            {/* Profile */}
                            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                                    A
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-slate-900">Admin</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-6">{children}</div>
            </main>
        </div>
    );
}
