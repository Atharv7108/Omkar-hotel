'use client';

import { useState, useEffect } from 'react';

interface RoomRate {
    id: string;
    roomType: string;
    baseRate: number;
    weekendRate: number;
    seasonalRate: number | null;
    effectiveFrom: string;
    effectiveTo: string | null;
}

export default function RatesManagementPage() {
    const [rates, setRates] = useState<RoomRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        // Mock data - in production, fetch from API
        setTimeout(() => {
            setRates([
                {
                    id: '1',
                    roomType: 'STANDARD',
                    baseRate: 2500,
                    weekendRate: 3250,
                    seasonalRate: null,
                    effectiveFrom: '2025-01-01',
                    effectiveTo: null,
                },
                {
                    id: '2',
                    roomType: 'DELUXE',
                    baseRate: 3500,
                    weekendRate: 4550,
                    seasonalRate: null,
                    effectiveFrom: '2025-01-01',
                    effectiveTo: null,
                },
                {
                    id: '3',
                    roomType: 'SUITE',
                    baseRate: 5500,
                    weekendRate: 7150,
                    seasonalRate: 6500,
                    effectiveFrom: '2025-01-01',
                    effectiveTo: null,
                },
                {
                    id: '4',
                    roomType: 'FAMILY',
                    baseRate: 6500,
                    weekendRate: 8450,
                    seasonalRate: 7500,
                    effectiveFrom: '2025-01-01',
                    effectiveTo: null,
                },
            ]);
            setLoading(false);
        }, 300);
    }, []);

    const getRoomTypeLabel = (type: string) => {
        switch (type) {
            case 'DELUXE':
                return 'Deluxe Room';
            case 'SUITE':
                return 'Premium Suite';
            case 'FAMILY':
                return 'Family Room';
            case 'STANDARD':
                return 'Standard Room';
            default:
                return type;
        }
    };

    const handleRateUpdate = (id: string, field: keyof RoomRate, value: string | number) => {
        setRates(
            rates.map((rate) =>
                rate.id === id ? { ...rate, [field]: value === '' ? null : Number(value) } : rate
            )
        );
    };

    const saveRates = () => {
        // In production, send to API
        setEditingId(null);
        // Show success message
        alert('Rates updated successfully!');
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
                    <h1 className="text-2xl font-bold text-neutral-900">Rate Management</h1>
                    <p className="text-neutral-600 mt-1">Manage room pricing and seasonal rates</p>
                </div>
                <button className="btn-primary">+ Add New Rate</button>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="card p-6">
                    <div className="text-3xl mb-2">💰</div>
                    <h3 className="text-sm font-semibold text-neutral-600 mb-1">Average Base Rate</h3>
                    <p className="text-2xl font-bold text-neutral-900">
                        ₹{Math.round(rates.reduce((sum, r) => sum + r.baseRate, 0) / rates.length).toLocaleString('en-IN')}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="text-3xl mb-2">📈</div>
                    <h3 className="text-sm font-semibold text-neutral-600 mb-1">Weekend Premium</h3>
                    <p className="text-2xl font-bold text-neutral-900">+30%</p>
                </div>

                <div className="card p-6">
                    <div className="text-3xl mb-2">🌟</div>
                    <h3 className="text-sm font-semibold text-neutral-600 mb-1">Seasonal Rates</h3>
                    <p className="text-2xl font-bold text-neutral-900">
                        {rates.filter((r) => r.seasonalRate).length} Active
                    </p>
                </div>
            </div>

            {/* Rates Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Room Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Base Rate (Weekday)
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Weekend Rate
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Seasonal Rate
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Effective From
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {rates.map((rate) => (
                                <tr key={rate.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900">
                                                {getRoomTypeLabel(rate.roomType)}
                                            </p>
                                            <p className="text-xs text-neutral-500">{rate.roomType}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === rate.id ? (
                                            <input
                                                type="number"
                                                value={rate.baseRate}
                                                onChange={(e) => handleRateUpdate(rate.id, 'baseRate', e.target.value)}
                                                className="input-field w-32 text-sm"
                                            />
                                        ) : (
                                            <span className="text-sm font-semibold text-neutral-900">
                                                ₹{rate.baseRate.toLocaleString('en-IN')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === rate.id ? (
                                            <input
                                                type="number"
                                                value={rate.weekendRate}
                                                onChange={(e) => handleRateUpdate(rate.id, 'weekendRate', e.target.value)}
                                                className="input-field w-32 text-sm"
                                            />
                                        ) : (
                                            <span className="text-sm font-semibold text-neutral-900">
                                                ₹{rate.weekendRate.toLocaleString('en-IN')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === rate.id ? (
                                            <input
                                                type="number"
                                                value={rate.seasonalRate || ''}
                                                onChange={(e) => handleRateUpdate(rate.id, 'seasonalRate', e.target.value)}
                                                className="input-field w-32 text-sm"
                                                placeholder="Optional"
                                            />
                                        ) : rate.seasonalRate ? (
                                            <span className="text-sm font-semibold text-brand-secondary">
                                                ₹{rate.seasonalRate.toLocaleString('en-IN')}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-neutral-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        {new Date(rate.effectiveFrom).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === rate.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveRates}
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-neutral-600 hover:text-neutral-700 text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingId(rate.id)}
                                                className="text-brand-primary hover:text-brand-secondary text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pricing Guidelines */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pricing Guidelines</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-neutral-50 rounded-lg">
                        <p className="font-semibold text-neutral-900 mb-2">💡 Weekend Rates</p>
                        <p className="text-neutral-600">
                            Weekend rates are automatically applied for Friday and Saturday nights with a 30%
                            premium.
                        </p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                        <p className="font-semibold text-neutral-900 mb-2">🌟 Seasonal Rates</p>
                        <p className="text-neutral-600">
                            Use seasonal rates for peak periods (holidays, festivals). These override weekend
                            rates.
                        </p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                        <p className="font-semibold text-neutral-900 mb-2">📅 Effective Dates</p>
                        <p className="text-neutral-600">
                            Rates take effect from the "Effective From" date. Set "Effective To" for temporary
                            pricing.
                        </p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                        <p className="font-semibold text-neutral-900 mb-2">⚡ Quick Tips</p>
                        <p className="text-neutral-600">
                            Review and adjust rates quarterly based on demand, competitor pricing, and seasonal
                            trends.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
