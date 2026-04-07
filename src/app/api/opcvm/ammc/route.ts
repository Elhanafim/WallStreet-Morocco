/**
 * OPCVM AMMC Aggregate API
 *
 * Serves weekly macro-level OPCVM statistics from AMMC (data.gov.ma).
 * Data is stored as static JSON files under public/data/opcvm/ and updated
 * weekly by GitHub Actions (.github/workflows/opcvm-ammc-update.yml).
 *
 * Endpoints:
 *   GET /api/opcvm/ammc                → latest snapshot (full)
 *   GET /api/opcvm/ammc?_path=latest   → same
 *   GET /api/opcvm/ammc?_path=history  → all weekly snapshots
 *   GET /api/opcvm/ammc?_path=categories → category breakdown (latest)
 *   GET /api/opcvm/ammc?_path=flows    → flows time series
 *   GET /api/opcvm/ammc?_path=scores   → score time series per category
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AmmcCategory {
  label:         string;
  aum:           number | null;
  aum_prev:      number | null;
  weight:        number | null;
  weekly_growth: number | null;
  perf_index:    number | null;
  subscriptions: number | null;
  redemptions:   number | null;
  net_flow:      number | null;
  net_flow_pct:  number | null;
  nb_fonds:      number | null;
  score:         number | null;
}

export interface AmmcSnapshot {
  date:          string;
  week_number:   number | null;
  aum_total:     number;
  aum_prev:      number | null;
  weekly_growth: number | null;
  categories:    Record<string, AmmcCategory>;
  flows: {
    subscriptions: number;
    redemptions:   number;
    net_flow:      number;
  };
  insights:  string[];
  scores:    Record<string, number>;
  source:    string;
}

// ── File reading ──────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'public', 'data', 'opcvm');

async function readJson<T>(filename: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ── Response helpers ──────────────────────────────────────────────────────────

function ok(body: unknown, cache = 3600): NextResponse {
  return NextResponse.json(body, {
    headers: {
      'Cache-Control': `public, s-maxage=${cache}, stale-while-revalidate=${cache * 2}`,
    },
  });
}

function notFound(msg: string): NextResponse {
  return NextResponse.json({ error: msg }, { status: 404 });
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const p = searchParams.get('_path') ?? 'latest';

  // ── /api/opcvm/ammc?_path=history ────────────────────────────────────────
  if (p === 'history') {
    const history = await readJson<AmmcSnapshot[]>('history.json');
    if (!history) return notFound('history.json not found');
    return ok({ history, count: history.length });
  }

  // ── /api/opcvm/ammc?_path=categories ─────────────────────────────────────
  if (p === 'categories') {
    const latest = await readJson<AmmcSnapshot>('latest.json');
    if (!latest) return notFound('latest.json not found');
    const { categories, date, aum_total, source } = latest;
    return ok({ date, aum_total, categories, source });
  }

  // ── /api/opcvm/ammc?_path=flows ──────────────────────────────────────────
  if (p === 'flows') {
    const history = await readJson<AmmcSnapshot[]>('history.json');
    if (!history) return notFound('history.json not found');
    const series = history.map(snap => ({
      date:          snap.date,
      subscriptions: snap.flows.subscriptions,
      redemptions:   snap.flows.redemptions,
      net_flow:      snap.flows.net_flow,
    }));
    return ok({ series, count: series.length });
  }

  // ── /api/opcvm/ammc?_path=scores ─────────────────────────────────────────
  if (p === 'scores') {
    const history = await readJson<AmmcSnapshot[]>('history.json');
    if (!history) return notFound('history.json not found');
    const series = history.map(snap => ({
      date:   snap.date,
      scores: snap.scores,
    }));
    return ok({ series });
  }

  // ── /api/opcvm/ammc  (default: latest) ───────────────────────────────────
  const latest = await readJson<AmmcSnapshot>('latest.json');
  if (!latest) return notFound('latest.json not found');
  return ok(latest, 1800);
}
