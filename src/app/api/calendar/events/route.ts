/**
 * /api/calendar/events — server-side calendar aggregator for Vercel.
 * Fetches from ForexFactory JSON + Médias24 RSS + HCP RSS + (optional) Finnhub.
 * Mirrors the Python calendar_fetcher / calendar_router logic.
 * Next.js caches this route for 15 minutes (ISR revalidation).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { LiveCalendarEvent } from '@/types';

export const revalidate = 900; // 15 min

// ── Constants ─────────────────────────────────────────────────────────────────

const FF_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
const MEDIAS24_RSS = 'https://medias24.com/feed/';
const HCP_RSS = 'https://www.hcp.ma/xml/syndication.rss';

const COUNTRY_FLAGS: Record<string, string> = {
  MA: '🇲🇦', US: '🇺🇸', EU: '🇪🇺', FR: '🇫🇷',
  DE: '🇩🇪', GB: '🇬🇧', CN: '🇨🇳', SA: '🇸🇦',
  JP: '🇯🇵', AU: '🇦🇺', CA: '🇨🇦', CH: '🇨🇭', NZ: '🇳🇿',
};

const FF_COUNTRY_MAP: Record<string, string> = {
  USD: 'US', EUR: 'EU', GBP: 'GB', JPY: 'JP',
  AUD: 'AU', CAD: 'CA', CHF: 'CH', CNY: 'CN',
  NZD: 'NZ', MAD: 'MA',
};

const FF_IMPACT_MAP: Record<string, number> = {
  Low: 1, Medium: 2, High: 3, Holiday: 1,
};

const EVENT_TRANSLATIONS: Record<string, string> = {
  'Interest Rate Decision': 'Décision de taux directeur',
  'Fed Interest Rate Decision': 'Décision de taux Fed',
  'ECB Interest Rate Decision': 'Décision de taux BCE',
  'BoE Interest Rate Decision': 'Décision de taux BoE',
  'BoJ Interest Rate Decision': 'Décision de taux BoJ',
  'FOMC Meeting': 'Réunion FOMC',
  'FOMC Statement': 'Communiqué FOMC',
  'FOMC Minutes': 'Procès-verbal FOMC',
  'Fed Minutes': 'Procès-verbal Fed',
  'ECB Press Conference': 'Conférence de presse BCE',
  'Monetary Policy Summary': 'Résumé de politique monétaire',
  'Monetary Policy Meeting Minutes': 'Procès-verbal réunion monétaire',
  'CPI m/m': 'Inflation mensuelle (IPC)',
  'CPI y/y': 'Inflation annuelle (IPC)',
  'Core CPI m/m': 'Inflation cœur mensuelle',
  'Core CPI y/y': 'Inflation cœur annuelle',
  'PCE Price Index m/m': 'Indice PCE mensuel',
  'Core PCE Price Index m/m': 'Indice PCE cœur mensuel',
  'PPI m/m': 'Prix producteurs mensuel (IPP)',
  'Flash CPI y/y': 'Flash inflation annuelle',
  'Non-Farm Payrolls': "Créations d'emplois NFP (USA)",
  'Non-Farm Employment Change': 'Variation emploi NFP',
  'Unemployment Rate': 'Taux de chômage',
  'ADP Non-Farm Employment Change': 'Emploi privé ADP',
  'Average Hourly Earnings m/m': 'Salaires horaires moyens (mensuel)',
  'Initial Jobless Claims': 'Nouvelles demandes chômage',
  'Claimant Count Change': "Demandeurs d'emploi (UK)",
  'GDP m/m': 'PIB mensuel',
  'GDP q/q': 'PIB trimestriel',
  'GDP y/y': 'PIB annuel',
  'Preliminary GDP q/q': 'PIB préliminaire trimestriel',
  'Flash GDP q/q': 'Flash PIB trimestriel',
  'Trade Balance': 'Balance commerciale',
  'Retail Sales m/m': 'Ventes au détail (mensuel)',
  'Core Retail Sales m/m': 'Ventes détail cœur',
  'Manufacturing PMI': 'PMI Industrie',
  'Services PMI': 'PMI Services',
  'Composite PMI': 'PMI Composite',
  'Flash Manufacturing PMI': 'Flash PMI Industrie',
  'Flash Services PMI': 'Flash PMI Services',
  'ISM Manufacturing PMI': 'ISM Industrie (USA)',
  'ISM Non-Manufacturing PMI': 'ISM Services (USA)',
  'Consumer Confidence': 'Confiance des consommateurs',
  'Consumer Sentiment': 'Sentiment consommateurs',
  'Crude Oil Inventories': 'Stocks pétrole brut (USA)',
  'Industrial Production m/m': 'Production industrielle (mensuel)',
  'Durable Goods Orders m/m': 'Commandes biens durables',
  'Housing Starts': 'Mises en chantier',
  'Building Permits': 'Permis de construire',
  'CB Consumer Confidence': 'Confiance CB des consommateurs',
};

const MACRO_INFLUENCERS = new Set(['US', 'EU', 'FR', 'DE', 'GB', 'CN', 'SA', 'JP']);

const COMMODITY_KW = ['crude oil', 'gold', 'silver', 'phosphate', 'wheat', 'oil inventory', 'pétrole', 'or '];

const MOROCCO_KW = ['maroc', 'morocco', 'bam', 'bank al-maghrib', 'hcp', 'casablanca', 'masi', 'mad', 'dirham'];

const CATEGORY_RULES: [string[], string][] = [
  [['rate', 'taux', 'monetary', 'fomc', 'bce', 'ecb', 'boe', 'boj', 'bam', 'fed'], 'monetary_policy'],
  [['cpi', 'pce', 'inflation', 'ipc', 'prix'], 'inflation'],
  [['gdp', 'pib', 'growth'], 'gdp'],
  [['employment', 'emploi', 'payroll', 'unemployment', 'jobless', 'nfp', 'adp', 'chômage'], 'employment'],
  [['pmi', 'ism', 'manufacturing', 'services'], 'pmi'],
  [['trade', 'balance commerciale', 'current account'], 'trade'],
  [['retail', 'ventes', 'consumer confidence', 'confiance'], 'consumer'],
  [['oil', 'crude', 'eia', 'baker hughes'], 'oil'],
  [['gold', 'silver', 'commodity', 'matière', 'phosphate'], 'commodities'],
  [['housing', 'logement', 'building permit'], 'housing'],
  [['hcp', 'haut commissariat'], 'statistics'],
  [['bvc', 'bourse', 'ipo', 'introduction'], 'market'],
  [['results', 'résultats', 'earnings', 'bénéfices'], 'earnings'],
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function translateTitle(title: string): string {
  if (EVENT_TRANSLATIONS[title]) return EVENT_TRANSLATIONS[title];
  const tl = title.toLowerCase();
  for (const [en, fr] of Object.entries(EVENT_TRANSLATIONS)) {
    if (tl.includes(en.toLowerCase())) return fr;
  }
  return title;
}

function inferCategory(title: string): string {
  const tl = title.toLowerCase();
  for (const [kws, cat] of CATEGORY_RULES) {
    if (kws.some((k) => tl.includes(k))) return cat;
  }
  return 'macro';
}

function normalizeImpact(base: number, country: string, title: string): number {
  let score = ({ 1: 1, 2: 3, 3: 5 } as Record<number, number>)[base] ?? base;
  const tl = title.toLowerCase();
  if (score >= 3 && MACRO_INFLUENCERS.has(country)) score = Math.min(5, score + 1);
  if (COMMODITY_KW.some((k) => tl.includes(k))) score = Math.min(5, score + 1);
  return Math.max(1, Math.min(5, score));
}

function impactLabel(s: number) {
  return ['', 'Faible', 'Modéré', 'Moyen', 'Élevé', 'Critique'][s] ?? 'Moyen';
}
function impactColor(s: number) {
  return ['', 'gray', 'blue', 'yellow', 'orange', 'red'][s] ?? 'gray';
}

function isMoroccoRelevant(country: string, score: number, title: string, cat: string): boolean {
  if (country === 'MA') return true;
  if (score >= 4) return true;
  const tl = title.toLowerCase();
  if (MOROCCO_KW.some((k) => tl.includes(k))) return true;
  if (COMMODITY_KW.some((k) => tl.includes(k))) return true;
  if (['monetary_policy', 'oil', 'commodities'].includes(cat) && score >= 3) return true;
  return false;
}

function makeId(source: string, title: string, date: string, country: string): string {
  const raw = `${source}:${title.toLowerCase().trim()}:${date.slice(0, 10)}:${country}`;
  return createHash('md5').update(raw).digest('hex').slice(0, 16);
}

function isUpcoming(date: string): boolean {
  try { return new Date(date) > new Date(); } catch { return false; }
}

function isPast(date: string): boolean {
  try { return new Date(date) <= new Date(); } catch { return false; }
}

// ── RSS parser ─────────────────────────────────────────────────────────────────

interface RssItem { title: string; link: string; pubDate: string; description: string }

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
  if (!m) return '';
  return m[1].replace(/<[^>]+>/g, '').trim();
}

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const chunks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  for (const chunk of chunks) {
    items.push({
      title: extractTag(chunk, 'title'),
      link: extractTag(chunk, 'link'),
      pubDate: extractTag(chunk, 'pubDate') || extractTag(chunk, 'dc:date'),
      description: extractTag(chunk, 'description').slice(0, 300),
    });
  }
  return items;
}

// ── Source fetchers ────────────────────────────────────────────────────────────

async function safeGet(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, {
      next: { revalidate: 900 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WallStreetMorocco/1.0)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return null;
    return r.text();
  } catch {
    return null;
  }
}

async function fetchForexFactory(): Promise<LiveCalendarEvent[]> {
  const text = await safeGet(FF_URL);
  if (!text) return [];
  let data: any[];
  try { data = JSON.parse(text); } catch { return []; }
  if (!Array.isArray(data)) return [];

  return data.flatMap((ev) => {
    const currency = String(ev.country ?? ev.currency ?? '').toUpperCase();
    const country = FF_COUNTRY_MAP[currency] ?? (currency.length >= 2 ? currency.slice(0, 2) : 'XX');
    const title = String(ev.title ?? '').trim();
    if (!title) return [];

    const rawDate = String(ev.date ?? '');
    const date = parseFFDate(rawDate);
    if (!date) return [];

    const base = FF_IMPACT_MAP[String(ev.impact)] ?? 1;
    const cat = inferCategory(title);
    const score = normalizeImpact(base, country, title);
    const morocco = isMoroccoRelevant(country, score, title, cat);
    const titleFr = translateTitle(title);

    return [{
      id: makeId('forexfactory', title, date, country),
      title,
      titleFr,
      date,
      time: String(ev.time ?? '') || null,
      country,
      countryFlag: COUNTRY_FLAGS[country] ?? '🌍',
      currency,
      category: cat,
      impactScore: score,
      impactLabel: impactLabel(score),
      impactColor: impactColor(score),
      actual: String(ev.actual ?? '') || null,
      forecast: String(ev.forecast ?? '') || null,
      previous: String(ev.previous ?? '') || null,
      unit: null,
      summary: null,
      sourceUrl: 'https://www.forexfactory.com/calendar',
      sourceName: 'ForexFactory',
      isUpcoming: isUpcoming(date),
      isPast: isPast(date),
      isMoroccoRelevant: morocco,
    } as LiveCalendarEvent];
  });
}

function parseFFDate(raw: string): string | null {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const m = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  for (const fmt of ['%a %b %d %Y', '%A %B %d %Y']) {
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch { /* */ }
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

