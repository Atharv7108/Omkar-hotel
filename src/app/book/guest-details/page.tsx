'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface GuestFormData {
    fullName: string;
    email: string;
    phone: string;
    idProofType: string;
    idProofNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    specialRequests?: string;
}

function GuestDetailsLoading() {
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading...</p>
            </div>
        </div>
    );
}

function GuestDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GuestFormData>();

    // Get booking details from URL - support both roomId and roomType
    const roomId = searchParams.get('roomId');
    const roomType = searchParams.get('roomType');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const addons = searchParams.get('addons');

    if ((!roomId && !roomType) || !checkIn || !checkOut) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                        Missing Booking Details
                    </h2>
                    <p className="text-neutral-600 mb-6">
                        Please start from the booking page.
                    </p>
                    <a href="/book" className="btn-primary">
                        Go to Booking Page
                    </a>
                </div>
            </div>
        );
    }

    const roomParam = roomId ? `roomId=${roomId}` : `roomType=${roomType}`;

    const onSubmit = async (data: GuestFormData) => {
        setIsSubmitting(true);

        // In a real app, this would create the guest and booking in the database
        console.log('Guest Details:', data);
        console.log('Booking Details:', { roomId, roomType, checkIn, checkOut, addons });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Navigate to payment page (or mock confirmation)
        router.push(
            `/book/confirmation?bookingRef=OMK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        );
    };

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
                            <a
                                href={`/book/addons?${roomParam}&checkIn=${checkIn}&checkOut=${checkOut}`}
                                className="text-neutral-600 hover:text-neutral-900 transition-colors"
                            >
                                ← Back to Add-ons
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
                            <div className="progress-step completed">3</div>
                            <span className="text-sm font-medium text-neutral-900">Add-ons</span>
                        </div>
                        <div className="h-px w-12 bg-neutral-300"></div>
                        <div className="flex items-center gap-2">
                            <div className="progress-step active">4</div>
                            <span className="text-sm font-medium text-brand-primary">Details</span>
                        </div>
                        <div className="h-px w-12 bg-neutral-300"></div>
                        <div className="flex items-center gap-2">
                            <div className="progress-step">5</div>
                            <span className="text-sm font-medium text-neutral-600">Confirmation</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="section">
                <div className="container-custom max-w-3xl">
                    {/* Page Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-display font-bold mb-4 text-neutral-900">
                            Guest Details
                        </h1>
                        <p className="text-lg text-neutral-600">
                            Please provide your information to complete the booking
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="card p-8 mb-8">
                            {/* Personal Information */}
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-6 pb-4 border-b border-neutral-200">
                                Personal Information
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('fullName', { required: 'Full name is required' })}
                                        className="input-field"
                                        placeholder="John Doe"
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address',
                                            },
                                        })}
                                        className="input-field"
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        {...register('phone', {
                                            required: 'Phone number is required',
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: 'Please enter a valid 10-digit phone number',
                                            },
                                        })}
                                        className="input-field"
                                        placeholder="9876543210"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        ID Proof Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('idProofType', { required: 'Please select ID proof type' })}
                                        className="input-field"
                                    >
                                        <option value="">Select ID proof</option>
                                        <option value="aadhar">Aadhar Card</option>
                                        <option value="passport">Passport</option>
                                        <option value="driving_license">Driving License</option>
                                        <option value="voter_id">Voter ID</option>
                                    </select>
                                    {errors.idProofType && (
                                        <p className="text-red-500 text-sm mt-1">{errors.idProofType.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    ID Proof Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('idProofNumber', { required: 'ID proof number is required' })}
                                    className="input-field"
                                    placeholder="Enter ID number"
                                />
                                {errors.idProofNumber && (
                                    <p className="text-red-500 text-sm mt-1">{errors.idProofNumber.message}</p>
                                )}
                            </div>

                            {/* Address Information */}
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-6 pb-4 border-b border-neutral-200">
                                Address Information
                            </h2>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Street Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('address', { required: 'Address is required' })}
                                    className="input-field"
                                    placeholder="123 Main Street"
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('city', { required: 'City is required' })}
                                        className="input-field"
                                        placeholder="Mumbai"
                                    />
                                    {errors.city && (
                                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('state', { required: 'State is required' })}
                                        className="input-field"
                                        placeholder="Maharashtra"
                                    />
                                    {errors.state && (
                                        <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('country', { required: 'Country is required' })}
                                        className="input-field"
                                        placeholder="India"
                                        defaultValue="India"
                                    />
                                    {errors.country && (
                                        <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        ZIP/Postal Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('zipCode', { required: 'ZIP code is required' })}
                                        className="input-field"
                                        placeholder="400001"
                                    />
                                    {errors.zipCode && (
                                        <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Special Requests */}
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-6 pb-4 border-b border-neutral-200">
                                Special Requests
                            </h2>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    {...register('specialRequests')}
                                    className="input-field min-h-[120px]"
                                    placeholder="Any special requests or requirements? (e.g., early check-in, high floor, etc.)"
                                ></textarea>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="glass p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-neutral-600 mb-1">Ready to proceed?</p>
                                    <p className="text-lg font-semibold text-neutral-900">
                                        Review your details and continue
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Complete Booking</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-neutral-500 text-center mt-4">
                                By completing this booking, you agree to our terms and conditions
                            </p>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default function GuestDetailsPage() {
    return (
        <Suspense fallback={<GuestDetailsLoading />}>
            <GuestDetailsContent />
        </Suspense>
    );
}
