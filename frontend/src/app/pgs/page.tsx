'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { PG } from '@/types';
import {
  Search,
  MapPin,
  Filter,
  Check,
  Building,
  Bed,
  Wifi,
  Utensils,
  Car,
  Shield,
  Loader2,
} from 'lucide-react';

function PGListingContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCity = searchParams.get('city') || '';

  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [maxRent, setMaxRent] = useState<number>(15000);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('');

  useEffect(() => {
    fetchPGs();
  }, [selectedCity, maxRent, selectedRoomType, selectedFacility]);

  const fetchPGs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCity) params.city = selectedCity;
      if (maxRent) params.maxRent = maxRent;
      if (selectedRoomType) params.roomType = selectedRoomType;
      if (selectedFacility) params.facility = selectedFacility;

      const res = await api.get('/pgs', { params });
      if (res.data.success) {
        setPgs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch PGs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPGs();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCity('');
    setMaxRent(15000);
    setSelectedRoomType('');
    setSelectedFacility('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Search Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Find Available PG Accommodations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search student hostels and paying guest rooms by location, budget, and sharing preferences.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by PG name, street, or landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Filters
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">City</label>
              <div className="flex flex-wrap gap-1.5">
                {['', 'Kopargaon', 'Pune'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                      selectedCity === city
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {city === '' ? 'All Cities' : city}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Room Type</label>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {['', 'Single', 'Double Sharing', 'Triple Sharing'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="roomType"
                      checked={selectedRoomType === type}
                      onChange={() => setSelectedRoomType(type)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>{type === '' ? 'Any Type' : type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Max Budget Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Max Budget</label>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">₹{maxRent.toLocaleString('en-IN')}/mo</span>
              </div>
              <input
                type="range"
                min="4000"
                max="20000"
                step="500"
                value={maxRent}
                onChange={(e) => setMaxRent(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                <span>₹4,000</span>
                <span>₹20,000</span>
              </div>
            </div>

            {/* Facilities Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Facility / Amenity</label>
              <div className="flex flex-wrap gap-1.5">
                {['', 'Wi-Fi', 'Food', 'Laundry', 'AC', 'Parking', 'CCTV'].map((fac) => (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => setSelectedFacility(fac)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                      selectedFacility === fac
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {fac === '' ? 'All Facilities' : fac}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PG Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading available PGs...</p>
            </div>
          ) : pgs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <Building className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No PGs Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try adjusting your search query, budget range, or selected city filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pgs.map((pg) => (
                <div
                  key={pg.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-brand-950/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image */}
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={
                          pg.images?.[0] ||
                          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={pg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 dark:text-slate-100 shadow-sm">
                        {pg.availableBeds ?? 0} Beds Available
                      </div>
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-400" />
                        {pg.city}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {pg.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {pg.address}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(pg.facilities || []).slice(0, 4).map((f) => (
                          <span
                            key={f}
                            className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>

                      {/* Rooms summary */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Bed className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span>{pg.rooms?.length || 0} Room Types Configured</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Rent from</span>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white">
                        ₹{(pg.minRent || 5500).toLocaleString('en-IN')}{' '}
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/mo</span>
                      </p>
                    </div>
                    <Link
                      href={`/pgs/${pg.id}`}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                    >
                      View & Book Bed
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PGListingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading PG catalog...</p>
        </div>
      }
    >
      <PGListingContent />
    </Suspense>
  );
}
