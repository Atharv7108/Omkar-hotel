'use client';

import { useState } from 'react';
import { DateRangePicker } from '@/components/DateRangePicker';
import { RoomCard } from '@/components/RoomCard';
import { BookingSummary } from '@/components/BookingSummary';

interface Room {
    id: string;
    roomNumber: string;
    type: string;
    capacity: number;
    description: string | null;
    amenities: string[];
    images: string[];
    baseRate: number;
}

export default function BookPage() {
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDateChange = async (range: { checkIn: Date | null; checkOut: Date | null }) => {
        setCheckIn(range.checkIn);
        setCheckOut(range.checkOut);

        if (range.checkIn && range.checkOut) {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/rooms/available?checkIn=${range.checkIn.toISOString()}&checkOut=${range.checkOut.toISOString()}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch available rooms');
                }

                const data = await response.json();
                setAvailableRooms(data.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setAvailableRooms([]);
            } finally {
                setLoading(false);
            }
        } else {
            setAvailableRooms([]);
            setSelectedRoom(null);
        }
    };

    const handleRoomSelect = (roomId: string) => {
        const room = availableRooms.find((r) => r.id === roomId);
        if (room && checkIn && checkOut) {
            // Navigate to addons page with booking details
            window.location.href = `/book/addons?roomId=${roomId}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`;
        }
    };

    const nights = checkIn && checkOut
        ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="text-2xl font-display font-bold text-neutral-900">
                            Omkar Hotel
                        </a>
                        <nav className="flex items-center gap-6">
                            <a href="/" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                                Home
                            </a>
                            <a href="/rooms" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                                Rooms
                            </a>
                            <a href="/contact" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                                Contact
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="section">
                <div className="container-custom">
                    {/* Page Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-display font-bold mb-4 text-neutral-900">
                            Book Your Stay
                        </h1>
                        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                            Select your dates to see available rooms and make a reservation
                        </p>
                    </div>

                    {/* Date Picker */}
                    <div className="mb-12">
                        <DateRangePicker onChange={handleDateChange} minNights={1} />
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                            <p className="mt-4 text-neutral-600">Searching for available rooms...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                            <p className="text-red-800 font-medium">⚠️ {error}</p>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && availableRooms.length === 0 && checkIn && checkOut && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">😔</div>
                            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
                                No rooms available
                            </h3>
                            <p className="text-neutral-600">
                                Sorry, we don't have any available rooms for your selected dates.
                                Please try different dates.
                            </p>
                        </div>
                    )}

                    {!loading && availableRooms.length > 0 && (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Room List */}
                            <div className="lg:col-span-2 space-y-6">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                                    {availableRooms.length} Room{availableRooms.length > 1 ? 's' : ''} Available
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {availableRooms.map((room) => (
                                        <RoomCard
                                            key={room.id}
                                            room={room}
                                            nights={nights}
                                            onSelect={handleRoomSelect}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Booking Summary Sidebar */}
                            <div className="lg:col-span-1" id="booking-summary">
                                <BookingSummary
                                    room={selectedRoom ? {
                                        type: selectedRoom.type,
                                        roomNumber: selectedRoom.roomNumber,
                                        baseRate: selectedRoom.baseRate,
                                    } : undefined}
                                    checkIn={checkIn || undefined}
                                    checkOut={checkOut || undefined}
                                />
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!checkIn && !checkOut && !loading && (
                        <div className="text-center py-16">
                            <div className="text-7xl mb-6">📅</div>
                            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
                                Select Your Dates
                            </h3>
                            <p className="text-neutral-600 max-w-md mx-auto">
                                Choose your check-in and check-out dates above to see our available rooms
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
