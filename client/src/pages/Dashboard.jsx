import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingDown, Layers } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import ThreeCanvas from '../components/ThreeCanvas';
import TransactionList from '../components/TransactionList';
import BudgetRing from '../components/BudgetRing';
import CategoryChart from '../components/CategoryChart';
import CategoryExpenseList from '../components/CategoryExpenseList';
import CalendarWidget from '../components/CalendarWidget';

function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="glass glass--hover"
            style={{ padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}
        >
            <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
            }}>
                <Icon size={18} />
            </div>
            <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                    {label}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.1 }}>{value}</div>
                {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
            </div>
        </motion.div>
    );
}

export default function Dashboard({ onNavigate }) {
    const { getMonthlySpend, budgetLimit, currency, transactions, getSpendByCategory, setQuickAddOpen, loadTransactions, loadCategories } = useAppStore();

    useEffect(() => {
        loadTransactions();
        loadCategories();
    }, []);

    const spent = getMonthlySpend();
    const topCats = getSpendByCategory().slice(0, 3);

    return (
        <div style={{
            maxWidth: 1100, margin: '0 auto',
            padding: '1.5rem 1.25rem 3rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) 340px',
            gap: '1.25rem',
        }}>
            {/* ── Left column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
                    <StatCard
                        label="MONTHLY SPEND" icon={TrendingDown} color="var(--danger)" delay={0.05}
                        value={`${currency} ${spent.toFixed(2)}`}
                        sub={`of ${currency} ${budgetLimit}`}
                    />
                    <StatCard
                        label="TRANSACTIONS" icon={Layers} color="var(--accent)" delay={0.1}
                        value={transactions.length}
                        sub="this month"
                    />
                    <StatCard
                        label="TOP CATEGORY" icon={Zap} color="var(--warning)" delay={0.15}
                        value={topCats[0]?.name || '—'}
                        sub={topCats[0] ? `${currency} ${topCats[0].total.toFixed(2)}` : 'No data'}
                    />
                </div>

                {/* Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="glass"
                    style={{ padding: '1.25rem', flex: 1 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Recent Transactions</h2>
                        <button
                            onClick={() => onNavigate('transactions')}
                            style={{ fontSize: '0.78rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            See all →
                        </button>
                    </div>
                    <TransactionList limit={4} />
                </motion.div>

                {/* Category Sub-Expense section */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="glass"
                    style={{ padding: '1.25rem', flex: 1 }}
                >
                    <CategoryExpenseList />
                </motion.div>
            </div>

            {/* ── Right column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* 3D Canvas */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="glass"
                    style={{ height: 280, position: 'relative', overflow: 'hidden' }}
                >
                    <ThreeCanvas />
                </motion.div>

                {/* Budget ring */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.45 }}
                    className="glass"
                    style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                >
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 600, alignSelf: 'flex-start' }}>Monthly Budget</h2>
                    <BudgetRing size={160} />

                    {/* Category breakdown Chart */}
                    <div style={{ width: '100%', marginTop: '0.5rem' }}>
                        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Spending by Category</h3>
                        <CategoryChart />
                    </div>
                </motion.div>

                {/* Calendar */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.45 }}
                    className="glass"
                    style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}
                >
                    <CalendarWidget />
                </motion.div>

                {/* Quick add CTA */}
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                    className="btn btn-primary"
                    onClick={() => setQuickAddOpen(true)}
                    style={{ padding: '0.9rem', fontSize: '0.9rem' }}
                >
                    <Zap size={16} />
                    Quick Add  ⌘K
                </motion.button>
            </div>
        </div>
    );
}
