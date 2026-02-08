'use client';

import { useState } from 'react';

interface DateRange {
    checkIn: Date | null;
    checkOut: Date | null;
    guests: number;
}

interface DateRangePickerProps {
    onChange: (range: DateRange) => void;
    minNights?: number;
    maxGuests?: number;
}

export function DateRangePicker({ onChange, minNights = 1, maxGuests = 10 }: DateRangePickerProps) {
    const [checkIn, setCheckIn] = useState<string>('');
    const [checkOut, setCheckOut] = useState<string>('');
    const [guests, setGuests] = useState<number>(2);

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
                guests,
            });
        } else {
            onChange({
                checkIn: checkInDate,
                checkOut: new Date(checkOut),
                guests,
            });
        }
    };

    const handleCheckOutChange = (value: string) => {
        setCheckOut(value);
        onChange({
            checkIn: checkIn ? new Date(checkIn) : null,
            checkOut: new Date(value),
            guests,
        });
    };

    const handleGuestsChange = (value: number) => {
        setGuests(value);
        if (checkIn && checkOut) {
            onChange({
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                guests: value,
            });
        }
    };

    const nights = checkIn && checkOut
        ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="bg-[#3E362E] rounded-2xl p-6 border border-[#93785B]/30">
            <div className="grid md:grid-cols-4 gap-6">
                {/* Check-in Date */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#A69080] mb-3">
                        <svg className="w-4 h-4 text-[#C9A66B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Check-in
                    </label>
                    <input
                        type="date"
                        value={checkIn}
                        min={today}
                        onChange={(e) => handleCheckInChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#93785B]/40 bg-[#3E362E] rounded-xl focus:border-[#C9A66B] focus:ring-4 focus:ring-[#C9A66B]/10 transition-all text-white font-medium"
                    />
                </div>

                {/* Check-out Date */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#A69080] mb-3">
                        <svg className="w-4 h-4 text-[#C9A66B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Check-out
                    </label>
                    <input
                        type="date"
                        value={checkOut}
                        min={checkIn || today}
                        onChange={(e) => handleCheckOutChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#93785B]/40 bg-[#3E362E] rounded-xl focus:border-[#C9A66B] focus:ring-4 focus:ring-[#C9A66B]/10 transition-all text-white font-medium"
                    />
                </div>

                {/* Guests Selector */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#A69080] mb-3">
                        <svg className="w-4 h-4 text-[#C9A66B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Guests
                    </label>
                    <div className="flex items-center justify-between px-4 py-3 border-2 border-[#93785B]/40 rounded-xl bg-[#3E362E]">
                        <button
                            type="button"
                            onClick={() => handleGuestsChange(Math.max(1, guests - 1))}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#93785B]/50 to-[#93785B]/30 hover:from-[#865D36] hover:to-[#AC8968] flex items-center justify-center text-white font-bold transition-all text-lg disabled:opacity-40"
                            disabled={guests <= 1}
                        >
                            −
                        </button>
                        <span className="font-bold text-lg text-white">
                            {guests} <span className="font-normal text-[#A69080]">Guest{guests > 1 ? 's' : ''}</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => handleGuestsChange(Math.min(maxGuests, guests + 1))}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#93785B]/50 to-[#93785B]/30 hover:from-[#865D36] hover:to-[#AC8968] flex items-center justify-center text-white font-bold transition-all text-lg disabled:opacity-40"
                            disabled={guests >= maxGuests}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Nights Display / Search Button */}
                <div className="flex items-end">
                    <div className="w-full">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#A69080] mb-3">
                            <svg className="w-4 h-4 text-[#C9A66B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            Duration
                        </label>
                        <div className={`px-4 py-3 rounded-xl flex items-center justify-center font-bold text-lg ${
                            nights > 0 
                                ? 'bg-gradient-to-r from-[#865D36] to-[#AC8968] text-white shadow-lg shadow-[#865D36]/30' 
                                : 'bg-[#3E362E] text-[#A69080]'
                        }`}>
                            {nights > 0 ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    {nights} Night{nights > 1 ? 's' : ''}
                                </span>
                            ) : (
                                'Select dates'
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {nights > 0 && (
                <div className="mt-6 pt-4 border-t border-[#93785B]/30 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-[#A69080]">
                        <div className="w-8 h-8 bg-[#C9A66B]/20 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#C9A66B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-white">{new Date(checkIn).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}</p>
                            <p className="text-xs text-[#93785B]">Check-in</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#93785B]">
                        <span>→</span>
                        <span className="text-xs">{nights} night{nights > 1 ? 's' : ''}</span>
                        <span>→</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#A69080]">
                        <div className="w-8 h-8 bg-[#865D36]/20 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#865D36]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-white">{new Date(checkOut).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}</p>
                            <p className="text-xs text-[#93785B]">Check-out</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
