'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateRangePicker } from '@/components/DateRangePicker';

type RoomOption = { id: string; label: string; baseRate: number };

interface NewBookingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // refresh callback
}

export default function NewBookingModal({ open, onClose, onCreated }: NewBookingModalProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [availableRooms, setAvailableRooms] = useState<RoomOption[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    idProofType: 'AADHAAR',
    idProofNumber: '',
    roomId: '',
    numberOfGuests: 2,
    paymentMethod: 'CASH',
    paidAmount: 0,
    specialRequests: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset on close
      setCheckIn(null);
      setCheckOut(null);
      setAvailableRooms([]);
      setForm({
        fullName: '', email: '', phone: '', idProofType: 'AADHAAR', idProofNumber: '',
        roomId: '', numberOfGuests: 2, paymentMethod: 'CASH', paidAmount: 0, specialRequests: ''
      });
      setError(null);
    }
  }, [open]);

  // Fetch available rooms when both dates selected
  useEffect(() => {
    const fetchAvailable = async () => {
      if (!checkIn || !checkOut) return;
      setRoomsLoading(true);
      setError(null);
      try {
        const url = `/api/rooms/available?checkIn=${encodeURIComponent(checkIn.toISOString())}&checkOut=${encodeURIComponent(checkOut.toISOString())}`;
        const res = await fetch(url);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Failed to fetch available rooms');
        }
        const j = await res.json();
        const opts = (j.data || []).map((r: any) => ({ id: r.id, label: `Room ${r.roomNumber} • ${r.type}`, baseRate: r.baseRate }));
        setAvailableRooms(opts);
        // auto-select first room
        setForm((f) => ({ ...f, roomId: opts[0]?.id ?? '' }));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch available rooms');
        setAvailableRooms([]);
        setForm((f) => ({ ...f, roomId: '' }));
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchAvailable();
  }, [checkIn?.toISOString(), checkOut?.toISOString()]);

  const nights = useMemo(() => (checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000*60*60*24)) : 0), [checkIn, checkOut]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) { setError('Please select check-in and check-out'); return; }
    if (!form.roomId) { setError('Please select a room'); return; }
    if (!form.fullName || !form.email || !form.phone || !form.idProofNumber) { setError('Please complete guest details'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        guestInfo: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          idProofType: form.idProofType.trim(),
          idProofNumber: form.idProofNumber.trim(),
        },
        roomId: form.roomId,
        checkIn: checkIn.toISOString().slice(0,10),
        checkOut: checkOut.toISOString().slice(0,10),
        numberOfGuests: Number(form.numberOfGuests),
        specialRequests: form.specialRequests || undefined,
        addons: [],
        paymentMethod: form.paymentMethod as 'CASH' | 'CARD' | 'UPI' | 'ONLINE',
        paidAmount: Number(form.paidAmount) || 0,
      };

      const res = await fetch('/api/admin/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to create booking');
      }
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[720px] bg-white shadow-xl border-l border-neutral-200 overflow-y-auto">
        <form onSubmit={submit} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">New Booking</h2>
            <button type="button" onClick={onClose} className="text-neutral-500 hover:text-neutral-800">✕</button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">{error}</div>
          )}

          {/* Dates */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Stay Dates</label>
            <DateRangePicker
              onChange={({checkIn: ci, checkOut: co}) => { setCheckIn(ci); setCheckOut(co); }}
              minNights={1}
            />
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Room</label>
            <select
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              className="input-field"
              disabled={!checkIn || !checkOut || roomsLoading}
              required
            >
              <option value="">{roomsLoading ? 'Loading rooms…' : 'Select room'}</option>
              {availableRooms.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            {nights > 0 && form.roomId && (
              <p className="text-xs text-neutral-600 mt-1">{nights} night(s)</p>
            )}
          </div>

          {/* Guest */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Full Name</label>
              <input className="input-field" value={form.fullName} onChange={(e)=>setForm({...form, fullName: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Phone</label>
              <input className="input-field" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">ID Type</label>
                <select className="input-field" value={form.idProofType} onChange={(e)=>setForm({...form, idProofType: e.target.value})}>
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="VOTER_ID">Voter ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">ID Number</label>
                <input className="input-field" value={form.idProofNumber} onChange={(e)=>setForm({...form, idProofNumber: e.target.value})} required />
              </div>
            </div>
          </div>

          {/* Others */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Guests</label>
              <input type="number" min={1} className="input-field" value={form.numberOfGuests} onChange={(e)=>setForm({...form, numberOfGuests: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Payment Method</label>
              <select className="input-field" value={form.paymentMethod} onChange={(e)=>setForm({...form, paymentMethod: e.target.value})}>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Paid Amount (₹)</label>
              <input type="number" min={0} className="input-field" value={form.paidAmount} onChange={(e)=>setForm({...form, paidAmount: Number(e.target.value)})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Special Requests</label>
            <textarea className="input-field" rows={3} value={form.specialRequests} onChange={(e)=>setForm({...form, specialRequests: e.target.value})} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-brand-primary text-white hover:opacity-90">
              {submitting ? 'Creating…' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
