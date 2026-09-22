'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Search,
  CheckCircle2,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { Notification } from '@/types';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout, demoLogin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              PGMate
              <span className="text-[10px] uppercase font-semibold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                PRO
              </span>
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 -mt-1">
              Smart PG Accommodations
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-5">
          <Link
            href="/pgs"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-4 h-4" />
            Explore PGs
          </Link>

          <Link
            href="/list-pg"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            List Your PG
          </Link>

          {user?.role === 'STUDENT' && (
            <Link
              href="/student/dashboard"
              className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Student Portal
            </Link>
          )}

          {user?.role === 'OWNER' && (
            <Link
              href="/owner/dashboard"
              className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Owner Portal
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-2.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 px-2 py-1">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-6">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl transition ${
                              n.isRead
                                ? 'bg-white dark:bg-slate-900 opacity-80'
                                : 'bg-brand-50/50 dark:bg-brand-950/40'
                            }`}
                          >
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs border border-brand-200 dark:border-brand-700">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-xs font-medium text-slate-700 dark:text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {user.role}
                      </span>
                    </div>

                    <div className="p-1">
                      {user.role === 'STUDENT' && (
                        <Link
                          href="/student/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                          Student Dashboard
                        </Link>
                      )}
                      {user.role === 'OWNER' && (
                        <Link
                          href="/owner/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                          Owner Dashboard
                        </Link>
                      )}
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Quick Demo Switcher Buttons */}
              <div className="hidden lg:flex items-center gap-1.5 mr-1">
                <button
                  onClick={() => demoLogin('STUDENT')}
                  className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition"
                  title="Test as Demo Student"
                >
                  🎓 Demo Student
                </button>
                <button
                  onClick={() => demoLogin('OWNER')}
                  className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition"
                  title="Test as Demo Owner"
                >
                  🏢 Demo Owner
                </button>
              </div>

              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-lg shadow-sm shadow-brand-500/20 transition hover:shadow"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