async function fetchRss(
  url: string,
  sourceName: string,
  sourceUrl: string,
  country: string,
  defaultCat: string,
): Promise<LiveCalendarEvent[]> {
  const xml = await safeGet(url);
  if (!xml) return [];
  const items = parseRss(xml);
  const now = new Date();

  return items.slice(0, 20).flatMap((item) => {
    if (!item.title) return [];

    let date = '';
    try {
      const d = new Date(item.pubDate);
      if (!isNaN(d.getTime())) date = d.toISOString().slice(0, 10);
    } catch { /* */ }
    if (!date) return [];

    const cat = inferCategory(item.title) === 'macro' ? defaultCat : inferCategory(item.title);
    let score = 2;
    if (/résultats|ipo|dividende|introduction|taux/i.test(item.title)) score = 3;

    const titleFr = translateTitle(item.title);

    return [{
      id: makeId(sourceName.toLowerCase(), item.title, date, country),
      title: item.title,
      titleFr,
      date,
      time: null,
      country,
      countryFlag: COUNTRY_FLAGS[country] ?? '🌍',
      currency: '',
      category: cat,
      impactScore: score,
      impactLabel: impactLabel(score),
      impactColor: impactColor(score),
      actual: null,
      forecast: null,
      previous: null,
      unit: null,
      summary: item.description.slice(0, 200) || null,
      sourceUrl: item.link || sourceUrl,
      sourceName,
      isUpcoming: isUpcoming(date),
      isPast: isPast(date),
      isMoroccoRelevant: true,
    } as LiveCalendarEvent];
  });
}

