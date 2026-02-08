'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateRangePicker } from '@/components/DateRangePicker';

type RoomOption = { id: string; label: string; baseRate: number; roomNumber: string; type: string };

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
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    idProofType: 'AADHAAR',
    idProofNumber: '',
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
      setSelectedRoomIds([]);
      setForm({
        fullName: '', email: '', phone: '', idProofType: 'AADHAAR', idProofNumber: '',
        numberOfGuests: 2, paymentMethod: 'CASH', paidAmount: 0, specialRequests: ''
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
        const opts = (j.data || []).map((r: any) => ({ 
          id: r.id, 
          label: `Room ${r.roomNumber} • ${r.type}`, 
          baseRate: r.baseRate,
          roomNumber: r.roomNumber,
          type: r.type
        }));
        setAvailableRooms(opts);
        setSelectedRoomIds([]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch available rooms');
        setAvailableRooms([]);
        setSelectedRoomIds([]);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchAvailable();
  }, [checkIn?.toISOString(), checkOut?.toISOString()]);

  const nights = useMemo(() => (checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000*60*60*24)) : 0), [checkIn, checkOut]);

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const selectAllRooms = () => {
    if (selectedRoomIds.length === availableRooms.length) {
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomIds(availableRooms.map(r => r.id));
    }
  };

  const selectedRoomsTotal = useMemo(() => {
    return selectedRoomIds.reduce((sum, id) => {
      const room = availableRooms.find(r => r.id === id);
      return sum + (room?.baseRate || 0) * nights;
    }, 0);
  }, [selectedRoomIds, availableRooms, nights]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) { setError('Please select check-in and check-out'); return; }
    if (selectedRoomIds.length === 0) { setError('Please select at least one room'); return; }
    if (!form.fullName || !form.email || !form.phone || !form.idProofNumber) { setError('Please complete guest details'); return; }
    setSubmitting(true);
    setError(null);
    
    try {
      const results = [];
      const errors = [];
      let guestId: string | null = null;
      
      // Create a booking for each selected room
      for (let i = 0; i < selectedRoomIds.length; i++) {
        const roomId = selectedRoomIds[i];
        const isFirstBooking = i === 0;
        
        const payload: any = {
          roomId,
          checkIn: checkIn.toISOString().slice(0,10),
          checkOut: checkOut.toISOString().slice(0,10),
          numberOfGuests: Number(form.numberOfGuests),
          specialRequests: form.specialRequests || undefined,
          addons: [],
          paymentMethod: form.paymentMethod as 'CASH' | 'CARD' | 'UPI' | 'ONLINE',
          paidAmount: isFirstBooking ? Number(form.paidAmount) || 0 : 0,
        };

        // First booking creates the guest, subsequent bookings use the guestId
        if (isFirstBooking || !guestId) {
          payload.guestInfo = {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            idProofType: form.idProofType.trim(),
            idProofNumber: form.idProofNumber.trim(),
          };
        } else {
          payload.guestId = guestId;
        }

        console.log(`Sending payload for room ${i + 1}:`, JSON.stringify(payload, null, 2));

        try {
          const res = await fetch('/api/admin/bookings', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload)
          });
          
          console.log(`Response for room ${i + 1}: status=${res.status}`);
          
          if (!res.ok) {
            const text = await res.text();
            console.error(`Response text for room ${i + 1}:`, text);
            let j: any = {};
            try {
              j = JSON.parse(text);
            } catch {
              j = { error: text || `HTTP ${res.status}` };
            }
            const room = availableRooms.find(r => r.id === roomId);
            // Show detailed validation errors
            let errorMsg = j.error || `HTTP ${res.status}`;
            if (j.details) {
              if (Array.isArray(j.details)) {
                errorMsg = j.details.map((d: any) => `${d.path?.join('.')}: ${d.message}`).join(', ');
              } else {
                errorMsg = `${j.error}: ${j.details}`;
              }
            }
            errors.push(`Room ${room?.roomNumber}: ${errorMsg}`);
            console.error('Booking error for room', room?.roomNumber, j);
          } else {
            const j = await res.json();
            console.log('Booking created:', j);
            results.push(j.booking);
            // Store the guestId from first successful booking to reuse
            if (!guestId && j.booking?.guest?.id) {
              guestId = j.booking.guest.id;
              console.log('Captured guestId:', guestId);
            }
          }
        } catch (err) {
          const room = availableRooms.find(r => r.id === roomId);
          errors.push(`Room ${room?.roomNumber}: Network error`);
        }
      }
      
      if (errors.length > 0 && results.length === 0) {
        throw new Error(errors.join('; '));
      }
      
      if (errors.length > 0) {
        setError(`Created ${results.length} booking(s). Errors: ${errors.join('; ')}`);
      }
      
      onCreated();
      if (errors.length === 0) {
        onClose();
      }
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

          {/* Room Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-neutral-700">
                Select Rooms {selectedRoomIds.length > 0 && <span className="text-amber-600">({selectedRoomIds.length} selected)</span>}
              </label>
              {availableRooms.length > 0 && (
                <button 
                  type="button"
                  onClick={selectAllRooms}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  {selectedRoomIds.length === availableRooms.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            
            {roomsLoading ? (
              <div className="flex items-center justify-center py-8 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="animate-spin h-5 w-5 border-2 border-amber-600 border-t-transparent rounded-full mr-2"></div>
                <span className="text-neutral-600 text-sm">Loading available rooms...</span>
              </div>
            ) : !checkIn || !checkOut ? (
              <div className="py-8 text-center bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 text-sm">Select check-in and check-out dates first</span>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="py-8 text-center bg-red-50 rounded-lg border border-red-200">
                <span className="text-red-600 text-sm">No rooms available for selected dates</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {availableRooms.map(room => {
                  const isSelected = selectedRoomIds.includes(room.id);
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => toggleRoom(room.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`font-semibold text-sm ${isSelected ? 'text-amber-700' : 'text-neutral-800'}`}>
                            Room {room.roomNumber}
                          </div>
                          <div className="text-xs text-neutral-500">{room.type}</div>
                          <div className="text-xs font-medium text-neutral-600 mt-1">₹{room.baseRate.toLocaleString()}/night</div>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${
                          isSelected ? 'bg-amber-500' : 'border-2 border-neutral-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {nights > 0 && selectedRoomIds.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-600">
                    {selectedRoomIds.length} room(s) × {nights} night(s)
                  </span>
                  <span className="font-semibold text-amber-700">
                    ₹{selectedRoomsTotal.toLocaleString()} (before tax)
                  </span>
                </div>
              </div>
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
