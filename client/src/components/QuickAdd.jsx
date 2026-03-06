import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BDT'];

// Parses "25.50 Coffee" or "Coffee 25.50" into { amount, description }
function parseInput(raw) {
    const cleaned = raw.trim();
    const numMatch = cleaned.match(/([\d]+(?:[.,]\d+)?)/);
    if (!numMatch) return null;
    const amount = parseFloat(numMatch[1].replace(',', '.'));
    const description = cleaned.replace(numMatch[0], '').trim() || 'Expense';
    return { amount, description };
}

export default function QuickAdd() {
    const { quickAddOpen, setQuickAddOpen, addTransaction, categories, currency } = useAppStore();
    const [input, setInput] = useState('');
    const [catId, setCatId] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setQuickAddOpen(true);
            }
            if (e.key === 'Escape') setQuickAddOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [setQuickAddOpen]);

    useEffect(() => {
        if (quickAddOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setInput(''); setCatId(''); setError(''); setSuccess(false);
        }
    }, [quickAddOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const parsed = parseInput(input);
        if (!parsed || isNaN(parsed.amount) || parsed.amount <= 0) {
            setError('Try "25.50 Coffee" or "Lunch 12"');
            return;
        }
        setLoading(true);
        const { error } = await addTransaction({
            amount: parsed.amount,
            description: parsed.description,
            currency,
            category_id: catId || (categories[0]?.id || null),
        });
        setLoading(false);

        if (error) {
            setError(error.message || 'Failed to save transaction');
            return;
        }

        setSuccess(true);
        setTimeout(() => setQuickAddOpen(false), 600);
    };

    return (
        <AnimatePresence>
            {quickAddOpen && (
                <>
                    <motion.div
                        className="overlay-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setQuickAddOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -16, scale: 0.97 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="glass"
                        style={{
                            position: 'fixed', top: '18%', left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%', maxWidth: 480,
                            padding: '1.5rem', zIndex: 51,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Zap size={16} color="var(--accent)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Quick Add
                            </span>
                            <span style={{
                                marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)',
                                background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
                            }}>
                                ESC
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input
                                ref={inputRef}
                                className="input"
                                type="text"
                                placeholder='e.g. "25.50 Coffee" or "Lunch 12"'
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                style={{ fontSize: '1.05rem', padding: '0.85rem 1rem' }}
                            />

                            <select
                                className="input"
                                value={catId}
                                onChange={e => setCatId(e.target.value)}
                                style={{ color: catId ? 'var(--text-primary)' : 'var(--text-muted)' }}
                            >
                                <option value="">Pick a category (optional)</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                ))}
                            </select>

                            {error && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--danger)', paddingLeft: '0.2rem' }}>{error}</p>
                            )}

                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={loading || success || !input.trim()}
                                style={{ fontSize: '0.95rem', padding: '0.8rem' }}
                            >
                                {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                                {success ? '✓ Added!' : loading ? 'Adding…' : 'Add Expense ↵'}
                            </button>
                        </form>

                        <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Press <kbd style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 4, padding: '0.05rem 0.35rem' }}>Ctrl+K</kbd> anytime to open
                        </p>
                    </motion.div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </>
            )}
        </AnimatePresence>
    );
}
