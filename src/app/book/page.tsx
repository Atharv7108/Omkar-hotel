'use client';

import { useEffect, useState } from 'react';
import { DateRangePicker } from '@/components/DateRangePicker';

interface FloorOption {
    floor: number | null;
    floorLabel: string;
    baseRate: number;
    availableCount: number;
    totalCount: number;
    roomIds: string[];
}

interface RoomTypeGroup {
    type: string;
    typeLabel: string;
    description: string;
    minRate: number;
    maxRate: number;
    totalAvailable: number;
    totalRooms: number;
    baseOccupancy: number;
    maxOccupancy: number;
    extraGuestCharge: number | null;
    amenities: string[];
    images: string[];
    floorOptions: FloorOption[];
}

export default function BookPage() {
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [guests, setGuests] = useState<number>(2);
    const [roomTypes, setRoomTypes] = useState<RoomTypeGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDateChange = async (range: { checkIn: Date | null; checkOut: Date | null; guests: number }) => {
        setCheckIn(range.checkIn);
        setCheckOut(range.checkOut);
        setGuests(range.guests);

        if (range.checkIn && range.checkOut) {
            setLoading(true);
            setError(null);

            try {
                const url = `/api/rooms/available-by-type?checkIn=${encodeURIComponent(range.checkIn.toISOString())}&checkOut=${encodeURIComponent(range.checkOut.toISOString())}`;
                const response = await fetch(url);

                if (!response.ok) {
                    try {
                        const errJson = await response.json();
                        throw new Error(errJson?.error || 'Failed to fetch available rooms');
                    } catch (_) {
                        throw new Error('Failed to fetch available rooms');
                    }
                }

                const data = await response.json();
                setRoomTypes(data.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setRoomTypes([]);
            } finally {
                setLoading(false);
            }
        } else {
            setRoomTypes([]);
            setSelectedType(null);
        }
    };

    // Realtime: subscribe to inventory updates and refetch if overlapping current selection
    useEffect(() => {
        let pusher: any;
        let channel: any;
        (async () => {
            try {
                const { default: Pusher } = await import('pusher-js');
                const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
                const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string | undefined;
                if (!key || !cluster) return;
                pusher = new Pusher(key as string, { cluster });
                channel = pusher.subscribe('inventory');
                channel.bind('update', (evt: { type: string; payload: any }) => {
                    if (!checkIn || !checkOut) return;
                    const s = evt.payload?.checkIn ?? evt.payload?.startDate;
                    const e = evt.payload?.checkOut ?? evt.payload?.endDate;
                    if (!s || !e) return;
                    const evStart = new Date(s);
                    const evEnd = new Date(e);
                    const overlaps = evStart < checkOut && evEnd > checkIn;
                    if (overlaps) {
                        handleDateChange({ checkIn, checkOut, guests });
                    }
                });
            } catch {
                // ignore when pusher not configured
            }
        })();
        return () => {
            try {
                if (channel) channel.unbind_all();
                if (pusher) pusher.unsubscribe('inventory');
            } catch {}
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkIn?.toISOString(), checkOut?.toISOString()]);

    const handleFloorSelect = (roomType: RoomTypeGroup, floorOption: FloorOption) => {
        if (checkIn && checkOut && floorOption.availableCount > 0) {
            // Pass first available room ID from the floor option
            const roomId = floorOption.roomIds[0];
            window.location.href = `/book/addons?roomId=${roomId}&roomType=${roomType.type}&floor=${floorOption.floor}&guests=${guests}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`;
        }
    };

    const nights = checkIn && checkOut
        ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const totalAvailable = roomTypes.reduce((sum, rt) => sum + rt.totalAvailable, 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 sticky top-0 z-40">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <span className="text-white text-xl">🏨</span>
                            </div>
                            <span className="text-2xl font-display font-bold text-neutral-900">
                                Omkar Hotel
                            </span>
                        </a>
                        <nav className="flex items-center gap-6">
                            <a href="/" className="text-neutral-600 hover:text-teal-600 transition-colors font-medium">
                                Home
                            </a>
                            <a href="/rooms" className="text-neutral-600 hover:text-teal-600 transition-colors font-medium">
                                Rooms
                            </a>
                            <a href="/contact" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                                Contact Us
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 text-white py-12 mb-8">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                        Book Your Perfect Stay
                    </h1>
                    <p className="text-teal-100 text-lg max-w-2xl mx-auto">
                        Experience comfort and luxury at Omkar Hotel. Select your dates and find the perfect room for your stay.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="pb-16">
                <div className="container-custom">
                    {/* Date Picker - Enhanced */}
                    <div className="mb-12 -mt-6">
                        <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 p-1 border border-neutral-100">
                            <DateRangePicker onChange={handleDateChange} minNights={1} />
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-16">
                            <div className="relative inline-block">
                                <div className="w-16 h-16 rounded-full border-4 border-teal-200"></div>
                                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"></div>
                            </div>
                            <p className="mt-6 text-neutral-600 font-medium">Searching for available rooms...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-red-800 font-semibold">Something went wrong</p>
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* No Rooms Available */}
                    {!loading && roomTypes.length === 0 && checkIn && checkOut && (
                        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
                            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">😔</span>
                            </div>
                            <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                                No rooms available
                            </h3>
                            <p className="text-neutral-600 max-w-md mx-auto">
                                Sorry, we don't have any available rooms for your selected dates.
                                Please try different dates or contact us for assistance.
                            </p>
                            <button className="mt-6 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                                Modify Dates
                            </button>
                        </div>
                    )}

                    {/* Room Types Grid */}
                    {!loading && roomTypes.length > 0 && (
                        <div>
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900">
                                        Available Rooms
                                    </h2>
                                    <p className="text-neutral-500 mt-1">
                                        {totalAvailable} room{totalAvailable !== 1 ? 's' : ''} found for {nights} night{nights !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="flex items-center gap-2 text-neutral-600">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Available
                                    </span>
                                    <span className="flex items-center gap-2 text-neutral-600">
                                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                        Limited
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {roomTypes.map((roomType) => (
                                    <RoomTypeCard
                                        key={roomType.type}
                                        roomType={roomType}
                                        nights={nights}
                                        onFloorSelect={(floorOption) => handleFloorSelect(roomType, floorOption)}
                                    />
                                ))}
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-12 pt-8 border-t border-neutral-200">
                                <div className="grid md:grid-cols-4 gap-6 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <p className="font-medium text-neutral-900">Secure Booking</p>
                                        <p className="text-xs text-neutral-500">SSL encrypted</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="font-medium text-neutral-900">Best Price</p>
                                        <p className="text-xs text-neutral-500">Price match guarantee</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="font-medium text-neutral-900">Free Cancellation</p>
                                        <p className="text-xs text-neutral-500">Up to 24 hours before</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <p className="font-medium text-neutral-900">24/7 Support</p>
                                        <p className="text-xs text-neutral-500">We're here to help</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!checkIn && !checkOut && !loading && (
                        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
                            <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-5xl">📅</span>
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                                Select Your Dates
                            </h3>
                            <p className="text-neutral-600 max-w-md mx-auto mb-8">
                                Choose your check-in and check-out dates above to see our available rooms and best prices
                            </p>
                            
                            {/* Features Preview */}
                            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 pt-8 border-t border-neutral-100">
                                <div className="p-4">
                                    <div className="text-3xl mb-2">🛏️</div>
                                    <p className="font-medium text-neutral-800">Luxury Rooms</p>
                                    <p className="text-sm text-neutral-500">Premium comfort</p>
                                </div>
                                <div className="p-4">
                                    <div className="text-3xl mb-2">🍽️</div>
                                    <p className="font-medium text-neutral-800">Breakfast Included</p>
                                    <p className="text-sm text-neutral-500">Start your day right</p>
                                </div>
                                <div className="p-4">
                                    <div className="text-3xl mb-2">📶</div>
                                    <p className="font-medium text-neutral-800">Free WiFi</p>
                                    <p className="text-sm text-neutral-500">High-speed internet</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-neutral-900 text-white py-8">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                                <span className="text-sm">🏨</span>
                            </div>
                            <span className="font-display font-bold">Omkar Hotel</span>
                        </div>
                        <p className="text-neutral-400 text-sm">© 2026 Omkar Hotel. All rights reserved.</p>
                        <div className="flex gap-4 text-neutral-400">
                            <a href="/privacy" className="hover:text-white transition-colors text-sm">Privacy</a>
                            <a href="/terms" className="hover:text-white transition-colors text-sm">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Room Type Card Component
function RoomTypeCard({ 
    roomType, 
    nights, 
    onFloorSelect 
}: { 
    roomType: RoomTypeGroup; 
    nights: number;
    onFloorSelect: (floorOption: FloorOption) => void;
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const isAvailable = roomType.totalAvailable > 0;
    const hasMultipleOptions = roomType.floorOptions.length > 1;
    const hasMultipleImages = roomType.images.length > 1;

    const displayAmenities = roomType.amenities.slice(0, 6);
    const moreAmenities = roomType.amenities.length - 6;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % roomType.images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + roomType.images.length) % roomType.images.length);
    };

    return (
        <div className="bg-white rounded-3xl shadow-lg shadow-neutral-200/50 border border-neutral-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div className="flex flex-col lg:flex-row">
                {/* Image Carousel - Enhanced */}
                <div className="lg:w-2/5 relative">
                    <div className="h-[300px] lg:h-[380px] relative overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50">
                        {roomType.images.length > 0 ? (
                            <>
                                <img
                                    src={roomType.images[currentImageIndex]}
                                    alt={`${roomType.typeLabel} - Image ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                {/* Image Navigation Arrows */}
                                {hasMultipleImages && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 hover:bg-white rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                        >
                                            <svg className="w-5 h-5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 hover:bg-white rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                        >
                                            <svg className="w-5 h-5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                        {/* Image Dots */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
                                            {roomType.images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                        idx === currentImageIndex 
                                                            ? 'bg-white w-6' 
                                                            : 'bg-white/50 hover:bg-white/80 w-1.5'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-7xl">🏨</span>
                                    <p className="text-neutral-400 mt-2 text-sm">No images available</p>
                                </div>
                            </div>
                        )}
                        {/* Availability Badge */}
                        <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                            isAvailable 
                                ? roomType.totalAvailable <= 2 
                                    ? 'bg-amber-500/90 text-white' 
                                    : 'bg-emerald-500/90 text-white'
                                : 'bg-red-500/90 text-white'
                        }`}>
                            {isAvailable 
                                ? roomType.totalAvailable <= 2 
                                    ? `Only ${roomType.totalAvailable} left!` 
                                    : `${roomType.totalAvailable} available`
                                : 'Sold out'}
                        </div>
                        {/* Image Counter */}
                        {hasMultipleImages && (
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                                📷 {currentImageIndex + 1} / {roomType.images.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content - Enhanced */}
                <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col">
                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded-md uppercase tracking-wide">
                                        {roomType.type}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900">
                                    {roomType.typeLabel}
                                </h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {roomType.baseOccupancy}-{roomType.maxOccupancy} guests
                                    </span>
                                    {roomType.extraGuestCharge && roomType.extraGuestCharge > 0 && (
                                        <span className="text-amber-600 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            ₹{roomType.extraGuestCharge.toLocaleString('en-IN')} for 3rd guest
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 rounded-2xl">
                                {hasMultipleOptions ? (
                                    <>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wide">From</p>
                                        <p className="text-2xl font-bold text-teal-600">
                                            ₹{roomType.minRate.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-xs text-neutral-500">per night</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold text-teal-600">
                                            ₹{roomType.minRate.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-xs text-neutral-500">per night</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-neutral-600 mb-5 leading-relaxed">
                            {roomType.description}
                        </p>

                        {/* Amenities - Enhanced */}
                        <div className="mb-5">
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Amenities</p>
                            <div className="flex flex-wrap gap-2">
                                {displayAmenities.map((amenity) => (
                                    <span
                                        key={amenity}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-neutral-50 to-neutral-100 border border-neutral-200 text-neutral-700 text-sm rounded-lg"
                                    >
                                        <span className="text-teal-500">✓</span>
                                        {amenity}
                                    </span>
                                ))}
                                {moreAmenities > 0 && (
                                    <span className="px-3 py-1.5 bg-teal-50 text-teal-600 text-sm rounded-lg font-medium">
                                        +{moreAmenities} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Floor Options - Enhanced */}
                    <div className="pt-5 border-t border-neutral-100">
                        {hasMultipleOptions ? (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Choose your floor preference:
                                </p>
                                <div className="grid gap-3">
                                    {roomType.floorOptions.map((option, index) => {
                                        const optionTotal = option.baseRate * nights;
                                        const optionAvailable = option.availableCount > 0;
                                        return (
                                            <div 
                                                key={index}
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                                                    optionAvailable 
                                                        ? 'border-neutral-200 hover:border-teal-400 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent cursor-pointer hover:shadow-md' 
                                                        : 'border-neutral-100 bg-neutral-50 opacity-50'
                                                }`}
                                                onClick={() => optionAvailable && onFloorSelect(option)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                                                        optionAvailable ? 'bg-teal-100' : 'bg-neutral-100'
                                                    }`}>
                                                        🏢
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-neutral-900">
                                                            {option.floorLabel}
                                                        </p>
                                                        <p className={`text-sm ${optionAvailable ? 'text-teal-600' : 'text-neutral-400'}`}>
                                                            {optionAvailable 
                                                                ? `${option.availableCount} room${option.availableCount > 1 ? 's' : ''} available`
                                                                : 'Sold out'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-neutral-900">
                                                        ₹{option.baseRate.toLocaleString('en-IN')}
                                                        <span className="text-sm font-normal text-neutral-500">/night</span>
                                                    </p>
                                                    {nights > 0 && (
                                                        <p className="text-sm text-neutral-500">
                                                            Total: <span className="font-medium text-neutral-700">₹{optionTotal.toLocaleString('en-IN')}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-transparent p-4 rounded-xl">
                                <div>
                                    {nights > 0 && (
                                        <div>
                                            <p className="text-sm text-neutral-500">Total for {nights} night{nights !== 1 ? 's' : ''}</p>
                                            <p className="text-2xl font-bold text-neutral-900">
                                                ₹{(roomType.minRate * nights).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => onFloorSelect(roomType.floorOptions[0])}
                                    disabled={!isAvailable}
                                    className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
                                        isAvailable
                                            ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:scale-105'
                                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isAvailable ? 'Book Now →' : 'Sold Out'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
