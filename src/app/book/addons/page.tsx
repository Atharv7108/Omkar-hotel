'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Addon {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: string;
}

const AVAILABLE_ADDONS: Addon[] = [
    {
        id: 'breakfast',
        name: 'Breakfast Package',
        price: 300,
        description: 'Complimentary breakfast for all guests. Includes Indian and Continental options.',
        icon: '🍳',
    },
    {
        id: 'spa',
        name: 'Spa Treatment',
        price: 1500,
        description: 'Relaxing spa session (60 minutes) with aromatherapy massage.',
        icon: '💆',
    },
    {
        id: 'pickup',
        name: 'Airport/Station Pickup',
        price: 800,
        description: 'Convenient transportation from Pune Airport or Satara Railway Station.',
        icon: '🚗',
    },
    {
        id: 'late_checkout',
        name: 'Late Checkout',
        price: 500,
        description: 'Extend your checkout time from 11 AM to 2 PM.',
        icon: '🕐',
    },
    {
        id: 'sightseeing',
        name: 'Sightseeing Tour',
        price: 1200,
        description: 'Guided tour of Mahabaleshwar attractions (4 hours).',
        icon: '🗺️',
    },
];

export default function AddonsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

    // Get booking details from URL
    const roomId = searchParams.get('roomId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (!roomId || !checkIn || !checkOut) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                        Missing Booking Details
                    </h2>
                    <p className="text-neutral-600 mb-6">
                        Please start from the booking page to select your room and dates.
                    </p>
                    <a href="/book" className="btn-primary">
                        Go to Booking Page
                    </a>
                </div>
            </div>
        );
    }

    const toggleAddon = (addonId: string) => {
        setSelectedAddons((prev) => {
            const current = prev[addonId] || 0;
            if (current > 0) {
                const { [addonId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [addonId]: 1 };
        });
    };

    const updateQuantity = (addonId: string, quantity: number) => {
        if (quantity <= 0) {
            const { [addonId]: _, ...rest } = selectedAddons;
            setSelectedAddons(rest);
        } else {
            setSelectedAddons((prev) => ({ ...prev, [addonId]: quantity }));
        }
    };

    const calculateTotal = () => {
        return Object.entries(selectedAddons).reduce((sum, [id, quantity]) => {
            const addon = AVAILABLE_ADDONS.find((a) => a.id === id);
            return sum + (addon?.price || 0) * quantity;
        }, 0);
    };

    const handleContinue = () => {
        // Convert selected addons to URL params
        const addonParams = Object.entries(selectedAddons)
            .map(([id, quantity]) => `${id}:${quantity}`)
            .join(',');

        router.push(
            `/book/guest-details?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&addons=${addonParams}`
        );
    };

    const handleSkip = () => {
        router.push(
            `/book/guest-details?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`
        );
    };

    const selectedCount = Object.keys(selectedAddons).length;
    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="text-2xl font-display font-bold text-neutral-900">
                            Omkar Hotel
                        </a>
                        <div className="flex items-center gap-4">
                            <a href="/book" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                                ← Back to Rooms
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Indicator */}
            <div className="bg-white border-b border-neutral-200">
                <div className="container-custom py-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="progress-step completed">1</div>
                            <span className="text-sm font-medium text-neutral-900">Dates</span>
                        </div>
                        <div className="h-px w-12 bg-neutral-300"></div>
                        <div className="flex items-center gap-2">
                            <div className="progress-step completed">2</div>
                            <span className="text-sm font-medium text-neutral-900">Room</span>
                        </div>
                        <div className="h-px w-12 bg-neutral-300"></div>
                        <div className="flex items-center gap-2">
                            <div className="progress-step active">3</div>
                            <span className="text-sm font-medium text-brand-primary">Add-ons</span>
                        </div>
                        <div className="h-px w-12 bg-neutral-300"></div>
                        <div className="flex items-center gap-2">
                            <div className="progress-step">4</div>
                            <span className="text-sm font-medium text-neutral-600">Details</span>
                        </div>
                        <div className="h-px w-12 bg-neutral-300"></div>
                        <div className="flex items-center gap-2">
                            <div className="progress-step">5</div>
                            <span className="text-sm font-medium text-neutral-600">Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="section">
                <div className="container-custom max-w-4xl">
                    {/* Page Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-display font-bold mb-4 text-neutral-900">
                            Enhance Your Stay
                        </h1>
                        <p className="text-lg text-neutral-600">
                            Select optional add-ons to make your experience even more memorable
                        </p>
                    </div>

                    {/* Add-ons Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {AVAILABLE_ADDONS.map((addon) => {
                            const quantity = selectedAddons[addon.id] || 0;
                            const isSelected = quantity > 0;

                            return (
                                <div
                                    key={addon.id}
                                    className={`card cursor-pointer ${isSelected ? 'border-2 border-brand-primary bg-brand-primary/5' : ''
                                        }`}
                                    onClick={() => toggleAddon(addon.id)}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="text-5xl">{addon.icon}</div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                                                    {addon.name}
                                                </h3>
                                                <p className="text-neutral-600 text-sm mb-3">{addon.description}</p>
                                                <p className="text-lg font-bold text-brand-primary">
                                                    ₹{addon.price.toLocaleString('en-IN')}
                                                </p>
                                            </div>

                                            {/* Checkbox */}
                                            <div
                                                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected
                                                        ? 'bg-brand-primary border-brand-primary'
                                                        : 'border-neutral-300'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <svg
                                                        className="w-4 h-4 text-white"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity Selector */}
                                        {isSelected && (
                                            <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center gap-4">
                                                <span className="text-sm font-medium text-neutral-700">Quantity:</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(addon.id, quantity - 1);
                                                        }}
                                                        className="w-8 h-8 rounded-lg border-2 border-neutral-300 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-12 text-center font-semibold">{quantity}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(addon.id, quantity + 1);
                                                        }}
                                                        className="w-8 h-8 rounded-lg border-2 border-neutral-300 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="ml-auto text-sm font-medium text-neutral-900">
                                                    ₹{(addon.price * quantity).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary & Actions */}
                    <div className="glass p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm text-neutral-600 mb-1">Selected Add-ons</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {selectedCount} item{selectedCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-neutral-600 mb-1">Add-ons Total</p>
                                <p className="text-3xl font-bold gradient-gold bg-clip-text text-transparent">
                                    ₹{total.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={handleSkip} className="flex-1 btn-secondary">
                                Skip Add-ons
                            </button>
                            <button onClick={handleContinue} className="flex-1 btn-primary">
                                Continue to Guest Details →
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
