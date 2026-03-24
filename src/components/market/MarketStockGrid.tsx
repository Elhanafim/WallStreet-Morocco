'use client';

import { useCallback, useEffect, useRef, useState, memo } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import { SECTORS } from '@/lib/data/marketSectors';
import { fetchSnapshot } from '@/lib/bvcPriceService';
import AddToPortfolioModal, { type ModalAsset } from '@/components/AddToPortfolioModal';

const AssetWidget = dynamic(() => import('./AssetWidget'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

interface Asset {
  symbol: string;   // e.g. "CSEMA:ATW"
  name: string;
  sector: string;
}

// ─── Market open/closed ───────────────────────────────────────────────────────

function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return false;
  const h = now.getUTCHours() + 1;
  const m = now.getUTCMinutes();
  const totalMin = h * 60 + m;
  return totalMin >= 9 * 60 + 30 && totalMin < 15 * 60 + 30;
}

// ─── Jump Nav ─────────────────────────────────────────────────────────────────

function JumpNav({ activeSector }: { activeSector: string }) {
  return (
    <div className="overflow-x-auto scrollbar-hide pb-1">
      <div className="flex gap-2 min-w-max">
        {SECTORS.map((s) => (
          <a
            key={s.id}
            href={`#sector-${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(`sector-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
              activeSector === s.id
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-primary/60 border-surface-200 hover:border-primary/40 hover:text-primary'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.name.split(' & ')[0].split(' ')[0]}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Stock Card (AssetWidget + Add button) ────────────────────────────────────

function StockCard({
  asset,
  sectorName,
  isAuthenticated,
  onAddClick,
}: {
  asset: Asset;
  sectorName: string;
  isAuthenticated: boolean;
  onAddClick: (a: ModalAsset) => void;
}) {
  const ticker = asset.symbol.split(':')[1] ?? asset.symbol;

  function handleAdd() {
    onAddClick({ ticker, name: asset.name, type: 'stock', symbol: asset.symbol });
  }

  return (
    <div className="flex flex-col">
      <AssetWidget symbol={asset.symbol} name={asset.name} sector={sectorName} />
      <div className="px-2 pt-2">
        {isAuthenticated ? (
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-secondary/30 text-secondary text-xs font-semibold hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter au portefeuille
          </button>
        ) : (
          <button
            disabled
            title="Connectez-vous pour investir"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-surface-200 text-primary/25 text-xs font-semibold cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter au portefeuille
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sector Section ───────────────────────────────────────────────────────────

const SectorSection = memo(function SectorSection({
  sector,
  assets,
  onVisible,
  isAuthenticated,
  onAddClick,
}: {
  sector: (typeof SECTORS)[number];
  assets: Asset[];
  onVisible: (id: string) => void;
  isAuthenticated: boolean;
  onAddClick: (a: ModalAsset) => void;
}) {
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headingRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible(sector.id); },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, [sector.id, onVisible]);

  if (assets.length === 0) return null;

  return (
    <section id={`sector-${sector.id}`} className="scroll-mt-32">
      {/* Sticky sector header */}
      <div
        ref={headingRef}
        className="sticky top-16 z-20 bg-surface-50/95 backdrop-blur-sm border-b-2 border-secondary/30 flex items-center justify-between px-1 py-3 mb-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{sector.icon}</span>
          <span className="font-black text-primary text-sm">{sector.name}</span>
        </div>
        <span className="text-xs font-semibold text-primary/40 bg-surface-200 px-2.5 py-1 rounded-full">
          {assets.length} valeur{assets.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
        {assets.map((asset) => (
          <StockCard
            key={asset.symbol}
            asset={asset}
            sectorName={sector.name}
            isAuthenticated={isAuthenticated}
            onAddClick={onAddClick}
          />
        ))}
      </div>
    </section>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarketStockGrid({ assets }: { assets: Asset[] }) {
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';

  const [activeSector, setActiveSector] = useState(SECTORS[0].id);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState('');

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAsset, setModalAsset] = useState<ModalAsset | null>(null);

  const handleAddClick = useCallback((a: ModalAsset) => {
    setModalAsset(a);
    setModalOpen(true);
  }, []);

  // ── Market open/closed clock ──
  useEffect(() => {
    setOpen(isMarketOpen());
    setNow(new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setOpen(isMarketOpen());
      setNow(new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' }));
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // ── Pre-fetch full price snapshot on mount; refresh every 60s while visible ──
  useEffect(() => {
    fetchSnapshot().catch(() => {});

    const handleVisibility = () => {
      if (!document.hidden) fetchSnapshot().catch(() => {});
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(() => {
      if (!document.hidden) fetchSnapshot().catch(() => {});
    }, 60_000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Map assets by ticker (strip CSEMA: prefix)
  const assetMap = Object.fromEntries(
    assets.map((a) => [a.symbol.split(':')[1] ?? a.symbol, a])
  );

  // Build sector→assets list
  const sectorAssets = SECTORS.map((s) => ({
    sector: s,
    assets: s.symbols.map((ticker) => assetMap[ticker]).filter(Boolean) as Asset[],
  }));

  return (
    <div>
      {/* ── Status + count strip ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-primary/60">
            {assets.length} valeurs cotées
          </span>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
            open ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {open ? 'Marché ouvert' : 'Marché fermé'}
          </div>
          {now && (
            <span className="text-xs text-primary/30">· {now}</span>
          )}
        </div>
      </div>

      {/* ── Jump nav ── */}
      <div className="sticky top-16 z-30 bg-surface-50/95 backdrop-blur-sm py-3 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-surface-200">
        <JumpNav activeSector={activeSector} />
      </div>

      {/* ── Sector sections ── */}
      {sectorAssets.map(({ sector, assets: sectorList }) => (
        <SectorSection
          key={sector.id}
          sector={sector}
          assets={sectorList}
          onVisible={setActiveSector}
          isAuthenticated={isAuthenticated}
          onAddClick={handleAddClick}
        />
      ))}

      {/* ── Add to portfolio modal ── */}
      {modalAsset && (
        <AddToPortfolioModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          asset={modalAsset}
        />
      )}
    </div>
  );
}
