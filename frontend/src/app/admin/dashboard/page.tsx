'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  ShieldCheck,
  Users,
  Building2,
  Bed,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Loader2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statRes, userRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);

      if (statRes.data.success) setStats(statRes.data.data);
      if (userRes.data.success) setUsers(userRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOwner = async (ownerId: string, status: string) => {
    try {
      const res = await api.put(`/admin/owners/${ownerId}/verification`, {
        verificationStatus: status,
      });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update verification');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-2">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading admin telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
            Superuser Control
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Platform Master Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global metrics, owner verification status, and registered user directory.
          </p>
        </div>

        <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Admin Authorized
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Users</span>
          <p className="text-3xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
          <span className="text-xs text-slate-500 block">
            {stats?.studentCount} Students • {stats?.ownerCount} Owners
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Accommodations</span>
          <p className="text-3xl font-black text-indigo-600">{stats?.totalPGs || 0}</p>
          <span className="text-xs text-slate-500 block">
            {stats?.totalRooms} Rooms • {stats?.totalBeds} Beds
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Platform Occupancy</span>
          <p className="text-3xl font-black text-emerald-600">{stats?.occupancyRate || 0}%</p>
          <span className="text-xs text-slate-500 block">
            {stats?.occupiedBeds} of {stats?.totalBeds} Beds Occupied
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Revenue Volume</span>
          <p className="text-3xl font-black text-slate-900">
            ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-slate-500 block">Processed through Razorpay</span>
        </div>
      </div>

      {/* User Directory Table */}
      <div id="users" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Registered Users & Owners</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit user roles, verification statuses, and account timestamps.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status / Verification</th>
                <th className="p-4">Joined On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-bold text-slate-900">{u.name}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4 text-slate-600">{u.mobile}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'OWNER'
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.owner ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            u.owner.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {u.owner.verificationStatus}
                        </span>
                        {u.owner.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyOwner(u.owner.id, 'VERIFIED')}
                            className="text-[10px] text-brand-600 font-bold hover:underline"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">Active</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
