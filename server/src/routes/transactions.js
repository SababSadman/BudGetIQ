const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/transactions/bulk-create
 * Creates multiple transactions at once (used by cron for recurring expenses).
 */
router.post('/bulk-create', async (req, res) => {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ error: 'transactions array is required' });
    }

    const { data, error } = await supabase
        .from('transactions')
        .insert(transactions)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ created: data.length, data });
});

/**
 * GET /api/transactions/summary/:userId
 * Returns month-to-date spending summary for a user.
 */
router.get('/summary/:userId', async (req, res) => {
    const { userId } = req.params;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('transactions')
        .select('amount_usd')
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString());

    if (error) return res.status(500).json({ error: error.message });

    const total = data.reduce((sum, t) => sum + (t.amount_usd || 0), 0);
    res.json({ userId, monthStart, totalSpentUSD: total });
});

module.exports = router;
