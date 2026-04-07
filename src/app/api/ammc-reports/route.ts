import { NextResponse } from 'next/server';
import { getAmmcReports } from '@/lib/ammcReports';

export async function GET() {
  try {
    const data = await getAmmcReports();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching AMMC reports API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AMMC reports' },
      { status: 500 }
    );
  }
}
