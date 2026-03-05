const express = require('express');
const router = express.Router();

// In-memory cache (5 minute TTL)
let rateCache = { rates: null, updatedAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * GET /api/currency/rates?base=USD
 * Returns exchange rates for common currencies.
 * Uses FreeCurrencyAPI if CURRENCY_API_KEY is set, otherwise returns mock rates.
 */
router.get('/rates', async (req, res) => {
    const base = (req.query.base || 'USD').toUpperCase();

    const now = Date.now();
    if (rateCache.rates && now - rateCache.updatedAt < CACHE_TTL_MS) {
        return res.json({ base, rates: rateCache.rates, cached: true });
    }

    const apiKey = process.env.CURRENCY_API_KEY;

    if (!apiKey) {
        // Return realistic mock rates so the app is usable without a key
        const mockRates = {
            USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36,
            AUD: 1.53, CHF: 0.89, CNY: 7.24, INR: 83.1, BDT: 110.5,
        };
        return res.json({ base: 'USD', rates: mockRates, cached: false, mock: true });
    }

    try {
        const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${base}`;
        const response = await fetch(url);
        const data = await response.json();

        rateCache = { rates: data.data, updatedAt: Date.now() };
        res.json({ base, rates: data.data, cached: false });
    } catch (err) {
        console.error('Currency API error:', err.message);
        res.status(502).json({ error: 'Failed to fetch exchange rates' });
    }
});

module.exports = router;
