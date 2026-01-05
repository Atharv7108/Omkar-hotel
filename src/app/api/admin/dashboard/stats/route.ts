import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/dashboard/stats - Get real-time dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get all bookings for calculations
        const [
            totalRooms,
            roomsByStatus,
            monthlyBookings,
            lastMonthBookings,
            todayCheckIns,
            todayCheckOuts,
            pendingBookings,
            confirmedRevenue,
            lastMonthRevenue,
            recentBookings,
            totalGuests,
            upcomingCheckIns,
        ] = await Promise.all([
            // Total rooms count
            prisma.room.count(),

            // Rooms grouped by status
            prisma.room.groupBy({
                by: ['status'],
                _count: { id: true },
            }),

            // Total bookings this month
            prisma.booking.count({
                where: {
                    createdAt: { gte: startOfMonth },
                },
            }),

            // Last month bookings for comparison
            prisma.booking.count({
                where: {
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),

            // Today's check-ins
            prisma.booking.findMany({
                where: {
                    checkIn: { gte: startOfToday, lt: endOfToday },
                    status: { in: ['CONFIRMED', 'PENDING'] },
                },
                include: { guest: true, room: true },
            }),

            // Today's check-outs
            prisma.booking.findMany({
                where: {
                    checkOut: { gte: startOfToday, lt: endOfToday },
                    status: 'CHECKED_IN',
                },
                include: { guest: true, room: true },
            }),

            // Pending bookings requiring action
            prisma.booking.count({
                where: { status: 'PENDING' },
            }),

            // Revenue this month (confirmed/checked-in/checked-out bookings)
            prisma.booking.aggregate({
                where: {
                    createdAt: { gte: startOfMonth },
                    status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
                },
                _sum: { totalAmount: true },
            }),

            // Last month revenue for comparison
            prisma.booking.aggregate({
                where: {
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                    status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
                },
                _sum: { totalAmount: true },
            }),

            // Recent 5 bookings
            prisma.booking.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { guest: true, room: true },
            }),

            // Total guests
            prisma.guest.count(),

            // Upcoming check-ins (next 7 days)
            prisma.booking.count({
                where: {
                    checkIn: {
                        gte: startOfToday,
                        lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                    },
                    status: { in: ['CONFIRMED', 'PENDING'] },
                },
            }),
        ]);

        // Calculate room status breakdown
        const roomStatus = {
            available: 0,
            occupied: 0,
            maintenance: 0,
            blocked: 0,
        };
        roomsByStatus.forEach((r) => {
            const status = r.status.toLowerCase();
            if (status === 'available') roomStatus.available = r._count.id;
            else if (status === 'occupied') roomStatus.occupied = r._count.id;
            else if (status === 'maintenance') roomStatus.maintenance = r._count.id;
            else if (status === 'blocked') roomStatus.blocked = r._count.id;
        });

        // Calculate occupancy rate
        const occupancyRate = totalRooms > 0
            ? Math.round((roomStatus.occupied / totalRooms) * 100)
            : 0;

        // Calculate month-over-month changes
        const currentRevenue = confirmedRevenue._sum.totalAmount?.toNumber() || 0;
        const prevRevenue = lastMonthRevenue._sum.totalAmount?.toNumber() || 0;
        const revenueChange = prevRevenue > 0
            ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
            : 0;

        const bookingsChange = lastMonthBookings > 0
            ? Math.round(((monthlyBookings - lastMonthBookings) / lastMonthBookings) * 100)
            : 0;

        // Format recent bookings
        const formattedBookings = recentBookings.map((booking) => ({
            id: booking.bookingReference,
            guestName: booking.guest.fullName,
            room: booking.room.roomNumber,
            roomType: booking.room.type,
            checkIn: booking.checkIn.toISOString().split('T')[0],
            checkOut: booking.checkOut.toISOString().split('T')[0],
            status: booking.status,
            amount: booking.totalAmount.toNumber(),
        }));

        // Format today's check-ins/outs
        const formattedCheckIns = todayCheckIns.map((b) => ({
            id: b.bookingReference,
            guestName: b.guest.fullName,
            room: b.room.roomNumber,
            status: b.status,
        }));

        const formattedCheckOuts = todayCheckOuts.map((b) => ({
            id: b.bookingReference,
            guestName: b.guest.fullName,
            room: b.room.roomNumber,
        }));

        const stats = {
            // Core metrics
            totalBookings: monthlyBookings,
            bookingsChange,
            todayCheckIns: todayCheckIns.length,
            todayCheckOuts: todayCheckOuts.length,
            occupancyRate,
            revenue: currentRevenue,
            revenueChange,
            
            // Room breakdown
            totalRooms,
            roomStatus,
            
            // Additional metrics
            pendingBookings,
            totalGuests,
            upcomingCheckIns,
            
            // Lists
            recentBookings: formattedBookings,
            todayCheckInsList: formattedCheckIns,
            todayCheckOutsList: formattedCheckOuts,
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
