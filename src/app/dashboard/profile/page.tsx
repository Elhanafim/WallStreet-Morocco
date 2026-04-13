'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  User, Mail, Shield, Calendar, Lock, AlertTriangle, Check, Eye, EyeOff,
} from 'lucide-react';

function roleBadge(role: string) {
  const map: Record<string, { label: string; className: string; description: string }> = {
    FREE: { label: 'Gratuit', className: 'bg-gray-100 text-gray-700', description: 'Accès aux fonctionnalités de base' },
    PREMIUM: { label: 'Premium', className: 'bg-amber-100 text-amber-700', description: 'Accès complet aux analyses exclusives' },
    ADMIN: { label: 'Administrateur', className: 'bg-purple-100 text-purple-700', description: 'Accès complet + gestion de la plateforme' },
  };
  return map[role] ?? map['FREE'];
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const role = (user as any)?.role ?? 'FREE';
  const badge = roleBadge(role);

  const [nameForm, setNameForm] = useState({ name: user?.name ?? '', saving: false, success: false, error: '' });
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    saving: false,
    success: false,
    error: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameForm.name.trim()) { setNameForm((p) => ({ ...p, error: 'Le nom ne peut pas être vide' })); return; }
    setNameForm((p) => ({ ...p, saving: true, error: '', success: false }));
    // In a real app, call PATCH /api/user/profile
    await new Promise((r) => setTimeout(r, 800));
    setNameForm((p) => ({ ...p, saving: false, success: true }));
    setTimeout(() => setNameForm((p) => ({ ...p, success: false })), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) {
      setPwForm((p) => ({ ...p, error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' }));
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwForm((p) => ({ ...p, error: 'Les mots de passe ne correspondent pas' }));
      return;
    }
    setPwForm((p) => ({ ...p, saving: true, error: '', success: false }));
    // In a real app, call POST /api/user/change-password
    await new Promise((r) => setTimeout(r, 800));
    setPwForm((p) => ({ ...p, saving: false, success: true, currentPassword: '', newPassword: '', confirmPassword: '' }));
    setTimeout(() => setPwForm((p) => ({ ...p, success: false })), 3000);
  };

  const memberSince = user ? new Date().toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0A2540] flex items-center justify-center text-white text-2xl font-medium flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-medium text-[#0A2540] truncate">{user?.name ?? 'Utilisateur'}</h2>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
              <span className="text-xs text-gray-400">Membre depuis {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: User, label: 'Nom', value: user?.name ?? '—' },
          { icon: Mail, label: 'Email', value: user?.email ?? '—' },
          { icon: Calendar, label: 'Membre depuis', value: memberSince },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0A2540]/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-[#0A2540]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-[#0A2540] truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Name */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-medium text-[#0A2540] mb-4">Modifier le nom</h3>
        <form onSubmit={handleNameSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0A2540] mb-1.5">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm((p) => ({ ...p, name: e.target.value, error: '' }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[#0A2540] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A86FF] transition-all"
              />
            </div>
            {nameForm.error && <p className="text-red-500 text-xs mt-1">{nameForm.error}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={nameForm.saving}
              className="px-5 py-2.5 bg-[#0A2540] text-white text-sm font-medium rounded-xl hover:bg-[#3A86FF] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {nameForm.saving ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              Sauvegarder
            </button>
            {nameForm.success && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
                <Check className="w-4 h-4" />
                Sauvegardé !
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-medium text-[#0A2540] mb-4">Changer le mot de passe</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Mot de passe actuel', showKey: 'showCurrent' },
            { key: 'newPassword', label: 'Nouveau mot de passe', showKey: 'showNew' },
            { key: 'confirmPassword', label: 'Confirmer le nouveau mot de passe', showKey: 'showNew' },
          ].map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[#0A2540] mb-1.5">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={(pwForm as any)[showKey] ? 'text' : 'password'}
                  value={(pwForm as any)[key]}
                  onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value, error: '' }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-[#0A2540] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A86FF] transition-all"
                />
                {key !== 'confirmPassword' && (
                  <button
                    type="button"
                    onClick={() => setPwForm((p) => ({ ...p, [showKey]: !(p as any)[showKey] }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {(pwForm as any)[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {pwForm.error && <p className="text-red-500 text-xs">{pwForm.error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pwForm.saving}
              className="px-5 py-2.5 bg-[#0A2540] text-white text-sm font-medium rounded-xl hover:bg-[#3A86FF] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {pwForm.saving && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Changer le mot de passe
            </button>
            {pwForm.success && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
                <Check className="w-4 h-4" />
                Modifié !
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-medium text-[#0A2540] mb-4">Abonnement</h3>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-[#3A86FF]" />
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
            </div>
            <p className="text-sm text-gray-500">{badge.description}</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
        <h3 className="text-base font-medium text-red-600 mb-1">Zone de danger</h3>
        <p className="text-sm text-gray-500 mb-4">Ces actions sont irréversibles. Agissez avec précaution.</p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Supprimer mon compte
        </button>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-[#0A2540] text-center mb-2">Supprimer le compte ?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Toutes vos données (portfolio, historique) seront définitivement supprimées. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // In production: call DELETE /api/user then sign out
                  signOut({ callbackUrl: '/' });
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
