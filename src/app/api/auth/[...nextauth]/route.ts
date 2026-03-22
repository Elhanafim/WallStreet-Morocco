import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Required: prevent Next.js from statically analysing this route at build time
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
