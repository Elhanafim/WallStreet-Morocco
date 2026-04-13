'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, TrendingUp, Mail, Lock, User, Check, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const COMMON_PASSWORDS = new Set([
  'password','123456','azerty','qwerty','morocco',
  'wallstreet','motdepasse','admin','12345678','111111',
  'password1','iloveyou','sunshine','princess','welcome',
]);

const passwordStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  // Penalise common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return Math.min(score, 1);
  return score;
};

/** Returns a human-readable error if password is too weak, or null if acceptable. */
const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
  if (password.length > 128) return 'Le mot de passe est trop long';
  if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule';
  if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une minuscule';
  if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre';
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return 'Ce mot de passe est trop commun';
  return null;
};

const strengthColors = ['', 'bg-danger', 'bg-warning', 'bg-secondary', 'bg-success'];

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptNewsletter: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  const strength = passwordStrength(formData.password);

  const strengthLabels = ['', t('auth.strength.weak'), t('auth.strength.fair'), t('auth.strength.good'), t('auth.strength.strong')];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = t('errors.firstNameRequired');
    if (!formData.lastName.trim()) newErrors.lastName = t('errors.lastNameRequired');
    if (!formData.email.includes('@')) newErrors.email = t('errors.emailInvalid');
    const pwdError = validatePasswordStrength(formData.password);
    if (pwdError) newErrors.password = pwdError;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('errors.passwordMismatch');
    if (!formData.acceptTerms) newErrors.acceptTerms = t('errors.termsRequired');
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || t('errors.generic'));
        setIsLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push('/auth/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setApiError(t('errors.network'));
      setIsLoading(false);
    }
  };

  const update = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

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
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <span className="font-medium text-2xl text-white">
              WallStreet <span className="text-accent">Morocco</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-primary mb-2">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-primary/60 text-sm">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-secondary/5 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-2">
              {[
                t('auth.benefits.articles'),
                t('auth.benefits.simulator'),
                t('auth.benefits.calendar'),
                t('auth.benefits.newsletter'),
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-primary/70">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {apiError && (
            <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-primary mb-1.5">{t('auth.firstName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    placeholder="Mohammed"
                    className={`w-full pl-9 pr-3 py-3 rounded-xl border text-primary text-sm placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                      errors.firstName ? 'border-danger bg-danger/5' : 'border-surface-200'
                    }`}
                  />
                </div>
                {errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-primary mb-1.5">{t('auth.lastName')}</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  placeholder="Dupont"
                  className={`w-full px-3 py-3 rounded-xl border text-primary text-sm placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                    errors.lastName ? 'border-danger bg-danger/5' : 'border-surface-200'
                  }`}
                />
                {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-primary mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-primary text-sm placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                    errors.email ? 'border-danger bg-danger/5' : 'border-surface-200'
                  }`}
                />
              </div>
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-primary mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-primary text-sm placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                    errors.password ? 'border-danger bg-danger/5' : 'border-surface-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < strength ? strengthColors[strength] : 'bg-surface-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strengthColors[strength].replace('bg-', 'text-')}`}>
                    {t('auth.passwordStrength')} : {strengthLabels[strength]}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-primary mb-1.5">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-primary text-sm placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                    errors.confirmPassword ? 'border-danger bg-danger/5' : 'border-surface-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
                )}
              </div>
              {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.acceptTerms}
                  onChange={(e) => update('acceptTerms', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-surface-300 text-secondary focus:ring-secondary"
                />
                <label htmlFor="terms" className="text-xs text-primary/70 leading-relaxed">
                  {t('auth.acceptTerms')}{' '}
                  <Link href="/terms" className="text-secondary hover:underline">{t('auth.termsOfUse')}</Link>
                  {' '}{t('auth.and')}{' '}
                  <Link href="/confidentialite" className="text-secondary hover:underline">{t('auth.privacyPolicy')}</Link>
                </label>
              </div>
              {errors.acceptTerms && <p className="text-danger text-xs">{errors.acceptTerms}</p>}

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={formData.acceptNewsletter}
                  onChange={(e) => update('acceptNewsletter', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-surface-300 text-secondary focus:ring-secondary"
                />
                <label htmlFor="newsletter" className="text-xs text-primary/70">
                  {t('auth.newsletterConsent')}
                </label>
              </div>
            </div>

            {/* Submit — disabled until T&C accepted */}
            <button
              type="submit"
              disabled={isLoading || !formData.acceptTerms}
              className="w-full bg-secondary text-white font-medium py-3.5 rounded-xl hover:bg-secondary-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('auth.creatingAccount')}
                </>
              ) : (
                <>
                  {t('nav.registerFree')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-primary/60 mt-5">
            {t('auth.hasAccount')}{' '}
            <Link href="/auth/login" className="text-secondary font-medium hover:text-secondary-600 transition-colors">
              {t('nav.login')}
            </Link>
          </p>

          {/* Premium Upgrade Hint */}
          <div className="mt-5 bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-xs text-primary/70">
              {t('auth.premiumHint')}
            </p>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          {t('auth.dataProtected')}
        </p>
      </div>
    </div>
  );
}
