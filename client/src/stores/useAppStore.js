import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, hasSupabase } from '../lib/supabase';

// ─── Mock/demo seed data ──────────────────────────────────────────────────────
const DEMO_CATEGORIES = [
    { id: 'cat-1', name: 'Food & Drink', icon: '🍜', color: '#f97316', parent_id: null },
    { id: 'cat-2', name: 'Transport', icon: '🚌', color: '#3b82f6', parent_id: null },
    { id: 'cat-3', name: 'Entertainment', icon: '🎮', color: '#a855f7', parent_id: null },
    { id: 'cat-4', name: 'Health', icon: '💊', color: '#22c55e', parent_id: null },
    { id: 'cat-5', name: 'Shopping', icon: '🛍️', color: '#ec4899', parent_id: null },
    { id: 'cat-6', name: 'Utilities', icon: '💡', color: '#eab308', parent_id: null },
    { id: 'cat-7', name: 'Coffee', icon: '☕', color: '#a16207', parent_id: 'cat-1' },
    { id: 'cat-8', name: 'Lunch', icon: '🥗', color: '#16a34a', parent_id: 'cat-1' },
];

const DEMO_TRANSACTIONS = [
    { id: 't-1', description: 'Morning Coffee', amount: 4.50, currency: 'USD', category_id: 'cat-7', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), is_recurring: false },
    { id: 't-2', description: 'Lunch', amount: 12.80, currency: 'USD', category_id: 'cat-8', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), is_recurring: false },
    { id: 't-3', description: 'Bus Pass', amount: 30.00, currency: 'USD', category_id: 'cat-2', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), is_recurring: true },
    { id: 't-4', description: 'Netflix', amount: 15.99, currency: 'USD', category_id: 'cat-3', created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), is_recurring: true },
    { id: 't-5', description: 'Groceries', amount: 54.20, currency: 'USD', category_id: 'cat-5', created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), is_recurring: false },
    { id: 't-6', description: 'Gym', amount: 25.00, currency: 'USD', category_id: 'cat-4', created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), is_recurring: true },
];

