'use client';

/**
 * SNEPDonneesPanel — Dashboard financier complet pour SNEP
 * Données issues du Rapport d'Évaluation Financière ENCG Meknès S8 — Avril 2026
 * Sources: Comptes sociaux certifiés Fidaroc Grant Thornton & BDO — Exercice 31/12/2024
 */

import { useState } from 'react';
import { Roboto_Mono, Inter } from 'next/font/google';
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const mono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:     '#040914',
  panel:  '#0B101E',
  panel2: '#0A0F1D',
  border: '#1E293B',
  orange: '#FF9800',
  green:  '#00E676',
  red:    '#FF1744',
  yellow: '#FFD700',
  cyan:   '#00E5FF',
  muted:  '#8B95A1',
  white:  '#FFFFFF',
  gold:   '#C9A84C',
  teal:   '#0E9F8E',
  blue1:  '#1E3A5F',
  navy:   '#1A4A80',
  purple: '#7C3AED',
};

const COURS_ACTUEL = 583;

// ── Hardcoded SNEP data from ENCG Meknès report ─────────────────────────────
const DATA = {
  // État des Soldes de Gestion 2023-2024
  esg: [
    { label: 'Ventes de marchandises', v23: 189.2, v24: 92.2, varPct: -51.3 },
    { label: '- Achats revendus marchandises', v23: 162.3, v24: 80.7, varPct: -50.3 },
    { label: 'I. Marge Brute commerciale', v23: 26.9, v24: 11.5, varPct: -57.2, highlight: true },
    { label: 'Production de l\'exercice', v23: 556.6, v24: 533.7, varPct: -4.1 },
    { label: 'Consommation de l\'exercice', v23: 564.2, v24: 602.9, varPct: 6.9 },
    { label: 'IV. Valeur Ajoutée', v23: 19.3, v24: -57.7, varPct: null, special: 'basculement', highlight: true },
    { label: '- Charges de personnel', v23: 78.9, v24: 79.9, varPct: 1.3, indent: true },
    { label: 'V. IBE / EBE (EBITDA)', v23: -67.9, v24: -145.2, varPct: -113.9, highlight: true },
    { label: '+ Reprises d\'exploitation', v23: 100.2, v24: 159.8, varPct: 59.5, indent: true },
    { label: '- Dotations d\'exploitation', v23: 36.8, v24: 60.2, varPct: 63.7, indent: true },
    { label: 'VI. Résultat d\'Exploitation (EBIT)', v23: -10.7, v24: -51.9, varPct: -384.9, highlight: true },
    { label: 'VII. Résultat Financier', v23: 4.2, v24: -26.9, varPct: null },
    { label: 'VIII. Résultat Courant', v23: -6.5, v24: -78.8, varPct: null, highlight: true },
    { label: 'IX. Résultat Non Courant', v23: -41.2, v24: 5.8, varPct: null },
    { label: 'X. Résultat Net', v23: -56.8, v24: -74.6, varPct: -31.5, highlight: true },
  ],

  // Bilan grandes masses
  bilan: {
    rows2024: [
      { label: 'Actif immobilisé net', v24: 1144.1, v23: 975.3, varPct: 17.3, side: 'ACTIF' },
      { label: 'Actif circulant hors tréso.', v24: 650.9, v23: 619.9, varPct: 5.0, side: 'ACTIF' },
      { label: 'Trésorerie Actif', v24: 1.2, v23: 13.5, varPct: -91.1, side: 'ACTIF' },
      { label: 'Total Actif', v24: 1797.5, v23: 1622.1, varPct: 10.8, side: 'ACTIF', highlight: true },
      { label: 'Capitaux propres', v24: 727.5, v23: 802.2, varPct: -9.3, side: 'PASSIF' },
      { label: 'Dettes de financement', v24: 207.3, v23: 92.6, varPct: 123.8, side: 'PASSIF' },
      { label: 'Total Financement Permanent', v24: 940.6, v23: 895.4, varPct: 5.0, side: 'PASSIF', highlight: true },
      { label: 'Dettes passif circulant', v24: 365.3, v23: 278.1, varPct: 31.4, side: 'PASSIF' },
      { label: 'Trésorerie Passif', v24: 491.6, v23: 448.6, varPct: 9.6, side: 'PASSIF' },
    ],
    frng: { v24: -203.5, v23: -80.1 },
    bfr: { v24: 286.9, v23: 355.3 },
    tn: { v24: -490.4, v23: -435.2 },
  },

  // ANC
  anc: {
    capitalSocial: 240.0,
    reserveLegale: 24.0,
    autresReserves: 100.0,
    reportNouveau: 438.154,
    rnExercice: -74.627,
    total: 727.527,
    perAction: 303.1,
    actions: 2400000,
  },

  // ANCC
  ancc: {
    ancDepart: 727.527,
    correction1: -67.610,
    correction2: 37.000,
    correction3: 0,
    correction4: 12.000,
    total: 708.917,
    perAction: 295.4,
  },

  // Projections 2025-2029
  projections: [
    { year: '2025E', ca: 791.7, growth: 25.0, ebit: -15.8, margeEbit: -2.0, dotations: 80.0, capex: 70.0, bfr: 20.0, fcf: -21.7, rn: -30.0 },
    { year: '2026E', ca: 855.0, growth: 8.0,  ebit: 25.7,  margeEbit: 3.0,  dotations: 80.0, capex: 70.0, bfr: 15.0, fcf: 14.0,  rn: 15.0  },
    { year: '2027E', ca: 914.9, growth: 7.0,  ebit: 54.9,  margeEbit: 6.0,  dotations: 78.0, capex: 50.0, bfr: 12.0, fcf: 56.6,  rn: 40.0  },
    { year: '2028E', ca: 969.8, growth: 6.0,  ebit: 77.6,  margeEbit: 8.0,  dotations: 75.0, capex: 50.0, bfr: 10.0, fcf: 72.4,  rn: 60.0  },
    { year: '2029E', ca: 1018.3, growth: 5.0, ebit: 101.8, margeEbit: 10.0, dotations: 72.0, capex: 50.0, bfr: 10.0, fcf: 87.3,  rn: 80.0  },
  ],

  // Valorisation
  valuation: [
    { methode: 'DDM (Dividendes 2 phases)', mmad: 417.8, perAction: 174.1, fourchette: '140–210', poids: 'Secondaire ★★★', color: C.muted },
    { methode: 'Multiples EV/EBITDA × 7,0 (2026E)', mmad: 409.8, perAction: 170.7, fourchette: '171–219', poids: 'Marché ★★★', color: C.blue1 },
    { methode: 'Multiples EV/CA × 1,0 (2026E)', mmad: 524.9, perAction: 218.7, fourchette: '—', poids: 'Marché', color: C.navy },
    { methode: 'DCF — Scénario central (WACC 10,7 %)', mmad: 559.8, perAction: 233.2, fourchette: '181–303', poids: 'Principal ★★★★', color: C.cyan },
    { methode: 'ANCC (Actif Net Corrigé)', mmad: 708.9, perAction: 295.4, fourchette: '—', poids: 'Référence patrimoniale', color: C.teal },
    { methode: 'Méthode Praticiens (Goodwill)', mmad: 717.7, perAction: 299.0, fourchette: '—', poids: 'Complémentaire ANCC', color: C.teal },
    { methode: 'ANC (Actif Net Comptable)', mmad: 727.5, perAction: 303.1, fourchette: '—', poids: 'Plancher', color: C.gold },
    { methode: 'Multiples P/B × 1,3 (ANCC)', mmad: 921.6, perAction: 384.0, fourchette: '295–450', poids: 'Stratégique ★★', color: C.yellow },
    { methode: 'Cours boursier actuel', mmad: 1400.0, perAction: 583.0, fourchette: '—', poids: 'Référence marché', color: C.orange },
  ],

  // WACC
  wacc: {
    rf: 4.5,
    prime: 7.0,
    betaDesendetté: 0.95,
    de: 28.5,
    is: 26.0,
    betaEndetté: 1.150,
    ke: 12.5,
    kd: 6.0,
    kdNet: 4.44,
    peidsE: 77.8,
    poidsD: 22.2,
    wacc: 10.7,
    g: 3.5,
  },

  // DCF
  dcf: {
    fcfActualises: 134.2,
    vtBrute: 1255.6,
    vtActualisee: 755.7,
    ev: 889.9,
    approchA: { equity: 559.8, perAction: 233.2 },
    approchB: { equity: 68.2, perAction: 28.4 },
  },

  // DDM
  ddm: {
    pvDividendes: 48.0,
    pvVT: 369.8,
    total: 417.8,
    perAction: 174.1,
  },

  // Scénarios
  scenarios: [
    { scenario: 'Bear (pessimiste)', mmadMin: 170, mmadMax: 200, madMin: 70, madMax: 83, conditions: 'Redressement lent, marges 5% max en 2029, tréso passif incluse en dette nette' },
    { scenario: 'Base (central)', mmadMin: 410, mmadMax: 560, madMin: 170, madMax: 233, conditions: 'Marges 10% en 2029, dette LT seule, antidumping reconduit' },
    { scenario: 'Bull (optimiste)', mmadMin: 700, mmadMax: 920, madMin: 295, madMax: 384, conditions: 'Batteries significatives, marges 15%+, expansion export, WACC 9,2%' },
  ],

  // Sensibilité DCF
  sensitivity: [
    { wacc: '9,7 %', g25: 290, g30: 318, g35: 352, g40: 393, g45: 445 },
    { wacc: '10,2 %', g25: 253, g30: 276, g35: 303, g40: 336, g45: 376 },
    { wacc: '10,7 %', g25: 220, g30: 239, g35: 233, g40: 286, g45: 317, central: true },
    { wacc: '11,2 %', g25: 191, g30: 207, g35: 224, g40: 245, g45: 269 },
    { wacc: '11,7 %', g25: 166, g30: 180, g35: 194, g40: 211, g45: 230 },
  ],

  // Ratios
  ratios: [
    { label: 'Liquidité générale', v24: '0,76x', v23: '0,74x', interpretation: 'Tensions court terme', warn: true },
    { label: 'Autonomie financière', v24: '40,5 %', v23: '49,4 %', interpretation: 'En déclin, encore acceptable', warn: true },
    { label: 'Taux d\'endettement LT', v24: '28,5 %', v23: '11,5 %', interpretation: 'Fort accroissement post-extension', warn: true },
    { label: 'Levier financier global', v24: '1,47x', v23: '1,02x', interpretation: 'Hausse du levier — risque accru', warn: true },
    { label: 'ROA', v24: '-2,9 %', v23: '-0,7 %', interpretation: 'Actifs non encore pleinement productifs', danger: true },
    { label: 'ROCE', v24: '-5,6 %', v23: '-1,1 %', interpretation: 'Capital employé non encore rentabilisé', danger: true },
    { label: 'ROE', v24: '-10,3 %', v23: '-7,1 %', interpretation: 'Destruction valeur temporaire', danger: true },
    { label: 'Marge d\'exploitation', v24: '-8,2 %', v23: '-1,3 %', interpretation: 'Forte dégradation 2024', danger: true },
    { label: 'Marge nette', v24: '-11,8 %', v23: '-7,1 %', interpretation: 'Exercice déficitaire consécutif', danger: true },
    { label: 'Rotation de l\'actif', v24: '0,35x', v23: '0,49x', interpretation: 'Intensité capitalistique élevée', warn: true },
    { label: 'Délai clients (jours)', v24: '174 j.', v23: '103 j.', interpretation: 'Allongement préoccupant', warn: true },
    { label: 'Délai fournisseurs (jours)', v24: '193 j.', v23: '119 j.', interpretation: 'Financement fournisseurs volontaire', ok: true },
  ],
};

