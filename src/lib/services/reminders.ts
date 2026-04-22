import { supabaseAdmin } from '@/lib/supabase/admin';

export interface IPOReminder {
  id?: string;
  email: string;
  ipo_id: string;
  company_name: string;
  symbol: string;
  opening_date: string;
  price: number;
  sent?: boolean;
  created_at?: string;
}

export async function saveReminder(reminder: IPOReminder) {
  try {
    const { data, error } = await supabaseAdmin
      .from('ipo_reminders')
      .insert([
        {
          email: reminder.email,
          ipo_id: reminder.ipo_id,
          company_name: reminder.company_name,
          symbol: reminder.symbol,
          opening_date: reminder.opening_date,
          price: reminder.price,
          sent: false
        }
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Failed to save reminder to Supabase:', error);
    // Fallback to local storage (for development)
    return { success: false, error };
  }
}

export async function getPendingReminders() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const { data, error } = await supabaseAdmin
      .from('ipo_reminders')
      .select('*')
      .eq('sent', false)
      .lte('opening_date', today);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch pending reminders:', error);
    return [];
  }
}

export async function markReminderAsSent(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('ipo_reminders')
      .update({ sent: true })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to mark reminder as sent:', error);
    return false;
  }
}
