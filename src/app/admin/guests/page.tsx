'use client';

import { useState, useEffect } from 'react';

interface Guest {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    totalBookings: number;
    lastVisit: string | null;
    status: string;
}

export default function GuestsManagementPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Mock data - in production, fetch from API
        setTimeout(() => {
            setGuests([
                {
                    id: '1',
                    fullName: 'Rajesh Kumar',
                    email: 'rajesh.kumar@example.com',
                    phone: '9876543210',
                    totalBookings: 5,
                    lastVisit: '2025-01-05',
                    status: 'VIP',
                },
                {
                    id: '2',
                    fullName: 'Priya Sharma',
                    email: 'priya.sharma@example.com',
                    phone: '9876543211',
                    totalBookings: 3,
                    lastVisit: '2025-01-06',
                    status: 'Regular',
                },
                {
                    id: '3',
                    fullName: 'Amit Patel',
                    email: 'amit.patel@example.com',
                    phone: '9876543212',
                    totalBookings: 1,
                    lastVisit: null,
                    status: 'New',
                },
                {
                    id: '4',
                    fullName: 'Sneha Desai',
                    email: 'sneha.desai@example.com',
                    phone: '9876543213',
                    totalBookings: 7,
                    lastVisit: '2025-01-03',
                    status: 'VIP',
                },
                {
                    id: '5',
                    fullName: 'Vikram Singh',
                    email: 'vikram.singh@example.com',
                    phone: '9876543214',
                    totalBookings: 2,
                    lastVisit: '2024-12-28',
                    status: 'Regular',
                },
            ]);
            setLoading(false);
        }, 300);
    }, []);

    const filteredGuests = guests.filter(
        (guest) =>
            guest.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.phone.includes(searchTerm)
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VIP':
                return 'bg-yellow-100 text-yellow-700';
            case 'Regular':
                return 'bg-blue-100 text-blue-700';
            case 'New':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-neutral-100 text-neutral-700';
        }
    };

    const stats = {
        total: guests.length,
        vip: guests.filter((g) => g.status === 'VIP').length,
        regular: guests.filter((g) => g.status === 'Regular').length,
        new: guests.filter((g) => g.status === 'New').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Guest Management</h1>
                    <p className="text-neutral-600 mt-1">View and manage guest information</p>
                </div>
                <button className="btn-primary">+ Add Guest</button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
                <div className="card p-6">
                    <p className="text-sm text-neutral-600 mb-1">Total Guests</p>
                    <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-neutral-600 mb-1">VIP Guests</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.vip}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-neutral-600 mb-1">Regular Guests</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.regular}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-neutral-600 mb-1">New Guests</p>
                    <p className="text-3xl font-bold text-green-600">{stats.new}</p>
                </div>
            </div>

            {/* Search */}
            <div className="card p-6">
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field"
                />
            </div>

            {/* Guests Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Guest Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Bookings
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Last Visit
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {filteredGuests.map((guest) => (
                                <tr key={guest.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900">{guest.fullName}</p>
                                            <p className="text-xs text-neutral-500">{guest.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">{guest.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-neutral-900">
                                            {guest.totalBookings}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        {guest.lastVisit
                                            ? new Date(guest.lastVisit).toLocaleDateString('en-IN')
                                            : 'Never'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                guest.status
                                            )}`}
                                        >
                                            {guest.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-brand-primary hover:text-brand-secondary text-sm font-medium">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredGuests.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">No guests found</h3>
                        <p className="text-neutral-600">Try adjusting your search term</p>
                    </div>
                )}
            </div>
        </div>
    );
}
