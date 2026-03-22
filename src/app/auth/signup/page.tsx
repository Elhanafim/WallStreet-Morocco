'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, TrendingUp, Mail, Lock, User, Check, ArrowRight, Zap, AlertCircle } from 'lucide-react';

const passwordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ['', 'Faible', 'Passable', 'Bien', 'Excellent'];
const strengthColors = ['', 'bg-danger', 'bg-warning', 'bg-secondary', 'bg-success'];

export default function SignupPage() {
  const router = useRouter();
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!formData.email.includes('@')) newErrors.email = 'Email invalide';
    if (formData.password.length < 8) newErrors.password = 'Minimum 8 caractères';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions';
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
        setApiError(data.error || 'Une erreur est survenue');
        setIsLoading(false);
        return;
      }

      // Auto sign-in after registration
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
    } catch (err) {
      setApiError('Une erreur réseau est survenue. Veuillez réessayer.');
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
            <span className="font-black text-2xl text-white">
              WallStreet <span className="text-accent">Morocco</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-primary mb-2">
              Créer un compte gratuit
            </h1>
            <p className="text-primary/60 text-sm">
              Rejoignez 12 400+ investisseurs marocains. Accès immédiat, sans carte bancaire.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-secondary/5 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-2">
              {[
                'Accès aux articles de base',
                'Simulateur de portefeuille',
                'Calendrier économique',
                'Newsletter hebdomadaire',
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
                <label className="block text-xs font-semibold text-primary mb-1.5">Prénom</label>
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
                <label className="block text-xs font-semibold text-primary mb-1.5">Nom</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  placeholder="El Hanafi"
                  className={`w-full px-3 py-3 rounded-xl border text-primary text-sm placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                    errors.lastName ? 'border-danger bg-danger/5' : 'border-surface-200'
                  }`}
                />
                {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="votre@email.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-primary text-sm placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
                    errors.email ? 'border-danger bg-danger/5' : 'border-surface-200'
                  }`}
                />
              </div>
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">Mot de passe</label>
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
                    Force : {strengthLabels[strength]}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">Confirmer le mot de passe</label>
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
                  J&apos;accepte les{' '}
                  <Link href="#" className="text-secondary hover:underline">Conditions d&apos;utilisation</Link>
                  {' '}et la{' '}
                  <Link href="#" className="text-secondary hover:underline">Politique de confidentialité</Link>
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
                  Recevoir la newsletter hebdomadaire (analyses marchés, conseils)
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary text-white font-bold py-3.5 rounded-xl hover:bg-secondary-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Création du compte...
                </>
              ) : (
                <>
                  Créer mon compte gratuit
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-primary/60 mt-5">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-secondary font-semibold hover:text-secondary-600 transition-colors">
              Se connecter
            </Link>
          </p>

          {/* Premium Upgrade Hint */}
          <div className="mt-5 bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-xs text-primary/70">
              <strong>Passez Premium</strong> après l&apos;inscription pour accéder aux analyses exclusives.
              7 jours gratuits.
            </p>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Vos données sont protégées et ne sont jamais revendues
        </p>
      </div>
    </div>
  );
}