async function fetchFinnhub(fromDate: string, toDate: string): Promise<LiveCalendarEvent[]> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return [];
  const text = await safeGet(
    `https://finnhub.io/api/v1/calendar/economic?from=${fromDate}&to=${toDate}&token=${key}`,
  );
  if (!text) return [];
  let data: any;
  try { data = JSON.parse(text); } catch { return []; }
  const events: any[] = data?.economicCalendar ?? [];

  return events.flatMap((ev) => {
    const country = String(ev.country ?? '').toUpperCase();
    const title = String(ev.event ?? '').trim();
    if (!title) return [];
    const date = String(ev.time ?? '').slice(0, 10);
    if (!date) return [];
    const base = (ev.impact as number) <= 3 ? ev.impact : 1;
    const cat = inferCategory(title);
    const score = normalizeImpact(base, country, title);
    const morocco = isMoroccoRelevant(country, score, title, cat);

    return [{
      id: makeId('finnhub', title, date, country),
      title,
      titleFr: translateTitle(title),
      date,
      time: String(ev.time ?? '').slice(11, 16) || null,
      country,
      countryFlag: COUNTRY_FLAGS[country] ?? '🌍',
      currency: '',
      category: cat,
      impactScore: score,
      impactLabel: impactLabel(score),
      impactColor: impactColor(score),
      actual: String(ev.actual ?? '') || null,
      forecast: String(ev.estimate ?? '') || null,
      previous: String(ev.prev ?? '') || null,
      unit: String(ev.unit ?? '') || null,
      summary: null,
      sourceUrl: 'https://finnhub.io',
      sourceName: 'Finnhub',
      isUpcoming: isUpcoming(date),
      isPast: isPast(date),
      isMoroccoRelevant: morocco,
    } as LiveCalendarEvent];
  });
}

