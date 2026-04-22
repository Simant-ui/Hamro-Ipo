import { NextResponse } from 'next/server';
import { getPendingReminders, markReminderAsSent } from '@/lib/services/reminders';
import { sendIPOReminderEmail } from '@/lib/email';

export async function GET(req: Request) {
  // Simple security check: Check for a secret key in the headers or query
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  if (secret !== process.env.ENCRYPTION_SECRET?.substring(0, 8)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reminders = await getPendingReminders();
    const results = [];

    for (const reminder of reminders) {
      try {
        await sendIPOReminderEmail(
          reminder.email,
          reminder.company_name,
          reminder.symbol,
          reminder.opening_date,
          reminder.price
        );
        
        await markReminderAsSent(reminder.id);
        results.push({ id: reminder.id, status: 'sent' });
      } catch (err: any) {
        console.error(`Failed to send email for reminder ${reminder.id}:`, err);
        results.push({ id: reminder.id, status: 'failed', error: err.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: reminders.length,
      results 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
