import { PrismaClient, RoomType, RoomStatus, RateType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a new pool just for seeding
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Create sample rooms
    const rooms = await Promise.all([
        prisma.room.create({
            data: {
                roomNumber: '101',
                type: RoomType.DELUXE,
                capacity: 2,
                floor: 1,
                size: 300,
                description: 'Luxurious deluxe room with stunning valley views and modern amenities.',
                amenities: JSON.stringify([
                    'King Size Bed',
                    'Air Conditioning',
                    'Free WiFi',
                    'Smart TV',
                    'Mini Bar',
                    'Valley View',
                    'Balcony',
                ]),
                images: JSON.stringify([
                    '/images/rooms/deluxe-1.jpg',
                    '/images/rooms/deluxe-2.jpg',
                ]),
                status: RoomStatus.AVAILABLE,
                rates: {
                    create: {
                        baseRate: 3500,
                        effectiveFrom: new Date('2025-01-01'),
                        rateType: RateType.BASE,
                        weekendMultiplier: 1.3,
                        description: 'Standard rate for deluxe room',
                    },
                },
            },
        }),
        prisma.room.create({
            data: {
                roomNumber: '102',
                type: RoomType.DELUXE,
                capacity: 2,
                floor: 1,
                size: 300,
                description: 'Elegant deluxe room with garden views and premium furnishings.',
                amenities: JSON.stringify([
                    'King Size Bed',
                    'Air Conditioning',
                    'Free WiFi',
                    'Smart TV',
                    'Mini Bar',
                    'Garden View',
                ]),
                images: JSON.stringify([
                    '/images/rooms/deluxe-3.jpg',
                    '/images/rooms/deluxe-4.jpg',
                ]),
                status: RoomStatus.AVAILABLE,
                rates: {
                    create: {
                        baseRate: 3500,
                        effectiveFrom: new Date('2025-01-01'),
                        rateType: RateType.BASE,
                        weekendMultiplier: 1.3,
                    },
                },
            },
        }),
        prisma.room.create({
            data: {
                roomNumber: '201',
                type: RoomType.SUITE,
                capacity: 3,
                floor: 2,
                size: 450,
                description: 'Spacious suite with separate living area and panoramic mountain views.',
                amenities: JSON.stringify([
                    'King Size Bed',
                    'Sofa Bed',
                    'Air Conditioning',
                    'Free WiFi',
                    'Smart TV',
                    'Mini Bar',
                    'Mountain View',
                    'Balcony',
                    'Jacuzzi',
                ]),
                images: JSON.stringify([
                    '/images/rooms/suite-1.jpg',
                    '/images/rooms/suite-2.jpg',
                ]),
                status: RoomStatus.AVAILABLE,
                rates: {
                    create: {
                        baseRate: 5500,
                        effectiveFrom: new Date('2025-01-01'),
                        rateType: RateType.BASE,
                        weekendMultiplier: 1.4,
                        description: 'Premium suite rate',
                    },
                },
            },
        }),
        prisma.room.create({
            data: {
                roomNumber: '202',
                type: RoomType.SUITE,
                capacity: 3,
                floor: 2,
                size: 450,
                description: 'Luxury suite with modern amenities and stunning valley views.',
                amenities: JSON.stringify([
                    'King Size Bed',
                    'Sofa Bed',
                    'Air Conditioning',
                    'Free WiFi',
                    'Smart TV',
                    'Mini Bar',
                    'Valley View',
                    'Balcony',
                    'Jacuzzi',
                ]),
                images: JSON.stringify([
                    '/images/rooms/suite-3.jpg',
                    '/images/rooms/suite-4.jpg',
                ]),
                status: RoomStatus.AVAILABLE,
                rates: {
                    create: {
                        baseRate: 5500,
                        effectiveFrom: new Date('2025-01-01'),
                        rateType: RateType.BASE,
                        weekendMultiplier: 1.4,
                    },
                },
            },
        }),
        prisma.room.create({
            data: {
                roomNumber: '301',
                type: RoomType.FAMILY,
                capacity: 5,
                floor: 3,
                size: 600,
                description: 'Perfect for families! Spacious room with multiple beds and entertainment options.',
                amenities: JSON.stringify([
                    'Queen Size Bed',
                    '2 Single Beds',
                    'Air Conditioning',
                    'Free WiFi',
                    'Smart TV',
                    'Mini Bar',
                    'Kids Play Area',
                    'Balcony',
                    'Kitchenette',
                ]),
                images: JSON.stringify([
                    '/images/rooms/family-1.jpg',
                    '/images/rooms/family-2.jpg',
                ]),
                status: RoomStatus.AVAILABLE,
                rates: {
                    create: {
                        baseRate: 6500,
                        effectiveFrom: new Date('2025-01-01'),
                        rateType: RateType.BASE,
                        weekendMultiplier: 1.5,
                        description: 'Family room rate',
                    },
                },
            },
        }),
        prisma.room.create({
            data: {
                roomNumber: '103',
                type: RoomType.STANDARD,
                capacity: 2,
                floor: 1,
                size: 250,
                description: 'Comfortable standard room with all essential amenities.',
                amenities: JSON.stringify([
                    'Double Bed',
                    'Air Conditioning',
                    'Free WiFi',
                    'TV',
                    'City View',
                ]),
                images: JSON.stringify([
                    '/images/rooms/standard-1.jpg',
                    '/images/rooms/standard-2.jpg',
                ]),
                status: RoomStatus.AVAILABLE,
                rates: {
                    create: {
                        baseRate: 2500,
                        effectiveFrom: new Date('2025-01-01'),
                        rateType: RateType.BASE,
                        weekendMultiplier: 1.2,
                        description: 'Standard room rate',
                    },
                },
            },
        }),
    ]);

    console.log(`✅ Created ${rooms.length} rooms`);

    // Create seasonal rates (December-February peak season in Mahabaleshwar)
    const seasonalRates = await Promise.all(
        rooms.map((room) =>
            prisma.roomRate.create({
                data: {
                    roomId: room.id,
                    baseRate: room.rates[0].baseRate.toNumber() * 1.5,
                    effectiveFrom: new Date('2025-12-01'),
                    effectiveTo: new Date('2026-02-28'),
                    rateType: RateType.SEASONAL,
                    weekendMultiplier: 1.5,
                    description: 'Peak season (Winter) rate',
                },
            })
        )
    );

    console.log(`✅ Created ${seasonalRates.length} seasonal rates`);

    // Create hotel configuration
    const configs = await Promise.all([
        prisma.hotelConfig.create({
            data: {
                key: 'hotel_info',
                value: JSON.stringify({
                    name: 'Omkar Hotel',
                    location: 'Mahabaleshwar',
                    address: 'Main Market Road, Mahabaleshwar, Maharashtra 412806',
                    phone: '+91 12345 67890',
                    email: 'info@omkarhotel.com',
                    checkInTime: '14:00',
                    checkOutTime: '11:00',
                }),
                description: 'Basic hotel information',
            },
        }),
        prisma.hotelConfig.create({
            data: {
                key: 'tax_config',
                value: JSON.stringify({
                    gstRate: 12,
                    serviceTax: 10,
                }),
                description: 'Tax configuration',
            },
        }),
        prisma.hotelConfig.create({
            data: {
                key: 'addons',
                value: JSON.stringify([
                    {
                        id: 'breakfast',
                        name: 'Breakfast Package',
                        price: 300,
                        description: 'Complimentary breakfast for all guests',
                        icon: '🍳',
                    },
                    {
                        id: 'spa',
                        name: 'Spa Treatment',
                        price: 1500,
                        description: 'Relaxing spa session (60 minutes)',
                        icon: '💆',
                    },
                    {
                        id: 'pickup',
                        name: 'Airport/Station Pickup',
                        price: 800,
                        description: 'Pickup from Pune Airport or Satara Station',
                        icon: '🚗',
                    },
                    {
                        id: 'late_checkout',
                        name: 'Late Checkout',
                        price: 500,
                        description: 'Extend checkout time till 2 PM',
                        icon: '🕐',
                    },
                ]),
                description: 'Available add-ons for bookings',
            },
        }),
    ]);

    console.log(`✅ Created ${configs.length} hotel configurations`);

    // Create admin user (password: admin123)
    // In production, use proper password hashing with bcrypt
    const adminUser = await prisma.adminUser.create({
        data: {
            email: 'admin@omkarhotel.com',
            passwordHash: '$2a$10$X8qZ7LJE9PHRl/8kVNZ5h.rY4qV4RjP4F5V8tE9gVnO5M3vJ6zN6K', // admin123
            fullName: 'Admin User',
            role: 'ADMIN',
        },
    });

    console.log(`✅ Created admin user: ${adminUser.email}`);

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
