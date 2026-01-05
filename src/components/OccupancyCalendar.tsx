'use client';

import { useEffect, useMemo, useState } from 'react';

interface CalendarDay {
    date: number;
    isCurrentMonth: boolean;
    bookings: number;
    checkIns: number;
    checkOuts: number;
}

export default function OccupancyCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [stats, setStats] = useState<Record<string, { bookings: number; checkIns: number; checkOuts: number; blocks: number }> | null>(null);
    const [rooms, setRooms] = useState<{ id: string; roomNumber: string }[]>([]);
    const [form, setForm] = useState<{ roomId: string; start: string; end: string; reason: string }>({ roomId: '', start: '', end: '', reason: '' });
    const [loading, setLoading] = useState(false);

    // Get month/year info
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    // Generate calendar days
    const generateCalendar = (): CalendarDay[] => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: CalendarDay[] = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: prevMonthLastDay - i,
                isCurrentMonth: false,
                bookings: 0,
                checkIns: 0,
                checkOuts: 0,
            });
        }

        // Current month days (from API stats)
        for (let date = 1; date <= daysInMonth; date++) {
            const key = new Date(year, month, date).toISOString().slice(0, 10);
            const d = stats?.[key] ?? { bookings: 0, checkIns: 0, checkOuts: 0, blocks: 0 };
            days.push({
                date,
                isCurrentMonth: true,
                bookings: d.bookings,
                checkIns: d.checkIns,
                checkOuts: d.checkOuts,
            });
        }

        // Next month days
        const remainingDays = 42 - days.length; // 6 rows × 7 days
        for (let date = 1; date <= remainingDays; date++) {
            days.push({
                date,
                isCurrentMonth: false,
                bookings: 0,
                checkIns: 0,
                checkOuts: 0,
            });
        }

        return days;
    };

    const days = useMemo(() => generateCalendar(), [currentDate, stats]);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (day: CalendarDay) => {
        const today = new Date();
        return (
            day.isCurrentMonth &&
            day.date === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    const getOccupancyColor = (bookings: number) => {
        if (bookings === 0) return 'bg-neutral-100';
        if (bookings < 5) return 'bg-green-100';
        if (bookings < 10) return 'bg-yellow-100';
        if (bookings < 15) return 'bg-orange-100';
        return 'bg-red-100';
    };

    // Fetch month stats and rooms
    useEffect(() => {
        const m = `${year}-${String(month + 1).padStart(2, '0')}`;
        (async () => {
            try {
                const [occRes, roomsRes] = await Promise.all([
                    fetch(`/api/admin/occupancy?month=${m}`),
                    fetch(`/api/admin/rooms`),
                ]);
                if (occRes.ok) {
                    const data = await occRes.json();
                    setStats(data.days);
                } else {
                    setStats(null);
                }
                if (roomsRes.ok) {
                    const data = await roomsRes.json();
                    setRooms((data.rooms || []).map((r: any) => ({ id: r.id, roomNumber: r.roomNumber })));
                }
            } catch {
                setStats(null);
            }
        })();
    }, [year, month]);

    // Realtime: refresh stats when inventory updates (booking or blocks)
    useEffect(() => {
        let pusher: any;
        let channel: any;
        (async () => {
            try {
                const { default: Pusher } = await import('pusher-js');
                const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
                const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string | undefined;
                if (!key || !cluster) return;
                pusher = new Pusher(key as string, { cluster });
                channel = pusher.subscribe('inventory');
                const refresh = async () => {
                    const m = `${year}-${String(month + 1).padStart(2, '0')}`;
                    const occ = await fetch(`/api/admin/occupancy?month=${m}`);
                    if (occ.ok) {
                        const data = await occ.json();
                        setStats(data.days);
                    }
                };
                channel.bind('update', refresh);
            } catch {
                // ignore when pusher not configured
            }
        })();
        return () => {
            try {
                if (channel) channel.unbind_all();
                if (pusher) pusher.unsubscribe('inventory');
            } catch {}
        };
    }, [year, month]);

    const submitBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.roomId || !form.start || !form.end) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/room-blocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: form.roomId, startDate: form.start, endDate: form.end, reason: form.reason }),
            });
            if (!res.ok) throw new Error('Failed to create block');
            // reload stats
            const m = `${year}-${String(month + 1).padStart(2, '0')}`;
            const occ = await fetch(`/api/admin/occupancy?month=${m}`);
            if (occ.ok) {
                const data = await occ.json();
                setStats(data.days);
            }
            setForm({ roomId: '', start: '', end: '', reason: '' });
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : 'Failed to create block');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Quick block form */}
            <form onSubmit={submitBlock} className="card p-4">
                <div className="grid md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Room</label>
                        <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} className="input-field" required>
                            <option value="">Select room</option>
                            {rooms.map(r => (<option key={r.id} value={r.id}>Room {r.roomNumber}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Start</label>
                        <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">End</label>
                        <input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="input-field" required />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Blocking...' : 'Block Dates'}</button>
                    </div>
                </div>
            </form>
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-neutral-900">
                        {monthName} {year}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">
                        View occupancy and upcoming check-ins/check-outs
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Today
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        Next →
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-neutral-600">Low (0-5)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span className="text-neutral-600">Medium (5-10)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                    <span className="text-neutral-600">High (10-15)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-neutral-600">Full (15+)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-neutral-300 border border-neutral-400 rounded"></div>
                    <span className="text-neutral-600">Blocked</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 bg-neutral-100 border-b border-neutral-200">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="py-3 text-center text-sm font-semibold text-neutral-700"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={`
                                min-h-25 p-2 border-b border-r border-neutral-200
                                ${!day.isCurrentMonth ? 'bg-neutral-50' : getOccupancyColor(day.bookings)}
                                ${isToday(day) ? 'ring-2 ring-brand-primary ring-inset' : ''}
                                hover:bg-opacity-80 transition-colors cursor-pointer
                                ${index % 7 === 6 ? 'border-r-0' : ''}
                                ${index >= 35 ? 'border-b-0' : ''}
                            `}
                        >
                            <div className={`
                                text-sm font-semibold mb-2
                                ${!day.isCurrentMonth ? 'text-neutral-400' : 'text-neutral-900'}
                                ${isToday(day) ? 'text-brand-primary' : ''}
                            `}>
                                {day.date}
                            </div>

                            {day.isCurrentMonth && (day.bookings > 0 || (stats?.[new Date(year, month, day.date).toISOString().slice(0,10)]?.blocks ?? 0) > 0) && (
                                <div className="space-y-1">
                                    <div className="text-xs text-neutral-700">
                                        {day.bookings} bookings
                                    </div>
                                    {(stats?.[new Date(year, month, day.date).toISOString().slice(0,10)]?.blocks ?? 0) > 0 && (
                                        <div className="text-xs text-neutral-700">
                                            {(stats?.[new Date(year, month, day.date).toISOString().slice(0,10)]?.blocks ?? 0)} blocked
                                        </div>
                                    )}
                                    {day.checkIns > 0 && (
                                        <div className="text-xs text-green-700 flex items-center gap-1">
                                            <span>✅</span>
                                            <span>{day.checkIns} check-in{day.checkIns > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                    {day.checkOuts > 0 && (
                                        <div className="text-xs text-orange-700 flex items-center gap-1">
                                            <span>🚪</span>
                                            <span>{day.checkOuts} check-out{day.checkOuts > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card p-4">
                    <div className="text-sm text-neutral-600 mb-1">Total Bookings</div>
                    <div className="text-2xl font-bold text-neutral-900">
                        {days.filter(d => d.isCurrentMonth).reduce((sum, d) => sum + d.bookings, 0)}
                    </div>
                </div>
                <div className="card p-4">
                    <div className="text-sm text-neutral-600 mb-1">Check-ins</div>
                    <div className="text-2xl font-bold text-green-600">
                        {days.filter(d => d.isCurrentMonth).reduce((sum, d) => sum + d.checkIns, 0)}
                    </div>
                </div>
                <div className="card p-4">
                    <div className="text-sm text-neutral-600 mb-1">Check-outs</div>
                    <div className="text-2xl font-bold text-orange-600">
                        {days.filter(d => d.isCurrentMonth).reduce((sum, d) => sum + d.checkOuts, 0)}
                    </div>
                </div>
            </div>
        </div>
    );
}
