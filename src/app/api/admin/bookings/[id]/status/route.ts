import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateBookingStatusSchema } from '@/lib/validations/booking';
import { z } from 'zod';

// PATCH /api/admin/bookings/[id]/status - Update booking status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = updateBookingStatusSchema.parse(body);

        // Get booking with room
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { room: true },
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const updates: any = { status: validatedData.status };

        // Handle status-specific logic
        switch (validatedData.status) {
            case 'CHECKED_IN':
                // Update room status to OCCUPIED
                await prisma.room.update({
                    where: { id: booking.roomId },
                    data: { status: 'OCCUPIED' },
                });
                break;

            case 'CHECKED_OUT':
                // Update room status to CLEANING
                await prisma.room.update({
                    where: { id: booking.roomId },
                    data: { status: 'CLEANING' },
                });
                break;

            case 'CANCELLED':
                // Add cancellation reason and free up room
                if (validatedData.cancellationReason) {
                    updates.specialRequests = `${booking.specialRequests || ''}\n\nCancellation Reason: ${validatedData.cancellationReason}`.trim();
                }
                // Set room back to available if it was held
                if (booking.room.status === 'OCCUPIED') {
                    await prisma.room.update({
                        where: { id: booking.roomId },
                        data: { status: 'AVAILABLE' },
                    });
                }
                // TODO: Trigger PMS cancellation
                // await cancelBookingInPMS(id);
                break;
        }

        // Update booking
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: updates,
            include: {
                guest: true,
                room: true,
                transaction: true,
            },
        });

        return NextResponse.json({ booking: updatedBooking }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error updating booking status:', error);
        return NextResponse.json(
            { error: 'Failed to update booking status' },
            { status: 500 }
        );
    }
}
