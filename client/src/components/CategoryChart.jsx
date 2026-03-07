import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../stores/useAppStore';

export default function CategoryChart() {
    const { getSpendByCategory, categories, currency } = useAppStore();
    const data = getSpendByCategory();

    // Map each category to its assigned color
    const chartData = data.map(item => {
        const cat = categories.find(c => c.name === item.name);
        return {
            ...item,
            color: cat ? cat.color : '#8884d8' // Fallback color
        };
    });

    if (chartData.length === 0 || chartData.every(d => d.total === 0)) {
        return (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No spending data yet.
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border)',
                    padding: '0.5rem 0.8rem',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ color: dataPoint.color, fontWeight: 600 }}>{dataPoint.name}</div>
                    <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>{currency} {dataPoint.total.toFixed(2)}</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ height: 220, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="total"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
