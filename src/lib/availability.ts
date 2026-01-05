import { prisma } from './db';

export interface AvailabilityParams {
    checkIn: Date;
    checkOut: Date;
    roomId?: string;
}

export interface RoomAvailability {
    roomId: string;
    available: boolean;
    reason?: string;
}

/**
 * Check if a specific room is available for the given date range
 */
export async function checkRoomAvailability(
    roomId: string,
    checkIn: Date,
    checkOut: Date
): Promise<boolean> {
    // Find any overlapping bookings for this room
    const overlappingBookings = await prisma.booking.findMany({
        where: {
            roomId,
            status: {
                in: ['CONFIRMED', 'CHECKED_IN'],
            },
            OR: [
                {
                    // Booking starts during our requested period
                    AND: [
                        { checkIn: { gte: checkIn } },
                        { checkIn: { lt: checkOut } },
                    ],
                },
                {
                    // Booking ends during our requested period
                    AND: [
                        { checkOut: { gt: checkIn } },
                        { checkOut: { lte: checkOut } },
                    ],
                },
                {
                    // Booking completely encompasses our requested period
                    AND: [
                        { checkIn: { lte: checkIn } },
                        { checkOut: { gte: checkOut } },
                    ],
                },
            ],
        },
    });

    if (overlappingBookings.length > 0) return false;

    // Check for overlapping room blocks (inventory closures)
    const overlappingBlocks = await prisma.roomBlock.findMany({
        where: {
            roomId,
            OR: [
                {
                    AND: [
                        { startDate: { lte: checkIn } },
                        { endDate: { gt: checkIn } },
                    ],
                },
                {
                    AND: [
                        { startDate: { lt: checkOut } },
                        { endDate: { gte: checkOut } },
                    ],
                },
                {
                    AND: [
                        { startDate: { gte: checkIn } },
                        { endDate: { lte: checkOut } },
                    ],
                },
            ],
        },
    });

    return overlappingBlocks.length === 0;
}

/**
 * Get all available rooms for a given date range
 */
export async function getAvailableRooms(checkIn: Date, checkOut: Date) {
    // Get all rooms
    const allRooms = await prisma.room.findMany({
        where: {
            status: {
                in: ['AVAILABLE', 'CLEANING'], // Include rooms that are just being cleaned
            },
        },
        include: {
            rates: {
                where: {
                    effectiveFrom: { lte: checkIn },
                    OR: [
                        { effectiveTo: null },
                        { effectiveTo: { gte: checkIn } },
                    ],
                },
                orderBy: {
                    effectiveFrom: 'desc',
                },
                take: 1,
            },
        },
    });

    // Check availability for each room
    const availabilityChecks: (Prisma.RoomGetPayload<{
        include: {
            rates: {
                where: {
                    effectiveFrom: { lte: Date };
                    OR: ({ effectiveTo: null } | { effectiveTo: { gte: Date } })[];
                };
                orderBy: { effectiveFrom: 'desc' };
                take: 1;
            };
        };
    }> & { available: boolean })[] = await Promise.all(
        allRooms.map(async (room) => {
            const isAvailable = await checkRoomAvailability(room.id, checkIn, checkOut);
            return {
                ...room,
                available: isAvailable,
            };
        })
    );

    // Return only available rooms
    return availabilityChecks
        .filter((room) => room.available)
        .map((room) => ({
            id: room.id,
            roomNumber: room.roomNumber,
            type: room.type,
            capacity: room.capacity,
            description: room.description,
            amenities: JSON.parse(room.amenities as string) as string[],
            images: JSON.parse(room.images as string) as string[],
            baseRate: room.rates[0]?.baseRate.toNumber() || 0,
            status: room.status,
        }));
}

/**
 * Calculate the total price for a room booking
 */
export function calculateBookingPrice(
    baseRate: number,
    checkIn: Date,
    checkOut: Date,
    weekendMultiplier: number = 1.3
): number {
    const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    let totalPrice = 0;
    const currentDate = new Date(checkIn);

    for (let i = 0; i < nights; i++) {
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

        const nightRate = isWeekend ? baseRate * weekendMultiplier : baseRate;
        totalPrice += nightRate;

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalPrice;
}

/**
 * Prevent double bookings by creating a booking with proper validation
 */
export async function createBooking(data: {
    guestId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    totalAmount: number;
    addons?: Array<{ addonType: string; name: string; quantity: number; price: number }>;
}) {
    // Check availability one more time before creating
    const isAvailable = await checkRoomAvailability(
        data.roomId,
        data.checkIn,
        data.checkOut
    );

    if (!isAvailable) {
        throw new Error('Room is no longer available for the selected dates');
    }

    // Generate unique booking reference
    const bookingReference = `OMK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create booking with addons in a transaction
    const booking = await prisma.booking.create({
        data: {
            bookingReference,
            guestId: data.guestId,
            roomId: data.roomId,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            numberOfGuests: data.numberOfGuests,
            totalAmount: data.totalAmount,
            taxAmount: data.totalAmount * 0.12, // 12% GST
            status: 'PENDING',
            addons: data.addons
                ? {
                    create: data.addons.map((addon) => ({
                        addonType: addon.addonType,
                        name: addon.name,
                        quantity: addon.quantity,
                        price: addon.price,
                    })),
                }
                : undefined,
        },
        include: {
            room: true,
            guest: true,
            addons: true,
        },
    });

    return booking;
}
