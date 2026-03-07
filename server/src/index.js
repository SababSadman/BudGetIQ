require('dotenv').config();
const express = require('express');
const cors = require('cors');

const currencyRoutes = require('./routes/currency');
const transactionRoutes = require('./routes/transactions');

// Start cron jobs
require('./services/cron');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/currency', currencyRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => console.log(`🚀 BudGetIQ server running on port ${PORT}`));
