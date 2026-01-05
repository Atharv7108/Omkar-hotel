'use client';

import { useState, useEffect } from 'react';
import RoomFormModal from '@/components/admin/RoomFormModal';

interface Room {
    id: string;
    roomNumber: string;
    type: string;
    capacity: number;
    status: string;
    baseRate: number;
    amenities: string[];
    images: string[];
    description: string;
    floor: number;
    size: number;
}

export default function RoomsManagementPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // Fetch rooms from API
    const fetchRooms = async () => {
        setLoading(true);
        try {
            const url = filter === 'all'
                ? '/api/admin/rooms'
                : `/api/admin/rooms?status=${filter}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch rooms');

            const data = await response.json();
            setRooms(data.rooms);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            alert('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [filter]);

    const handleCreateRoom = async (formData: any) => {
        try {
            const response = await fetch('/api/admin/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                let message = 'Failed to create room';
                try {
                    const error = await response.json();
                    if (error?.details?.length) {
                        // Show the first validation issue message
                        message = `Validation failed: ${error.details[0]?.message ?? error.error}`;
                    } else if (error?.error) {
                        message = error.error;
                    }
                } catch (_) { /* ignore JSON parse errors */ }
                throw new Error(message);
            }

            await fetchRooms();
            alert('Room created successfully!');
        } catch (error) {
            console.error('Error creating room:', error);
            alert(error instanceof Error ? error.message : 'Failed to create room');
            throw error;
        }
    };

    const handleEditRoom = async (formData: any) => {
        if (!selectedRoom) return;

        try {
            const response = await fetch(`/api/admin/rooms/${selectedRoom.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update room');
            }

            await fetchRooms();
            alert('Room updated successfully!');
        } catch (error) {
            console.error('Error updating room:', error);
            alert(error instanceof Error ? error.message : 'Failed to update room');
            throw error;
        }
    };

    const handleDeleteRoom = async (roomId: string, roomNumber: string) => {
        if (!confirm(`Are you sure you want to delete Room ${roomNumber}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/rooms/${roomId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete room');
            }

            await fetchRooms();
            alert('Room deleted successfully!');
        } catch (error) {
            console.error('Error deleting room:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete room');
        }
    };

    const handleStatusChange = async (roomId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/admin/rooms/${roomId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Optimistically update UI
            setRooms(rooms.map(room =>
                room.id === roomId ? { ...room, status: newStatus } : room
            ));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update room status');
            await fetchRooms(); // Refresh on error
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-green-100 text-green-700';
            case 'OCCUPIED':
                return 'bg-red-100 text-red-700';
            case 'CLEANING':
                return 'bg-yellow-100 text-yellow-700';
            case 'MAINTENANCE':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-neutral-100 text-neutral-700';
        }
    };

    const getRoomTypeLabel = (type: string) => {
        return type.charAt(0) + type.slice(1).toLowerCase();
    };

    const filteredRooms = filter === 'all'
        ? rooms
        : rooms.filter(room => room.status === filter);

    const statusCounts = {
        all: rooms.length,
        AVAILABLE: rooms.filter(r => r.status === 'AVAILABLE').length,
        OCCUPIED: rooms.filter(r => r.status === 'OCCUPIED').length,
        CLEANING: rooms.filter(r => r.status === 'CLEANING').length,
        MAINTENANCE: rooms.filter(r => r.status === 'MAINTENANCE').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Room Management</h1>
                    <p className="text-neutral-600 mt-1">Manage room status and availability</p>
                </div>
                <button
                    onClick={() => {
                        setModalMode('create');
                        setSelectedRoom(null);
                        setModalOpen(true);
                    }}
                    className="btn-primary"
                >
                    + Add New Room
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'All Rooms', count: statusCounts.all },
                        { key: 'AVAILABLE', label: 'Available', count: statusCounts.AVAILABLE },
                        { key: 'OCCUPIED', label: 'Occupied', count: statusCounts.OCCUPIED },
                        { key: 'CLEANING', label: 'Cleaning', count: statusCounts.CLEANING },
                        { key: 'MAINTENANCE', label: 'Maintenance', count: statusCounts.MAINTENANCE },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === tab.key
                                ? 'bg-brand-primary text-white'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                    <div key={room.id} className="card p-6">
                        {/* Room Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900">
                                    Room {room.roomNumber}
                                </h3>
                                <p className="text-sm text-neutral-600">{getRoomTypeLabel(room.type)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                                {room.status}
                            </span>
                        </div>

                        {/* Room Details */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600">Capacity</span>
                                <span className="font-medium text-neutral-900">{room.capacity} guests</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600">Base Rate</span>
                                <span className="font-medium text-neutral-900">₹{room.baseRate.toLocaleString('en-IN')}/night</span>
                            </div>
                        </div>

                        {/* Status Change Dropdown */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-2">
                                Update Status
                            </label>
                            <select
                                value={room.status}
                                onChange={(e) => handleStatusChange(room.id, e.target.value)}
                                className="input-field text-sm"
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="OCCUPIED">Occupied</option>
                                <option value="CLEANING">Cleaning</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="OUT_OF_ORDER">Out of Order</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-4 border-t border-neutral-200 flex gap-2">
                            <button
                                onClick={() => {
                                    setModalMode('edit');
                                    setSelectedRoom(room);
                                    setModalOpen(true);
                                }}
                                className="flex-1 btn-secondary text-sm py-2"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                                className="px-3 py-2 text-neutral-600 hover:text-red-600 transition-colors"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredRooms.length === 0 && (
                <div className="card p-12 text-center">
                    <div className="text-6xl mb-4">🏨</div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                        No rooms found
                    </h3>
                    <p className="text-neutral-600">
                        {rooms.length === 0
                            ? 'Click "Add New Room" to create your first room'
                            : 'No rooms match the selected filter'}
                    </p>
                </div>
            )}

            {/* Room Form Modal */}
            <RoomFormModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedRoom(null);
                }}
                onSubmit={modalMode === 'create' ? handleCreateRoom : handleEditRoom}
                initialData={selectedRoom ? {
                    roomNumber: selectedRoom.roomNumber,
                    type: selectedRoom.type as any,
                    capacity: selectedRoom.capacity,
                    floor: selectedRoom.floor,
                    size: selectedRoom.size,
                    description: selectedRoom.description,
                    amenities: selectedRoom.amenities,
                    images: selectedRoom.images,
                    baseRate: selectedRoom.baseRate,
                } : undefined}
                mode={modalMode}
            />
        </div>
    );
}
