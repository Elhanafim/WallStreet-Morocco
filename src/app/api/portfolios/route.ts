import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const createSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
});

// GET /api/portfolios — list all named portfolios for the authenticated user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const portfolios = await prisma.namedPortfolio.findMany({
    where: { userId: (session.user as any).id },
    include: { holdings: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(portfolios);
}

// POST /api/portfolios — create a new named portfolio
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const portfolio = await prisma.namedPortfolio.create({
    data: {
      userId: (session.user as any).id,
      name: parsed.data.name.trim(),
    },
    include: { holdings: true },
  });

  return NextResponse.json(portfolio, { status: 201 });
}
