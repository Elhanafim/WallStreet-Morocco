'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, ChevronDown, ChevronUp, Heart, Monitor, BarChart2, Wrench } from 'lucide-react';
import { copyToClipboard } from '@/utils/copyToClipboard';

const REVOLUT = {
  iban:            process.env.NEXT_PUBLIC_DONATE_REVOLUT_IBAN              ?? 'FR76 2823 3000 0145 7448 0043 017',
  bic:             process.env.NEXT_PUBLIC_DONATE_REVOLUT_BIC               ?? 'REVOFRP2',
  bank:            process.env.NEXT_PUBLIC_DONATE_REVOLUT_BANK              ?? 'Revolut Bank UAB',
  correspondentBic:process.env.NEXT_PUBLIC_DONATE_REVOLUT_CORRESPONDENT_BIC ?? 'CHASDEFX',
  username:        process.env.NEXT_PUBLIC_DONATE_REVOLUT_USERNAME          ?? '@elhanafi01',
  link:            process.env.NEXT_PUBLIC_DONATE_REVOLUT_LINK              ?? 'https://revolut.me/elhanafi01',
};

const ATTIJARI = {
  beneficiary: process.env.NEXT_PUBLIC_DONATE_ATTIJARI_BENEFICIARY ?? 'WallStreet Morocco',
  rib:         process.env.NEXT_PUBLIC_DONATE_ATTIJARI_RIB         ?? '007 480 0000827330040243161',
  bankCode:    process.env.NEXT_PUBLIC_DONATE_ATTIJARI_BANK_CODE   ?? '007',
  cityCode:    process.env.NEXT_PUBLIC_DONATE_ATTIJARI_CITY_CODE   ?? '480',
  account:     process.env.NEXT_PUBLIC_DONATE_ATTIJARI_ACCOUNT     ?? '000827C300402431',
  ribKey:      process.env.NEXT_PUBLIC_DONATE_ATTIJARI_RIB_KEY     ?? '61',
  swift:       process.env.NEXT_PUBLIC_DONATE_ATTIJARI_SWIFT       ?? 'BCMAMAMC',
};

const AMOUNTS = ['1', '5', '10', '20'] as const;

function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation('donate');
  const [toast, setToast] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = () => {
    copyToClipboard(
      value,
      () => {
        setToast('copied');
        setTimeout(() => setToast('idle'), 1500);
      },
      () => {
        setToast('error');
        setTimeout(() => setToast('idle'), 1500);
      }
    );
  };

  return (
    <button
      onClick={handleCopy}
      title={`${t('copied')} ${label}`}
      className="ml-2 flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors group relative"
    >
      {toast === 'copied' ? (
        <span className="text-xs font-semibold text-emerald-600 whitespace-nowrap">{t('copied')}</span>
      ) : toast === 'error' ? (
        <span className="text-xs font-semibold text-red-500 whitespace-nowrap">{t('copyError')}</span>
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition-colors" />
      )}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900 flex-1 text-right break-all">{value}</span>
      <CopyButton value={value} label={label} />
    </div>
  );
}

