'use client';

import { useState, useMemo, useCallback } from 'react';
import { Info, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { opcvmFunds, banks, getFundsByBank } from '@/lib/data/opcvm';
import { OPCVMFund } from '@/types';
import { formatCurrency, formatPercent, getRiskColor } from '@/lib/utils';
import AddToPortfolioModal, { type ModalAsset } from '@/components/AddToPortfolioModal';

type FundType  = 'Tous' | OPCVMFund['type'];
type SortKey   = 'name' | 'performanceYTD' | 'performance1Y' | 'performance3Y' | 'risk' | 'nav';
type SortDir   = 'asc' | 'desc';

// ── Constants ───────────────────────────────────────────────────────────────

const FUND_TYPES: FundType[] = ['Tous', 'Actions', 'Obligataire', 'Monétaire', 'Diversifié'];

const TYPE_STYLE: Record<string, string> = {
  Actions:     'bg-success/10 text-success',
  Obligataire: 'bg-secondary/10 text-secondary',
  Monétaire:   'bg-sky-50 text-sky-600',
  Diversifié:  'bg-accent/10 text-accent-600',
};

const BANK_LOGOS: Record<string, string> = {
  ATW:  '/images/banks/attijariwafa.svg',
  BMCE: '/images/banks/bmce.svg',
  CIH:  '/images/banks/cih.png',
  CDG:  '/images/banks/cdg.svg',
};

const BANK_COLORS: Record<string, string> = {
  ATW:  'bg-[#F47920]',
  BMCE: 'bg-[#0066CC]',
  CDG:  'bg-[#00A86B]',
  CIH:  'bg-[#E63946]',
};

// ── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLE[type] ?? 'bg-surface-200 text-primary/60'}`}>
      {type}
    </span>
  );
}

function RiskDots({ risk }: { risk: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className={`rounded-full ${i < risk ? 'bg-accent' : 'bg-surface-200'}`}
          style={{ width: 7, height: 5 + i * 1.5 }}
        />
      ))}
      <span className={`text-xs font-bold ml-1 ${getRiskColor(risk)}`}>{risk}/7</span>
    </div>
  );
}

