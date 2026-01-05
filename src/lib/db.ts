import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Lazy initialization to ensure env vars are loaded
let pool: Pool | null = null;
let adapter: PrismaPg | null = null;

function getAdapter() {
    if (!adapter) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined');
        }
        pool = new Pool({ connectionString });
        adapter = new PrismaPg(pool);
    }
    return adapter;
}

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma =
    globalThis.prisma ??
    new PrismaClient({
        adapter: getAdapter(),
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
