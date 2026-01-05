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
    const [roomTypes, setRoomTypes] = useState<RoomTypeGroup[]>([]);
    const [selectedType, setSelectedType] = useState<RoomTypeGroup | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDateChange = async (range: { checkIn: Date | null; checkOut: Date | null }) => {
        setCheckIn(range.checkIn);
        setCheckOut(range.checkOut);

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
                        handleDateChange({ checkIn, checkOut });
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
            window.location.href = `/book/addons?roomId=${roomId}&roomType=${roomType.type}&floor=${floorOption.floor}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`;
        }
    };

    const nights = checkIn && checkOut
        ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const totalAvailable = roomTypes.reduce((sum, rt) => sum + rt.totalAvailable, 0);

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

                    {/* No Rooms Available */}
                    {!loading && roomTypes.length === 0 && checkIn && checkOut && (
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

                    {/* Room Types Grid */}
                    {!loading && roomTypes.length > 0 && (
                        <div>
                            {/* Room Types List - Full Width */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                                    {totalAvailable} Room{totalAvailable !== 1 ? 's' : ''} Available
                                </h2>

                                <div className="space-y-6">
                                    {roomTypes.map((roomType) => (
                                        <RoomTypeCard
                                            key={roomType.type}
                                            roomType={roomType}
                                            nights={nights}
                                            onFloorSelect={(floorOption) => handleFloorSelect(roomType, floorOption)}
                                        />
                                    ))}
                                </div>
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
    const isAvailable = roomType.totalAvailable > 0;
    const hasMultipleOptions = roomType.floorOptions.length > 1;

    const displayAmenities = roomType.amenities.slice(0, 4);
    const moreAmenities = roomType.amenities.length - 4;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-1/3 relative">
                    <div className="aspect-[4/3] md:aspect-auto md:h-full relative">
                        {roomType.images.length > 0 ? (
                            <img
                                src={roomType.images[0]}
                                alt={roomType.typeLabel}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center min-h-[200px]">
                                <span className="text-4xl">🏨</span>
                            </div>
                        )}
                        {/* Availability Badge */}
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${
                            isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {isAvailable 
                                ? `${roomType.totalAvailable} available` 
                                : 'Sold out'}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="md:w-2/3 p-6 flex flex-col">
                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-xl font-semibold text-neutral-900">
                                    {roomType.typeLabel}
                                </h3>
                                <p className="text-sm text-neutral-500 mt-1">
                                    👥 {roomType.baseOccupancy}-{roomType.maxOccupancy} guests
                                    {roomType.extraGuestCharge && roomType.extraGuestCharge > 0 && (
                                        <span className="ml-2 text-amber-600">
                                            (+₹{roomType.extraGuestCharge.toLocaleString('en-IN')} for 3rd guest)
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="text-right">
                                {hasMultipleOptions ? (
                                    <>
                                        <p className="text-lg font-bold text-neutral-900">
                                            From ₹{roomType.minRate.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-sm text-neutral-500">per night</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl font-bold text-neutral-900">
                                            ₹{roomType.minRate.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-sm text-neutral-500">per night</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-neutral-600 text-sm mb-4">
                            {roomType.description}
                        </p>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {displayAmenities.map((amenity) => (
                                <span
                                    key={amenity}
                                    className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full"
                                >
                                    {amenity}
                                </span>
                            ))}
                            {moreAmenities > 0 && (
                                <span className="px-3 py-1 bg-neutral-100 text-neutral-500 text-xs rounded-full">
                                    +{moreAmenities} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Floor Options */}
                    <div className="pt-4 border-t border-neutral-100">
                        {hasMultipleOptions ? (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-neutral-700 mb-2">Choose your preference:</p>
                                {roomType.floorOptions.map((option, index) => {
                                    const optionTotal = option.baseRate * nights;
                                    const optionAvailable = option.availableCount > 0;
                                    return (
                                        <div 
                                            key={index}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${
                                                optionAvailable 
                                                    ? 'border-neutral-200 hover:border-teal-300 hover:bg-teal-50/50 cursor-pointer' 
                                                    : 'border-neutral-100 bg-neutral-50 opacity-60'
                                            }`}
                                            onClick={() => optionAvailable && onFloorSelect(option)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">🏢</span>
                                                <div>
                                                    <p className="font-medium text-neutral-900">
                                                        {option.floorLabel}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        {optionAvailable 
                                                            ? `${option.availableCount} room${option.availableCount > 1 ? 's' : ''} available`
                                                            : 'Sold out'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-neutral-900">
                                                    ₹{option.baseRate.toLocaleString('en-IN')}<span className="text-sm font-normal text-neutral-500">/night</span>
                                                </p>
                                                {nights > 0 && (
                                                    <p className="text-xs text-neutral-500">
                                                        Total: ₹{optionTotal.toLocaleString('en-IN')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    {nights > 0 && (
                                        <p className="text-sm text-neutral-600">
                                            Total for {nights} night{nights !== 1 ? 's' : ''}: 
                                            <span className="font-semibold text-neutral-900 ml-1">
                                                ₹{(roomType.minRate * nights).toLocaleString('en-IN')}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => onFloorSelect(roomType.floorOptions[0])}
                                    disabled={!isAvailable}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                                        isAvailable
                                            ? 'bg-teal-600 text-white hover:bg-teal-700'
                                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isAvailable ? 'Select Room' : 'Sold Out'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
