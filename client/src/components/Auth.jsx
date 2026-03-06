import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function Auth() {
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [dir, setDir] = useState(1);
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAppStore();

    const switchMode = (next) => {
        setDir(next === 'signup' ? 1 : -1);
        setMode(next);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = mode === 'login'
            ? await signIn(form.email, form.password)
            : await signUp(form.email, form.password, form.name);

        setLoading(false);
        if (result.error) setError(result.error.message || 'Something went wrong.');
    };

    return (
        <div className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient background blobs */}
            <div style={{
                position: 'absolute', width: 480, height: 480,
                borderRadius: '50%', top: '-10%', left: '-10%',
                background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)',
                filter: 'blur(60px)', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', width: 320, height: 320,
                borderRadius: '50%', bottom: '5%', right: '5%',
                background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)',
                filter: 'blur(50px)', pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass"
                style={{ width: '100%', maxWidth: 420, padding: '2.5rem' }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💸</div>
                    <h1 className="glow-text" style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
                        Aura Finance
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Your minimalist money companion
                    </p>
                </div>

                {/* Tab switcher */}
                <div style={{
                    display: 'flex', background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-md)', padding: 4,
                    marginBottom: '1.75rem', border: '1px solid var(--border)',
                }}>
                    {['login', 'signup'].map(m => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className="btn"
                            style={{
                                flex: 1, padding: '0.5rem',
                                background: mode === m ? 'var(--accent)' : 'transparent',
                                color: mode === m ? '#09090b' : 'var(--text-secondary)',
                                fontSize: '0.85rem', border: 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            {m === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <AnimatePresence mode="wait" custom={dir}>
                    <motion.form
                        key={mode}
                        custom={dir}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        onSubmit={handleSubmit}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        {mode === 'signup' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                                    Display Name
                                </label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    required
                                    autoFocus
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                                Email
                            </label>
                            <input
                                className="input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                                autoFocus={mode === 'login'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="input"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                    style={{ paddingRight: '2.8rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    style={{
                                        position: 'absolute', right: '0.75rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                        display: 'flex', alignItems: 'center', padding: 0,
                                    }}
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                                    borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem',
                                    fontSize: '0.83rem', color: 'var(--danger)',
                                }}
                            >
                                {error}
                                {error.includes('Email not confirmed') && (
                                    <div style={{ marginTop: '0.4rem', opacity: 0.8, fontSize: '0.75rem' }}>
                                        Tip: Go to Supabase Dashboard &gt; Auth &gt; Providers &gt; Email and disable "Confirm email" to log in immediately.
                                    </div>
                                )}
                                {error.includes('Invalid login credentials') && (
                                    <div style={{ marginTop: '0.4rem', opacity: 0.8, fontSize: '0.75rem' }}>
                                        Tip: Did you delete your account? Use the <strong>Sign Up</strong> tab to recreate it.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.25rem' }}>
                            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                            {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>

                        {/* Demo hint */}
                        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <Sparkles size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            {' '}No Supabase? Enter any email/password to demo
                        </p>
                    </motion.form>
                </AnimatePresence>
            </motion.div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
