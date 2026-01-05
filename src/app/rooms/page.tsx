'use client';

import { useEffect, useState } from 'react';
import { RoomCard } from '@/components/RoomCard';

interface PublicRoom {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  baseRate: number;
}

export default function RoomsListingPage() {
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/rooms');
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to load rooms');
        }
        const data = await res.json();
        setRooms(data.rooms || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="space-y-8">
      {/* Premium header */}
      <div className="rounded-2xl overflow-hidden shadow-medium">
        <div className="gradient-primary text-white p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-display font-semibold">Find Your Perfect Stay</h1>
          <p className="mt-2 text-white/90 max-w-2xl">Browse our thoughtfully designed rooms with stunning views and modern amenities. Pick the one that suits your style.</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      )}

      {error && (
        <div className="card p-4 text-red-700 bg-red-50 border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No rooms available</h3>
          <p className="text-neutral-600">Please check back later.</p>
        </div>
      )}

      {!loading && !error && rooms.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
