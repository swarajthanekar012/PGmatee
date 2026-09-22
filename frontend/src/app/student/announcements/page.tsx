'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Announcement } from '@/types';
import { Megaphone, Calendar, Building2, Loader2 } from 'lucide-react';

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Bulletin</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Owner Announcements & Notices
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Stay informed with official maintenance schedules, Wi-Fi upgrades, and PG updates.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading notices...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Announcements Currently</h3>
          <p className="text-xs text-slate-500 mt-1">
            New updates published by your PG owner will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 hover:border-brand-300 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                    <Megaphone className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(a.createdAt).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>{a.pg?.name || 'PG Management'}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                  Target: {a.targetType === 'ALL' ? 'All Residents' : a.targetType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
