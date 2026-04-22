import { NextResponse } from 'next/server';
import { fetchSubIndices } from '@/lib/services/sharesansar';

export async function GET() {
  try {
    const indices = await fetchSubIndices();
    return NextResponse.json({ success: true, data: indices });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
