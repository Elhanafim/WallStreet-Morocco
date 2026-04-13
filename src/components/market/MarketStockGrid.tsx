'use client';

import { useCallback, useEffect, useRef, useState, memo } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Plus, Clock, Activity } from 'lucide-react';
import { SECTORS } from '@/lib/data/marketSectors';
import { fetchSnapshot } from '@/lib/bvcPriceService';
import AddToPortfolioModal, { type ModalAsset } from '@/components/AddToPortfolioModal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

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
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all border ${
              activeSector === s.id 
                ? 'bg-gold-gradient text-white border-transparent shadow-md' 
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--gold)]'
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
    <div className="group animate-fadeIn">
      <AssetWidget symbol={asset.symbol} name={asset.name} sector={sectorName} />
      <div className="px-1 pt-3">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          icon={<Plus className="w-3.5 h-3.5" />}
          disabled={!isAuthenticated}
          onClick={handleAdd}
          title={!isAuthenticated ? "Connectez-vous pour investir" : undefined}
          className="rounded-xl"
        >
          {isAuthenticated ? "Ajouter" : "Connexion requise"}
        </Button>
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
    <section id={`sector-${sector.id}`} className="scroll-mt-36">
      <div
        ref={headingRef}
        className="sticky top-16 z-20 glass-surface flex items-center justify-between px-6 py-4 mb-6 rounded-2xl shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-white text-lg">
            {sector.icon}
          </div>
          <h3 className="text-xl font-medium tracking-tight">{sector.name}</h3>
        </div>
        <Badge variant="default" dot>
          {assets.length} valeur{assets.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAsset, setModalAsset] = useState<ModalAsset | null>(null);

  const handleAddClick = useCallback((a: ModalAsset) => {
    setModalAsset(a);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    setOpen(isMarketOpen());
    setNow(new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setOpen(isMarketOpen());
      setNow(new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' }));
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSnapshot().catch(() => {});
    const handleVisibility = () => { if (!document.hidden) fetchSnapshot().catch(() => {}); };
    document.addEventListener('visibilitychange', handleVisibility);
    const interval = setInterval(() => { if (!document.hidden) fetchSnapshot().catch(() => {}); }, 60_000);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const assetMap = Object.fromEntries(assets.map((a) => [a.symbol.split(':')[1] ?? a.symbol, a]));
  const sectorAssets = SECTORS.map((s) => ({
    sector: s,
    assets: s.symbols.map((ticker) => assetMap[ticker]).filter(Boolean) as Asset[],
  }));

  return (
    <div className="space-y-8">
      {/* ── Status Header ── */}
      <div className="flex items-center justify-between mb-8 animate-fadeIn">
        <div className="flex items-center gap-4">
          <Badge variant="outline" size="md" dot>
            {assets.length} Valeurs cotées
          </Badge>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
            <span className={`w-2 h-2 rounded-full ${open ? 'bg-[var(--gain)] animate-pulse' : 'bg-[var(--loss)]'}`} />
            <span className={`text-[11px] font-medium uppercase tracking-widest ${open ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
              {open ? 'Marché ouvert' : 'Marché fermé'}
            </span>
          </div>
          {now && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
              <Clock className="w-3.5 h-3.5" />
              {now} (Casablanca)
            </div>
          )}
        </div>
        <div className="hidden md:flex items-center gap-2 text-[var(--text-muted)]">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-medium">Temps réel via BVC</span>
        </div>
      </div>

      {/* ── Sticky Jump Nav ── */}
      <div className="sticky top-16 z-30 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b bg-[var(--bg-base)]/80 backdrop-blur-xl border-[var(--border)] overflow-hidden">
        <JumpNav activeSector={activeSector} />
      </div>

      {/* ── Sector sections ── */}
      <div className="space-y-12">
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
      </div>

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
