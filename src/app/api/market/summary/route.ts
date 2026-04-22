import { NextResponse } from 'next/server';
import { fetchMarketSummary } from '@/lib/services/sharesansar';

export async function GET() {
  try {
    const summary = await fetchMarketSummary();
    if (!summary) {
      return NextResponse.json({ success: false, message: 'Failed to fetch market summary' }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
