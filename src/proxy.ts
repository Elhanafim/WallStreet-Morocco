// Next.js 16 renamed middleware.ts to proxy.ts; it runs on the Node.js runtime.
// Protects the dashboard and portfolio pages with the NextAuth session check —
// same behaviour as the previous `export { default } from 'next-auth/middleware'`.
import type { NextFetchEvent } from 'next/server';
import withAuth, { type NextRequestWithAuth } from 'next-auth/middleware';

export default function proxy(request: NextRequestWithAuth, event: NextFetchEvent) {
  return withAuth(request, event);
}

export const config = {
  matcher: ['/dashboard/:path*', '/portfolio/:path*', '/portfolio'],
};
