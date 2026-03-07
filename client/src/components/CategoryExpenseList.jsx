import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function CategoryExpenseList() {
    const { categories, transactions, addTransaction, editTransaction, removeTransaction, currency, convertToBase } = useAppStore();
    const [expandedCat, setExpandedCat] = useState(null);

    // Filter out categories that are sub-categories (we map top levels)
    const topLevelCats = categories.filter(c => !c.parent_id);

    // Derived state for category totals
    const catTotals = {};
    topLevelCats.forEach(cat => {
        catTotals[cat.id] = 0;
    });

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const validTx = transactions.filter(t => new Date(t.created_at) >= currentMonthStart);

    validTx.forEach(tx => {
        if (catTotals[tx.category_id] !== undefined) {
            catTotals[tx.category_id] += convertToBase(tx.amount, tx.currency);
        }
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category Expenses</h2>

            {topLevelCats.map(cat => {
                const total = catTotals[cat.id];
                const catTxs = validTx.filter(t => t.category_id === cat.id);
                const isExpanded = expandedCat === cat.id;

                return (
                    <div key={cat.id} className="glass" style={{ overflow: 'hidden' }}>
                        {/* Header Box */}
                        <div
                            onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.85rem 1rem', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    background: `${cat.color}22`, border: `1px solid ${cat.color}44`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {cat.icon}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {currency} {total.toFixed(2)}
                                </span>
                                {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                            </div>
                        </div>

                        {/* Collapsible Content */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ borderTop: '1px solid var(--border)' }}
                                >
                                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {catTxs.length === 0 ? (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No expenses yet.</p>
                                        ) : (
                                            catTxs.map(tx => (
                                                <SubExpenseItem
                                                    key={tx.id}
                                                    tx={tx}
                                                    currency={currency}
                                                    editTransaction={editTransaction}
                                                    removeTransaction={removeTransaction}
                                                />
                                            ))
                                        )}

                                        <AddSubExpenseForm catId={cat.id} addTransaction={addTransaction} currency={currency} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}

function SubExpenseItem({ tx, currency, editTransaction, removeTransaction }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editDesc, setEditDesc] = useState(tx.description);
    const [editAmt, setEditAmt] = useState(String(tx.amount));
    // Provide a default fallback to today if created_at is somehow missing
    const [editDate, setEditDate] = useState(() => (tx.created_at ? new Date(tx.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));

    const handleSave = () => {
        const amt = parseFloat(editAmt);
        if (amt > 0 && editDesc.trim()) {
            editTransaction(tx.id, {
                description: editDesc.trim(),
                amount: amt,
                created_at: new Date(editDate).toISOString()
            });
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-glass)', padding: '0.5rem', borderRadius: 8 }}>
                <input
                    className="input"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    style={{ flex: 1, padding: '0.4rem' }}
                    placeholder="Name (e.g. Burger)"
                />
                <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={editAmt}
                    onChange={e => setEditAmt(e.target.value)}
                    style={{ width: 80, padding: '0.4rem' }}
                    placeholder="Amt"
                />
                <input
                    className="input"
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    style={{ width: 130, padding: '0.4rem', color: editDate ? 'var(--text-primary)' : 'var(--text-muted)' }}
                />
                <button className="btn" onClick={handleSave} style={{ padding: '0.4rem', background: 'var(--accent)', color: 'white' }}>
                    <Check size={14} />
                </button>
                <button className="btn" onClick={() => setIsEditing(false)} style={{ padding: '0.4rem' }}>
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.5rem 0.75rem', background: 'var(--bg-glass)',
            border: '1px solid var(--border)', borderRadius: 8
        }}>
            <span style={{ fontSize: '0.85rem' }}>{tx.description}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{currency} {tx.amount.toFixed(2)}</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        <Edit2 size={13} />
                    </button>
                    <button
                        onClick={() => removeTransaction(tx.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddSubExpenseForm({ catId, addTransaction, currency }) {
    const [desc, setDesc] = useState('');
    const [amt, setAmt] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        const numAmt = parseFloat(amt);
        if (!desc.trim() || isNaN(numAmt) || numAmt <= 0) return;

        setLoading(true);
        await addTransaction({
            description: desc.trim(),
            amount: numAmt,
            currency: currency,
            category_id: catId,
            created_at: new Date(date).toISOString() // Use selected date
        });
        setDesc('');
        setAmt('');
        setDate(new Date().toISOString().split('T')[0]); // Reset date back to today
        setLoading(false);
    };

    return (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <input
                className="input"
                placeholder="New sub-expense..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                style={{ flex: 1, padding: '0.5rem' }}
            />
            <input
                className="input"
                type="number"
                placeholder="Amount"
                step="0.01"
                value={amt}
                onChange={e => setAmt(e.target.value)}
                style={{ width: 90, padding: '0.5rem' }}
            />
            <input
                className="input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: 130, padding: '0.5rem', color: date ? 'var(--text-primary)' : 'var(--text-muted)' }}
            />
            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !desc.trim() || !amt.trim() || !date}
                style={{ padding: '0.5rem 0.75rem' }}
            >
                <Plus size={16} />
            </button>
        </form>
    );
}
