// Simple in-memory per-IP rate limiter.
// Works within a single serverless instance; good enough for basic protection.
const ipCounts = new Map<string, { count: number; reset: number }>();

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Default: 30 requests per minute per IP.
 */
export function checkRateLimit(ip: string, maxPerMinute = 30): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);

  if (!entry || now > entry.reset) {
    ipCounts.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }

  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}

/** Extract the best available IP from a Next.js request. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}
