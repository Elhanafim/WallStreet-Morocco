// ─── localStorage High Score Utilities ──────────────────────────────────────
// Privacy-friendly: all data stays in the browser. No tracking, no server calls.

export type GameId = 'souk-day' | 'riads-and-rials' | 'casablanca-capital';

export interface GameScore {
  game: GameId;
  score: number;        // profit (MAD) or return (%)
  date: string;         // ISO date
  label: string;        // formatted display string, e.g. "+1 200 MAD" or "+12.5%"
}

const STORAGE_KEY = 'wsma_game_scores';

function readAll(): Record<GameId, GameScore | null> {
  if (typeof window === 'undefined') {
    return { 'souk-day': null, 'riads-and-rials': null, 'casablanca-capital': null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { 'souk-day': null, 'riads-and-rials': null, 'casablanca-capital': null };
    return JSON.parse(raw);
  } catch {
    return { 'souk-day': null, 'riads-and-rials': null, 'casablanca-capital': null };
  }
}

function writeAll(scores: Record<GameId, GameScore | null>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Save a high score if it beats the current best.
 * Returns true if a new high score was set.
 */
export function saveHighScore(score: GameScore): boolean {
  const all = readAll();
  const current = all[score.game];
  if (!current || score.score > current.score) {
    all[score.game] = score;
    writeAll(all);
    return true;
  }
  return false;
}

/** Get the best score for a specific game, or null if none. */
export function getHighScore(game: GameId): GameScore | null {
  return readAll()[game] ?? null;
}

/** Get all high scores. */
export function getAllHighScores(): Record<GameId, GameScore | null> {
  return readAll();
}

/** Clear all high scores. */
export function clearAllHighScores(): void {
  writeAll({ 'souk-day': null, 'riads-and-rials': null, 'casablanca-capital': null });
}
