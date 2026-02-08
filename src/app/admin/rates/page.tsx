"use client";

import { useEffect, useMemo, useState } from "react";

type RateRow = {
    roomType: "DELUXE" | "SUITE" | "FAMILY" | "STANDARD" | string;
    baseRate: number;
    weekendMultiplier: number;
    weekendRate: number;
    count: number;
    extraGuestCharge?: number;
};

type BulkEditData = {
    baseRate: number;
    weekendMultiplier: number;
    extraGuestCharge: number;
    effectiveFrom: string;
};

export default function RatesManagementPage() {
    const [rows, setRows] = useState<RateRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<Record<string, { baseRate: number; weekendMultiplier: number; extraGuestCharge: number; effectiveFrom: string }>>>({});
    const [error, setError] = useState<string | null>(null);
    
    // Bulk edit state
    const [bulkEditOpen, setBulkEditOpen] = useState(false);
    const [bulkEditData, setBulkEditData] = useState<BulkEditData>({
        baseRate: 0,
        weekendMultiplier: 1.2,
        extraGuestCharge: 500,
        effectiveFrom: new Date().toISOString().slice(0, 10),
    });
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/rates");
            if (!res.ok) throw new Error("Failed to fetch rates");
            const j = await res.json();
            setRows(j.rates || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to fetch rates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const avgBase = useMemo(() => (rows.length ? Math.round(rows.reduce((s, r) => s + r.baseRate, 0) / rows.length) : 0), [rows]);
    const avgWm = useMemo(() => (rows.length ? (rows.reduce((s, r) => s + r.weekendMultiplier, 0) / rows.length) : 1.2), [rows]);

    const getRoomTypeLabel = (type: string) => {
        switch (type) {
            case "DELUXE":
                return "Deluxe Room";
            case "SUITE":
                return "Premium Suite";
            case "FAMILY":
                return "Family Room";
            case "STANDARD":
                return "Standard Room";
            default:
                return type;
        }
    };

    const startEdit = (roomType: string) => {
        setEditingKey(roomType);
        const today = new Date().toISOString().slice(0, 10);
        const row = rows.find((r) => r.roomType === roomType)!;
        setDraft((d) => ({
            ...d,
            [roomType]: {
                baseRate: row.baseRate,
                weekendMultiplier: row.weekendMultiplier,
                extraGuestCharge: row.extraGuestCharge || 500,
                effectiveFrom: today,
            },
        }));
    };

    const cancelEdit = () => {
        setEditingKey(null);
    };

    const save = async (roomType: string) => {
        const data = draft[roomType];
        if (!data) return;
        setError(null);
        try {
            const res = await fetch("/api/admin/rates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomType,
                    baseRate: Number(data.baseRate),
                    weekendMultiplier: Number(data.weekendMultiplier),
                    extraGuestCharge: Number(data.extraGuestCharge),
                    effectiveFrom: data.effectiveFrom,
                }),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || "Failed to update rates");
            }
            setEditingKey(null);
            await load();
            alert("Rates updated for all rooms of type " + roomType);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update rates");
        }
    };

    // Bulk edit functions
    const toggleTypeSelection = (type: string) => {
        setSelectedTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const selectAllTypes = () => {
        if (selectedTypes.length === rows.length) {
            setSelectedTypes([]);
        } else {
            setSelectedTypes(rows.map(r => r.roomType));
        }
    };

    const handleBulkEdit = async () => {
        if (selectedTypes.length === 0) {
            alert("Please select at least one room type");
            return;
        }
        
        setBulkLoading(true);
        setError(null);
        
        try {
            // Update each selected room type
            for (const roomType of selectedTypes) {
                const res = await fetch("/api/admin/rates", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        roomType,
                        baseRate: Number(bulkEditData.baseRate),
                        weekendMultiplier: Number(bulkEditData.weekendMultiplier),
                        extraGuestCharge: Number(bulkEditData.extraGuestCharge),
                        effectiveFrom: bulkEditData.effectiveFrom,
                    }),
                });
                if (!res.ok) {
                    const j = await res.json().catch(() => ({}));
                    throw new Error(j.error || `Failed to update rates for ${roomType}`);
                }
            }
            
            setBulkEditOpen(false);
            setSelectedTypes([]);
            await load();
            alert(`Rates updated for ${selectedTypes.length} room type(s)`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to bulk update rates");
        } finally {
            setBulkLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm text-slate-500">Loading rates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-slate-500">Manage room pricing, weekend premiums and guest charges</p>
                <button
                    onClick={() => setBulkEditOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Bulk Edit Rates
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-4 gap-5">
                <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white mb-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Avg Base Rate (2 Guests)</h3>
                    <p className="text-2xl font-bold text-slate-800">₹{avgBase.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white mb-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Avg Weekend Multiplier</h3>
                    <p className="text-2xl font-bold text-slate-800">×{avgWm.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white mb-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">3rd Guest Charge</h3>
                    <p className="text-2xl font-bold text-slate-800">₹500+</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg flex items-center justify-center text-white mb-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Room Types</h3>
                    <p className="text-2xl font-bold text-slate-800">{rows.length}</p>
                </div>
            </div>

            {/* Rates Table */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Room Type Rates</h3>
                    <p className="text-sm text-slate-500 mt-1">Set base rates for 2 guests and extra charges for additional guests</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <div>Base Rate</div>
                                    <div className="font-normal text-slate-400">(2 Guests)</div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <div>3rd Guest</div>
                                    <div className="font-normal text-slate-400">Extra Charge</div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekend ×</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekend Rate</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rooms</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Effective From</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, idx) => {
                                const isEditing = editingKey === r.roomType;
                                const d = draft[r.roomType] || { baseRate: r.baseRate, weekendMultiplier: r.weekendMultiplier, extraGuestCharge: r.extraGuestCharge || 500, effectiveFrom: new Date().toISOString().slice(0, 10) };
                                const weekendRate = Math.round((isEditing ? Number(d.baseRate) : r.baseRate) * (isEditing ? Number(d.weekendMultiplier) : r.weekendMultiplier));
                                return (
                                    <tr key={r.roomType} className={`hover:bg-slate-50/50 transition-colors ${idx !== rows.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{getRoomTypeLabel(r.roomType)}</p>
                                                <p className="text-xs text-slate-500">{r.roomType}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <input type="number" className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={d.baseRate}
                                                    onChange={(e) => setDraft((prev) => ({ ...prev, [r.roomType]: { ...d, baseRate: Number(e.target.value) } }))} />
                                            ) : (
                                                <span className="text-sm font-semibold text-slate-800">₹{r.baseRate.toLocaleString("en-IN")}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <input type="number" className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={d.extraGuestCharge}
                                                    onChange={(e) => setDraft((prev) => ({ ...prev, [r.roomType]: { ...d, extraGuestCharge: Number(e.target.value) } }))} />
                                            ) : (
                                                <span className="text-sm font-semibold text-amber-600">+₹{(r.extraGuestCharge || 500).toLocaleString("en-IN")}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <input type="number" step="0.05" min={0.5} max={3} className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={d.weekendMultiplier}
                                                    onChange={(e) => setDraft((prev) => ({ ...prev, [r.roomType]: { ...d, weekendMultiplier: Number(e.target.value) } }))} />
                                            ) : (
                                                <span className="text-sm font-semibold text-slate-800">×{r.weekendMultiplier.toFixed(2)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-800">₹{weekendRate.toLocaleString("en-IN")}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{r.count}</td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <input type="date" className="w-40 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={d.effectiveFrom}
                                                    onChange={(e) => setDraft((prev) => ({ ...prev, [r.roomType]: { ...d, effectiveFrom: e.target.value } }))} />
                                            ) : (
                                                <span className="text-sm text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => save(r.roomType)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">Save</button>
                                                    <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-600 text-sm font-medium transition-colors">Cancel</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => startEdit(r.roomType)} className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors">Edit</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rate Calculator Card */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-emerald-50">
                    <h3 className="font-semibold text-slate-800">💡 Rate Calculator</h3>
                    <p className="text-sm text-slate-500 mt-1">How rates are calculated for different guest counts</p>
                </div>
                <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <span className="text-lg">👤</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">1-2 Guests</p>
                                    <p className="text-xs text-slate-500">Base occupancy</p>
                                </div>
                            </div>
                            <div className="text-center py-3 bg-white rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-500">Rate</p>
                                <p className="text-xl font-bold text-emerald-600">Base Rate</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <span className="text-lg">👥</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">3 Guests</p>
                                    <p className="text-xs text-slate-500">Extra guest</p>
                                </div>
                            </div>
                            <div className="text-center py-3 bg-white rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-500">Rate</p>
                                <p className="text-xl font-bold text-amber-600">Base + Extra Charge</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-lg">📅</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Weekend</p>
                                    <p className="text-xs text-slate-500">Sat & Sun</p>
                                </div>
                            </div>
                            <div className="text-center py-3 bg-white rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-500">Rate</p>
                                <p className="text-xl font-bold text-blue-600">Base × Multiplier</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Edit Modal */}
            {bulkEditOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">Bulk Edit Rates</h2>
                                <p className="text-sm text-slate-500 mt-1">Update rates for multiple room types at once</p>
                            </div>
                            <button onClick={() => setBulkEditOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Select Room Types */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-semibold text-slate-700">Select Room Types</label>
                                    <button 
                                        onClick={selectAllTypes}
                                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        {selectedTypes.length === rows.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {rows.map(r => (
                                        <label 
                                            key={r.roomType} 
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                                selectedTypes.includes(r.roomType) 
                                                    ? 'border-teal-500 bg-teal-50' 
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={selectedTypes.includes(r.roomType)}
                                                onChange={() => toggleTypeSelection(r.roomType)}
                                                className="w-4 h-4 text-teal-500 rounded border-slate-300 focus:ring-teal-500"
                                            />
                                            <div>
                                                <p className="font-medium text-slate-800">{getRoomTypeLabel(r.roomType)}</p>
                                                <p className="text-xs text-slate-500">{r.count} rooms • Current: ₹{r.baseRate.toLocaleString("en-IN")}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Rate Inputs */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Base Rate (2 Guests)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                        <input 
                                            type="number" 
                                            value={bulkEditData.baseRate}
                                            onChange={(e) => setBulkEditData(prev => ({ ...prev, baseRate: Number(e.target.value) }))}
                                            className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                            placeholder="Enter base rate"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        3rd Guest Extra Charge
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">+₹</span>
                                        <input 
                                            type="number" 
                                            value={bulkEditData.extraGuestCharge}
                                            onChange={(e) => setBulkEditData(prev => ({ ...prev, extraGuestCharge: Number(e.target.value) }))}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                            placeholder="Extra charge per guest"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Weekend Multiplier
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">×</span>
                                        <input 
                                            type="number" 
                                            step="0.05"
                                            min="0.5"
                                            max="3"
                                            value={bulkEditData.weekendMultiplier}
                                            onChange={(e) => setBulkEditData(prev => ({ ...prev, weekendMultiplier: Number(e.target.value) }))}
                                            className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Effective From
                                    </label>
                                    <input 
                                        type="date" 
                                        value={bulkEditData.effectiveFrom}
                                        onChange={(e) => setBulkEditData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {bulkEditData.baseRate > 0 && (
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">Rate Preview</p>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-xs text-slate-500">2 Guests (Weekday)</p>
                                            <p className="text-lg font-bold text-slate-800">₹{bulkEditData.baseRate.toLocaleString("en-IN")}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">3 Guests (Weekday)</p>
                                            <p className="text-lg font-bold text-amber-600">₹{(bulkEditData.baseRate + bulkEditData.extraGuestCharge).toLocaleString("en-IN")}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">2 Guests (Weekend)</p>
                                            <p className="text-lg font-bold text-blue-600">₹{Math.round(bulkEditData.baseRate * bulkEditData.weekendMultiplier).toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
                            <button 
                                onClick={() => setBulkEditOpen(false)}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleBulkEdit}
                                disabled={bulkLoading || selectedTypes.length === 0}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {bulkLoading ? 'Updating...' : `Update ${selectedTypes.length} Room Type(s)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

