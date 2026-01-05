'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface RoomFormData {
    roomNumber: string;
    type: 'STANDARD' | 'DELUXE' | 'SUITE' | 'FAMILY' | 'PENTHOUSE';
    capacity: number;
    floor: number;
    size: number;
    description: string;
    amenities: string[];
    images: string[];
    baseRate: number;
}

interface RoomFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RoomFormData) => Promise<void>;
    initialData?: Partial<RoomFormData>;
    mode: 'create' | 'edit';
}

// Match DB enum RoomType
const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'] as const;

const COMMON_AMENITIES = [
    'Air Conditioning',
    'Free WiFi',
    'TV',
    'Smart TV',
    'Mini Bar',
    'King Size Bed',
    'Queen Size Bed',
    'Double Bed',
    'Single Beds',
    'Balcony',
    'Valley View',
    'Garden View',
    'Mountain View',
    'City View',
    'Jacuzzi',
    'Bathtub',
    'Sofa Bed',
    'Work Desk',
    'Coffee Maker',
    'Refrigerator',
    'Kitchenette',
    'Room Service',
];

export default function RoomFormModal({ isOpen, onClose, onSubmit, initialData, mode }: RoomFormModalProps) {
    const [formData, setFormData] = useState<RoomFormData>({
        roomNumber: initialData?.roomNumber || '',
        type: initialData?.type || 'DELUXE',
        capacity: initialData?.capacity || 2,
        floor: initialData?.floor || 1,
        size: initialData?.size || 300,
        description: initialData?.description || '',
        amenities: initialData?.amenities || [],
        images: initialData?.images || [],
        baseRate: initialData?.baseRate || 2500,
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    // Reset form data when modal opens or initialData/mode changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                roomNumber: initialData?.roomNumber || '',
                type: initialData?.type || 'DELUXE',
                capacity: initialData?.capacity || 2,
                floor: initialData?.floor || 1,
                size: initialData?.size || 300,
                description: initialData?.description || '',
                amenities: initialData?.amenities || [],
                images: initialData?.images || [],
                baseRate: initialData?.baseRate || 2500,
            });
        }
    }, [isOpen, initialData, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileKey = `${file.name}-${Date.now()}`;

            try {
                // Create FormData
                const formData = new FormData();
                formData.append('file', file);

                // Simulate progress (since fetch doesn't support upload progress directly)
                setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));

                // Upload file
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Upload failed');
                }

                const data = await response.json();
                uploadedUrls.push(data.url);

                setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
            } catch (error) {
                console.error('Error uploading file:', error);
                alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[fileKey];
                    return newProgress;
                });
            }
        }

        // Add uploaded URLs to images
        if (uploadedUrls.length > 0) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls],
            }));
        }

        setUploading(false);
        setUploadProgress({});
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        handleFileUpload(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-neutral-900">
                        {mode === 'create' ? 'Add New Room' : 'Edit Room'}
                    </h2>
                    <button onClick={onClose} className="text-neutral-600 hover:text-neutral-900 text-2xl">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Room Number *
                            </label>
                            <input
                                type="text"
                                value={formData.roomNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Room Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                                className="input-field"
                                required
                            >
                                {ROOM_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0) + type.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Capacity (Guests) *
                            </label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                                className="input-field"
                                min={1}
                                max={10}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Floor *
                            </label>
                            <input
                                type="number"
                                value={formData.floor}
                                onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) }))}
                                className="input-field"
                                min={0}
                                max={20}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Size (sq ft) *
                            </label>
                            <input
                                type="number"
                                value={formData.size}
                                onChange={(e) => setFormData(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                                className="input-field"
                                min={100}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Base Rate (₹/night) *
                            </label>
                            <input
                                type="number"
                                value={formData.baseRate}
                                onChange={(e) => setFormData(prev => ({ ...prev, baseRate: parseInt(e.target.value) }))}
                                className="input-field"
                                min={500}
                                step={100}
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="input-field min-h-25"
                            required
                        />
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-3">
                            Amenities
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-50 overflow-y-auto p-3 border border-neutral-200 rounded-lg">
                            {COMMON_AMENITIES.map((amenity) => (
                                <label key={amenity} className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 rounded">
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities.includes(amenity)}
                                        onChange={() => toggleAmenity(amenity)}
                                        className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                                    />
                                    <span className="text-sm text-neutral-700">{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Room Images
                        </label>

                        {/* Upload Area */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-brand-primary transition-colors cursor-pointer"
                        >
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                multiple
                                onChange={(e) => handleFileUpload(e.target.files)}
                                className="hidden"
                                disabled={uploading}
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="text-4xl mb-2">📸</div>
                                <p className="text-sm font-medium text-neutral-700">
                                    Drag and drop images or click to browse
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    JPEG, PNG, WebP • Max 5MB per file
                                </p>
                            </label>
                        </div>

                        {/* Upload Progress */}
                        {Object.keys(uploadProgress).length > 0 && (
                            <div className="mt-3 space-y-2">
                                {Object.entries(uploadProgress).map(([key, progress]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                                            <div
                                                className="bg-brand-primary h-2 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-neutral-600">{progress}%</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Image Preview Grid */}
                        {formData.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-video relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                                            <Image
                                                src={img}
                                                alt={`Room image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={loading || uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={loading || uploading}
                        >
                            {loading ? 'Saving...' : uploading ? 'Uploading Images...' : mode === 'create' ? 'Create Room' : 'Update Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
