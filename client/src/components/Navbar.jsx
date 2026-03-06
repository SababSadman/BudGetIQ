import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, LogOut, Settings, DollarSign, LayoutDashboard, List, ChevronDown } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BDT'];

export default function Navbar({ currentPage, onNavigate }) {
    const { user, signOut, currency, setCurrency, setQuickAddOpen } = useAppStore();
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'transactions', label: 'Transactions', icon: List },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 40,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(9,9,11,0.8)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
        }}>
            {/* Logo */}
            <button
                onClick={() => onNavigate('dashboard')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0 0.5rem 0 0',
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>💸</span>
                <span className="glow-text" style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                    Aura
                </span>
            </button>

            {/* Nav items — desktop */}
            <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.75rem' }}>
                {navItems.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => onNavigate(id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            background: currentPage === id ? 'var(--bg-glass)' : 'none',
                            border: currentPage === id ? '1px solid var(--border)' : '1px solid transparent',
                            borderRadius: 'var(--radius-sm)',
                            color: currentPage === id ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontSize: '0.83rem', fontWeight: 500,
                            padding: '0.35rem 0.65rem', cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Quick add button */}
                <button
                    className="btn btn-ghost"
                    onClick={() => setQuickAddOpen(true)}
                    style={{ fontSize: '0.8rem', padding: '0.38rem 0.75rem', gap: '0.35rem' }}
                >
                    <Zap size={13} />
                    <span>Add</span>
                    <span style={{
                        fontSize: '0.68rem', color: 'var(--text-muted)',
                        background: 'var(--bg-glass)', border: '1px solid var(--border)',
                        borderRadius: 4, padding: '0.05rem 0.3rem',
                    }}>
                        ⌘K
                    </span>
                </button>

                {/* Currency picker */}
                <div style={{ position: 'relative' }}>
                    <button
                        className="btn btn-ghost"
                        onClick={() => { setCurrencyOpen(v => !v); setProfileOpen(false); }}
                        style={{ fontSize: '0.8rem', padding: '0.38rem 0.65rem' }}
                    >
                        <DollarSign size={13} />
                        {currency}
                        <ChevronDown size={11} style={{ opacity: 0.6 }} />
                    </button>
                    {currencyOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                            className="glass"
                            style={{
                                position: 'absolute', right: 0, top: '110%',
                                borderRadius: 'var(--radius-md)', padding: '0.4rem',
                                minWidth: 90, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 2,
                            }}
                        >
                            {CURRENCIES.map(c => (
                                <button
                                    key={c}
                                    onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                                    style={{
                                        background: currency === c ? 'var(--accent-glow)' : 'none',
                                        border: 'none', cursor: 'pointer', padding: '0.3rem 0.6rem',
                                        borderRadius: 'var(--radius-sm)', color: currency === c ? 'var(--accent)' : 'var(--text-secondary)',
                                        fontSize: '0.82rem', textAlign: 'left', width: '100%',
                                    }}
                                >
                                    {c}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Profile / logout */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setProfileOpen(v => !v); setCurrencyOpen(false); }}
                        style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--accent-glow)', border: '2px solid var(--accent)',
                            cursor: 'pointer', color: 'var(--accent)', fontWeight: 700,
                            fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        {user?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                    </button>
                    {profileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                            className="glass"
                            style={{
                                position: 'absolute', right: 0, top: '110%',
                                borderRadius: 'var(--radius-md)', padding: '0.5rem',
                                minWidth: 160, zIndex: 100,
                            }}
                        >
                            <div style={{ padding: '0.4rem 0.65rem', borderBottom: '1px solid var(--border)', marginBottom: '0.3rem' }}>
                                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {user?.display_name || 'User'}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    {user?.email}
                                </div>
                            </div>
                            <button
                                className="btn btn-danger"
                                onClick={signOut}
                                style={{ width: '100%', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
                            >
                                <LogOut size={13} />
                                Sign Out
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </nav>
    );
}
