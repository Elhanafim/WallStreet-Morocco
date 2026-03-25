/**
 * Central donation prompt service.
 * All frequency logic lives here so no two prompts fire simultaneously.
 */

export const DONATE_KEYS = {
  toastLastShown:     'donate_toast_last_shown',
  pageLastVisited:    'donate_page_last_visited',
  promptLastShown:    'donate_prompt_last_shown',
  calendarDismissed:  'calendar_banner_dismissed',
  dashboardDismissed: 'dashboard_widget_dismissed',
  sessionPageViews:   'session_page_views',
  sessionStartTime:   'session_start_time',
  calendarPageViews:  'calendar_page_views',
} as const;

const COOLDOWNS_DAYS: Record<string, number> = {
  [DONATE_KEYS.toastLastShown]:     14,
  [DONATE_KEYS.promptLastShown]:    30,
  [DONATE_KEYS.calendarDismissed]:  14,
  [DONATE_KEYS.dashboardDismissed]: 30,
};

function safe(fn: () => void) {
  try { fn(); } catch { /* SSR / quota */ }
}

function getItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function setItem(key: string, value: string) {
  safe(() => localStorage.setItem(key, value));
}

/** Returns true if the user visited /donate less than 7 days ago. */
function visitedDonateRecently(): boolean {
  const ts = getItem(DONATE_KEYS.pageLastVisited);
  if (!ts) return false;
  return (Date.now() - parseInt(ts)) / 86_400_000 < 7;
}

/** Returns true if it's OK to show the given prompt type right now. */
export function canShowPrompt(storageKey: string): boolean {
  if (typeof window === 'undefined') return false;
  if (visitedDonateRecently()) return false;
  const last = getItem(storageKey);
  if (!last) return true;
  const cooldown = COOLDOWNS_DAYS[storageKey] ?? 14;
  return (Date.now() - parseInt(last)) / 86_400_000 >= cooldown;
}

/** Record that a prompt was shown. */
export function markShown(storageKey: string) {
  setItem(storageKey, String(Date.now()));
}

/** Call on every route change to update session tracking. */
export function trackPageView(path: string) {
  if (typeof window === 'undefined') return;
  safe(() => {
    if (path === '/donate') {
      setItem(DONATE_KEYS.pageLastVisited, String(Date.now()));
      return;
    }
    // Session page views
    const views = parseInt(getItem(DONATE_KEYS.sessionPageViews) ?? '0') + 1;
    setItem(DONATE_KEYS.sessionPageViews, String(views));
    // Session start time (set once)
    if (!getItem(DONATE_KEYS.sessionStartTime)) {
      setItem(DONATE_KEYS.sessionStartTime, String(Date.now()));
    }
    // Calendar page views
    if (path === '/calendar') {
      const cv = parseInt(getItem(DONATE_KEYS.calendarPageViews) ?? '0') + 1;
      setItem(DONATE_KEYS.calendarPageViews, String(cv));
    }
  });
}

/**
 * Engagement score:
 *   pageViews×1 + minutesOnSite×0.5 + holdingsCount×3 + calendarViews×1
 * Toast fires when score ≥ 10.
 */
export function getEngagementScore(holdingsCount = 0): number {
  if (typeof window === 'undefined') return 0;
  const pageViews = parseInt(getItem(DONATE_KEYS.sessionPageViews) ?? '0');
  const start = parseInt(getItem(DONATE_KEYS.sessionStartTime) ?? String(Date.now()));
  const minutesOnSite = (Date.now() - start) / 60_000;
  const calViews = parseInt(getItem(DONATE_KEYS.calendarPageViews) ?? '0');
  return pageViews * 1 + minutesOnSite * 0.5 + holdingsCount * 3 + calViews * 1;
}

// ── Global "one prompt at a time" gate ────────────────────────────────────────

let _activeCount = 0;
export function canShowAnotherPrompt(): boolean { return _activeCount === 0; }
export function registerPromptVisible() { _activeCount++; }
export function registerPromptHidden()  { _activeCount = Math.max(0, _activeCount - 1); }
