import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.PRICE_SERVICE_URL ?? 'http://localhost:8001';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('_path') ?? '';
  searchParams.delete('_path');

  const upstream = `${BACKEND}/opcvm/${path}?${searchParams.toString()}`;

  try {
    const res = await fetch(upstream, {
      next: { revalidate: 300 }, // 5-min edge cache
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Backend unavailable', status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    // Backend offline — return empty payload so UI can degrade gracefully
    return NextResponse.json(
      { funds: [], count: 0, source: 'unavailable', error: true },
      { status: 200 }
    );
  }
}