// ─── Exchange rates (updated via server) ─────────────────────────────────────
const DEFAULT_RATES = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36,
    AUD: 1.53, CHF: 0.89, CNY: 7.24, INR: 83.1, BDT: 110.5,
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create(
    persist(
        (set, get) => ({
            // ── Session Sync (Run once on App mount) ───────────────────────────
            initialize: () => {
                if (!hasSupabase) return;

                // 1. Sync initial session
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session) {
                        set({
                            user: {
                                id: session.user.id,
                                email: session.user.email,
                                display_name: session.user.user_metadata?.display_name || session.user.email.split('@')[0]
                            }
                        });
                        get().loadCategories();
                        get().loadTransactions();
                    } else {
                        set({ user: null });
                    }
                });

                // 2. Listen for auth changes
                supabase.auth.onAuthStateChange((_event, session) => {
                    if (session) {
                        set({
                            user: {
                                id: session.user.id,
                                email: session.user.email,
                                display_name: session.user.user_metadata?.display_name || session.user.email.split('@')[0]
                            }
                        });
                        get().loadCategories();
                        get().loadTransactions();
                    } else {
                        set({ user: null, transactions: [], categories: [] });
                    }
                });
            },

            signIn: async (email, password) => {
                if (!hasSupabase) {
                    console.error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
                    return { error: { message: 'Database connection missing. Please configure environment variables.' } };
                }

                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) {
                        console.error('Login error:', error.message);
                        return { error };
                    }

                    if (data?.user) {
                        set({ user: { id: data.user.id, email: data.user.email, display_name: data.user.user_metadata?.display_name || email.split('@')[0] } });
                        // Load user data immediately after success
                        await get().loadCategories();
                        await get().loadTransactions();
                    }
                    return { error: null };
                } catch (err) {
                    return { error: { message: 'Network or configuration error' } };
                }
            },

            signUp: async (email, password, displayName) => {
                if (!hasSupabase) {
                    console.error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
                    return { error: { message: 'Database connection missing. Please configure environment variables.' } };
                }
                const { data, error } = await supabase.auth.signUp({
                    email, password,
                    options: { data: { display_name: displayName } },
                });
                if (error) return { error };
                if (data?.user) {
                    set({ user: { id: data.user.id, email: data.user.email, display_name: displayName }, isNewUser: true });
                }
                return { error: null };
            },

            signOut: async () => {
                if (hasSupabase) await supabase.auth.signOut();
                set({ user: null, transactions: [], categories: [], isNewUser: false });
            },

            // ── Profile ───────────────────────────────────────────────────────────
            currency: 'USD',
            budgetLimit: 1000,
            setCurrency: (c) => set({ currency: c }),
            setBudgetLimit: (l) => set({ budgetLimit: Number(l) }),

            // ── Exchange rates ────────────────────────────────────────────────────
            rates: DEFAULT_RATES,
            setRates: (r) => set({ rates: r }),

            convertToBase: (amount, fromCurrency) => {
                const { rates, currency } = get();
                const inUSD = amount / (rates[fromCurrency] || 1);
                return inUSD * (rates[currency] || 1);
            },

            // ── Categories ────────────────────────────────────────────────────────
            categories: [],

            loadCategories: async () => {
                const { user } = get();
                if (!hasSupabase || !user) {
                    if (!user) set({ categories: DEMO_CATEGORIES });
                    return;
                }
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at');

                if (!error && data?.length) {
                    set({ categories: data });
                } else if (!error && data?.length === 0) {
                    // Fallback to demo if user has no cats yet (trigger might be slow)
                    set({ categories: DEMO_CATEGORIES });
                }
            },

            addCategory: async (cat) => {
                const { user, categories } = get();
                const tempId = `temp-${Date.now()}`;
                const newCat = { ...cat, id: tempId, user_id: user?.id };

                set({ categories: [...categories, newCat] });

                if (hasSupabase && user) {
                    const { data, error } = await supabase
                        .from('categories')
                        .insert({ ...cat, user_id: user.id })
                        .select()
                        .single();
                    if (!error && data) {
                        set(s => ({
                            categories: s.categories.map(c => c.id === tempId ? data : c)
                        }));
                    }
                }
            },

            // ── Transactions ──────────────────────────────────────────────────────
            transactions: [],

            loadTransactions: async () => {
                const { user } = get();
                if (!hasSupabase || !user) {
                    if (!user) set({ transactions: DEMO_TRANSACTIONS });
                    return;
                }
                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);

                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (!error && data) set({ transactions: data });
            },

            addTransaction: async (tx) => {
                const { user, transactions, categories } = get();

                // Ensure category_id is a valid UUID if using Supabase
                // If the provided ID doesn't exist in our current categories list (e.g. demo ID 'cat-1'),
                // we try to find a matching category name in the actual database categories.
                let finalCategoryId = tx.category_id;

                if (hasSupabase && user && tx.category_id?.startsWith('cat-')) {
                    const demoCat = DEMO_CATEGORIES.find(c => c.id === tx.category_id);
                    const realCat = categories.find(c => c.name === demoCat?.name);
                    finalCategoryId = realCat?.id || null;
                }

                const newTx = {
                    id: `temp-${Date.now()}`,
                    user_id: user?.id,
                    created_at: new Date().toISOString(),
                    is_recurring: false,
                    ...tx,
                    category_id: finalCategoryId
                };

                // Optimistic update
                set({ transactions: [newTx, ...transactions] });

                if (hasSupabase && user) {
                    const { data, error } = await supabase
                        .from('transactions')
                        .insert({
                            amount: tx.amount,
                            currency: tx.currency,
                            description: tx.description,
                            category_id: finalCategoryId,
                            user_id: user.id
                        })
                        .select()
                        .single();

                    if (error) {
                        console.error('Supabase insert error:', error.message);
                        // Optional: Rollback optimistic update on error
                        return { error };
                    }

                    if (data) {
                        set(s => ({
                            transactions: s.transactions.map(t => t.id === newTx.id ? data : t),
                        }));
                    }
                }
                return { data: newTx, error: null };
            },

            removeTransaction: async (id) => {
                set(s => ({ transactions: s.transactions.filter(t => t.id !== id) }));
                if (hasSupabase) {
                    await supabase.from('transactions').delete().eq('id', id);
                }
            },

            // ── Derived / Computed ────────────────────────────────────────────────
            getMonthlySpend: () => {
                const { transactions, convertToBase } = get();
                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);
                return transactions
                    .filter(t => new Date(t.created_at) >= monthStart)
                    .reduce((sum, t) => sum + convertToBase(t.amount, t.currency), 0);
            },

            getSpendByCategory: () => {
                const { transactions, convertToBase, categories } = get();
                const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
                const map = {};
                transactions
                    .filter(t => new Date(t.created_at) >= monthStart)
                    .forEach(t => {
                        const cat = categories.find(c => c.id === t.category_id);
                        const key = cat?.name || 'Other';
                        map[key] = (map[key] || 0) + convertToBase(t.amount, t.currency);
                    });
                return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
            },

            // zen score: 1.0 = perfect calm, 0.0 = blown budget
            getZenScore: () => {
                const { getMonthlySpend, budgetLimit } = get();
                if (!budgetLimit) return 1;
                return Math.max(0, 1 - getMonthlySpend() / budgetLimit);
            },

            // ── UI State ──────────────────────────────────────────────────────────
            quickAddOpen: false,
            setQuickAddOpen: (v) => set({ quickAddOpen: v }),
        }),
        {
            name: 'aura-finance-store',
            partialize: (s) => ({
                user: s.user,
                currency: s.currency,
                budgetLimit: s.budgetLimit,
                transactions: s.transactions,
                categories: s.categories,
            }),
        }
    )
);
