import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a new pool just for seeding
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await prisma.roomBlock.deleteMany({});
    await prisma.roomRate.deleteMany({});
    await prisma.bookingAddon.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.guest.deleteMany({});
    await prisma.adminUser.deleteMany({});
    await prisma.hotelConfig.deleteMany({});
    console.log('✅ Existing data cleared');

    // No sample rooms - admin will add rooms manually via admin panel

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
