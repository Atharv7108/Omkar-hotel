'use client';

import React from 'react';

export interface AdminBooking {
  id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  room: string;
  roomType: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  status: string;
  totalAmount: number;
  paidAmount: number;
  guests: number;
  pmsBookingId: string | null;
}

interface BookingDetailsDrawerProps {
  open: boolean;
  booking: AdminBooking | null;
  onClose: () => void;
  onChangeStatus: (bookingId: string, status: string, ref: string) => void;
}

export function BookingDetailsDrawer({ open, booking, onClose, onChangeStatus }: BookingDetailsDrawerProps) {
  if (!open || !booking) return null;

  const nights = Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)));

  const statusActions = [
    booking.status === 'PENDING' && { key: 'CONFIRMED', label: 'Confirm', className: 'bg-blue-500 hover:bg-blue-600' },
    booking.status === 'CONFIRMED' && { key: 'CHECKED_IN', label: 'Check-in', className: 'bg-green-500 hover:bg-green-600' },
    booking.status === 'CHECKED_IN' && { key: 'CHECKED_OUT', label: 'Check-out', className: 'bg-neutral-600 hover:bg-neutral-700' },
    !['CANCELLED','CHECKED_OUT'].includes(booking.status) && { key: 'CANCELLED', label: 'Cancel', className: 'bg-red-500 hover:bg-red-600' },
  ].filter(Boolean) as { key: string; label: string; className: string }[];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[540px] bg-white shadow-xl border-l border-neutral-200 overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500">Booking Ref</div>
            <div className="text-lg font-semibold text-neutral-900">{booking.bookingReference}</div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Guest */}
          <section className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Guest</div>
              <div className="text-sm font-medium text-neutral-900">{booking.guestName}</div>
              <div className="text-xs text-neutral-600">{booking.guestEmail}</div>
              <div className="text-xs text-neutral-600">{booking.guestPhone}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Room</div>
              <div className="text-sm font-medium text-neutral-900">Room {booking.room}</div>
              <div className="text-xs text-neutral-600">{booking.roomType}</div>
            </div>
          </section>

          {/* Stay */}
          <section className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Check-in</div>
              <div className="text-sm font-medium text-neutral-900">{booking.checkIn}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Check-out</div>
              <div className="text-sm font-medium text-neutral-900">{booking.checkOut}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Nights</div>
              <div className="text-sm font-medium text-neutral-900">{nights}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Guests</div>
              <div className="text-sm font-medium text-neutral-900">{booking.guests}</div>
            </div>
          </section>

          {/* Payment */}
          <section className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Total Amount</div>
              <div className="text-sm font-semibold text-neutral-900">₹{booking.totalAmount.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Paid</div>
              <div className="text-sm font-semibold text-green-700">₹{booking.paidAmount.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Balance</div>
              <div className="text-sm font-semibold text-orange-700">₹{Math.max(0, booking.totalAmount - booking.paidAmount).toLocaleString('en-IN')}</div>
            </div>
          </section>

          {/* Actions */}
          <section className="flex flex-wrap gap-2 pt-2">
            {statusActions.map(a => (
              <button
                key={a.key}
                onClick={() => onChangeStatus(booking.id, a.key, booking.bookingReference)}
                className={`text-xs px-3 py-2 text-white rounded ${a.className}`}
              >
                {a.label}
              </button>
            ))}
          </section>

          {/* Metadata */}
          {booking.pmsBookingId && (
            <section className="pt-4">
              <div className="text-xs text-neutral-500 mb-1">PMS</div>
              <div className="text-xs text-green-700">Synced • {booking.pmsBookingId}</div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
