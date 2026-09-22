'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  Bed,
  ShieldCheck,
  CreditCard,
  Bell,
  Users,
  CheckCircle,
  MapPin,
  ArrowRight,
  Sparkles,
  Wifi,
  Utensils,
  Car,
} from 'lucide-react';
import api from '@/lib/api';
import { PG } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { demoLogin } = useAuth();
  const [searchCity, setSearchCity] = useState('');
  const [featuredPGs, setFeaturedPGs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPGs();
  }, []);

  const fetchFeaturedPGs = async () => {
    try {
      const res = await api.get('/pgs');
      if (res.data.success) {
        setFeaturedPGs(res.data.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch PGs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      router.push(`/pgs?search=${encodeURIComponent(searchCity.trim())}`);
    } else {
      router.push('/pgs');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-slate-50 dark:from-brand-950/20 dark:via-slate-950 dark:to-slate-950 py-16 lg:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-900/60 text-brand-800 dark:text-brand-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Next-Gen PG Accommodation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Manage. Pay. Stay. <br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              Everything For Your PG In One Place.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate manual paperwork. Browse verified student PGs in Kopargaon & Pune, book available beds in seconds, pay monthly rent via Razorpay, and stay connected with instant notifications.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-center p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-200 dark:border-slate-800 gap-2"
            >
              <div className="flex items-center gap-3 px-4 py-2 w-full">
                <MapPin className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter location or PG name (e.g. Kopargaon, Pune)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition hover:scale-102"
              >
                <Search className="w-4 h-4" />
                Find Beds
              </button>
            </form>

            {/* Quick Popular Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-400 dark:text-slate-500">Popular:</span>
              <button
                type="button"
                onClick={() => router.push('/pgs?city=Kopargaon')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition text-slate-700 dark:text-slate-300"
              >
                📍 Kopargaon
              </button>
              <button
                type="button"
                onClick={() => router.push('/pgs?city=Pune')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition text-slate-700 dark:text-slate-300"
              >
                📍 Pune (Viman Nagar)
              </button>
              <button
                type="button"
                onClick={() => router.push('/pgs?roomType=Triple Sharing')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition text-slate-700 dark:text-slate-300"
              >
                🛏️ Triple Sharing
              </button>
            </div>
          </div>

          {/* 1-Click Interactive Demo Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">⚡ Test 1-Click Demo Accounts:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => demoLogin('STUDENT')}
                className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                🎓 Demo Student (Swaraj)
              </button>
              <button
                onClick={() => demoLogin('OWNER')}
                className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                🏢 Demo Owner (Ramesh)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured PGs Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Featured PG Accommodations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Top-rated verified properties with real-time bed availability.
            </p>
          </div>
          <Link
            href="/pgs"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1"
          >
            View All ({featuredPGs.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPGs.map((pg) => (
            <div
              key={pg.id}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-brand-950/30 transition-all duration-300 flex flex-col group"
            >
              {/* Image Preview */}
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={
                    pg.images?.[0] ||
                    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={pg.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 dark:text-slate-100 shadow-sm">
                  {pg.availableBeds ?? 0} Beds Left
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  {pg.city}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                    {pg.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {pg.description || pg.address}
                  </p>

                  {/* Amenities Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(pg.facilities || []).slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
                      >
                        {f}
                      </span>
                    ))}
                    {(pg.facilities || []).length > 3 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 py-0.5">
                        +{pg.facilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Starting from</span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      ₹{(pg.minRent || 5500).toLocaleString('en-IN')}{' '}
                      <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/mo</span>
                    </p>
                  </div>
                  <Link
                    href={`/pgs/${pg.id}`}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-brand-600 dark:hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-white dark:bg-slate-900 py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Built Specifically for Students & PG Owners
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Everything you need to automate occupancy, rent collections, and campus hostel stays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <Bed className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Visual Room & Bed Allocation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Owners configure rooms with beds (e.g. Room 203: B1, B2, B3). Availability updates automatically as student requests are approved.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Razorpay Online Rent Collection</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Students pay rent seamlessly via UPI or Card. Backend verifies cryptographic signatures and instantly generates official downloadable receipts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Announcements & Grievance Tracking</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Broadcast water maintenance and Wi-Fi alerts. Students submit complaints for fans or plumbing and track resolution status in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
