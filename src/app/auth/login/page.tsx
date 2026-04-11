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
        const rec = recordFailedAttempt(email.trim().toLowerCase());
        if (rec.count >= MAX_ATTEMPTS) {
          setError(`Trop de tentatives. Réessayez dans ${LOCKOUT_MS / 60_000} minutes.`);
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <div
      className="px-4 py-20 flex items-center justify-center"
      style={{ minHeight: 'calc(100vh - 160px)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <span
              className="font-medium text-lg"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
            >
              WallStreet <span style={{ color: 'var(--gold)' }}>Morocco</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '32px',
          }}
        >
          <div className="mb-7">
            <h1
              className="text-2xl mb-1"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              {t('auth.loginTitle')}
            </h1>
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
            >
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {error && (
            <div
              className="mb-5 flex items-center gap-3 px-3 py-3"
              style={{
                backgroundColor: 'rgba(217,91,91,0.06)',
                border: '1px solid rgba(217,91,91,0.25)',
                borderRadius: '6px',
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--loss)' }} />
              <p
                className="text-sm"
                style={{ color: 'var(--loss)', fontFamily: 'var(--font-sans)' }}
              >
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
              >
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
                >
                  {t('auth.password')}
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)')}
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingLeft: '36px', paddingRight: '40px' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4"
                style={{
                  accentColor: 'var(--gold)',
                  backgroundColor: 'var(--bg-elevated)',
                }}
              />
              <label
                htmlFor="remember"
                className="text-xs"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
              >
                {t('auth.rememberMe')}
              </label>
            </div>

            {/* Submit — gold border = 1 of 3 gold uses on this page */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                border: '1px solid var(--gold)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => {
                if (!isLoading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(184,151,74,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
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
              <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3 text-xs"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {t('auth.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Google',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                ),
              },
              {
                label: 'Facebook',
                icon: (
                  <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 text-sm transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-elevated)',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)')}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Signup link */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
          >
            {t('auth.noAccount')}{' '}
            <Link
              href="/auth/signup"
              className="underline transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('nav.registerFree')}
            </Link>
          </p>
        </div>

        {/* Security note */}
        <p
          className="text-center text-xs mt-5"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
        >
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
