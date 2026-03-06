import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

function formatDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TransactionList({ limit }) {
    const { transactions, categories, removeTransaction, currency, convertToBase } = useAppStore();

    const sorted = [...transactions]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);

    if (sorted.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No transactions yet. Press <kbd style={{
                    background: 'var(--bg-glass)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '0.1rem 0.4rem', fontSize: '0.78rem'
                }}>Ctrl+K</kbd> to add one.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <AnimatePresence initial={false}>
                {sorted.map((tx, i) => {
                    const cat = categories.find(c => c.id === tx.category_id);
                    const convertedAmount = convertToBase(tx.amount, tx.currency);
                    return (
                        <motion.div
                            key={tx.id}
                            layout
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, height: 0 }}
                            transition={{ duration: 0.22, delay: i * 0.03 }}
                            className="glass--hover"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.7rem 0.9rem',
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: cat ? `${cat.color}22` : 'var(--bg-glass)',
                                border: `1px solid ${cat?.color || 'var(--border)'}44`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1rem', flexShrink: 0,
                            }}>
                                {cat?.icon || '💳'}
                            </div>

                            {/* Details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {tx.description}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.1rem' }}>
                                    {cat && (
                                        <span style={{ fontSize: '0.72rem', color: cat.color }}>
                                            {cat.name}
                                        </span>
                                    )}
                                    {tx.is_recurring && (
                                        <RefreshCw size={10} color="var(--text-muted)" />
                                    )}
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        {formatDate(tx.created_at)}
                                    </span>
                                </div>
                            </div>

                            {/* Amount */}
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--danger)' }}>
                                    -{currency} {convertedAmount.toFixed(2)}
                                </div>
                                {tx.currency !== currency && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {tx.currency} {tx.amount.toFixed(2)}
                                    </div>
                                )}
                            </div>

                            {/* Delete */}
                            <button
                                onClick={() => removeTransaction(tx.id)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-muted)', padding: '0.25rem',
                                    borderRadius: 6, display: 'flex', alignItems: 'center',
                                    flexShrink: 0, transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