// ── Formatters ─────────────────────────────────────────────────────────────────
const fmtMMAD = (v: number | null, d = 1) =>
  v == null ? '—' : `${v >= 0 ? '' : ''}${v.toFixed(d)} MMAD`;
const fmtPct = (v: number | null) =>
  v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)} %`;
const fmtMAD = (v: number) => `${v.toFixed(1)} MAD`;

function varColor(v: number | null, special?: string): string {
  if (special) return C.yellow;
  if (v == null) return C.muted;
  return v > 0 ? C.green : v < 0 ? C.red : C.muted;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border px-3 py-2 text-[11px]" style={{ background: C.panel, borderColor: C.border, ...mono.style }}>
      <p className="font-bold uppercase mb-1" style={{ color: C.orange }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? C.white }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Collapsible section ────────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: C.border }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#0f1929] transition-colors"
        style={{ background: C.panel2 }}
      >
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange, ...mono.style }}>
          ■ {title}
        </span>
        <span className="text-[10px]" style={{ color: C.muted, ...mono.style }}>
          {open ? '▲ Réduire' : '▼ Développer'}
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ── KPI cards ─────────────────────────────────────────────────────────────────
function KpiCards() {
  const cards = [
    { label: 'Cours actuel', value: `${COURS_ACTUEL} MAD`, sub: 'Bourse de Casablanca', color: C.orange },
    { label: 'CA 2024', value: '633,3 MMAD', growth: '-20,3 %', sub: 'vs 794,5 MMAD en 2023', color: C.red },
    { label: 'Résultat Net 2024', value: '-74,6 MMAD', growth: '-31,5 %', sub: '2ème exercice déficitaire', color: C.red },
    { label: 'Trésorerie Nette', value: '-490,4 MMAD', sub: 'FRNG: -203,5 | BFR: +286,9', color: C.red },
    { label: 'WACC', value: '10,7 %', sub: 'Ke 12,5% | Kd 4,44% | D/E 28,5%', color: C.cyan },
    { label: 'ANC / Action', value: '303,1 MAD', sub: `P/B actuel: ${(COURS_ACTUEL / 303.1).toFixed(2)}x`, color: C.gold },
    { label: 'Recommandation', value: 'NEUTRE', sub: 'Attendre conf. résultats 2025', color: C.yellow },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px" style={{ background: C.border }}>
      {cards.map(c => (
        <div key={c.label} className="flex flex-col gap-1.5 p-3" style={{ background: C.panel, borderLeft: `2px solid ${c.color}` }}>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>{c.label}</span>
          <span className="text-sm font-black leading-tight tabular-nums" style={{ color: c.color, ...mono.style }}>{c.value}</span>
          {c.growth && (
            <span className="text-[10px] font-bold" style={{ color: c.growth.startsWith('+') ? C.green : C.red, ...mono.style }}>
              {c.growth}
            </span>
          )}
          <span className="text-[9px] uppercase tracking-wide" style={{ color: C.muted, ...mono.style }}>{c.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ── ESG table (soldes de gestion) ─────────────────────────────────────────────
function EsgTable() {
  return (
    <div style={{ background: C.panel }}>
      <div className="grid px-4 py-2 text-[9px] font-bold uppercase tracking-widest"
        style={{ color: C.orange, borderBottom: `1px solid ${C.border}`, ...mono.style,
          gridTemplateColumns: '1fr 110px 110px 90px' }}>
        <span>Solde de Gestion</span>
        <span className="text-right">2023 (MMAD)</span>
        <span className="text-right">2024 (MMAD)</span>
        <span className="text-right">Variation</span>
      </div>
      {DATA.esg.map(row => (
        <div key={row.label}
          className={`grid py-2 hover:bg-[#0f1929] transition-colors border-b ${row.indent ? 'pl-8 pr-4' : 'px-4'}`}
          style={{ borderColor: C.border, gridTemplateColumns: '1fr 110px 110px 90px', ...mono.style,
            background: row.highlight ? `${C.orange}06` : 'transparent' }}>
          <span className={`text-[10px] ${row.highlight ? 'font-black uppercase tracking-wide' : 'font-medium'}`}
            style={{ color: row.highlight ? C.orange : C.muted }}>
            {row.label}
          </span>
          <span className="text-[10px] tabular-nums text-right font-bold"
            style={{ color: row.v23 < 0 ? C.red : C.white }}>
            {row.v23 >= 0 ? '+' : ''}{row.v23.toFixed(1)}
          </span>
          <span className="text-[10px] tabular-nums text-right font-bold"
            style={{ color: row.v24 < 0 ? C.red : C.green }}>
            {row.v24 >= 0 ? '+' : ''}{row.v24.toFixed(1)}
          </span>
          <span className="text-[9px] tabular-nums text-right font-black"
            style={{ color: varColor(row.varPct, row.special) }}>
            {row.special ? '⚠ Basculement' : row.varPct != null ? fmtPct(row.varPct) : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── CA vs RN bar chart ─────────────────────────────────────────────────────────
function CaRnChart() {
  const data = [
    { an: '2023', CA: 794.5, RN: -56.8, EBE: -67.9 },
    { an: '2024', CA: 633.3, RN: -74.6, EBE: -145.2 },
  ];
  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ CA / RN / EBE — ÉVOLUTION 2023–2024 (MMAD)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="35%" barGap={3}>
          <CartesianGrid vertical={false} stroke={C.border} />
          <XAxis dataKey="an" tick={{ fill: C.muted, fontSize: 11, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false}
            domain={[-200, 900]} />
          <ReferenceLine y={0} stroke={C.muted} strokeDasharray="3 3" />
          <Tooltip content={<ChartTip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Roboto Mono', color: C.muted }} />
          <Bar dataKey="CA" fill={C.navy} radius={[2, 2, 0, 0]} />
          <Bar dataKey="EBE" fill={C.red} radius={[2, 2, 0, 0]} />
          <Bar dataKey="RN" fill={`${C.red}88`} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Bilan table ────────────────────────────────────────────────────────────────
function BilanTable() {
  return (
    <div style={{ background: C.panel }}>
      <div className="grid px-4 py-2 text-[9px] font-bold uppercase tracking-widest"
        style={{ color: C.orange, borderBottom: `1px solid ${C.border}`, ...mono.style,
          gridTemplateColumns: '1fr 80px 110px 110px 80px' }}>
        <span>Masse bilancielle</span>
        <span className="text-center">Côté</span>
        <span className="text-right">2023 (MMAD)</span>
        <span className="text-right">2024 (MMAD)</span>
        <span className="text-right">Var. %</span>
      </div>
      {DATA.bilan.rows2024.map(row => (
        <div key={row.label} className="grid px-4 py-2.5 hover:bg-[#0f1929] transition-colors border-b"
          style={{ borderColor: C.border, gridTemplateColumns: '1fr 80px 110px 110px 80px', ...mono.style,
            background: row.highlight ? `${C.orange}06` : 'transparent' }}>
          <span className={`text-[10px] ${row.highlight ? 'font-black uppercase' : 'font-medium'}`}
            style={{ color: row.highlight ? C.orange : C.white }}>
            {row.label}
          </span>
          <span className="text-[10px] text-center font-bold uppercase"
            style={{ color: row.side === 'ACTIF' ? C.cyan : C.gold }}>
            {row.side}
          </span>
          <span className="text-[10px] tabular-nums text-right font-bold" style={{ color: C.muted }}>
            {row.v23.toFixed(1)}
          </span>
          <span className="text-[10px] tabular-nums text-right font-bold" style={{ color: C.white }}>
            {row.v24.toFixed(1)}
          </span>
          <span className="text-[9px] tabular-nums text-right font-black"
            style={{ color: row.varPct > 0 ? (row.side === 'ACTIF' ? C.green : C.red) : (row.side === 'ACTIF' ? C.red : C.green) }}>
            {fmtPct(row.varPct)}
          </span>
        </div>
      ))}
      {/* FRNG / BFR / TN */}
      <div className="grid grid-cols-3 gap-px mt-px" style={{ background: C.border }}>
        {[
          { label: 'FRNG', v24: DATA.bilan.frng.v24, v23: DATA.bilan.frng.v23 },
          { label: 'BFR', v24: DATA.bilan.bfr.v24, v23: DATA.bilan.bfr.v23 },
          { label: 'Trésorerie Nette', v24: DATA.bilan.tn.v24, v23: DATA.bilan.tn.v23 },
        ].map(item => (
          <div key={item.label} className="p-3 flex flex-col gap-1" style={{ background: C.panel2 }}>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.orange, ...mono.style }}>{item.label}</span>
            <span className="text-base font-black tabular-nums" style={{ color: item.v24 < 0 ? C.red : C.green, ...mono.style }}>
              {fmtMMAD(item.v24)}
            </span>
            <span className="text-[9px]" style={{ color: C.muted, ...mono.style }}>vs {fmtMMAD(item.v23)} en 2023</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ANC / ANCC ────────────────────────────────────────────────────────────────
function AncAncc() {
  const a = DATA.anc;
  const b = DATA.ancc;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: C.border }}>
      {/* ANC */}
      <div style={{ background: C.panel }}>
        <p className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest" style={{ color: C.orange, borderBottom: `1px solid ${C.border}`, ...mono.style }}>
          ANC — ACTIF NET COMPTABLE
        </p>
        {[
          { label: 'Capital social', v: `${a.capitalSocial.toFixed(0)} MMAD`, color: C.white },
          { label: 'Réserve légale', v: `${a.reserveLegale.toFixed(0)} MMAD`, color: C.white },
          { label: 'Autres réserves', v: `${a.autresReserves.toFixed(0)} MMAD`, color: C.white },
          { label: 'Report à nouveau', v: `+${a.reportNouveau.toFixed(3)} MMAD`, color: C.green },
          { label: 'Résultat net 2024', v: `${a.rnExercice.toFixed(3)} MMAD`, color: C.red },
          { label: 'ANC — Total CP', v: `${a.total.toFixed(3)} MMAD`, color: C.cyan, bold: true },
          { label: 'Nombre d\'actions', v: `${a.actions.toLocaleString('fr-MA')}`, color: C.white },
          { label: 'ANC par action', v: `${a.perAction.toFixed(1)} MAD`, color: C.gold, bold: true },
        ].map(r => (
          <div key={r.label} className="flex items-center justify-between px-4 py-2 hover:bg-[#0f1929] border-b"
            style={{ borderColor: C.border, ...mono.style }}>
            <span className="text-[9px] uppercase" style={{ color: C.muted }}>{r.label}</span>
            <span className={`text-[10px] tabular-nums font-${r.bold ? 'black' : 'bold'}`} style={{ color: r.color }}>{r.v}</span>
          </div>
        ))}
      </div>
      {/* ANCC */}
      <div style={{ background: C.panel }}>
        <p className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest" style={{ color: C.orange, borderBottom: `1px solid ${C.border}`, ...mono.style }}>
          ANCC — ACTIF NET COMPTABLE CORRIGÉ
        </p>
        {[
          { label: 'ANC de départ', v: `${b.ancDepart.toFixed(3)} MMAD`, color: C.white },
          { label: '– Actifs fictifs net IS (×74%)', v: `${b.correction1.toFixed(3)} MMAD`, color: C.red },
          { label: '+ Plus-value corporelles net IS', v: `+${b.correction2.toFixed(3)} MMAD`, color: C.green },
          { label: '± Réévaluation DIMATIT', v: '0 MMAD (conservateur)', color: C.muted },
          { label: '+ Retraitement crédit-bail (net)', v: `+${b.correction4.toFixed(3)} MMAD`, color: C.green },
          { label: 'ANCC — Total', v: `${b.total.toFixed(3)} MMAD`, color: C.cyan, bold: true },
          { label: 'Nombre d\'actions', v: `${DATA.anc.actions.toLocaleString('fr-MA')}`, color: C.white },
          { label: 'ANCC par action', v: `${b.perAction.toFixed(1)} MAD`, color: C.gold, bold: true },
        ].map(r => (
          <div key={r.label} className="flex items-center justify-between px-4 py-2 hover:bg-[#0f1929] border-b"
            style={{ borderColor: C.border, ...mono.style }}>
            <span className="text-[9px] uppercase" style={{ color: C.muted }}>{r.label}</span>
            <span className={`text-[10px] tabular-nums font-${r.bold ? 'black' : 'bold'}`} style={{ color: r.color }}>{r.v}</span>
          </div>
        ))}
        {/* Praticiens */}
        <div className="px-4 py-2.5 border-t" style={{ borderColor: `${C.orange}44`, background: `${C.orange}06`, ...mono.style }}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: C.orange }}>MÉTHODE DES PRATICIENS</p>
          {[
            { label: 'RN normé (moy. 2025-2029)', v: '33,0 MMAD' },
            { label: 'Rémunération requise (4,5% × ANCC)', v: '31,9 MMAD' },
            { label: 'Super-profit', v: '+1,1 MMAD' },
            { label: 'Goodwill (1,1 / 12,5%)', v: '+8,8 MMAD' },
            { label: 'Valeur globale', v: '717,7 MMAD = 299,0 MAD/action' },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-0.5">
              <span className="text-[9px] uppercase" style={{ color: C.muted }}>{r.label}</span>
              <span className="text-[9px] font-bold tabular-nums" style={{ color: C.white }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Projections table ─────────────────────────────────────────────────────────
function ProjectionsTable() {
  return (
    <div style={{ background: C.panel }}>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]" style={mono.style}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
              {['Année', 'CA (MMAD)', 'Croissance', 'EBIT (MMAD)', 'Marge EBIT', 'FCF (MMAD)', 'RN Estimé'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-black uppercase tracking-widest whitespace-nowrap"
                  style={{ color: C.orange }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA.projections.map((r, i) => (
              <tr key={r.year} className="hover:bg-[#0f1929] transition-colors"
                style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : `${C.border}22` }}>
                <td className="px-3 py-2.5 font-black" style={{ color: C.cyan }}>{r.year}</td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: C.white }}>{r.ca.toFixed(1)}</td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: C.green }}>+{r.growth.toFixed(1)} %</td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: r.ebit < 0 ? C.red : C.green }}>
                  {r.ebit >= 0 ? '+' : ''}{r.ebit.toFixed(1)}
                </td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: r.margeEbit < 0 ? C.red : C.teal }}>
                  {r.margeEbit >= 0 ? '+' : ''}{r.margeEbit.toFixed(1)} %
                </td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: r.fcf < 0 ? C.red : C.gold }}>
                  {r.fcf >= 0 ? '+' : ''}{r.fcf.toFixed(1)}
                </td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: r.rn < 0 ? C.red : C.green }}>
                  {r.rn >= 0 ? '+' : ''}{r.rn.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── CA projections chart ──────────────────────────────────────────────────────
function ProjectionsChart() {
  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ PROJECTIONS CA & FCF 2025–2029 (MMAD)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={DATA.projections} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={C.border} />
          <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 10, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false}
            domain={[-100, 1200]} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }}
            axisLine={false} tickLine={false} domain={[-50, 120]} />
          <ReferenceLine yAxisId="left" y={0} stroke={C.muted} strokeDasharray="3 3" />
          <Tooltip content={<ChartTip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Roboto Mono', color: C.muted }} />
          <Bar yAxisId="left" dataKey="ca" name="CA" fill={C.navy} radius={[2, 2, 0, 0]} />
          <Bar yAxisId="left" dataKey="rn" name="RN estimé">
            {DATA.projections.map((e, i) => <Cell key={i} fill={e.rn < 0 ? C.red : C.teal} />)}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="fcf" name="FCF" stroke={C.gold} strokeWidth={2}
            dot={{ fill: C.gold, r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Marge EBIT chart ──────────────────────────────────────────────────────────
function MargeEbitChart() {
  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ MARGE EBIT PROJETÉE 2025–2029 (%)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={DATA.projections} barCategoryGap="40%">
          <CartesianGrid vertical={false} stroke={C.border} />
          <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 10, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} domain={[-5, 12]} />
          <ReferenceLine y={0} stroke={C.muted} strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: 'Roboto Mono', fontSize: 10 }}
            formatter={(v: number) => [`${v.toFixed(1)} %`, 'Marge EBIT']}
          />
          <Bar dataKey="margeEbit" name="Marge EBIT %">
            {DATA.projections.map((e, i) => (
              <Cell key={i} fill={e.margeEbit < 0 ? C.red : `hsl(${160 + i * 12}, 65%, 45%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── DCF summary ────────────────────────────────────────────────────────────────
function DcfSummary() {
  const d = DATA.dcf;
  return (
    <div style={{ background: C.panel }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: C.border }}>
        {[
          { label: 'Σ FCF actualisés', value: `+${d.fcfActualises.toFixed(1)} MMAD`, color: C.teal },
          { label: 'Valeur Terminale actualisée', value: `+${d.vtActualisee.toFixed(1)} MMAD`, color: C.cyan },
          { label: 'Valeur d\'Entreprise (EV)', value: `${d.ev.toFixed(1)} MMAD`, color: C.white, bold: true },
          { label: 'DCF Approche A (dette LT)', value: `${d.approchA.perAction.toFixed(1)} MAD/action`, color: C.gold, bold: true },
        ].map(c => (
          <div key={c.label} className="p-3 flex flex-col gap-1" style={{ background: C.panel2 }}>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>{c.label}</span>
            <span className={`text-sm tabular-nums font-${c.bold ? 'black' : 'bold'}`} style={{ color: c.color, ...mono.style }}>
              {c.value}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t" style={{ borderColor: `${C.red}44`, background: `${C.red}06` }}>
        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: C.red, ...mono.style }}>
          ⚠ DCF Approche B (dette nette totale inclus crédits tréso)
        </p>
        <p className="text-[9px]" style={{ color: C.muted, ...mono.style }}>
          Equity = 68,2 MMAD → 28,4 MAD/action — Scénario de stress : sans rebond opérationnel, structure financière érode la valeur actionnariale
        </p>
      </div>
    </div>
  );
}

// ── DDM summary ────────────────────────────────────────────────────────────────
function DdmSummary() {
  const d = DATA.ddm;
  const ddmPhases = [
    { year: '2025E', rn: -30.0, payout: 0, div: 0, dps: 0, factor: 0.8889, dpsAct: 0 },
    { year: '2026E', rn: 15.0, payout: 20, div: 3.0, dps: 1.25, factor: 0.7901, dpsAct: 0.99 },
    { year: '2027E', rn: 40.0, payout: 30, div: 12.0, dps: 5.00, factor: 0.7023, dpsAct: 3.51 },
    { year: '2028E', rn: 60.0, payout: 40, div: 24.0, dps: 10.00, factor: 0.6243, dpsAct: 6.24 },
    { year: '2029E', rn: 80.0, payout: 50, div: 40.0, dps: 16.67, factor: 0.5549, dpsAct: 9.25 },
  ];
  return (
    <div style={{ background: C.panel }}>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]" style={mono.style}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
              {['Année', 'RN (MMAD)', 'Payout', 'Div. total (MMAD)', 'DPS (MAD)', 'Facteur', 'DPS actualisé'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-black uppercase tracking-widest whitespace-nowrap"
                  style={{ color: C.orange }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ddmPhases.map(r => (
              <tr key={r.year} className="hover:bg-[#0f1929] border-b" style={{ borderColor: C.border }}>
                <td className="px-3 py-2 font-black" style={{ color: C.cyan }}>{r.year}</td>
                <td className="px-3 py-2 tabular-nums" style={{ color: r.rn < 0 ? C.red : C.green }}>
                  {r.rn >= 0 ? '+' : ''}{r.rn.toFixed(1)}
                </td>
                <td className="px-3 py-2 tabular-nums" style={{ color: C.muted }}>{r.payout} %</td>
                <td className="px-3 py-2 tabular-nums" style={{ color: r.div === 0 ? C.muted : C.gold }}>{r.div.toFixed(1)}</td>
                <td className="px-3 py-2 tabular-nums" style={{ color: r.dps === 0 ? C.muted : C.white }}>{r.dps.toFixed(2)}</td>
                <td className="px-3 py-2 tabular-nums" style={{ color: C.muted }}>{r.factor.toFixed(4)}</td>
                <td className="px-3 py-2 tabular-nums font-bold" style={{ color: r.dpsAct === 0 ? C.muted : C.teal }}>
                  {r.dpsAct.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-3 gap-px border-t" style={{ background: C.border, borderColor: C.border }}>
        {[
          { label: 'PV Dividendes Phase 1', value: `${d.pvDividendes.toFixed(1)} MMAD / 20,0 MAD`, color: C.teal },
          { label: 'PV Valeur Terminale (Gordon 2030+)', value: `${d.pvVT.toFixed(1)} MMAD / 154,1 MAD`, color: C.cyan },
          { label: 'Valeur DDM totale', value: `${d.total.toFixed(1)} MMAD / ${d.perAction.toFixed(1)} MAD/action`, color: C.gold },
        ].map(c => (
          <div key={c.label} className="p-3" style={{ background: C.panel2 }}>
            <span className="block text-[9px] uppercase tracking-widest mb-1" style={{ color: C.muted, ...mono.style }}>{c.label}</span>
            <span className="text-sm font-black tabular-nums" style={{ color: c.color, ...mono.style }}>{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Football field ─────────────────────────────────────────────────────────────
function FootballField() {
  const sorted = [...DATA.valuation].sort((a, b) => a.perAction - b.perAction);
  const maxVal = 700;

  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: C.orange, ...mono.style }}>
        ■ FOOTBALL FIELD — VALORISATION PAR MÉTHODE (MAD/ACTION)
      </p>
      <div className="space-y-2.5">
        {sorted.map(m => {
          const pct = Math.min(100, (Math.min(m.perAction, maxVal) / maxVal) * 100);
          const coursePct = Math.min(100, (COURS_ACTUEL / maxVal) * 100);
          const isActuel = m.methode.includes('boursier');
          const isBeyond = m.perAction > maxVal;
          return (
            <div key={m.methode} className="flex items-center gap-3" style={mono.style}>
              <div className="text-[9px] uppercase tracking-wide w-52 text-right flex-shrink-0"
                style={{ color: isActuel ? C.orange : C.muted }}>
                {m.methode}
              </div>
              <div className="flex-1 relative h-5">
                <div className="absolute inset-0 rounded-sm" style={{ background: C.border }} />
                <div className="absolute inset-y-0 left-0 rounded-sm"
                  style={{ width: `${pct}%`, background: isActuel ? `${C.orange}44` : `${m.color}55` }} />
                <div className="absolute top-0 bottom-0 w-0.5"
                  style={{ left: `${pct}%`, background: isActuel ? C.orange : m.color }} />
                <div className="absolute top-0 bottom-0 w-px"
                  style={{ left: `${coursePct}%`, background: `${C.orange}88`, zIndex: 10 }} />
              </div>
              <div className="text-[10px] font-black tabular-nums w-24 text-right flex-shrink-0"
                style={{ color: isActuel ? C.orange : m.color }}>
                {isBeyond ? `>${maxVal}` : fmtMAD(m.perAction)}
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t" style={{ borderColor: C.border, ...mono.style }}>
          <div className="w-52 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-[9px] uppercase tracking-widest" style={{ color: C.orange }}>
              ↑ Cours actuel: {COURS_ACTUEL} MAD — Nettement au-dessus des méthodes intrinsèques
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Valuation table ────────────────────────────────────────────────────────────
function ValuationTable() {
  const sorted = [...DATA.valuation].sort((a, b) => a.perAction - b.perAction);
  return (
    <div style={{ background: C.panel }}>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]" style={mono.style}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
              {['Méthode', 'Valeur CP (MMAD)', 'MAD / Action', 'Fourchette', 'Poids'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-black uppercase tracking-widest"
                  style={{ color: C.orange }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => {
              const isActuel = r.methode.includes('boursier');
              return (
                <tr key={r.methode} className="hover:bg-[#0f1929] transition-colors"
                  style={{ borderBottom: `1px solid ${C.border}`, background: isActuel ? `${C.orange}08` : 'transparent' }}>
                  <td className="px-3 py-2.5 font-bold" style={{ color: isActuel ? C.orange : C.white }}>
                    {r.methode}{isActuel ? ' ★' : ''}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums" style={{ color: C.muted }}>{r.mmad.toFixed(1)}</td>
                  <td className="px-3 py-2.5 tabular-nums font-black" style={{ color: r.color }}>
                    {r.perAction.toFixed(1)} MAD
                  </td>
                  <td className="px-3 py-2.5" style={{ color: C.muted }}>{r.fourchette}</td>
                  <td className="px-3 py-2.5" style={{ color: C.muted }}>{r.poids}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sensitivity table ─────────────────────────────────────────────────────────
function SensitivityTable() {
  const cols = ['2,5 %', '3,0 %', '3,5 %', '4,0 %', '4,5 %'];
  const vals: (keyof typeof DATA.sensitivity[0])[] = ['g25', 'g30', 'g35', 'g40', 'g45'];
  return (
    <div style={{ background: C.panel }}>
      <p className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest border-b" style={{ color: C.orange, borderColor: C.border, ...mono.style }}>
        ANALYSE DE SENSIBILITÉ — VALEUR PAR ACTION (MAD) · Approche A
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]" style={mono.style}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
              <th className="px-3 py-2 text-left font-black" style={{ color: C.muted }}>WACC \ g</th>
              {cols.map(c => (
                <th key={c} className="px-3 py-2 text-right font-black" style={{ color: C.orange }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA.sensitivity.map(row => (
              <tr key={row.wacc} className="hover:bg-[#0f1929] border-b"
                style={{ borderColor: C.border, background: row.central ? `${C.cyan}06` : 'transparent' }}>
                <td className="px-3 py-2 font-black" style={{ color: row.central ? C.cyan : C.muted }}>{row.wacc}</td>
                {vals.map((v, i) => {
                  const val = row[v] as number;
                  const isCentral = row.central && i === 2;
                  return (
                    <td key={v} className="px-3 py-2 text-right tabular-nums font-bold"
                      style={{ color: isCentral ? C.orange : val >= COURS_ACTUEL ? C.green : val >= 300 ? C.gold : val >= 200 ? C.white : C.muted,
                        background: isCentral ? `${C.orange}20` : 'transparent' }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2 text-[9px]" style={{ color: C.muted, ...mono.style }}>
        Aucune combinaison de paramètres dans le tableau n&apos;atteint le cours boursier de 583 MAD — le marché intègre des FCF terminaux ≈ 2× notre modèle central.
      </p>
    </div>
  );
}

// ── Scenarios table ────────────────────────────────────────────────────────────
function ScenariosTable() {
  const colors: Record<string, string> = {
    'Bear (pessimiste)': C.red,
    'Base (central)': C.gold,
    'Bull (optimiste)': C.green,
  };
  return (
    <div style={{ background: C.panel }}>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]" style={mono.style}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
              {['Scénario', 'CP (MMAD)', 'Fourchette (MAD/action)', 'Conditions sous-jacentes'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-black uppercase tracking-widest"
                  style={{ color: C.orange }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA.scenarios.map(r => (
              <tr key={r.scenario} className="hover:bg-[#0f1929] border-b" style={{ borderColor: C.border }}>
                <td className="px-3 py-2.5 font-black" style={{ color: colors[r.scenario] ?? C.white }}>{r.scenario}</td>
                <td className="px-3 py-2.5 tabular-nums font-bold" style={{ color: colors[r.scenario] ?? C.white }}>
                  {r.mmadMin}–{r.mmadMax}
                </td>
                <td className="px-3 py-2.5 tabular-nums font-bold" style={{ color: colors[r.scenario] ?? C.white }}>
                  {r.madMin}–{r.madMax} MAD
                </td>
                <td className="px-3 py-2.5 text-[9px]" style={{ color: C.muted }}>{r.conditions}</td>
              </tr>
            ))}
            <tr style={{ borderTop: `1px solid ${C.orange}44`, background: `${C.orange}08` }}>
              <td className="px-3 py-2.5 font-black" style={{ color: C.orange }}>Cours boursier actuel</td>
              <td className="px-3 py-2.5 font-black tabular-nums" style={{ color: C.orange }}>~1 400</td>
              <td className="px-3 py-2.5 font-black tabular-nums" style={{ color: C.orange }}>~{COURS_ACTUEL} MAD</td>
              <td className="px-3 py-2.5 text-[9px]" style={{ color: C.muted }}>
                2–3× la valeur intrinsèque centrale — prime de monopole + option batteries électriques
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── WACC table ────────────────────────────────────────────────────────────────
function WaccTable() {
  const w = DATA.wacc;
  const rows = [
    { label: 'Taux sans risque (Rf)', value: `${w.rf.toFixed(1)} %`, sub: 'BDT 10 ans Maroc', color: C.white },
    { label: 'Prime de risque marché (Rm–Rf)', value: `${w.prime.toFixed(1)} %`, sub: 'Damodaran Emerging Markets — Maroc', color: C.white },
    { label: 'Bêta désendetté sectoriel (β₀)', value: `${w.betaDesendetté.toFixed(2)}`, sub: 'Chemicals (Basic) — marchés émergents', color: C.white },
    { label: 'D/E (structure financière)', value: `${w.de.toFixed(1)} %`, sub: '207,3 / 727,5 MMAD au 31/12/2024', color: C.white },
    { label: 'Bêta endetté (β) — Hamada', value: `${w.betaEndetté.toFixed(3)}`, sub: '0,95 × [1 + 0,74 × 0,285]', color: C.white },
    { label: 'Coût fonds propres (Ke)', value: `${w.ke.toFixed(1)} %`, sub: `${w.rf} % + ${w.betaEndetté} × ${w.prime} %`, color: C.cyan },
    { label: 'Coût de la dette brut (Kd)', value: `${w.kd.toFixed(1)} %`, sub: 'Spread 150 bps / taux sans risque', color: C.white },
    { label: 'Coût de la dette net IS (Kd)', value: `${w.kdNet.toFixed(2)} %`, sub: `${w.kd} % × (1 – ${w.is} %)`, color: C.white },
    { label: 'Poids fonds propres E/(D+E)', value: `${w.peidsE.toFixed(1)} %`, sub: '727,5 / (727,5 + 207,3)', color: C.muted },
    { label: 'Poids dette D/(D+E)', value: `${w.poidsD.toFixed(1)} %`, sub: '207,3 / (727,5 + 207,3)', color: C.muted },
    { label: 'WACC final', value: `${w.wacc.toFixed(1)} %`, sub: `${w.peidsE.toFixed(1)}% × ${w.ke}% + ${w.poidsD.toFixed(1)}% × ${w.kdNet}%`, color: C.orange, bold: true },
    { label: 'Taux croissance perpétuelle (g)', value: `${w.g.toFixed(1)} %`, sub: 'Croissance nominale LT PIB Maroc', color: C.gold },
  ];
  return (
    <div className="divide-y" style={{ background: C.panel, borderColor: C.border }}>
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#0f1929] transition-colors"
          style={mono.style}>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold" style={{ color: C.white }}>{r.label}</span>
            <span className="text-[9px] uppercase tracking-wide" style={{ color: C.muted }}>{r.sub}</span>
          </div>
          <span className={`text-base tabular-nums font-${r.bold ? 'black' : 'bold'} ml-4 flex-shrink-0`}
            style={{ color: r.color }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Ratios table ───────────────────────────────────────────────────────────────
function RatiosTable() {
  return (
    <div style={{ background: C.panel }}>
      <div className="grid px-4 py-2 text-[9px] font-bold uppercase tracking-widest"
        style={{ color: C.orange, borderBottom: `1px solid ${C.border}`, ...mono.style,
          gridTemplateColumns: '1fr 90px 90px 1fr' }}>
        <span>Ratio</span>
        <span className="text-right">2024</span>
        <span className="text-right">2023</span>
        <span className="pl-4">Interprétation</span>
      </div>
      {DATA.ratios.map(r => {
        const sigColor = r.danger ? C.red : r.warn ? C.yellow : C.green;
        const sig = r.danger ? '🔴' : r.warn ? '🟡' : '🟢';
        return (
          <div key={r.label} className="grid px-4 py-2.5 hover:bg-[#0f1929] border-b"
            style={{ borderColor: C.border, gridTemplateColumns: '1fr 90px 90px 1fr', ...mono.style }}>
            <span className="text-[10px] font-bold" style={{ color: C.white }}>{r.label}</span>
            <span className="text-[10px] tabular-nums text-right font-black" style={{ color: sigColor }}>{r.v24}</span>
            <span className="text-[10px] tabular-nums text-right" style={{ color: C.muted }}>{r.v23}</span>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-xs">{sig}</span>
              <span className="text-[9px]" style={{ color: sigColor }}>{r.interpretation}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function SNEPDonneesPanel() {
  return (
    <div className="flex flex-col" style={{ background: C.bg, ...mono.style }}>

      {/* Company header */}
      <div className="px-5 py-3 border-b flex flex-wrap items-center gap-3"
        style={{ borderColor: C.border, background: C.panel }}>
        <span className="text-sm font-black uppercase tracking-wider" style={{ color: C.cyan, ...sans.style }}>
          SNEP
        </span>
        <span className="text-xs font-bold px-2 py-0.5 border" style={{ color: C.orange, borderColor: `${C.orange}55` }}>
          SNEP
        </span>
        <span className="text-[10px] font-bold border px-2 py-0.5" style={{ color: C.muted, borderColor: C.border }}>
          BVC Casablanca
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>
          Pétrochimie · PVC · Chlore · Soude Caustique · Monopole National
        </span>
        <span className="ml-auto text-[10px] font-bold" style={{ color: C.gold }}>
          Capital: 240 MMAD | 2 400 000 actions | Ynna Holding 62,92 %
        </span>
      </div>

      <div className="space-y-px" style={{ background: C.border }}>

        {/* KPI Cards */}
        <KpiCards />

        {/* ESG */}
        <Section title="État des Soldes de Gestion (ESG) 2023–2024">
          <EsgTable />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px mt-px" style={{ background: C.border }}>
            <CaRnChart />
            <div className="p-4" style={{ background: C.panel }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
                ■ SIGNAUX D&apos;ALERTE 2024
              </p>
              <div className="space-y-2">
                {[
                  { msg: 'Valeur Ajoutée négative: –57,7 MMAD (vs +19,3 MMAD en 2023)', level: 'danger' },
                  { msg: 'IBE/EBE (EBITDA) négatif: –145,2 MMAD', level: 'danger' },
                  { msg: 'Reprises d\'exploit. non récurrentes: 159,8 MMAD (dont 155 MMAD frais démarrage)', level: 'warn' },
                  { msg: 'Résultat financier dégradé: –26,9 MMAD (charge intérêts 33,6 MMAD)', level: 'warn' },
                  { msg: 'CA en repli –20,3% : pression prix PVC –18% + perturbation éthylène', level: 'warn' },
                  { msg: '2ème exercice déficitaire consécutif: RN –74,6 MMAD', level: 'danger' },
                ].map((a, i) => {
                  const color = a.level === 'danger' ? C.red : C.yellow;
                  return (
                    <div key={i} className="flex items-start gap-2 px-3 py-2 border"
                      style={{ borderColor: `${color}44`, background: `${color}08` }}>
                      <span className="text-xs flex-shrink-0 mt-0.5">{a.level === 'danger' ? '🔴' : '⚠️'}</span>
                      <span className="text-[10px] font-bold leading-relaxed" style={{ color, ...mono.style }}>{a.msg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Bilan */}
        <Section title="Analyse Bilancielle 2023–2024 · FRNG / BFR / Trésorerie Nette">
          <BilanTable />
        </Section>

        {/* Ratios */}
        <Section title="Ratios Financiers 2024" defaultOpen={false}>
          <RatiosTable />
        </Section>

        {/* ANC / ANCC */}
        <Section title="Méthodes Patrimoniales — ANC · ANCC · Praticiens">
          <AncAncc />
        </Section>

        {/* Projections */}
        <Section title="Projections Financières 2025–2029">
          <ProjectionsTable />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px mt-px" style={{ background: C.border }}>
            <ProjectionsChart />
            <MargeEbitChart />
          </div>
        </Section>

        {/* DCF */}
        <Section title="Méthode DCF — Discounted Cash Flows (WACC 10,7 %, g 3,5 %)">
          <DcfSummary />
          <div className="mt-px">
            <SensitivityTable />
          </div>
        </Section>

        {/* DDM */}
        <Section title="Méthode DDM — Dividendes Actualisés (2 phases)" defaultOpen={false}>
          <DdmSummary />
        </Section>

        {/* Valorisation */}
        <Section title="Valorisation — Football Field & Synthèse des Méthodes">
          <FootballField />
          <div className="border-t" style={{ borderColor: C.border }}>
            <ValuationTable />
          </div>
        </Section>

        {/* Scénarios */}
        <Section title="Scénarios de Valorisation · Décôdage du Cours de Marché">
          <ScenariosTable />
          <div className="px-4 py-3 border-t" style={{ borderColor: C.border, background: C.panel, ...mono.style }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: C.orange }}>
              DÉCODAGE DU COURS DE MARCHÉ (~583 MAD)
            </p>
            <p className="text-[10px] leading-relaxed" style={{ color: C.muted }}>
              EV implicite ≈ 1 730 MMAD · EV/EBITDA 2026E implicite = 16,4x (très élevé pour un industriel émergent)
              · FCF terminal implicite ≈ 184 MMAD vs 87,3 MMAD dans notre modèle central (marché anticipe 2× nos FCF).
              Le cours intègre la prime de monopole national + l&apos;option réelle batteries électriques (COBCO) + anticipation rebond 2025.
            </p>
          </div>
        </Section>

        {/* WACC */}
        <Section title="Paramètres WACC / MEDAF — Détermination du Coût du Capital" defaultOpen={false}>
          <WaccTable />
        </Section>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 border-t"
        style={{ borderColor: C.border, background: C.panel2 }}>
        <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>
          Source : Rapport d&apos;évaluation SNEP — ENCG Meknès S8, Avril 2026 | Comptes sociaux certifiés Fidaroc Grant Thornton &amp; BDO | À fins informationnels
        </span>
        <span className="text-[9px] uppercase tracking-widest" style={{ color: C.gold, ...mono.style }}>
          ★ DONNÉES — SNEP | BVC CASABLANCA | PÉTROCHIMIE
        </span>
      </div>

    </div>
  );
}
