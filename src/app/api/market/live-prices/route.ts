import { NextResponse } from 'next/server';
import { fetchLivePrices } from '@/lib/services/sharesansar';

export async function GET() {
  try {
    const prices = await fetchLivePrices();
    return NextResponse.json({ 
      success: true, 
      data: prices || [],
      message: prices?.length === 0 ? 'Market might be closed or data unavailable' : undefined
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
