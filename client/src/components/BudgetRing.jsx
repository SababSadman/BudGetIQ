import { useAppStore } from '../stores/useAppStore';

export default function BudgetRing({ size = 160 }) {
    const { getMonthlySpend, budgetLimit, currency } = useAppStore();
    const spent = getMonthlySpend();
    const pct = budgetLimit > 0 ? Math.min(1, spent / budgetLimit) : 0;

    const r = (size / 2) - 14;
    const circ = 2 * Math.PI * r;
    const dash = circ * pct;
    const gap = circ - dash;

    // Color gradient: green → yellow → red
    const color = pct < 0.5
        ? `hsl(${142 - pct * 2 * 60}, 70%, 55%)`   // green→yellow
        : `hsl(${62 - (pct - 0.5) * 2 * 62}, 80%, 55%)`; // yellow→red

    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Track */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke="var(--border)" strokeWidth={8}
                />
                {/* Progress */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={circ * 0.25}  /* start from top */
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1), stroke 0.8s' }}
                />
                {/* Glow */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={circ * 0.25}
                    opacity={0.12}
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                />
            </svg>

            {/* Center labels */}
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>SPENT</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    {spent.toFixed(0)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{currency}</div>
                <div style={{ height: 1, width: 24, background: 'var(--border)', margin: '0.2rem 0' }} />
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    of {budgetLimit.toFixed(0)} {currency}
                </div>
            </div>
        </div>
    );
}
