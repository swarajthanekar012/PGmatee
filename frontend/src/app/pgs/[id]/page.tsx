'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { PG, Room, Bed } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  ShieldCheck,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  BedDouble,
  Calendar,
  Loader2,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export default function PGDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [pg, setPg] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Booking Modal State
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');
  const [bookingErrorMsg, setBookingErrorMsg] = useState('');

  useEffect(() => {
    if (id) {
      fetchPGDetail();
    }
  }, [id]);

  const fetchPGDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pgs/${id}`);
      if (res.data.success) {
        setPg(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load PG:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookingModal = (room: Room, bed: Bed) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      alert('Only registered students can request bed bookings.');
      return;
    }
    setSelectedRoom(room);
    setSelectedBed(bed);
    setBookingSuccessMsg('');
    setBookingErrorMsg('');
  };

  const handleSubmitBooking = async () => {
    if (!selectedBed) return;
    setIsSubmittingBooking(true);
    setBookingErrorMsg('');

    try {
      const res = await api.post('/bookings', {
        bedId: selectedBed.id,
        startDate: new Date(startDate),
      });

      if (res.data.success) {
        setBookingSuccessMsg('Booking request submitted! The owner will review and confirm your bed allocation.');
        // Refresh PG details
        setTimeout(() => {
          setSelectedBed(null);
          fetchPGDetail();
        }, 2200);
      }
    } catch (err: any) {
      setBookingErrorMsg(err.message || 'Failed to request bed booking.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading accommodation details...</p>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">PG Not Found</h2>
        <Link href="/pgs" className="text-xs text-brand-600 font-bold hover:underline mt-2 inline-block">
          ← Return to listings
        </Link>
      </div>
    );
  }

  const images =
    pg.images && pg.images.length > 0
      ? pg.images
      : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/pgs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to PG Catalog
        </Link>
      </div>

      {/* Main Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wide bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified Property
            </span>
            <span className="text-xs font-medium text-slate-500">• {pg.city}, Maharashtra</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{pg.name}</h1>
          <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            {pg.address}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 uppercase font-semibold">Rent Starting From</span>
          <p className="text-2xl font-black text-slate-900">
            ₹{(pg.minRent || 5500).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-500">/ month</span>
          </p>
          <span className="text-xs font-bold text-emerald-600">
            {pg.availableBeds ?? 0} Beds Available
          </span>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="md:col-span-3 rounded-2xl overflow-hidden h-72 sm:h-96 bg-slate-100 shadow-sm border border-slate-200">
          <img
            src={images[selectedImage]}
            alt={pg.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:col-span-1 flex md:flex-col gap-3 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`rounded-xl overflow-hidden h-24 sm:h-28 w-28 md:w-full shrink-0 border-2 transition ${
                selectedImage === idx ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* 2-Columns: Details & Rooms Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Facilities, Rules, Description */}
        <div className="lg:col-span-1 space-y-6">
          {/* About */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">About This Accommodation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {pg.description || 'Modern PG accommodation providing high quality stay, meals, and Wi-Fi.'}
            </p>
          </div>

          {/* Owner Info Card */}
          <div className="bg-brand-50/50 rounded-2xl p-5 border border-brand-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                {pg.owner?.user.name.charAt(0) || 'O'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{pg.owner?.user.name}</p>
                <span className="text-[10px] text-brand-700 font-semibold uppercase">Verified PG Owner</span>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-brand-100">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                {pg.owner?.user.mobile || '+91 9876543210'}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-600" />
                {pg.owner?.user.email}
              </p>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Included Facilities & Amenities</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(pg.facilities || []).map((f) => (
                <div key={f} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">House Rules</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {(pg.rules || []).map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Rooms & Bed Availability Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Room Types & Bed Allocation</h3>
                <p className="text-xs text-slate-500">
                  Select an available bed to instantly submit a booking request to the owner.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Occupied
                </span>
              </div>
            </div>

            {/* Rooms list */}
            <div className="space-y-4">
              {pg.rooms?.map((room) => {
                const availableBeds = room.beds.filter((b) => b.status === 'AVAILABLE').length;

                return (
                  <div
                    key={room.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">Room {room.roomNumber}</h4>
                          <span className="text-[10px] font-bold uppercase bg-brand-100 text-brand-800 px-2 py-0.5 rounded">
                            {room.roomType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {availableBeds} of {room.beds.length} beds available
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Rent</span>
                        <p className="text-base font-extrabold text-slate-900">
                          ₹{room.rent.toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-normal text-slate-500">/bed</span>
                        </p>
                      </div>
                    </div>

                    {/* Beds Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {room.beds.map((bed) => {
                        const isAvailable = bed.status === 'AVAILABLE';

                        return (
                          <div
                            key={bed.id}
                            className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                              isAvailable
                                ? 'bg-white border-emerald-200 shadow-sm hover:border-brand-500'
                                : 'bg-slate-100 border-slate-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-800">Bed {bed.bedNumber}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isAvailable
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isAvailable ? 'Vacant' : 'Occupied'}
                              </span>
                            </div>

                            {isAvailable ? (
                              <button
                                type="button"
                                onClick={() => handleOpenBookingModal(room, bed)}
                                className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[11px] font-bold transition shadow-sm"
                              >
                                Request Bed
                              </button>
                            ) : (
                              <button
                                disabled
                                className="w-full py-1.5 bg-slate-200 text-slate-500 rounded-lg text-[11px] font-semibold cursor-not-allowed"
                              >
                                Occupied
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {selectedBed && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Confirm Bed Booking Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Your request will be sent to owner {pg.owner?.user.name} for approval.
            </p>

            {bookingSuccessMsg ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{bookingSuccessMsg}</h4>
                <p className="text-xs text-slate-500">Redirecting...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                    {bookingErrorMsg}
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accommodation</span>
                    <span className="font-bold text-slate-800">{pg.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Room & Bed</span>
                    <span className="font-bold text-brand-600">
                      Room {selectedRoom.roomNumber} • Bed {selectedBed.bedNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Rent</span>
                    <span className="font-bold text-slate-800">
                      ₹{selectedRoom.rent.toLocaleString('en-IN')}/month
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Move-in Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBed(null)}
                    disabled={isSubmittingBooking}
                    className="w-1/2 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitBooking}
                    disabled={isSubmittingBooking}
                    className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingBooking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Send Request'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