export default function DonateContent() {
  const { t } = useTranslation('donate');
  const [revolutOpen, setRevolutOpen] = useState(false);
  const [attijariOpen, setAttijariOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const displayAmount = selectedAmount === 'libre' ? customAmount : selectedAmount;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-6">
            <Heart className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('subtitle')}
          </p>

          {/* Cost transparency strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Monitor,   label: t('costs.hosting'),     value: t('costs.hostingValue') },
              { icon: BarChart2, label: t('costs.apis'),        value: t('costs.apisValue') },
              { icon: Wrench,    label: t('costs.maintenance'), value: t('costs.maintenanceValue') },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-base font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed italic">
            {t('warmMessage')}
          </p>
        </div>
      </section>

      {/* ── PAYMENT CARD ─────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Revolut Card ────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-900 text-white">
                    🌍 {t('international')}
                  </span>
                </div>
                <h2 className="text-xl font-black text-gray-900 mt-2">Debit / Credit Card · Apple Pay</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {displayAmount
                    ? `${t('transferVia', { amount: displayAmount })}`
                    : 'Visa · Mastercard · Apple Pay · Google Pay'}
                </p>
              </div>

              {/* QR + pay via app link */}
              <div className="p-6 flex flex-col items-center border-b border-gray-100">
                <img
                  src="/images/donate/qr-revolut.png"
                  alt="Revolut QR code WallStreet Morocco"
                  className="w-48 h-48 rounded-xl object-cover"
                />
                <p className="mt-3 font-bold text-gray-900 text-sm">{REVOLUT.username}</p>
                <a
                  href={REVOLUT.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Support here →
                </a>
              </div>

              {/* Expandable bank details */}
              <div className="p-4">
                <button
                  onClick={() => setRevolutOpen(!revolutOpen)}
                  className="w-full text-left text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  {revolutOpen
                    ? <><ChevronUp className="w-3.5 h-3.5" />{t('hideBankDetails')}</>
                    : <><ChevronDown className="w-3.5 h-3.5" />{t('showBankDetails')}</>}
                </button>
                {revolutOpen && (
                  <div className="mt-3">
                    <DetailRow label={t('iban')}         value={REVOLUT.iban} />
                    <DetailRow label={t('bic')}          value={REVOLUT.bic} />
                    <DetailRow label={t('bank')}         value={REVOLUT.bank} />
                    <DetailRow label={t('correspondent')} value={REVOLUT.correspondentBic} />
                  </div>
                )}
              </div>
            </div>

            {/* ── Attijari Card ───────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#c1272d' }}>
                    🇲🇦 {t('morocco')}
                  </span>
                </div>
                <h2 className="text-xl font-black text-gray-900 mt-2">Attijariwafa Bank</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {displayAmount
                    ? `${t('transferVia', { amount: displayAmount })} Attijari`
                    : t('attijariSubtitle')}
                </p>
              </div>

              {/* QR */}
              <div className="p-6 flex flex-col items-center border-b border-gray-100">
                <img
                  src="/images/donate/qr-attijari.png"
                  alt="Attijari QR code WallStreet Morocco"
                  className="w-48 h-48 rounded-xl object-cover"
                />
                <p className="mt-3 font-bold text-gray-900 text-sm">{ATTIJARI.beneficiary}</p>
                <p className="mt-1 text-xs text-gray-500 text-center">{t('scanQR')}</p>
              </div>

              {/* Expandable bank details */}
              <div className="p-4">
                <button
                  onClick={() => setAttijariOpen(!attijariOpen)}
                  className="w-full text-left text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  {attijariOpen
                    ? <><ChevronUp className="w-3.5 h-3.5" />{t('hideRibDetails')}</>
                    : <><ChevronDown className="w-3.5 h-3.5" />{t('showRibDetails')}</>}
                </button>
                {attijariOpen && (
                  <div className="mt-3">
                    <DetailRow label={t('beneficiary')} value={ATTIJARI.beneficiary} />
                    <DetailRow label={t('rib')}         value={ATTIJARI.rib} />
                    <DetailRow label={t('bankCode')}    value={ATTIJARI.bankCode} />
                    <DetailRow label={t('cityCode')}    value={ATTIJARI.cityCode} />
                    <DetailRow label={t('account')}     value={ATTIJARI.account} />
                    <DetailRow label={t('ribKey')}      value={ATTIJARI.ribKey} />
                    <DetailRow label={t('swift')}       value={ATTIJARI.swift} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUGGESTED AMOUNTS ────────────────────────────────────── */}
      <section className="pb-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">{t('suggestedAmount')}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(selectedAmount === amt ? null : amt)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                    selectedAmount === amt
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {amt}$
                </button>
              ))}
              <button
                onClick={() => setSelectedAmount(selectedAmount === 'libre' ? null : 'libre')}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                  selectedAmount === 'libre'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                }`}
              >
                {t('freeAmount')} ✏️
              </button>
            </div>

            {selectedAmount === 'libre' && (
              <input
                type="text"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={t('freeAmountPlaceholder')}
                className="mb-4 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-gray-400 w-48"
              />
            )}

            {selectedAmount && selectedAmount !== 'libre' && (
              <p className="text-sm text-gray-600 mb-3">
                {t(`amounts.${selectedAmount as typeof AMOUNTS[number]}`)}
              </p>
            )}

            <p className="text-xs text-gray-400 leading-relaxed">{t('amountNote')}</p>
          </div>
        </div>
      </section>

      {/* ── WHY SUPPORT ──────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-black text-gray-900 text-center mb-10">{t('whyTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🚫📢</div>
              <h4 className="font-bold text-gray-900 mb-2">{t('noAds')}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{t('noAdsBody')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🆓</div>
              <h4 className="font-bold text-gray-900 mb-2">{t('freeForAll')}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{t('freeForAllBody')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🇲🇦</div>
              <h4 className="font-bold text-gray-900 mb-2">{t('madeForMoroccans')}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{t('madeForMoroccansBody')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THANK YOU ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-2xl font-black text-gray-900 mb-5">{t('thankYou')}</p>
          <p className="text-gray-600 leading-relaxed mb-8">{t('thankYouBody')}</p>
          <p className="text-xs text-gray-400 leading-relaxed max-w-lg mx-auto">{t('legalNotice')}</p>
        </div>
      </section>
    </div>
  );
}
