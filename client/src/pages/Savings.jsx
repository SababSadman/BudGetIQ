import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Target, Calendar } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

function SavingsCard({ title, icon: Icon, budget, spent, currency, delay = 0, isEditing, editValue, onEditChange }) {
    const saved = budget - spent;
    const progress = Math.min(100, Math.max(0, (spent / budget) * 100));
    const isOverBudget = spent > budget;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45 }}
            className="glass"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'var(--accent-glow)', border: '1px solid var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--accent)'
                    }}>
                        <Icon size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BUDGET</div>
                    {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currency}</span>
                            <input
                                className="input"
                                type="number"
                                step="10"
                                value={editValue}
                                onChange={e => onEditChange(e.target.value)}
                                style={{ padding: '0.2rem 0.4rem', width: '80px', fontSize: '1rem', fontWeight: 600, height: 'auto', background: 'var(--bg-deep)' }}
                            />
                        </div>
                    ) : (
                        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{currency} {budget.toFixed(2)}</div>
                    )}
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SPENT</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: isOverBudget ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {currency} {spent.toFixed(2)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SAVED</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isOverBudget ? 'var(--danger)' : 'var(--success)' }}>
                        {currency} {saved.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                    <span>{progress.toFixed(0)}% Utilized</span>
                    <span>{currency} {budget} Limit</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--bg-glass)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: delay + 0.2 }}
                        style={{ height: '100%', background: isOverBudget ? 'var(--danger)' : 'var(--accent)', borderRadius: 4 }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

export default function Savings() {
    const { transactions, budgetLimit, setBudgetLimit, weeklyBudgetLimit, setWeeklyBudgetLimit, currency, convertToBase } = useAppStore();

    // Default to budget / 4.33 if weeklyBudgetLimit is undefined
    const currentWeeklyBudget = weeklyBudgetLimit || (budgetLimit / 4.33);

    const [isEditing, setIsEditing] = useState(false);
    const [editMonthly, setEditMonthly] = useState(String(budgetLimit));
    const [editWeekly, setEditWeekly] = useState(String(currentWeeklyBudget.toFixed(2)));

    const handleSave = () => {
        setBudgetLimit(parseFloat(editMonthly) || 0);
        setWeeklyBudgetLimit(parseFloat(editWeekly) || 0);
        setIsEditing(false);
    };

    // Calculate metrics
    const { weeklySpend, monthlySpend } = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let wSpend = 0;
        let mSpend = 0;

        transactions.forEach(t => {
            const date = new Date(t.created_at);
            const amt = convertToBase(t.amount, t.currency);

            if (date >= startOfMonth) mSpend += amt;
            if (date >= startOfWeek) wSpend += amt;
        });

        return { weeklySpend: wSpend, monthlySpend: mSpend };
    }, [transactions, convertToBase]);

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Savings Overview</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track your unspent budget over time</p>
                </div>
                <button
                    className="btn btn-ghost"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                    {isEditing ? 'Save Budgets ✓' : 'Edit Budgets'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                <SavingsCard
                    title="Weekly Overview"
                    icon={Calendar}
                    budget={currentWeeklyBudget}
                    spent={weeklySpend}
                    currency={currency}
                    delay={0.1}
                    isEditing={isEditing}
                    editValue={editWeekly}
                    onEditChange={setEditWeekly}
                />

                <SavingsCard
                    title="Monthly Overview"
                    icon={Target}
                    budget={budgetLimit}
                    spent={monthlySpend}
                    currency={currency}
                    delay={0.2}
                    isEditing={isEditing}
                    editValue={editMonthly}
                    onEditChange={setEditMonthly}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.45 }}
                className="glass"
                style={{ padding: '1.5rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(74, 222, 128, 0.05)' }}
            >
                <PiggyBank size={32} color="var(--success)" />
                <div>
                    <h3 style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--success)' }}>Keep it up!</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Consistent saving helps you reach your financial goals faster. Your total monthly savings potential is <strong style={{ color: 'var(--text-primary)' }}>{currency} {budgetLimit.toFixed(2)}</strong>.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
