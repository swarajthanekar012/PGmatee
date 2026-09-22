'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  UserCheck,

} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'OWNER') {
        router.push('/owner/dashboard');
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (role: 'student' | 'owner' | 'admin') => {
    if (role === 'student') {
      setEmail('student@pgmate.com');
      setPassword('student123');
    } else if (role === 'owner') {
      setEmail('owner@pgmate.com');
      setPassword('owner123');
    } else {
      setEmail('admin@pgmate.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-brand-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your PG dashboard and rent records.
          </p>
        </div>

        {/* Demo Fast-fill Buttons */}
        <div className="mb-6 p-3 bg-brand-50/60 rounded-2xl border border-brand-100">
          <p className="text-[11px] font-bold text-brand-800 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            1-Click Demo Logins:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials('student')}
              className="px-2 py-1.5 bg-white hover:bg-slate-50 border border-brand-200 rounded-xl text-[11px] font-semibold text-slate-700 transition shadow-sm text-center"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('owner')}
              className="px-2 py-1.5 bg-white hover:bg-slate-50 border border-brand-200 rounded-xl text-[11px] font-semibold text-slate-700 transition shadow-sm text-center"
            >
              🏢 Owner
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="px-2 py-1.5 bg-white hover:bg-slate-50 border border-brand-200 rounded-xl text-[11px] font-semibold text-slate-700 transition shadow-sm text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-brand-600 hover:underline">
            Register as Student or Owner
          </Link>
        </div>
      </div>
    </div>
  );
}
