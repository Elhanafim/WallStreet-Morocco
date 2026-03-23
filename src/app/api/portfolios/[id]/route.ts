import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE /api/portfolios/[id] — delete a portfolio and all its holdings (cascade)
export async function DELETE(
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

  await prisma.namedPortfolio.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
