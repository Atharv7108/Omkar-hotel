import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// DELETE /api/admin/room-blocks/[id]
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.roomBlock.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting room block:', error);
    return NextResponse.json({ error: 'Failed to delete room block' }, { status: 500 });
  }
}
