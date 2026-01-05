import { NextRequest, NextResponse } from 'next/server'
import { syncInventoryFromPMS, pushBookingToPMS } from '@/lib/pms/sync'
import { getPMSAdapter } from '@/lib/pms/adapter-factory'

/**
 * Admin endpoint for manual PMS operations
 * Allows admins to trigger sync operations manually
 * 
 * Route: POST /api/admin/pms/manual-sync
 */
export async function POST(request: NextRequest) {
    // TODO: Add admin authentication middleware
    // For now, we'll allow in development mode

    try {
        const { action, bookingId } = await request.json()

        switch (action) {
            case 'sync_inventory':
                const syncResult = await syncInventoryFromPMS()
                return NextResponse.json(syncResult)

            case 'push_booking':
                if (!bookingId) {
                    return NextResponse.json(
                        { error: 'bookingId required for push_booking action' },
                        { status: 400 }
                    )
                }
                const pushResult = await pushBookingToPMS(bookingId)
                return NextResponse.json(pushResult)

            case 'health_check':
                const pms = getPMSAdapter()
                const isConnected = await pms.isConnected()
                return NextResponse.json({
                    connected: isConnected,
                    pmsType: process.env.PMS_TYPE || 'mock'
                })

            default:
                return NextResponse.json(
                    { error: `Invalid action: ${action}` },
                    { status: 400 }
                )
        }

    } catch (error) {
        console.error('[Admin PMS] Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
