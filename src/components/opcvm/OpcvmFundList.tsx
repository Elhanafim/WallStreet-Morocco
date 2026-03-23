'use client';

import { useState } from 'react';
import { TrendingUp, Info, Search } from 'lucide-react';
import { opcvmFunds, banks, getFundsByBank } from '@/lib/data/opcvm';
import { OPCVMFund } from '@/types';
import { formatCurrency, formatPercent, getRiskColor } from '@/lib/utils';

type FundType = 'Tous' | OPCVMFund['type'];

const bankLogos: Record<string, string> = {
  ATW:  '/images/banks/attijariwafa.svg',
  BMCE: '/images/banks/bmce.svg',
  CIH:  '/images/banks/cih.png',
  CDG:  '/images/banks/cdg.svg',
};

const bankColors: Record<string, string> = {
  ATW:  'bg-[#F47920]',
  BMCE: 'bg-[#0066CC]',
  CDG:  'bg-[#00A86B]',
  CIH:  'bg-[#E63946]',
};

function BankLogo({ bankCode, bankName, size = 'md' }: { bankCode: string; bankName: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass  = size === 'lg' ? 'w-20 h-20' : size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';
  const textSize   = size === 'lg' ? 'text-lg'   : size === 'sm' ? 'text-xs'  : 'text-sm';
  const logoSrc    = bankLogos[bankCode];

  if (logoSrc) {
    return (
      <div className={`${sizeClass} rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-0`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={bankName}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.className = `${sizeClass} ${bankColors[bankCode] || 'bg-primary'} rounded-xl flex items-center justify-center`;
              parent.innerHTML = `<span class="text-white font-black ${textSize}">${bankCode.slice(0, 3)}</span>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${bankColors[bankCode] || 'bg-primary'} rounded-xl flex items-center justify-center`}>
      <span className={`text-white font-black ${textSize}`}>{bankCode.slice(0, 3)}</span>
    </div>
  );
}

function FundCard({ fund }: { fund: OPCVMFund }) {
  const isPositive1Y = fund.performance1Y >= 0;
  const isPositive3Y = fund.performance3Y >= 0;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-primary text-sm leading-snug mb-1.5">{fund.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              fund.type === 'Actions'     ? 'bg-success/10 text-success'   :
              fund.type === 'Obligataire' ? 'bg-secondary/10 text-secondary' :
              fund.type === 'Monétaire'   ? 'bg-surface-200 text-primary/60' :
              'bg-accent/10 text-accent-600'
            }`}>
              {fund.type}
            </span>
            {fund.minInvestment && (
              <span className="text-2xs text-primary/40">min. {formatCurrency(fund.minInvestment)}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-black ${isPositive1Y ? 'text-success' : 'text-danger'}`}>
            {formatPercent(fund.performance1Y)}
          </p>
          <p className="text-2xs text-primary/40">1 an</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'YTD',   val: fund.performanceYTD || 0 },
          { label: '1 an',  val: fund.performance1Y },
          { label: '3 ans', val: fund.performance3Y },
        ].map(({ label, val }) => (
          <div key={label} className="bg-surface-50 rounded-xl p-2 text-center">
            <p className="text-2xs text-primary/40 mb-0.5">{label}</p>
            <p className={`text-xs font-bold ${val >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatPercent(val)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-2xs text-primary/40 uppercase tracking-wide">Risque</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${i < fund.risk ? 'bg-accent' : 'bg-surface-200'}`}
                style={{ width: '8px', height: `${6 + i * 1.5}px` }}
              />
            ))}
            <span className={`text-xs font-semibold ml-1 ${getRiskColor(fund.risk)}`}>
              {fund.risk}/7
            </span>
          </div>
        </div>
        {fund.nav && (
          <div className="text-right">
            <p className="text-2xs text-primary/40">VL</p>
            <p className="text-xs font-bold text-primary">{fund.nav.toLocaleString('fr-MA')} MAD</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BankSection({ bankCode }: { bankCode: string }) {
  const bank  = banks.find((b) => b.code === bankCode)!;
  const funds = getFundsByBank(bankCode);

  return (
    <div className="bg-surface-50 rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <BankLogo bankCode={bank.code} bankName={bank.name} size="md" />
        <div>
          <h2 className="text-xl font-black text-primary">{bank.name}</h2>
          <p className="text-primary/50 text-sm">{funds.length} fonds disponibles</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {funds.map((fund) => (
          <FundCard key={fund.id} fund={fund} />
        ))}
      </div>
    </div>
  );
}

export default function OpcvmFundList() {
  const [activeType, setActiveType]   = useState<FundType>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const fundTypes: FundType[] = ['Tous', 'Actions', 'Obligataire', 'Monétaire', 'Diversifié'];

  const filteredFunds = opcvmFunds.filter((fund) => {
    const matchesType   = activeType === 'Tous' || fund.type === activeType;
    const matchesSearch = !searchQuery ||
      fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fund.bank.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1 shadow-sm overflow-x-auto">
          {fundTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeType === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-primary/60 hover:text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <input
            type="text"
            placeholder="Rechercher un fonds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 mb-8 flex gap-3">
        <Info className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-primary/70 leading-relaxed">
          Les performances affichées sont historiques et ne garantissent pas les résultats futurs.
          Les données sont approximatives et à titre illustratif. Consultez le prospectus officiel avant d&apos;investir.
        </p>
      </div>

      {/* Filtered table */}
      {(activeType !== 'Tous' || searchQuery) && (
        <div className="mb-10">
          <h3 className="font-black text-primary text-lg mb-4">
            {filteredFunds.length} fonds trouvés{activeType !== 'Tous' && ` — ${activeType}`}
          </h3>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-card border border-surface-200">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-surface-200">
                  {['Fonds', 'Banque', 'Type', 'YTD', '1 an', '3 ans', 'Risque', 'Min.'].map((h, i) => (
                    <th
                      key={h}
                      className={`text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-4 ${i >= 3 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFunds.map((fund) => (
                  <tr key={fund.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-primary text-sm">{fund.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold bg-primary/5 text-primary px-2 py-0.5 rounded-lg">
                        {fund.bankCode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        fund.type === 'Actions'     ? 'bg-success/10 text-success'   :
                        fund.type === 'Obligataire' ? 'bg-secondary/10 text-secondary' :
                        fund.type === 'Monétaire'   ? 'bg-surface-200 text-primary/60' :
                        'bg-accent/10 text-accent-600'
                      }`}>
                        {fund.type}
                      </span>
                    </td>
                    {[fund.performanceYTD || 0, fund.performance1Y, fund.performance3Y].map((val, i) => (
                      <td key={i} className={`px-5 py-3.5 text-right text-sm font-bold ${val >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatPercent(val)}
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {Array.from({ length: 7 }, (_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < fund.risk ? 'bg-accent' : 'bg-surface-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-primary/60">
                      {formatCurrency(fund.minInvestment)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bank sections (default view) */}
      {activeType === 'Tous' && !searchQuery && (
        <div className="space-y-8">
          {banks.map((bank) => (
            <BankSection key={bank.code} bankCode={bank.code} />
          ))}
        </div>
      )}
    </>
  );
}
