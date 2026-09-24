'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Suppress user-specific UI until after hydration so server and client
  // first-renders match. After mount, user is read from localStorage.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav
      className="sticky top-0 z-40 border-b border-white/[0.06]"
      style={{ background: 'rgba(15,17,23,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/products" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/30 transition-shadow duration-300">
              <svg className="w-4 h-4 text-charcoal-950" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM4 5h16a1 1 0 010 2H4a1 1 0 010-2z" />
              </svg>
            </div>
            <span className="font-bold text-cream-100 text-lg tracking-tight group-hover:text-amber-400 transition-colors duration-200">
              ProductAdmin
            </span>
          </Link>

          {/* Right side — only render after mount to match server HTML */}
          {mounted && user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold uppercase">
                  {user.firstName?.[0] ?? user.username[0]}
                </div>
                <span className="text-sm text-cream-200">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary !py-1.5 !px-3.5 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
