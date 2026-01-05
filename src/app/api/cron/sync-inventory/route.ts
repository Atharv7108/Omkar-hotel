import { NextRequest, NextResponse } from 'next/server'
import { syncInventoryFromPMS } from '@/lib/pms/sync'

/**
 * Cron job endpoint for periodic inventory synchronization
 * Called every 5 minutes by Vercel Cron or node-cron
 * 
 * Route: GET /api/cron/sync-inventory
 */
export async function GET(request: NextRequest) {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'

    if (authHeader !== `Bearer ${cronSecret}`) {
        console.warn('[Cron] Unauthorized sync attempt')
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    console.log('[Cron] Starting scheduled inventory sync...')

    try {
        const result = await syncInventoryFromPMS()

        return NextResponse.json({
            success: result.success,
            timestamp: result.timestamp.toISOString(),
            stats: {
                updatedRooms: result.updatedRooms,
                errorCount: result.errors.length,
                errors: result.errors
            }
        })

    } catch (error) {
        console.error('[Cron] Sync failed:', error)

        return NextResponse.json(
            {
                error: 'Sync failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
