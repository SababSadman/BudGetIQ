const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Runs every day at 00:05 UTC.
 * Fetches active recurring expenses whose next_run_date <= now,
 * inserts them as real transactions, and advances the next_run_date.
 */
async function processRecurringExpenses() {
    console.log('[CRON] Processing recurring expenses…');
    const now = new Date().toISOString();

    const { data: dues, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('is_active', true)
        .lte('next_run_date', now);

    if (error) {
        console.error('[CRON] Error fetching recurring expenses:', error.message);
        return;
    }

    if (!dues || dues.length === 0) {
        console.log('[CRON] No recurring expenses due.');
        return;
    }

    const newTransactions = dues.map(r => ({
        user_id: r.user_id,
        amount: r.amount,
        currency: r.currency,
        category_id: r.category_id,
        description: r.description,
        is_recurring: true,
    }));

    const { error: insertError } = await supabase
        .from('transactions')
        .insert(newTransactions);

    if (insertError) {
        console.error('[CRON] Error inserting transactions:', insertError.message);
        return;
    }

    // Advance next_run_date for each recurring expense
    for (const r of dues) {
        const nextDate = new Date(r.next_run_date);
        if (r.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (r.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (r.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

        await supabase
            .from('recurring_expenses')
            .update({ next_run_date: nextDate.toISOString() })
            .eq('id', r.id);
    }

    console.log(`[CRON] Processed ${dues.length} recurring expense(s).`);
}

// Schedule: every day at 00:05 UTC
cron.schedule('5 0 * * *', processRecurringExpenses, { timezone: 'UTC' });

// Export so it can be triggered manually (e.g., for testing)
module.exports = { processRecurringExpenses };
