import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const portfolioSchema = z.object({
  assetName: z.string().min(1, 'Le nom de l\'actif est requis'),
  assetType: z.enum(['STOCK', 'OPCVM', 'ETF', 'BOND', 'OTHER']),
  ticker: z.string().optional(),
  amountInvested: z.number().positive('Le montant investi doit être positif'),
  quantity: z.number().positive().optional(),
  purchasePrice: z.number().positive().optional(),
  currentPrice: z.number().positive().optional(),
  date: z.string().min(1, 'La date est requise'),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const portfolio = await prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Portfolio GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = portfolioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const { date, ...rest } = parsed.data;

    const entry = await prisma.portfolio.create({
      data: {
        ...rest,
        date: new Date(date),
        userId,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Portfolio POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
