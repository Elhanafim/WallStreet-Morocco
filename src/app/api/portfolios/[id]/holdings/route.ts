import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const holdingSchema = z.object({
  assetType:     z.enum(['STOCK', 'OPCVM']),
  assetSymbol:   z.string().min(1),
  assetName:     z.string().min(1),
  quantity:      z.number().positive('La quantité doit être supérieure à 0'),
  purchasePrice: z.number().positive('Le prix doit être supérieur à 0'),
  purchaseDate:  z.string().optional(),
  notes:         z.string().max(200).optional(),
});

// GET /api/portfolios/[id]/holdings — list holdings for a portfolio
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const portfolio = await prisma.namedPortfolio.findUnique({
    where: { id: params.id },
  });

  if (!portfolio) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  }
  if (portfolio.userId !== (session.user as any).id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const holdings = await prisma.portfolioHolding.findMany({
    where: { portfolioId: params.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(holdings);
}

// POST /api/portfolios/[id]/holdings — add a holding to a portfolio
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const portfolio = await prisma.namedPortfolio.findUnique({
    where: { id: params.id },
  });

  if (!portfolio) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  }
  if (portfolio.userId !== (session.user as any).id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = holdingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const holding = await prisma.portfolioHolding.create({
    data: {
      portfolioId:   params.id,
      assetType:     parsed.data.assetType,
      assetSymbol:   parsed.data.assetSymbol,
      assetName:     parsed.data.assetName,
      quantity:      parsed.data.quantity,
      purchasePrice: parsed.data.purchasePrice,
      purchaseDate:  parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : new Date(),
      notes:         parsed.data.notes ?? null,
    },
  });

  // Touch parent portfolio updatedAt
  await prisma.namedPortfolio.update({
    where: { id: params.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(holding, { status: 201 });
}
