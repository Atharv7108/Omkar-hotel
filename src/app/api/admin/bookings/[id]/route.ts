import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/bookings/[id] - Get booking details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                guest: true,
                room: {
                    include: {
                        rates: {
                            orderBy: { effectiveFrom: 'desc' },
                            take: 1,
                        },
                    },
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Parse addons
        const addons = typeof booking.addons === 'string' ? JSON.parse(booking.addons) : booking.addons;

        const formattedBooking = {
            ...booking,
            addons,
            totalAmount: booking.totalAmount.toNumber(),
            transactions: booking.transactions.map(t => ({
                ...t,
                amount: t.amount.toNumber(),
            })),
        };

        return NextResponse.json({ booking: formattedBooking }, { status: 200 });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { error: 'Failed to fetch booking details' },
            { status: 500 }
        );
    }
}