// ── Aggregator ────────────────────────────────────────────────────────────────

function dedup(events: LiveCalendarEvent[]): LiveCalendarEvent[] {
  const seen = new Map<string, LiveCalendarEvent>();
  for (const ev of events) {
    const existing = seen.get(ev.id);
    if (!existing || ev.impactScore > existing.impactScore) seen.set(ev.id, ev);
  }
  return Array.from(seen.values());
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const moroccoOnly = sp.get('morocco_only') === 'true';
  const impactMin = parseInt(sp.get('impact_min') ?? '1', 10);
  const categoryFilter = sp.get('category') ?? '';
  const upcomingOnly = sp.get('upcoming_only') === 'true';
  const pastOnly = sp.get('past_only') === 'true';
  const limit = Math.min(parseInt(sp.get('limit') ?? '200', 10), 500);

  // Date range
  const now = new Date();
  const fromDate = new Date(now.getTime() - 3 * 86400_000).toISOString().slice(0, 10);
  const toDate = new Date(now.getTime() + 14 * 86400_000).toISOString().slice(0, 10);

  const [ffEvents, medias24Events, hcpEvents, finnhubEvents] = await Promise.all([
    fetchForexFactory(),
    fetchRss(MEDIAS24_RSS, 'Médias24', 'https://medias24.com/economie/', 'MA', 'news'),
    fetchRss(HCP_RSS, 'HCP Maroc', 'https://www.hcp.ma/', 'MA', 'statistics'),
    fetchFinnhub(fromDate, toDate),
  ]);

  let events = dedup([...ffEvents, ...medias24Events, ...hcpEvents, ...finnhubEvents]);
  events.sort((a, b) => a.date.localeCompare(b.date) || b.impactScore - a.impactScore);

  // Filters
  if (moroccoOnly) events = events.filter((e) => e.isMoroccoRelevant);
  if (impactMin > 1) events = events.filter((e) => e.impactScore >= impactMin);
  if (categoryFilter) events = events.filter((e) => e.category === categoryFilter);
  if (upcomingOnly) events = events.filter((e) => e.isUpcoming);
  if (pastOnly) events = events.filter((e) => e.isPast);

  const sliced = events.slice(0, limit);

  return NextResponse.json({
    events: sliced,
    total: events.length,
    returned: sliced.length,
    cachedAt: new Date().toISOString(),
    moroccoOnly,
  });
}
