'use client';

import { useState, useEffect } from 'react';

interface Booking {
    id: string;
    bookingReference: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    room: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    guests: number;
    pmsBookingId: string | null;
}

export default function BookingsManagementPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/admin/bookings?${params}`);
            if (!response.ok) throw new Error('Failed to fetch bookings');

            const data = await response.json();
            setBookings(data.bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            alert('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchBookings();
    };

    const handleStatusChange = async (bookingId: string, newStatus: string, bookingRef: string) => {
        let cancellationReason = '';
        if (newStatus === 'CANCELLED') {
            cancellationReason = prompt('Please enter cancellation reason:') || '';
            if (!cancellationReason) return;
        }

        const confirmMessages: Record<string, string> = {
            CHECKED_IN: 'Mark this booking as checked-in?',
            CHECKED_OUT: 'Mark this booking as checked-out?',
            CANCELLED: `Cancel booking ${bookingRef}?`,
            CONFIRMED: 'Confirm this booking?',
        };

        if (!confirm(confirmMessages[newStatus] || 'Update booking status?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    ...(cancellationReason && { cancellationReason }),
                }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            await fetchBookings();
            alert('Booking status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update booking status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-700';
            case 'CHECKED_IN':
                return 'bg-green-100 text-green-700';
            case 'CHECKED_OUT':
                return 'bg-neutral-100 text-neutral-700';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-neutral-100 text-neutral-700';
        }
    };

    const statusCounts = {
        all: bookings.length,
        PENDING: bookings.filter((b) => b.status === 'PENDING').length,
        CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
        CHECKED_IN: bookings.filter((b) => b.status === 'CHECKED_IN').length,
        CHECKED_OUT: bookings.filter((b) => b.status === 'CHECKED_OUT').length,
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
                    <h1 className="text-2xl font-bold text-neutral-900">Booking Management</h1>
                    <p className="text-neutral-600 mt-1">View and manage all bookings</p>
                </div>
                <button className="btn-primary">+ New Booking</button>
            </div>

            {/* Search & Filter */}
            <div className="card p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by booking ref, guest name, or room..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field flex-1"
                        />
                        <button type="submit" className="btn-secondary px-6">
                            Search
                        </button>
                    </form>

                    {/* Status Filter */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'all', label: 'All', count: statusCounts.all },
                            { key: 'PENDING', label: 'Pending', count: statusCounts.PENDING },
                            { key: 'CONFIRMED', label: 'Confirmed', count: statusCounts.CONFIRMED },
                            { key: 'CHECKED_IN', label: 'Checked In', count: statusCounts.CHECKED_IN },
                            { key: 'CHECKED_OUT', label: 'Checked Out', count: statusCounts.CHECKED_OUT },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === tab.key
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Booking Ref
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Guest
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Room
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Check-in
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Check-out
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Amount
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
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-neutral-900">
                                        {booking.bookingReference}
                                        {booking.pmsBookingId && (
                                            <span className="ml-2 text-xs text-green-600" title="Synced to PMS">
                                                ✓ PMS
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-neutral-900">{booking.guestName}</div>
                                        <div className="text-xs text-neutral-600">{booking.guestPhone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-900">{booking.room}</td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        {new Date(booking.checkIn).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        {new Date(booking.checkOut).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-neutral-900">
                                            ₹{booking.totalAmount.toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-xs text-neutral-600">
                                            Paid: ₹{booking.paidAmount.toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {booking.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleStatusChange(booking.id, 'CONFIRMED', booking.bookingReference)}
                                                    className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                            {booking.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleStatusChange(booking.id, 'CHECKED_IN', booking.bookingReference)}
                                                    className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    Check-in
                                                </button>
                                            )}
                                            {booking.status === 'CHECKED_IN' && (
                                                <button
                                                    onClick={() => handleStatusChange(booking.id, 'CHECKED_OUT', booking.bookingReference)}
                                                    className="text-xs px-3 py-1 bg-neutral-500 text-white rounded hover:bg-neutral-600"
                                                >
                                                    Check-out
                                                </button>
                                            )}
                                            {!['CANCELLED', 'CHECKED_OUT'].includes(booking.status) && (
                                                <button
                                                    onClick={() => handleStatusChange(booking.id, 'CANCELLED', booking.bookingReference)}
                                                    className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {bookings.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">No bookings found</h3>
                        <p className="text-neutral-600">
                            {searchTerm
                                ? 'Try adjusting your search term'
                                : bookings.length === 0
                                    ? 'No bookings yet. Bookings will appear here once guests make reservations.'
                                    : 'No bookings match the selected filter'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
