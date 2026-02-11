import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a new pool just for seeding
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // NOTE: We no longer delete existing data to preserve rooms created via admin panel
    // If you need a fresh start, manually delete data from Supabase dashboard

    // Check if rooms already exist
    const existingRooms = await prisma.room.count();
    
    if (existingRooms > 0) {
        console.log(`ℹ️ Found ${existingRooms} existing rooms - skipping room creation`);
    } else {
        // Create sample rooms only if none exist
        console.log('🏨 Creating sample rooms...');
        const roomsData = [
            { roomNumber: '101', type: 'STANDARD', floor: 1, size: 250, baseOccupancy: 2, maxOccupancy: 2, baseRate: 2500 },
            { roomNumber: '102', type: 'STANDARD', floor: 1, size: 250, baseOccupancy: 2, maxOccupancy: 2, baseRate: 2500 },
            { roomNumber: '103', type: 'STANDARD', floor: 1, size: 250, baseOccupancy: 2, maxOccupancy: 3, baseRate: 2500, extraGuestCharge: 500 },
            { roomNumber: '201', type: 'DELUXE', floor: 2, size: 350, baseOccupancy: 2, maxOccupancy: 3, baseRate: 3500, extraGuestCharge: 700 },
            { roomNumber: '202', type: 'DELUXE', floor: 2, size: 350, baseOccupancy: 2, maxOccupancy: 3, baseRate: 3500, extraGuestCharge: 700 },
            { roomNumber: '203', type: 'DELUXE', floor: 2, size: 400, baseOccupancy: 2, maxOccupancy: 4, baseRate: 4000, extraGuestCharge: 800 },
            { roomNumber: '301', type: 'SUITE', floor: 3, size: 500, baseOccupancy: 2, maxOccupancy: 4, baseRate: 6000, extraGuestCharge: 1000 },
            { roomNumber: '302', type: 'SUITE', floor: 3, size: 550, baseOccupancy: 2, maxOccupancy: 4, baseRate: 6500, extraGuestCharge: 1000 },
            { roomNumber: '401', type: 'PREMIUM', floor: 4, size: 700, baseOccupancy: 2, maxOccupancy: 4, baseRate: 8500, extraGuestCharge: 1500 },
            { roomNumber: '402', type: 'PREMIUM', floor: 4, size: 800, baseOccupancy: 2, maxOccupancy: 5, baseRate: 10000, extraGuestCharge: 2000 },
        ];

        for (const roomData of roomsData) {
            const room = await prisma.room.create({
                data: {
                    roomNumber: roomData.roomNumber,
                    type: roomData.type as any,
                    floor: roomData.floor,
                    size: roomData.size,
                    baseOccupancy: roomData.baseOccupancy,
                    maxOccupancy: roomData.maxOccupancy,
                    extraGuestCharge: roomData.extraGuestCharge ?? null,
                    description: `${roomData.type.charAt(0) + roomData.type.slice(1).toLowerCase()} room on floor ${roomData.floor}`,
                    amenities: JSON.stringify(['WiFi', 'AC', 'TV', 'Room Service']),
                    images: JSON.stringify([]),
                    status: 'AVAILABLE',
                    rates: {
                        create: {
                            baseRate: roomData.baseRate,
                            extraGuestCharge: roomData.extraGuestCharge ?? null,
                            effectiveFrom: new Date(),
                        },
                    },
                },
            });
            console.log(`  ✅ Created room ${room.roomNumber} (${room.type})`);
        }
        console.log(`✅ Created ${roomsData.length} sample rooms`);
    }

    // Create hotel configurations
    const configs = await Promise.all([
        prisma.hotelConfig.upsert({
            where: { key: 'hotel_name' },
            update: {},
            create: {
                key: 'hotel_name',
                value: 'Omkar Hotel',
                description: 'Hotel display name',
            },
        }),
        prisma.hotelConfig.upsert({
            where: { key: 'check_in_time' },
            update: {},
            create: {
                key: 'check_in_time',
                value: '14:00',
                description: 'Standard check-in time',
            },
        }),
        prisma.hotelConfig.upsert({
            where: { key: 'check_out_time' },
            update: {},
            create: {
                key: 'check_out_time',
                value: '11:00',
                description: 'Standard check-out time',
            },
        }),
        prisma.hotelConfig.upsert({
            where: { key: 'tax_rate' },
            update: {},
            create: {
                key: 'tax_rate',
                value: '18',
                description: 'Tax rate percentage (GST)',
            },
        }),
    ]);

    console.log(`✅ Created ${configs.length} hotel configurations`);

    // Create admin user (password: admin123)
    const adminUser = await prisma.adminUser.create({
        data: {
            email: 'admin@omkarhotel.com',
            passwordHash: '$2a$10$X8qZ7LJE9PHRl/8kVNZ5h.rY4qV4RjP4F5V8tE9gVnO5M3vJ6zN6K', // admin123
            fullName: 'Admin User',
            role: 'ADMIN',
        },
    });

    console.log(`✅ Created admin user: ${adminUser.email}`);

    console.log('🎉 Seeding completed! Add rooms from the admin panel.');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
