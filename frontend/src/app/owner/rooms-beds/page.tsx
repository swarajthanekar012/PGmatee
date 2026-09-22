'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { PG, Room, Bed } from '@/types';
import {
  BedDouble,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Loader2,
  X,
} from 'lucide-react';

export default function OwnerRoomsBedsPage() {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [selectedPgId, setSelectedPgId] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Room Modal State
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Triple Sharing');
  const [rent, setRent] = useState('6000');
  const [initialBeds, setInitialBeds] = useState('3');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOwnerPGs();
  }, []);

  const fetchOwnerPGs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pgs/owner/my-pgs');
      if (res.data.success && res.data.data.length > 0) {
        setPgs(res.data.data);
        const firstPgId = res.data.data[0].id;
        setSelectedPgId(firstPgId);
        fetchRooms(firstPgId);
      }
    } catch (err) {
      console.error('Failed to load owner PGs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (pgId: string) => {
    try {
      const res = await api.get(`/rooms/pg/${pgId}`);
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const handlePgChange = (pgId: string) => {
    setSelectedPgId(pgId);
    fetchRooms(pgId);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPgId) return;
    setIsSubmitting(true);

    try {
      const res = await api.post('/rooms', {
        pgId: selectedPgId,
        roomNumber,
        roomType,
        rent: Number(rent),
        numberOfBeds: Number(initialBeds),
      });

      if (res.data.success) {
        setShowAddRoom(false);
        setRoomNumber('');
        fetchRooms(selectedPgId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBedToRoom = async (roomId: string, currentBedCount: number) => {
    try {
      const newBedNumber = `B${currentBedCount + 1}`;
      const res = await api.post('/beds', {
        roomId,
        bedNumber: newBedNumber,
        status: 'AVAILABLE',
      });
      if (res.data.success) {
        fetchRooms(selectedPgId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add bed');
    }
  };

  const handleToggleBedStatus = async (bed: Bed) => {
    const nextStatus =
      bed.status === 'AVAILABLE'
        ? 'OCCUPIED'
        : bed.status === 'OCCUPIED'
        ? 'MAINTENANCE'
        : 'AVAILABLE';

    try {
      const res = await api.put(`/beds/${bed.id}`, {
        status: nextStatus,
      });
      if (res.data.success) {
        fetchRooms(selectedPgId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update bed');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room and all its beds?')) return;
    try {
      const res = await api.delete(`/rooms/${roomId}`);
      if (res.data.success) {
        fetchRooms(selectedPgId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete room');
    }
  };

  const handleDeleteBed = async (bed: Bed) => {
    if (bed.status === 'OCCUPIED') {
      alert('Cannot remove an occupied bed. The student must checkout first.');
      return;
    }
    if (!confirm(`Are you sure you want to remove Bed ${bed.bedNumber}?`)) return;
    try {
      const res = await api.delete(`/beds/${bed.id}`);
      if (res.data.success) {
        fetchRooms(selectedPgId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove bed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Inventory</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Room & Bed Allocation Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure rooms, beds, rent prices, and toggle occupancy states in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddRoom(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Room
        </button>
      </div>

      {/* Property Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {pgs.map((pg) => (
          <button
            key={pg.id}
            onClick={() => handlePgChange(pg.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              selectedPgId === pg.id
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {pg.name} ({pg.city})
          </button>
        ))}
      </div>

      {/* Rooms and Beds Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading rooms and beds...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <BedDouble className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Rooms Added Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click "Add New Room" above to set up your accommodation inventory.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.map((room) => {
            const availableCount = room.beds.filter((b) => b.status === 'AVAILABLE').length;

            return (
              <div
                key={room.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Room Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Room {room.roomNumber}</h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300">
                        {room.roomType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Rent: <span className="font-bold text-slate-800 dark:text-slate-100">₹{room.rent.toLocaleString('en-IN')}/month</span> per bed • {availableCount} of {room.beds.length} beds vacant
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddBedToRoom(room.id, room.beds.length)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      Add Bed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title="Delete Room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Beds Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {room.beds.map((bed) => {
                    const isAvailable = bed.status === 'AVAILABLE';
                    const isOccupied = bed.status === 'OCCUPIED';

                    // Resident name if occupied
                    const activeBooking = bed.bookings?.[0];
                    const residentName = activeBooking?.student?.user?.name;

                    return (
                      <div
                        key={bed.id}
                        className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-2 ${
                          isAvailable
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
                            : isOccupied
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50'
                            : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white">Bed {bed.bedNumber}</span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isAvailable
                                ? 'bg-emerald-500'
                                : isOccupied
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                          />
                        </div>

                        <div>
                          <span
                            className={`text-[10px] font-bold block ${
                              isAvailable
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : isOccupied
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : 'text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {bed.status}
                          </span>
                          {residentName && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate mt-0.5">
                              👤 {residentName}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleBedStatus(bed)}
                            className="flex-1 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition"
                          >
                            Status
                          </button>
                          {bed.status !== 'OCCUPIED' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteBed(bed)}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[10px] font-bold shadow-2xs transition"
                              title="Remove vacant bed"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Room</h3>
              <button
                onClick={() => setShowAddRoom(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 204 or 301"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Single Room">Single Room</option>
                    <option value="Double Sharing">Double Sharing</option>
                    <option value="Triple Sharing">Triple Sharing</option>
                    <option value="Four Sharing">Four Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Bed Count</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={initialBeds}
                    onChange={(e) => setInitialBeds(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Rent (₹ / Bed)
                </label>
                <input
                  type="number"
                  required
                  step="500"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
