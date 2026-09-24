'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRef = useRef(false);

  // Sync auth — redirect immediately if already logged in
  useEffect(() => {
    if (user) router.replace('/products');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current || isSubmitting) return;

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    submitRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const userData = await loginUser({ username: username.trim(), password });
      // Save token to cookie so middleware can read it (client-side set)
      document.cookie = `auth_token=${userData.token}; path=/; max-age=3600; SameSite=Lax`;
      login(userData);
      router.push('/products');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Invalid username or password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
      submitRef.current = false;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/[0.04] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-amber-900/[0.06] blur-[100px]" />
      </div>

      <div className="page-enter w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-2xl shadow-amber-500/30 mb-4">
            <svg className="w-8 h-8 text-charcoal-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM4 5h16a1 1 0 010 2H4a1 1 0 010-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-cream-100 mb-1">ProductAdmin</h1>
          <p className="text-cream-300/60 text-sm">Sign in to manage your products</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3"
            >
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-cream-200 mb-1.5">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="emilys"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-cream-200 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••••"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  Signing in…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-5 p-3 rounded-lg bg-charcoal-800/50 border border-white/[0.05]">
            <p className="text-xs text-cream-300/50 text-center">
              Demo credentials pre-filled — just click Sign In
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
