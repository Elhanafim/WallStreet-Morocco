// ─── localStorage High Score Utilities ──────────────────────────────────────
// Privacy-friendly: all data stays in the browser. No tracking, no server calls.

// General-audience games
export type ClassicGameId = 'souk-day' | 'riads-and-rials' | 'casablanca-capital';

// Finance students games
export type StudentGameId =
  | 'risk-radar'
  | 'hedge-or-hold'
  | 'factory-break-even'
  | 'ratio-race'
  | 'capital-budgeting';

export type GameId = ClassicGameId | StudentGameId;

export interface GameScore {
  game: GameId;
  score: number;        // profit (MAD), return (%), or points
  date: string;         // ISO date
  label: string;        // formatted display string, e.g. "+1 200 MAD" or "+12.5%"
}

// ─── Classic games storage ─────────────────────────────────────────────────

const CLASSIC_KEY = 'wsma_game_scores';

const CLASSIC_DEFAULT: Record<ClassicGameId, GameScore | null> = {
  'souk-day': null, 'riads-and-rials': null, 'casablanca-capital': null,
};

function readClassic(): Record<ClassicGameId, GameScore | null> {
  if (typeof window === 'undefined') return { ...CLASSIC_DEFAULT };
  try {
    const raw = localStorage.getItem(CLASSIC_KEY);
    if (!raw) return { ...CLASSIC_DEFAULT };
    return JSON.parse(raw);
  } catch {
    return { ...CLASSIC_DEFAULT };
  }
}

function writeClassic(scores: Record<ClassicGameId, GameScore | null>): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(CLASSIC_KEY, JSON.stringify(scores)); } catch { /* ignore */ }
}

// ─── Student games storage ─────────────────────────────────────────────────

const STUDENT_KEY = 'wsma_student_scores';

const STUDENT_DEFAULT: Record<StudentGameId, GameScore | null> = {
  'risk-radar': null, 'hedge-or-hold': null, 'factory-break-even': null,
  'ratio-race': null, 'capital-budgeting': null,
};

function readStudent(): Record<StudentGameId, GameScore | null> {
  if (typeof window === 'undefined') return { ...STUDENT_DEFAULT };
  try {
    const raw = localStorage.getItem(STUDENT_KEY);
    if (!raw) return { ...STUDENT_DEFAULT };
    return JSON.parse(raw);
  } catch {
    return { ...STUDENT_DEFAULT };
  }
}

function writeStudent(scores: Record<StudentGameId, GameScore | null>): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STUDENT_KEY, JSON.stringify(scores)); } catch { /* ignore */ }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function isClassicId(id: string): id is ClassicGameId {
  return id in CLASSIC_DEFAULT;
}

function isStudentId(id: string): id is StudentGameId {
  return id in STUDENT_DEFAULT;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Save a high score if it beats the current best.
 * Returns true if a new high score was set.
 */
export function saveHighScore(score: GameScore): boolean {
  if (isClassicId(score.game)) {
    const all = readClassic();
    const current = all[score.game];
    if (!current || score.score > current.score) {
      all[score.game] = score;
      writeClassic(all);
      return true;
    }
    return false;
  }
  if (isStudentId(score.game)) {
    const all = readStudent();
    const current = all[score.game];
    if (!current || score.score > current.score) {
      all[score.game] = score;
      writeStudent(all);
      return true;
    }
    return false;
  }
  return false;
}

/** Get the best score for a specific game, or null if none. */
export function getHighScore(game: GameId): GameScore | null {
  if (isClassicId(game)) return readClassic()[game] ?? null;
  if (isStudentId(game)) return readStudent()[game] ?? null;
  return null;
}

/** Get all classic game high scores. */
export function getAllHighScores(): Record<ClassicGameId, GameScore | null> {
  return readClassic();
}

/** Get all student game high scores. */
export function getAllStudentHighScores(): Record<StudentGameId, GameScore | null> {
  return readStudent();
}

/** Clear all high scores. */
export function clearAllHighScores(): void {
  writeClassic({ ...CLASSIC_DEFAULT });
  writeStudent({ ...STUDENT_DEFAULT });
}
