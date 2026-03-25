'use client';

import { Suspense, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, TrendingUp, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ── Login lockout constants ────────────────────────────────────────────────────
const MAX_ATTEMPTS   = 5;
const LOCKOUT_MS     = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_PREFIX = 'wsm_login_attempts_';

interface AttemptRecord { count: number; resetAt: number }

function getAttemptKey(email: string): string {
  // Hash the email lightly so it's not stored in plain text
  let h = 0;
  for (let i = 0; i < email.length; i++) { h = (Math.imul(31, h) + email.charCodeAt(i)) | 0; }
  return ATTEMPT_PREFIX + Math.abs(h).toString(36);
}

function getAttempts(email: string): AttemptRecord {
  try {
    const raw = localStorage.getItem(getAttemptKey(email));
    if (!raw) return { count: 0, resetAt: 0 };
    const rec = JSON.parse(raw) as AttemptRecord;
    if (Date.now() > rec.resetAt) return { count: 0, resetAt: 0 };
    return rec;
  } catch { return { count: 0, resetAt: 0 }; }
}

function recordFailedAttempt(email: string): AttemptRecord {
  const rec = getAttempts(email);
  const updated: AttemptRecord = {
    count:   rec.count + 1,
    resetAt: rec.resetAt || Date.now() + LOCKOUT_MS,
  };
  localStorage.setItem(getAttemptKey(email), JSON.stringify(updated));
  return updated;
}

function clearAttempts(email: string): void {
  localStorage.removeItem(getAttemptKey(email));
}

function isLockedOut(email: string): { locked: boolean; minutesLeft: number } {
  const rec = getAttempts(email);
  if (rec.count < MAX_ATTEMPTS) return { locked: false, minutesLeft: 0 };
  const msLeft = rec.resetAt - Date.now();
  if (msLeft <= 0) { clearAttempts(email); return { locked: false, minutesLeft: 0 }; }
  return { locked: true, minutesLeft: Math.ceil(msLeft / 60_000) };
}

// ─────────────────────────────────────────────────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation('common');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check lockout before attempting
    const lockout = isLockedOut(email.trim().toLowerCase());
    if (lockout.locked) {
      setError(
        `Trop de tentatives. Réessayez dans ${lockout.minutesLeft} minute${lockout.minutesLeft > 1 ? 's' : ''}.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Generic error — never reveal whether the email exists
        const rec = recordFailedAttempt(email.trim().toLowerCase());
        if (rec.count >= MAX_ATTEMPTS) {
          setError(
            `Trop de tentatives. Réessayez dans ${LOCKOUT_MS / 60_000} minutes.`
          );
        } else {
          setError(t('errors.invalidCredentials'));
        }
      } else {
        clearAttempts(email.trim().toLowerCase());
        const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router, searchParams, t]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#3A86FF 1px, transparent 1px), linear-gradient(90deg, #3A86FF 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <span className="font-black text-2xl text-white">
              WallStreet <span className="text-accent">Morocco</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-primary mb-2">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-primary/60 text-sm">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 bg-white text-primary placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-primary">
                  {t('auth.password')}
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-secondary hover:text-secondary-600 font-medium transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-surface-200 bg-white text-primary placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-surface-300 text-secondary focus:ring-secondary"
              />
              <label htmlFor="remember" className="text-sm text-primary/60">
                {t('auth.rememberMe')}
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-secondary transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('auth.loggingIn')}
                </>
              ) : (
                <>
                  {t('nav.login')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center text-xs text-primary/40">
              <span className="bg-white px-3">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-surface-200 rounded-xl py-3 text-sm font-medium text-primary hover:bg-surface-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-surface-200 rounded-xl py-3 text-sm font-medium text-primary hover:bg-surface-50 transition-colors"
            >
              <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Signup Link */}
          <p className="text-center text-sm text-primary/60 mt-6">
            {t('auth.noAccount')}{' '}
            <Link href="/auth/signup" className="text-secondary font-semibold hover:text-secondary-600 transition-colors">
              {t('nav.registerFree')}
            </Link>
          </p>
        </div>

        {/* Security note */}
        <p className="text-center text-white/40 text-xs mt-6">
          {t('auth.secureConnection')}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
