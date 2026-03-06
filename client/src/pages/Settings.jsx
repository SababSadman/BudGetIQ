import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BDT'];
const EMOJIS = ['🍜', '🚌', '🎮', '💊', '🛍️', '💡', '☕', '🥗', '✈️', '📚', '🏋️', '🎵', '💻', '🐶', '🏠', '👗', '🎁', '🍕'];
const COLORS = ['#f97316', '#3b82f6', '#a855f7', '#22c55e', '#ec4899', '#eab308', '#06b6d4', '#ef4444', '#8b5cf6', '#14b8a6'];

export default function Settings() {
    const { currency, setCurrency, budgetLimit, setBudgetLimit, categories, addCategory, removeCategory } = useAppStore();

    const [budget, setBudget] = useState(String(budgetLimit));
    const [saved, setSaved] = useState(false);

    const [newCat, setNewCat] = useState({ name: '', icon: '💸', color: COLORS[0] });

    const handleSave = () => {
        setBudgetLimit(parseFloat(budget) || 0);
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
    };

    const handleAddCat = () => {
        if (!newCat.name.trim()) return;
        addCategory({ ...newCat, user_id: null, parent_id: null });
        setNewCat({ name: '', icon: '💸', color: COLORS[0] });
    };

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1.25rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem' }}>Settings</h1>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Manage your budget, currency, and categories.</p>
            </motion.div>

            {/* Budget & Currency */}
            <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}
                className="glass"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Preferences</h2>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Primary Currency
                    </label>
                    <select
                        className="input"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                    >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Monthly Budget Limit ({currency})
                    </label>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        step="10"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        The 3D zen sphere reacts to how close you are to this limit.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    style={{ alignSelf: 'flex-start' }}
                >
                    <Save size={14} />
                    {saved ? 'Saved ✓' : 'Save Changes'}
                </button>
            </motion.div>

            {/* Categories */}
            <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
                className="glass"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Categories</h2>

                {/* Add new */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Emoji picker */}
                    <select
                        value={newCat.icon}
                        onChange={e => setNewCat(c => ({ ...c, icon: e.target.value }))}
                        className="input"
                        style={{ width: 70 }}
                    >
                        {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>

                    <input
                        className="input"
                        type="text"
                        placeholder="Category name"
                        value={newCat.name}
                        onChange={e => setNewCat(c => ({ ...c, name: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddCat()}
                        style={{ flex: 1, minWidth: 140 }}
                    />

                    {/* Color swatches */}
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {COLORS.map(col => (
                            <button
                                key={col}
                                onClick={() => setNewCat(c => ({ ...c, color: col }))}
                                style={{
                                    width: 20, height: 20, borderRadius: '50%', background: col,
                                    border: newCat.color === col ? '2px solid white' : '2px solid transparent',
                                    cursor: 'pointer', outline: 'none',
                                    boxShadow: newCat.color === col ? `0 0 0 2px ${col}` : 'none',
                                }}
                            />
                        ))}
                    </div>

                    <button className="btn btn-primary" onClick={handleAddCat} style={{ padding: '0.55rem 0.85rem' }}>
                        <Plus size={15} />
                    </button>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {categories.map(cat => (
                        <div key={cat.id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.65rem',
                            padding: '0.55rem 0.75rem',
                            background: 'var(--bg-glass)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: `${cat.color}22`, border: `1px solid ${cat.color}44`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
                            }}>
                                {cat.icon}
                            </div>
                            <span style={{ flex: 1, fontSize: '0.88rem' }}>{cat.name}</span>
                            {cat.parent_id && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>sub-category</span>
                            )}
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                            <button
                                onClick={() => removeCategory(cat.id)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-muted)', display: 'flex', padding: '0.2rem',
                                    transition: 'color 0.15s', borderRadius: 4,
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
