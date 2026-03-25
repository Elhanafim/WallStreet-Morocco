const CONSENT_KEY = 'wsm_cookie_consent';
const CONSENT_VERSION = '1.0';

export interface ConsentState {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: number;
  version: string;
}

export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ConsentState;
  } catch {
    return null;
  }
}

export function hasConsent(category: keyof Omit<ConsentState, 'timestamp' | 'version'>): boolean {
  if (typeof window === 'undefined') return category === 'essential';
  const consent = getConsent();
  if (!consent) return category === 'essential';
  // If consent version changed, treat as no consent for non-essential
  if (consent.version !== CONSENT_VERSION && category !== 'essential') return false;
  return consent[category] === true;
}

export function saveConsent(state: Omit<ConsentState, 'timestamp' | 'version'>): void {
  if (typeof window === 'undefined') return;
  const consent: ConsentState = {
    ...state,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
}

export function clearNonEssentialData(): void {
  if (typeof window === 'undefined') return;
  // Keys that are non-essential and should be cleared on refusal
  const nonEssentialPrefixes = [
    'portfolio_snapshots_',
    'wsm_donate_',
    'wsm_engagement_',
  ];
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && nonEssentialPrefixes.some((p) => key.startsWith(p))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

export function consentGiven(): boolean {
  return getConsent() !== null;
}

export function needsNewConsent(): boolean {
  const consent = getConsent();
  if (!consent) return true;
  if (consent.version !== CONSENT_VERSION) return true;
  return false;
}
