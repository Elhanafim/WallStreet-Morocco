import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  assetName: z.string().min(1).optional(),
  assetType: z.enum(['STOCK', 'OPCVM', 'ETF', 'BOND', 'OTHER']).optional(),
  ticker: z.string().optional(),
  amountInvested: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  purchasePrice: z.number().positive().optional(),
  currentPrice: z.number().positive().optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const entry = await prisma.portfolio.findUnique({
      where: { id: params.id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entrée introuvable' }, { status: 404 });
    }

    if (entry.userId !== userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await prisma.portfolio.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Entrée supprimée' });
  } catch (error) {
    console.error('Portfolio DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const entry = await prisma.portfolio.findUnique({
      where: { id: params.id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entrée introuvable' }, { status: 404 });
    }

    if (entry.userId !== userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { date, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (date) updateData.date = new Date(date);

    const updated = await prisma.portfolio.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Portfolio PATCH error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
