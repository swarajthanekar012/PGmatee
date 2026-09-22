'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Home,
  BedDouble,
  CreditCard,
  Receipt,
  Megaphone,
  AlertCircle,
  Search,
  Users,
  CheckCircle2,
  Building,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const studentLinks = [
    { name: 'My Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Rent Due & Pay', href: '/student/rent', icon: CreditCard },
    { name: 'Payment Receipts', href: '/student/payments', icon: Receipt },
    { name: 'Booking Requests', href: '/student/bookings', icon: BedDouble },
    { name: 'Announcements', href: '/student/announcements', icon: Megaphone },
    { name: 'Raise Grievance', href: '/student/complaints', icon: AlertCircle },
    { name: 'Explore Other PGs', href: '/pgs', icon: Search },
  ];

  const ownerLinks = [
    { name: 'Overview Stats', href: '/owner/dashboard', icon: LayoutDashboard },
    { name: 'My Properties', href: '/owner/pgs', icon: Building },
    { name: 'Rooms & Bed Matrix', href: '/owner/rooms-beds', icon: BedDouble },
    { name: 'Booking Queue', href: '/owner/bookings', icon: Users },
    { name: 'Rent & Collections', href: '/owner/rent', icon: CreditCard },
    { name: 'Broadcast Notice', href: '/owner/announcements', icon: Megaphone },
    { name: 'Student Grievances', href: '/owner/complaints', icon: AlertCircle },
  ];

  const adminLinks = [
    { name: 'Platform Statistics', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Directory', href: '/admin/dashboard#users', icon: Users },
    { name: 'Explore PGs', href: '/pgs', icon: Search },
  ];

  const links =
    user.role === 'OWNER'
      ? ownerLinks
      : user.role === 'ADMIN'
      ? adminLinks
      : studentLinks;

  return (
    <aside className="w-64 shrink-0 hidden md:block bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 transition-colors duration-200">
      <div className="mb-6 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {user.role} WORKSPACE
        </p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">{user.name}</p>
        <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
          ● Active Session
        </span>
      </div>

      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 shadow-sm border border-brand-100 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
