import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// GET /api/admin/rates - Summary per RoomType with averages and latest effective rates
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        rates: {
          where: { effectiveFrom: { lte: new Date() } },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    const byType: Record<string, { type: string; items: { roomId: string; roomNumber: string; baseRate: number; weekendMultiplier: number; extraGuestCharge: number }[] }>
      = {};
    for (const r of rooms) {
      const latest = r.rates[0];
      const baseRate = latest ? latest.baseRate.toNumber() : 0;
      const weekendMultiplier = latest ? latest.weekendMultiplier.toNumber() : 1.2;
      const extraGuestCharge = r.extraGuestCharge ? r.extraGuestCharge.toNumber() : 500;
      const bucket = byType[r.type] || { type: r.type, items: [] };
      bucket.items.push({ roomId: r.id, roomNumber: r.roomNumber, baseRate, weekendMultiplier, extraGuestCharge });
      byType[r.type] = bucket;
    }

    const summary = Object.values(byType).map((g) => {
      const avgBase = g.items.length ? g.items.reduce((s, i) => s + i.baseRate, 0) / g.items.length : 0;
      const avgWm = g.items.length ? g.items.reduce((s, i) => s + i.weekendMultiplier, 0) / g.items.length : 1.2;
      const avgExtraCharge = g.items.length ? g.items.reduce((s, i) => s + i.extraGuestCharge, 0) / g.items.length : 500;
      return {
        roomType: g.type,
        baseRate: Math.round(avgBase),
        weekendMultiplier: Number(avgWm.toFixed(2)),
        weekendRate: Math.round(avgBase * avgWm),
        extraGuestCharge: Math.round(avgExtraCharge),
        count: g.items.length,
      };
    });

    return NextResponse.json({ rates: summary }, { status: 200 });
  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
  }
}

// POST /api/admin/rates - Bulk update: create new rate rows for all rooms of a RoomType
const bulkSchema = z.object({
  roomType: z.enum(['DELUXE','SUITE','FAMILY','STANDARD']),
  baseRate: z.number().min(0),
  weekendMultiplier: z.number().min(0.5).max(3).default(1.2),
  extraGuestCharge: z.number().min(0).optional(),
  effectiveFrom: z.string().optional(), // YYYY-MM-DD
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = bulkSchema.parse({
      ...body,
      baseRate: typeof body.baseRate === 'string' ? Number(body.baseRate) : body.baseRate,
      weekendMultiplier: typeof body.weekendMultiplier === 'string' ? Number(body.weekendMultiplier) : body.weekendMultiplier,
      extraGuestCharge: body.extraGuestCharge !== undefined ? (typeof body.extraGuestCharge === 'string' ? Number(body.extraGuestCharge) : body.extraGuestCharge) : undefined,
    });

    const rooms = await prisma.room.findMany({ where: { type: data.roomType } });
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'No rooms found for this type' }, { status: 404 });
    }

    const effFrom = data.effectiveFrom ? new Date(data.effectiveFrom) : new Date();

    // Update rates and extra guest charge in a transaction
    await prisma.$transaction([
      // Create new rate records
      ...rooms.map((room) =>
        prisma.roomRate.create({
          data: {
            roomId: room.id,
            baseRate: new Prisma.Decimal(data.baseRate),
            weekendMultiplier: new Prisma.Decimal(data.weekendMultiplier),
            effectiveFrom: effFrom,
            rateType: 'BASE',
          },
        })
      ),
      // Update extra guest charge on rooms if provided
      ...(data.extraGuestCharge !== undefined
        ? rooms.map((room) =>
            prisma.room.update({
              where: { id: room.id },
              data: { extraGuestCharge: new Prisma.Decimal(data.extraGuestCharge!) },
            })
          )
        : []),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Error updating rates:', error);
    return NextResponse.json({ error: 'Failed to update rates' }, { status: 500 });
  }
}
