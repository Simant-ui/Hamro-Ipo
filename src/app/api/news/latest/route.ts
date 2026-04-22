import { NextResponse } from 'next/server';
import { fetchLatestNews } from '@/lib/services/sharesansar';

export async function GET() {
  try {
    const news = await fetchLatestNews();
    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