function BankLogo({ bankCode, bankName }: { bankCode: string; bankName: string }) {
  const src = BANK_LOGOS[bankCode];
  if (src) {
    return (
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-surface-200 flex items-center justify-center flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={bankName}
          className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            t.style.display = 'none';
            const p = t.parentElement;
            if (p) {
              p.className = `w-8 h-8 rounded-lg ${BANK_COLORS[bankCode] ?? 'bg-primary'} flex items-center justify-center flex-shrink-0`;
              p.innerHTML = `<span class="text-white text-xs font-black">${bankCode[0]}</span>`;
            }
          }}
        />
      </div>
    );
  }
  return (
    <div className={`w-8 h-8 rounded-lg ${BANK_COLORS[bankCode] ?? 'bg-primary'} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white text-xs font-black">{bankCode[0]}</span>
    </div>
  );
}

function PerfCell({ value }: { value: number }) {
  return (
    <span className={`font-bold text-sm ${value >= 0 ? 'text-success' : 'text-danger'}`}>
      {formatPercent(value)}
    </span>
  );
}

// ── Sortable header ──────────────────────────────────────────────────────────

function SortTh({
  label, sortKey, current, dir, onSort, align = 'right',
}: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void; align?: 'left' | 'right';
}) {
  const active = current === sortKey;
  const Icon   = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none
        ${align === 'right' ? 'text-right' : 'text-left'}
        ${active ? 'text-secondary' : 'text-primary/50 hover:text-primary/70'}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {align === 'left' && label}
        <Icon className="w-3 h-3" />
        {align === 'right' && label}
      </span>
    </th>
  );
}

// ── Fund table ───────────────────────────────────────────────────────────────

function FundTable({ funds, onAddClick }: { funds: OPCVMFund[]; onAddClick: (f: OPCVMFund) => void }) {
  const [sortKey, setSortKey] = useState<SortKey>('performance1Y');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const sorted = useMemo(() => {
    return [...funds].sort((a, b) => {
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      if (typeof va === 'string' && typeof vb === 'string')
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [funds, sortKey, sortDir]);

  const shProps = { current: sortKey, dir: sortDir, onSort: handleSort };

  return (
    <div className="overflow-x-auto rounded-2xl border border-surface-200 shadow-card bg-white">
      <table className="w-full min-w-[800px]">
        <thead className="bg-surface-50 border-b border-surface-200">
          <tr>
            <SortTh label="Fonds" sortKey="name" {...shProps} align="left" />
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary/50">Banque</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary/50">Type</th>
            <SortTh label="YTD"    sortKey="performanceYTD"  {...shProps} />
            <SortTh label="1 an"   sortKey="performance1Y"   {...shProps} />
            <SortTh label="3 ans"  sortKey="performance3Y"   {...shProps} />
            <SortTh label="Risque" sortKey="risk"            {...shProps} />
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50">VL (MAD)</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50">Min.</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {sorted.map((fund) => (
            <tr key={fund.id} className="hover:bg-surface-50 transition-colors group">
              <td className="px-4 py-3.5">
                <p className="font-semibold text-primary text-sm">{fund.name}</p>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <BankLogo bankCode={fund.bankCode} bankName={fund.bank} />
                  <span className="text-xs font-bold text-primary/60 hidden sm:block">{fund.bankCode}</span>
                </div>
              </td>
              <td className="px-4 py-3.5"><TypeBadge type={fund.type} /></td>
              <td className="px-4 py-3.5 text-right"><PerfCell value={fund.performanceYTD ?? 0} /></td>
              <td className="px-4 py-3.5 text-right"><PerfCell value={fund.performance1Y} /></td>
              <td className="px-4 py-3.5 text-right"><PerfCell value={fund.performance3Y} /></td>
              <td className="px-4 py-3.5 text-right"><RiskDots risk={fund.risk} /></td>
              <td className="px-4 py-3.5 text-right text-sm font-semibold text-primary">
                {fund.nav ? fund.nav.toLocaleString('fr-MA') : '—'}
              </td>
              <td className="px-4 py-3.5 text-right text-xs text-primary/50">
                {formatCurrency(fund.minInvestment)}
              </td>
              <td className="px-4 py-3.5 text-right">
                <button
                  onClick={() => onAddClick(fund)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-secondary/30 text-secondary text-xs font-semibold hover:bg-secondary hover:text-white hover:border-secondary transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Fund card ────────────────────────────────────────────────────────────────

function FundCard({ fund, onAddClick }: { fund: OPCVMFund; onAddClick: (f: OPCVMFund) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Name + 1Y perf */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="min-w-0">
          <p className="font-bold text-sm text-primary leading-snug truncate">{fund.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <TypeBadge type={fund.type} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-xl font-black ${fund.performance1Y >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatPercent(fund.performance1Y)}
          </p>
          <p className="text-2xs text-primary/40">1 an</p>
        </div>
      </div>

      {/* Perf grid */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[
          { label: 'YTD',   val: fund.performanceYTD ?? 0 },
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

      {/* Risk + VL */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-100 mb-3">
        <RiskDots risk={fund.risk} />
        {fund.nav && (
          <div className="text-right">
            <p className="text-2xs text-primary/40">VL</p>
            <p className="text-xs font-bold text-primary">{fund.nav.toLocaleString('fr-MA')} MAD</p>
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddClick(fund)}
        className="mt-auto w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-secondary/30 text-secondary text-xs font-semibold hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-200"
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter au portefeuille
      </button>
    </div>
  );
}

// ── Bank section ─────────────────────────────────────────────────────────────

const BANK_ACCENT: Record<string, string> = {
  ATW:  'border-l-[#F47920]',
  BMCE: 'border-l-[#0066CC]',
  CDG:  'border-l-[#00A86B]',
  CIH:  'border-l-[#E63946]',
};

function BankSection({ bankCode, onAddClick }: { bankCode: string; onAddClick: (f: OPCVMFund) => void }) {
  const [open, setOpen] = useState(true);
  const bank  = banks.find((b) => b.code === bankCode)!;
  const funds = getFundsByBank(bankCode);

  return (
    <div className={`bg-white rounded-2xl border border-surface-200 shadow-card border-l-4 ${BANK_ACCENT[bankCode] ?? ''}`}>
      {/* Collapsible header */}
      <button
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface-50 transition-colors rounded-t-2xl"
        onClick={() => setOpen(!open)}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0">
          {BANK_LOGOS[bankCode] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={BANK_LOGOS[bankCode]} alt={bank.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-sm font-black">{bankCode[0]}</span>
          )}
        </div>
        <div className="text-left flex-1">
          <p className="font-black text-primary text-base">{bank.name}</p>
          <p className="text-primary/40 text-xs">{funds.length} fonds disponibles</p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-primary/40 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-primary/40 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {funds.map((fund) => <FundCard key={fund.id} fund={fund} onAddClick={onAddClick} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function OpcvmFundList() {
  const { status: authStatus } = useSession();
  const [activeType,   setActiveType]   = useState<FundType>('Tous');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [view,         setView]         = useState<'banks' | 'table'>('banks');

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAsset, setModalAsset] = useState<ModalAsset | null>(null);

  const handleAddClick = useCallback((fund: OPCVMFund) => {
    if (authStatus !== 'authenticated') {
      // Open modal anyway — it will show the login prompt
    }
    setModalAsset({
      ticker: fund.id,
      name: fund.name,
      type: 'opcvm',
      nav: fund.nav,
    });
    setModalOpen(true);
  }, [authStatus]);

  const filtered = useMemo(() => opcvmFunds.filter((f) => {
    const matchesType   = activeType === 'Tous' || f.type === activeType;
    const matchesSearch = !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.bank.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  }), [activeType, searchQuery]);

  const showTable = view === 'table' || !!searchQuery || activeType !== 'Tous';

  return (
    <>
      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Type filter */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1 shadow-sm overflow-x-auto">
          {FUND_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeType === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-primary/60 hover:text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <input
            type="text"
            placeholder="Rechercher un fonds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-200 bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
          />
        </div>

        {/* View toggle — only visible in default state */}
        {!searchQuery && activeType === 'Tous' && (
          <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1 shadow-sm ml-auto">
            <button
              onClick={() => setView('banks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'banks' ? 'bg-primary text-white' : 'text-primary/50 hover:text-primary'}`}
            >
              Par banque
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'table' ? 'bg-primary text-white' : 'text-primary/50 hover:text-primary'}`}
            >
              Tableau
            </button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3.5 mb-6 flex gap-3">
        <Info className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-primary/70 leading-relaxed">
          Performances historiques · données indicatives · ne constituent pas un conseil en investissement.
          Consultez le prospectus officiel avant toute souscription.
        </p>
      </div>

      {/* ── Table view ── */}
      {showTable && (
        <>
          <p className="text-sm text-primary/50 mb-3 font-medium">
            {filtered.length} fonds
            {activeType !== 'Tous' && <span className="text-secondary"> · {activeType}</span>}
            {searchQuery && <span> · «{searchQuery}»</span>}
          </p>
          <FundTable funds={filtered} onAddClick={handleAddClick} />
        </>
      )}

      {/* ── Bank card view ── */}
      {!showTable && (
        <div className="space-y-4">
          {banks.map((bank) => (
            <BankSection key={bank.code} bankCode={bank.code} onAddClick={handleAddClick} />
          ))}
        </div>
      )}

      {/* ── Add to portfolio modal ── */}
      {modalAsset && (
        <AddToPortfolioModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          asset={modalAsset}
        />
      )}
    </>
  );
}
