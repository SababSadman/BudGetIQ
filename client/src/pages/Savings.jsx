import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Target, Calendar, Lock, Unlock } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

// Returns today's midnight, this week's Monday midnight, and this month's 1st midnight
function getPeriodStarts() {
    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const dow = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dayStart, weekStart, monthStart };
}

function SavingsCard({ title, icon: Icon, budget, spent, currency, delay = 0, canEdit, editValue, onEditChange, onSave }) {
    const saved = budget - spent;
    const progress = Math.min(100, Math.max(0, (spent / budget) * 100));
    const isOverBudget = spent > budget;
    const [editing, setEditing] = useState(false);

    const handleSave = () => {
        onSave(parseFloat(editValue) || 0);
        setEditing(false);
    };

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
                {/* Lock / Edit controls */}
                {canEdit ? (
                    editing ? (
                        <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }} onClick={handleSave}>
                            Save ✓
                        </button>
                    ) : (
                        <button
                            className="btn btn-ghost"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            onClick={() => setEditing(true)}
                        >
                            <Unlock size={13} /> Edit Budget
                        </button>
                    )
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Lock size={12} /> Locked until reset
                    </div>
                )}
            </div>

            <div className="stats-inner-grid">
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BUDGET</div>
                    {editing ? (
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
                        {saved < 0 ? '−' : ''}{currency} {Math.abs(saved).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                    <span>{progress.toFixed(0)}% Utilized</span>
                    <span>{currency} {budget.toFixed(2)} Limit</span>
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
    const { transactions, budgetLimit, setBudgetLimit, weeklyBudgetLimit, setWeeklyBudgetLimit, dailyBudgetLimit, setDailyBudgetLimit, currency, convertToBase } = useAppStore();

    const currentWeeklyBudget = weeklyBudgetLimit || (budgetLimit / 4.33);
    const currentDailyBudget = dailyBudgetLimit || (budgetLimit / 30);

    const [editMonthly, setEditMonthly] = useState(String(budgetLimit));
    const [editWeekly, setEditWeekly] = useState(String(currentWeeklyBudget.toFixed(2)));
    const [editDaily, setEditDaily] = useState(String(currentDailyBudget.toFixed(2)));

    // Calculate metrics and per-period edit lock
    const { dailySpend, weeklySpend, monthlySpend, canEditDaily, canEditWeekly, canEditMonthly } = useMemo(() => {
        const { dayStart, weekStart, monthStart } = getPeriodStarts();
        let dSpend = 0, wSpend = 0, mSpend = 0;

        transactions.forEach(t => {
            const date = new Date(t.created_at);
            const amt = convertToBase(t.amount, t.currency);
            if (date >= monthStart) mSpend += amt;
            if (date >= weekStart) wSpend += amt;
            if (date >= dayStart) dSpend += amt;
        });

        // Unlock editing only if no spend has happened yet in the period (fresh reset)
        return {
            dailySpend: dSpend, weeklySpend: wSpend, monthlySpend: mSpend,
            canEditDaily: dSpend === 0,
            canEditWeekly: wSpend === 0,
            canEditMonthly: mSpend === 0,
        };
    }, [transactions, convertToBase]);

    const monthlySaved = budgetLimit - monthlySpend;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Savings Overview</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Budgets lock once spending starts — editable only after a period reset.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                <SavingsCard
                    title="Daily Overview" icon={Target}
                    budget={currentDailyBudget} spent={dailySpend} currency={currency}
                    delay={0.05} canEdit={canEditDaily}
                    editValue={editDaily} onEditChange={setEditDaily} onSave={setDailyBudgetLimit}
                />
                <SavingsCard
                    title="Weekly Overview" icon={Calendar}
                    budget={currentWeeklyBudget} spent={weeklySpend} currency={currency}
                    delay={0.1} canEdit={canEditWeekly}
                    editValue={editWeekly} onEditChange={setEditWeekly} onSave={setWeeklyBudgetLimit}
                />
                <SavingsCard
                    title="Monthly Overview" icon={Target}
                    budget={budgetLimit} spent={monthlySpend} currency={currency}
                    delay={0.2} canEdit={canEditMonthly}
                    editValue={editMonthly} onEditChange={setEditMonthly} onSave={setBudgetLimit}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.45 }}
                className="glass"
                style={{
                    padding: '1.5rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem',
                    background: monthlySaved >= 0 ? 'rgba(74, 222, 128, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                }}
            >
                <PiggyBank size={32} color={monthlySaved >= 0 ? 'var(--success)' : 'var(--danger)'} />
                <div>
                    <h3 style={{ fontWeight: 600, fontSize: '1.05rem', color: monthlySaved >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {monthlySaved >= 0 ? 'Keep it up!' : 'Over Budget!'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {monthlySaved >= 0
                            ? <>{`Monthly savings so far: `}<strong style={{ color: 'var(--text-primary)' }}>{currency} {monthlySaved.toFixed(2)}</strong></>
                            : <>{`You are `}<strong style={{ color: 'var(--danger)' }}>{currency} {Math.abs(monthlySaved).toFixed(2)}</strong>{` over your monthly budget.`}</>
                        }
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
