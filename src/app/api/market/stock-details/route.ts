import { NextResponse } from 'next/server';
import { fetchCompanyDetails, fetchPriceHistory } from '@/lib/services/stockDetails';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ success: false, message: 'Symbol is required' }, { status: 400 });
  }

  try {
    const details = await fetchCompanyDetails(symbol);
    if (!details) {
      return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    }

    const currentLtp = parseFloat(details.ltp.replace(/,/g, '')) || 0;
    const history = await fetchPriceHistory(symbol, currentLtp);

    return NextResponse.json({
      success: true,
      data: {
        details,
        history
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
