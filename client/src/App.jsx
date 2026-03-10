import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './stores/useAppStore';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import QuickAdd from './components/QuickAdd';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import Savings from './pages/Savings';

export default function App() {
  const user = useAppStore(s => s.user);
  const initialize = useAppStore(s => s.initialize);
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!user) return <Auth />;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-center" toastOptions={{
        style: { background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
      }} />
      <Navbar currentPage={page} onNavigate={setPage} />
      <main style={{ flex: 1 }}>
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'transactions' && <Transactions />}
        {page === 'savings' && <Savings />}
        {page === 'settings' && <Settings />}
      </main>
      <QuickAdd />
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted, #888)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        marginTop: 'auto',
        letterSpacing: '0.02em',
        fontWeight: 500
      }}>
        Created and Managed By Sabab Sadman
      </footer>
    </div>
  );
}
