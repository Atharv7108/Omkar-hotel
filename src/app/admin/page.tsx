'use client';

import { useEffect, useState } from 'react';
import OccupancyCalendar from '@/components/OccupancyCalendar';

interface DashboardStats {
    totalBookings: number;
    todayCheckIns: number;
    todayCheckOuts: number;
    occupancyRate: number;
    revenue: number;
    availableRooms: number;
}

interface RecentBooking {
    id: string;
    guestName: string;
    room: string;
    checkIn: string;
    status: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0,
        occupancyRate: 0,
        revenue: 0,
        availableRooms: 0,
    });
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('/api/admin/dashboard/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');

            const data = await response.json();
            setStats(data.stats);
            setRecentBookings(data.stats.recentBookings || []);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Bookings',
            value: stats.totalBookings,
            icon: '📊',
            color: 'from-blue-500 to-blue-600',
            suffix: '',
        },
        {
            title: "Today's Check-ins",
            value: stats.todayCheckIns,
            icon: '✅',
            color: 'from-green-500 to-green-600',
            suffix: '',
        },
        {
            title: "Today's Check-outs",
            value: stats.todayCheckOuts,
            icon: '🚪',
            color: 'from-orange-500 to-orange-600',
            suffix: '',
        },
        {
            title: 'Occupancy Rate',
            value: stats.occupancyRate,
            icon: '🏨',
            color: 'from-purple-500 to-purple-600',
            suffix: '%',
        },
        {
            title: 'Revenue (Month)',
            value: `₹${(stats.revenue / 1000).toFixed(0)}K`,
            icon: '💰',
            color: 'from-yellow-500 to-yellow-600',
            suffix: '',
            isCustomFormat: true,
        },
        {
            title: 'Available Rooms',
            value: stats.availableRooms,
            icon: '🛏️',
            color: 'from-teal-500 to-teal-600',
            suffix: '',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back, Admin!</h1>
                <p className="text-neutral-600">Here's what's happening with your hotel today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="card p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-neutral-900">
                                    {stat.isCustomFormat ? stat.value : `${stat.value}${stat.suffix}`}
                                </p>
                            </div>
                            <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                <span className="drop-shadow-lg">{stat.icon}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Bookings & Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-neutral-900">Recent Bookings</h3>
                        <a href="/admin/bookings" className="text-brand-primary hover:underline text-sm">
                            View All →
                        </a>
                    </div>

                    {recentBookings.length > 0 ? (
                        <div className="space-y-4">
                            {recentBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-neutral-900">{booking.guestName}</p>
                                        <p className="text-sm text-neutral-600">
                                            Room {booking.room} • {booking.checkIn}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'CONFIRMED'
                                            ? 'bg-green-100 text-green-700'
                                            : booking.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : booking.status === 'CHECKED_IN'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-neutral-100 text-neutral-700'
                                            }`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-neutral-500">
                            No recent bookings
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="card p-6">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-6">Quick Actions</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <a
                            href="/admin/bookings"
                            className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white hover:shadow-lg transition-shadow"
                        >
                            <div className="text-3xl mb-2">📅</div>
                            <p className="font-semibold">New Booking</p>
                        </a>

                        <a
                            href="/admin/rooms"
                            className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white hover:shadow-lg transition-shadow"
                        >
                            <div className="text-3xl mb-2">🏨</div>
                            <p className="font-semibold">Manage Rooms</p>
                        </a>

                        <a
                            href="/admin/rates"
                            className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white hover:shadow-lg transition-shadow"
                        >
                            <div className="text-3xl mb-2">💰</div>
                            <p className="font-semibold">Update Rates</p>
                        </a>

                        <a
                            href="/admin/guests"
                            className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white hover:shadow-lg transition-shadow"
                        >
                            <div className="text-3xl mb-2">👥</div>
                            <p className="font-semibold">Guest List</p>
                        </a>
                    </div>
                </div>
            </div>

            {/* Occupancy Calendar */}
            <div className="card p-6">
                <OccupancyCalendar />
            </div>
        </div>
    );
}
