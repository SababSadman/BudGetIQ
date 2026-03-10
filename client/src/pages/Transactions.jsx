import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import TransactionList from '../components/TransactionList';

export default function Transactions() {
    const { transactions, categories, currency, convertToBase } = useAppStore();
    const [search, setSearch] = useState('');
    const [catFilter, setCat] = useState('');
    const [sort, setSort] = useState('newest');

    const filtered = transactions
        .filter(t => {
            const matchText = search === '' || t.description.toLowerCase().includes(search.toLowerCase());
            const matchCat = catFilter === '' || t.category_id === catFilter;
            return matchText && matchCat;
        })
        .sort((a, b) => {
            if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
            if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            if (sort === 'highest') return convertToBase(b.amount, b.currency) - convertToBase(a.amount, a.currency);
            if (sort === 'lowest') return convertToBase(a.amount, a.currency) - convertToBase(b.amount, b.currency);
            return 0;
        });

    const totalFiltered = filtered.reduce((s, t) => s + convertToBase(t.amount, t.currency), 0);

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem' }}>Transactions</h1>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                    {' '}· Total: {currency} {totalFiltered.toFixed(2)}
                </p>

                {/* Filters */}
                <div className="transactions-filters">
                    <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                        <Search size={14} style={{
                            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-muted)', pointerEvents: 'none',
                        }} />
                        <input
                            className="input"
                            type="text"
                            placeholder="Search transactions…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.2rem' }}
                        />
                    </div>

                    <select
                        className="input"
                        value={catFilter}
                        onChange={e => setCat(e.target.value)}
                        style={{ width: 'auto', minWidth: 140 }}
                    >
                        <option value="">All categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                    </select>

                    <select
                        className="input"
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                        style={{ width: 'auto', minWidth: 130 }}
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="highest">Highest amount</option>
                        <option value="lowest">Lowest amount</option>
                    </select>
                </div>

                {/* List */}
                <div className="glass" style={{ padding: '1rem' }}>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No transactions match your filters.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {filtered.map((tx, i) => {
                                const cat = categories.find(c => c.id === tx.category_id);
                                const amt = convertToBase(tx.amount, tx.currency);
                                return (
                                    <div key={tx.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.7rem 0.75rem',
                                        background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                            background: cat ? `${cat.color}22` : 'var(--bg-glass)',
                                            border: `1px solid ${cat?.color || 'var(--border)'}44`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                                        }}>
                                            {cat?.icon || '💳'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 500, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {tx.description}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                                                {cat?.name || '—'} · {new Date(tx.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.92rem', flexShrink: 0 }}>
                                            -{currency} {amt.toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
