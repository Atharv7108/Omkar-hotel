'use client';

import { useState } from 'react';

interface DateRange {
    checkIn: Date | null;
    checkOut: Date | null;
}

interface DateRangePickerProps {
    onChange: (range: DateRange) => void;
    minNights?: number;
}

export function DateRangePicker({ onChange, minNights = 1 }: DateRangePickerProps) {
    const [checkIn, setCheckIn] = useState<string>('');
    const [checkOut, setCheckOut] = useState<string>('');

    const today = new Date().toISOString().split('T')[0];

    const handleCheckInChange = (value: string) => {
        setCheckIn(value);

        // Auto-set checkout to minimum nights later
        const checkInDate = new Date(value);
        const minCheckOut = new Date(checkInDate);
        minCheckOut.setDate(minCheckOut.getDate() + minNights);

        if (!checkOut || new Date(checkOut) <= checkInDate) {
            const newCheckOut = minCheckOut.toISOString().split('T')[0];
            setCheckOut(newCheckOut);
            onChange({
                checkIn: checkInDate,
                checkOut: minCheckOut,
            });
        } else {
            onChange({
                checkIn: checkInDate,
                checkOut: new Date(checkOut),
            });
        }
    };

    const handleCheckOutChange = (value: string) => {
        setCheckOut(value);
        onChange({
            checkIn: checkIn ? new Date(checkIn) : null,
            checkOut: new Date(value),
        });
    };

    const nights = checkIn && checkOut
        ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
            <div className="grid md:grid-cols-3 gap-4">
                {/* Check-in Date */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Check-in
                    </label>
                    <input
                        type="date"
                        value={checkIn}
                        min={today}
                        onChange={(e) => handleCheckInChange(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Check-out Date */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Check-out
                    </label>
                    <input
                        type="date"
                        value={checkOut}
                        min={checkIn || today}
                        onChange={(e) => handleCheckOutChange(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Nights Display */}
                <div className="flex items-end">
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Duration
                        </label>
                        <div className="input-field bg-neutral-50 flex items-center justify-center font-semibold text-brand-primary">
                            {nights > 0 ? `${nights} Night${nights > 1 ? 's' : ''}` : '—'}
                        </div>
                    </div>
                </div>
            </div>

            {nights > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200 text-sm text-neutral-600 text-center">
                    📅 {new Date(checkIn).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    })} → {new Date(checkOut).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            )}
        </div>
    );
}
