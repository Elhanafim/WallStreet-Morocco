/**
 * Frontend client for the calendar endpoints on the BVC Price Microservice.
 */

import { LiveCalendarEvent } from '@/types';

const BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PRICE_SERVICE_URL) ||
  'http://localhost:8001';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CalendarEventsResponse {
  events: LiveCalendarEvent[];
  total: number;
  returned: number;
  cachedAt: string;
  moroccoOnly: boolean;
}

export interface CalendarStatsResponse {
  total: number;
  moroccoRelevant: number;
  upcoming: number;
  byCountry: Record<string, number>;
  byCategory: Record<string, number>;
  byImpact: Record<string, number>;
  cacheStatus: { allFresh: boolean; moroccoFresh: boolean };
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

// ── API helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Calendar API ${path} → ${res.status}`);
  return res.json();
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchCalendarEvents(
  params: FetchEventsParams = {},
): Promise<CalendarEventsResponse> {
  return apiFetch<CalendarEventsResponse>('/calendar/events', {
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
  return apiFetch<CalendarEventsResponse>('/calendar/events/morocco', {
    impact_min: impactMin,
    upcoming_only: upcomingOnly,
    limit,
  });
}

export async function fetchCalendarStats(): Promise<CalendarStatsResponse> {
  return apiFetch<CalendarStatsResponse>('/calendar/stats');
}

export async function forceCalendarRefresh(): Promise<void> {
  await fetch(`${BASE_URL}/calendar/refresh`, { method: 'POST' });
}
