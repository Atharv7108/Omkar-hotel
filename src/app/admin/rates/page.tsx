"use client";

import { useEffect, useMemo, useState } from "react";

type RateRow = {
    roomType: "DELUXE" | "SUITE" | "FAMILY" | "STANDARD" | string;
    baseRate: number;
    weekendMultiplier: number;
    weekendRate: number;
    count: number;
};

export default function RatesManagementPage() {
    const [rows, setRows] = useState<RateRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<Record<string, { baseRate: number; weekendMultiplier: number; effectiveFrom: string }>>>({});
    const [error, setError] = useState<string | null>(null);

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
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Rate Management</h1>
                    <p className="text-slate-500 mt-1">Manage room pricing, weekend premiums and effective dates</p>
                </div>
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
            <div className="grid md:grid-cols-3 gap-5">
                <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white mb-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Average Base Rate</h3>
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
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Rate</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekend Multiplier</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekend Rate</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rooms</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Effective From</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, idx) => {
                                const isEditing = editingKey === r.roomType;
                                const d = draft[r.roomType] || { baseRate: r.baseRate, weekendMultiplier: r.weekendMultiplier, effectiveFrom: new Date().toISOString().slice(0, 10) };
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
                                                <input type="number" step="0.05" min={0.5} max={3} className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={d.weekendMultiplier}
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

            {/* Guidelines */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Pricing Guidelines</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-slate-700">Weekend Rates</p>
                        </div>
                        <p className="text-slate-500">Weekend rates apply for Saturday and Sunday nights with a configurable multiplier.</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-slate-700">Seasonal Rates</p>
                        </div>
                        <p className="text-slate-500">Use seasonal rates for peak periods. These override weekend rates.</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-slate-700">Effective Dates</p>
                        </div>
                        <p className="text-slate-500">New rates take effect from the selected date and do not modify historical data.</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-slate-700">Tips</p>
                        </div>
                        <p className="text-slate-500">Review rates monthly based on occupancy, pace, and competitor pricing.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

