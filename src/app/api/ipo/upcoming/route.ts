import { NextResponse } from 'next/server';
import { fetchUpcomingIpos } from '@/lib/services/sharesansar';

export async function GET() {
  try {
    const ipos = await fetchUpcomingIpos();
    return NextResponse.json({ 
      success: true, 
      data: ipos,
      source: 'ShareSansar',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
