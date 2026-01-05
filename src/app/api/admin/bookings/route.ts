import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createBookingSchema } from '@/lib/validations/booking';
import { z } from 'zod';

// GET /api/admin/bookings - Fetch all bookings with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const bookings = await prisma.booking.findMany({
            where: {
                ...(status && status !== 'all' && { status: status as any }),
                ...(search && {
                    OR: [
                        { bookingReference: { contains: search, mode: 'insensitive' } },
                        { guest: { fullName: { contains: search, mode: 'insensitive' } } },
                        { room: { roomNumber: { contains: search } } },
                    ],
                }),
            },
            include: {
                guest: true,
                room: true,
                transactions: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Format bookings for frontend
        const formattedBookings = bookings.map((booking) => ({
            id: booking.id,
            bookingReference: booking.bookingReference,
            guestName: booking.guest.fullName,
            guestEmail: booking.guest.email,
            guestPhone: booking.guest.phone,
            room: booking.room.roomNumber,
            roomType: booking.room.type,
            checkIn: booking.checkIn.toISOString().split('T')[0],
            checkOut: booking.checkOut.toISOString().split('T')[0],
            status: booking.status,
            totalAmount: booking.totalAmount.toNumber(),
            paidAmount: booking.transactions.reduce((sum, t) => sum + t.amount.toNumber(), 0),
            guests: booking.numberOfGuests,
            createdAt: booking.createdAt,
            pmsBookingId: booking.pmsBookingId,
        }));

        return NextResponse.json({ bookings: formattedBookings }, { status: 200 });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}

// POST /api/admin/bookings - Create a manual booking (walk-in)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = createBookingSchema.parse(body);

        const checkIn = new Date(validatedData.checkIn);
        const checkOut = new Date(validatedData.checkOut);

        // Validate dates
        if (checkIn >= checkOut) {
            return NextResponse.json(
                { error: 'Check-out date must be after check-in date' },
                { status: 400 }
            );
        }

        // Check room availability
        const room = await prisma.room.findUnique({
            where: { id: validatedData.roomId },
            include: { rates: { orderBy: { effectiveFrom: 'desc' }, take: 1 } },
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Check for overlapping bookings
        const overlappingBooking = await prisma.booking.findFirst({
            where: {
                roomId: validatedData.roomId,
                status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
                OR: [
                    {
                        checkIn: { lte: checkIn },
                        checkOut: { gt: checkIn },
                    },
                    {
                        checkIn: { lt: checkOut },
                        checkOut: { gte: checkOut },
                    },
                    {
                        checkIn: { gte: checkIn },
                        checkOut: { lte: checkOut },
                    },
                ],
            },
        });

        if (overlappingBooking) {
            return NextResponse.json(
                { error: 'Room is not available for the selected dates' },
                { status: 400 }
            );
        }

        // Get or create guest
        let guestId = validatedData.guestId;
        if (!guestId && validatedData.guestInfo) {
            const guest = await prisma.guest.create({
                data: validatedData.guestInfo,
            });
            guestId = guest.id;
        }

        if (!guestId) {
            return NextResponse.json(
                { error: 'Guest information is required' },
                { status: 400 }
            );
        }

        // Calculate total amount
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const baseRate = room.rates[0]?.baseRate?.toNumber() || 0;
        const roomTotal = baseRate * nights;

        // Get hotel config for addons and taxes
        const configRecords = await prisma.hotelConfig.findMany({
            where: { key: { in: ['addons', 'tax_config'] } },
        });

        const addonsConfig = configRecords.find(c => c.key === 'addons');
        const taxConfig = configRecords.find(c => c.key === 'tax_config');

        const addons = addonsConfig ? JSON.parse(addonsConfig.value as string) : [];
        const selectedAddons = addons.filter((a: any) => validatedData.addons.includes(a.id));
        const addonsTotal = selectedAddons.reduce((sum: number, a: any) => sum + (a.price * nights), 0);

        const taxes = taxConfig ? JSON.parse(taxConfig.value as string) : { gstRate: 12 };
        const subtotal = roomTotal + addonsTotal;
        const taxAmount = (subtotal * taxes.gstRate) / 100;
        const totalAmount = subtotal + taxAmount;

        // Generate booking reference
        const bookingReference = `OMK-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Create booking with transaction
        const booking = await prisma.booking.create({
            data: {
                bookingReference,
                guestId,
                roomId: validatedData.roomId,
                checkIn,
                checkOut,
                numberOfGuests: validatedData.numberOfGuests,
                specialRequests: validatedData.specialRequests,
                addons: JSON.stringify(selectedAddons),
                totalAmount,
                status: validatedData.paidAmount >= totalAmount ? 'CONFIRMED' : 'PENDING',
                transactions: validatedData.paidAmount > 0 ? {
                    create: {
                        amount: validatedData.paidAmount,
                        paymentMethod: validatedData.paymentMethod,
                        status: 'COMPLETED',
                        transactionReference: `TXN-${Date.now()}`,
                    },
                } : undefined,
            },
            include: {
                guest: true,
                room: true,
                transactions: true,
            },
        });

        // TODO: Push to PMS if needed
        // await pushBookingToPMS(booking.id);

        return NextResponse.json({ booking }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error creating booking:', error);
        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        );
    }
}
