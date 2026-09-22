'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { PG } from '@/types';
import {
  Building2,
  Plus,
  MapPin,
  CheckCircle2,
  Trash2,
  X,
  Loader2,
  ShieldCheck,
  QrCode,
  Phone,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

export default function OwnerPGsPage() {
  const [pgs, setPgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [legalPermission, setLegalPermission] = useState('Municipal Corporation Housing & Trade License');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [facilities, setFacilities] = useState<string[]>([
    'Wi-Fi',
    'Food',
    'CCTV',
    'RO Water',
    'Power Backup',
  ]);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPGs();
  }, []);

  const fetchPGs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pgs/owner/my-pgs');
      if (res.data.success) {
        setPgs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load PGs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePG = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanUpi = upiId.trim();
      const qrCodeUrl = cleanUpi
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(
            cleanUpi
          )}%26pn=${encodeURIComponent(name.trim())}%26cu=INR`
        : null;

      const res = await api.post('/pgs', {
        name,
        city,
        address,
        description,
        contactMobile: contactMobile.trim() || null,
        legalPermission,
        licenseNumber: licenseNumber.trim() || null,
        upiId: cleanUpi || null,
        qrCodeUrl,
        facilities,
        rules: [
          'No smoking or alcohol inside premises',
          'Gate closes at 10:30 PM (Biometric entry)',
          'Day visitors allowed till 8 PM',
        ],
        images: [imageUrl],
      });

      if (res.data.success) {
        setShowAddModal(false);
        setName('');
        setAddress('');
        setDescription('');
        setContactMobile('');
        setLicenseNumber('');
        setUpiId('');
        fetchPGs();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create PG');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFacility = (fac: string) => {
    if (facilities.includes(fac)) {
      setFacilities(facilities.filter((f) => f !== fac));
    } else {
      setFacilities([...facilities, fac]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Properties</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Manage PG Accommodations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review your listed properties, legal licenses, UPI QR codes, and capacity allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/list-pg"
            className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Full PG Setup Wizard
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Quick Add PG
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading properties...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pgs.map((pg) => (
            <div
              key={pg.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <img
                    src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'}
                    alt={pg.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 dark:text-slate-100">
                      {pg.city}
                    </span>
                    <span className="bg-emerald-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold">
                      {pg.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pg.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                        {pg.address}
                      </p>
                    </div>
                  </div>

                  {/* Legal & QR Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {pg.licenseNumber ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Permit: {pg.licenseNumber}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50">
                        <FileCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Permit Pending
                      </span>
                    )}

                    {pg.upiId ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900/50">
                        <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        UPI: {pg.upiId}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        <QrCode className="w-3.5 h-3.5 text-slate-400" /> No QR Set
                      </span>
                    )}

                    {pg.contactMobile && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" /> {pg.contactMobile}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {pg.description || 'Modern PG accommodation with high quality food and amenities.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Total Beds</span>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{pg.totalBeds || 0}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Occupied</span>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{pg.occupiedBeds || 0}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Available</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{pg.availableBeds || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-4 text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">{pg.rooms?.length || 0} Rooms Configured</span>
                <Link
                  href={`/owner/rooms-beds?pgId=${pg.id}`}
                  className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold"
                >
                  Configure Rooms & Beds →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add PG Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New PG Property</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Include legal licensing and UPI payment QR code.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePG} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">PG Property Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunrise Luxury PG for Men"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Frontdesk Mobile</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. #42, Near Tech Park, Main Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Legal Permission & License */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Legal Permission Type</label>
                  <select
                    value={legalPermission}
                    onChange={(e) => setLegalPermission(e.target.value)}
                    className="w-full text-[11px] px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Municipal Corporation Housing & Trade License">Municipal Corporation Trade License</option>
                    <option value="Police Station Tenant Verification NOC">Police Station NOC Clearance</option>
                    <option value="Fire Safety Clearance Certificate">Fire Safety Clearance Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">License / NOC Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BBMP/PG/2024/781"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Payment UPI & QR */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Owner UPI ID (for QR Code Rent Collection)
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. sunrise.pg@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full text-xs font-mono pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  A scannable QR code will be generated automatically for tenants to pay rent.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your PG facilities, nearby transit, and mess quality..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Amenities</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Wi-Fi', 'Food', 'Laundry', 'AC', 'Parking', 'CCTV', 'Power Backup', 'RO Water'].map(
                    (fac) => (
                      <button
                        key={fac}
                        type="button"
                        onClick={() => toggleFacility(fac)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                          facilities.includes(fac)
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {fac}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create PG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
