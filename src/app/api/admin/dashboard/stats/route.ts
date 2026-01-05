import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/dashboard/stats - Get real-time dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // Get all bookings for calculations
        const [
            totalRooms,
            availableRooms,
            monthlyBookings,
            todayCheckIns,
            todayCheckOuts,
            occupiedRooms,
            confirmedRevenue,
            recentBookings,
        ] = await Promise.all([
            // Total rooms count
            prisma.room.count(),

            // Available rooms count
            prisma.room.count({
                where: { status: 'AVAILABLE' },
            }),

            // Total bookings this month
            prisma.booking.count({
                where: {
                    createdAt: {
                        gte: startOfMonth,
                    },
                },
            }),

            // Today's check-ins
            prisma.booking.count({
                where: {
                    checkIn: {
                        gte: startOfToday,
                        lt: endOfToday,
                    },
                },
            }),

            // Today's check-outs
            prisma.booking.count({
                where: {
                    checkOut: {
                        gte: startOfToday,
                        lt: endOfToday,
                    },
                },
            }),

            // Currently occupied rooms
            prisma.room.count({
                where: { status: 'OCCUPIED' },
            }),

            // Revenue this month (confirmed/checked-in/checked-out bookings)
            prisma.booking.aggregate({
                where: {
                    createdAt: {
                        gte: startOfMonth,
                    },
                    status: {
                        in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'],
                    },
                },
                _sum: {
                    totalAmount: true,
                },
            }),

            // Recent 5 bookings
            prisma.booking.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    guest: true,
                    room: true,
                },
            }),
        ]);

        // Calculate occupancy rate
        const occupancyRate = totalRooms > 0
            ? Math.round((occupiedRooms / totalRooms) * 100)
            : 0;

        // Format recent bookings
        const formattedBookings = recentBookings.map((booking) => ({
            id: booking.bookingReference,
            guestName: booking.guest.fullName,
            room: booking.room.roomNumber,
            checkIn: booking.checkIn.toISOString().split('T')[0],
            status: booking.status,
        }));

        const stats = {
            totalBookings: monthlyBookings,
            todayCheckIns,
            todayCheckOuts,
            occupancyRate,
            revenue: confirmedRevenue._sum.totalAmount?.toNumber() || 0,
            availableRooms,
            recentBookings: formattedBookings,
        };

        return NextResponse.json({ stats }, { status: 200 });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
