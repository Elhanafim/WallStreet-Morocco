import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE /api/portfolios/[id]/holdings/[holdingId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; holdingId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Verify portfolio ownership
  const portfolio = await prisma.namedPortfolio.findUnique({
    where: { id: params.id },
  });

  if (!portfolio) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  }
  if (portfolio.userId !== (session.user as any).id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const holding = await prisma.portfolioHolding.findUnique({
    where: { id: params.holdingId },
  });

  if (!holding || holding.portfolioId !== params.id) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  }

  await prisma.portfolioHolding.delete({ where: { id: params.holdingId } });

  return NextResponse.json({ success: true });
}
