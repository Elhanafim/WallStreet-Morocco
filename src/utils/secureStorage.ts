/**
 * secureStorage — obfuscated localStorage wrapper.
 *
 * NOTE: This is NOT cryptographic encryption — it deters casual inspection.
 * True auth tokens (NextAuth session) are stored in httpOnly cookies by NextAuth.
 * This utility is used only for non-sensitive UI state that benefits from
 * light obfuscation (e.g. donate prompt timestamps, consent state).
 *
 * For actual secrets: use NextAuth's built-in httpOnly cookie session.
 */

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function secureSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    const encoded = btoa(encodeURIComponent(value + '|' + Date.now()));
    localStorage.setItem(key, encoded);
  } catch {
    // Storage quota exceeded or private mode — fail silently
  }
}

export function secureGet(key: string, maxAgeMs = THIRTY_DAYS_MS): string | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    const decoded = decodeURIComponent(atob(stored));
    const pipeIndex = decoded.lastIndexOf('|');
    if (pipeIndex === -1) {
      localStorage.removeItem(key);
      return null;
    }
    const value = decoded.slice(0, pipeIndex);
    const timestamp = parseInt(decoded.slice(pipeIndex + 1), 10);
    if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
      localStorage.removeItem(key);
      return null;
    }
    return value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function secureClear(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}
