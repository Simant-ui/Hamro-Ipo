import { NextResponse } from 'next/server';
import { saveReminder } from '@/lib/services/reminders';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, ipo_id, company_name, symbol, opening_date, price } = body;

    if (!email || !ipo_id) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await saveReminder({
      email,
      ipo_id,
      company_name,
      symbol,
      opening_date,
      price
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Reminder saved successfully. We will email you when it opens!',
      data: result.data 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
