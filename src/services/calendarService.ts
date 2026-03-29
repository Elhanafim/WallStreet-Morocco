/**
 * Frontend client for calendar events.
 * On Vercel (no NEXT_PUBLIC_PRICE_SERVICE_URL): calls /api/calendar/events (Next.js route).
 * Locally with Python service running: calls http://localhost:8001/calendar/events.
 */

import { LiveCalendarEvent } from '@/types';

const PRICE_SERVICE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PRICE_SERVICE_URL) || '';

// Paths relative to base — no leading /calendar segment since CALENDAR_BASE already includes it
const CALENDAR_BASE = PRICE_SERVICE ? `${PRICE_SERVICE}/calendar` : '/api/calendar';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CalendarEventsResponse {
  events: LiveCalendarEvent[];
  total: number;
  returned: number;
  cachedAt: string;
  moroccoOnly: boolean;
}

export interface FetchEventsParams {
  moroccoOnly?: boolean;
  impactMin?: number;
  category?: string;
  country?: string;
  upcomingOnly?: boolean;
  pastOnly?: boolean;
  limit?: number;
}

// ── API helper ────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  segment: string,
  params?: Record<string, string | number | boolean>,
): Promise<T> {
  const qs = params
    ? '?' +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';

  // Try the configured base (external Python service if NEXT_PUBLIC_PRICE_SERVICE_URL is set,
  // else the internal Next.js route). If the external service is unreachable, fall back to the
  // internal /api/calendar route so the page never breaks in production.
  const primaryUrl = `${CALENDAR_BASE}${segment}${qs}`;
  let res: Response;
  try {
    res = await fetch(primaryUrl, { cache: 'no-store' });
  } catch {
    // Network error (e.g. external service not running) — fall back to internal route
    if (PRICE_SERVICE) {
      res = await fetch(`/api/calendar${segment}${qs}`, { cache: 'no-store' });
    } else {
      throw new Error(`Calendar API ${segment} → network error`);
    }
  }

  if (!res.ok) {
    // If external service returned an error, retry against the internal route
    if (PRICE_SERVICE) {
      const fallback = await fetch(`/api/calendar${segment}${qs}`, { cache: 'no-store' });
      if (!fallback.ok) throw new Error(`Calendar API ${segment} → ${fallback.status}`);
      return fallback.json();
    }
    throw new Error(`Calendar API ${segment} → ${res.status}`);
  }

  return res.json();
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchCalendarEvents(
  params: FetchEventsParams = {},
): Promise<CalendarEventsResponse> {
  // Python service: /calendar/events  →  CALENDAR_BASE + /events
  // Next.js route:  /api/calendar/events → CALENDAR_BASE + /events
  return apiFetch<CalendarEventsResponse>('/events', {
    ...(params.moroccoOnly !== undefined && { morocco_only: params.moroccoOnly }),
    ...(params.impactMin !== undefined && { impact_min: params.impactMin }),
    ...(params.category && { category: params.category }),
    ...(params.country && { country: params.country }),
    ...(params.upcomingOnly !== undefined && { upcoming_only: params.upcomingOnly }),
    ...(params.pastOnly !== undefined && { past_only: params.pastOnly }),
    ...(params.limit !== undefined && { limit: params.limit }),
  });
}

export async function fetchMoroccoEvents(
  impactMin = 1,
  upcomingOnly = false,
  limit = 50,
): Promise<CalendarEventsResponse> {
  return apiFetch<CalendarEventsResponse>('/events', {
    morocco_only: true,
    impact_min: impactMin,
    upcoming_only: upcomingOnly,
    limit,
  });
}

export async function forceCalendarRefresh(): Promise<void> {
  if (PRICE_SERVICE) {
    await fetch(`${PRICE_SERVICE}/calendar/refresh`, { method: 'POST' });
  }
}
