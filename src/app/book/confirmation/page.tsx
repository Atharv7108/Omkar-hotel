'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function ConfirmationLoading() {
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading...</p>
            </div>
        </div>
    );
}

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const bookingRef = searchParams.get('bookingRef');
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        // Hide confetti after 3 seconds
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!bookingRef) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                        Invalid Booking Reference
                    </h2>
                    <p className="text-neutral-600 mb-6">
                        Please check your booking confirmation email.
                    </p>
                    <a href="/book" className="btn-primary">
                        Make New Booking
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="text-2xl font-display font-bold text-neutral-900">
                            Omkar Hotel
                        </a>
                        <a href="/" className="text-neutral-600 hover:text-neutral-900 transition-colors">
                            Return to Home
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="section">
                <div className="container-custom max-w-2xl">
                    {/* Success Animation */}
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-block mb-6 relative">
                            <div className="text-8xl">🎉</div>
                            {showConfetti && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-4xl animate-bounce">✨</div>
                                </div>
                            )}
                        </div>
                        <h1 className="text-5xl font-display font-bold mb-4 text-neutral-900">
                            Booking Confirmed!
                        </h1>
                        <p className="text-xl text-neutral-600">
                            Thank you for choosing Omkar Hotel
                        </p>
                    </div>

                    {/* Booking Details Card */}
                    <div className="card p-8 mb-8">
                        <div className="text-center mb-8 pb-8 border-b border-neutral-200">
                            <p className="text-sm text-neutral-600 mb-2">Your Booking Reference</p>
                            <p className="text-3xl font-bold font-mono gradient-gold bg-clip-text text-transparent">
                                {bookingRef}
                            </p>
                            <p className="text-sm text-neutral-500 mt-2">
                                Please save this reference for your records
                            </p>
                        </div>

                        {/* Confirmation Details */}
                        <div className="space-y-6">
                            <div className="glass p-6 rounded-xl">
                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                    📧 Confirmation Email Sent
                                </h3>
                                <p className="text-neutral-600 text-sm">
                                    A confirmation email with all booking details has been sent to your email address.
                                    Please check your inbox (and spam folder).
                                </p>
                            </div>

                            <div className="glass p-6 rounded-xl">
                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                    ✅ Next Steps
                                </h3>
                                <ul className="space-y-3 text-sm text-neutral-600">
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>You will receive a confirmation call within 24 hours</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>Please carry a valid ID proof for check-in</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>Check-in time: 2:00 PM | Check-out time: 11:00 AM</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>Free cancellation available up to 24 hours before check-in</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass p-6 rounded-xl">
                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                    📍 Location & Contact
                                </h3>
                                <div className="space-y-2 text-sm text-neutral-600">
                                    <p>
                                        <strong>Address:</strong> Main Market Road, Mahabaleshwar, Maharashtra 412806
                                    </p>
                                    <p>
                                        <strong>Phone:</strong> +91 12345 67890
                                    </p>
                                    <p>
                                        <strong>Email:</strong> info@omkarhotel.com
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <a href="/" className="btn-secondary text-center">
                            Return to Home
                        </a>
                        <button
                            onClick={() => window.print()}
                            className="btn-primary"
                        >
                            🖨️ Print Confirmation
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-neutral-500">
                            Need help? Contact us at{' '}
                            <a href="tel:+911234567890" className="text-brand-primary hover:underline">
                                +91 12345 67890
                            </a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<ConfirmationLoading />}>
            <ConfirmationContent />
        </Suspense>
    );
}
