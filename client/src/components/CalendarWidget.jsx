import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarWidget() {
    const { transactions, currency } = useAppStore();
    const [currentDate, setCurrentDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNext = () => setCurrentDate(new Date(year, month + 1, 1));

    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    // Map day to the array of transactions on that day
    const expenseMap = useMemo(() => {
        const map = {};
        transactions.forEach(t => {
            const date = new Date(t.created_at);
            if (date.getFullYear() === year && date.getMonth() === month) {
                const day = date.getDate();
                if (!map[day]) {
                    map[day] = { total: 0, items: [] };
                }
                map[day].total += (t.amount || 0);
                map[day].items.push(t);
            }
        });
        return map;
    }, [transactions, year, month]);

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        days.push(i);
    }

    const todayDate = new Date();
    const isCurrentMonth = todayDate.getFullYear() === year && todayDate.getMonth() === month;
    const today = isCurrentMonth ? todayDate.getDate() : -1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={handlePrev}>
                        <ChevronLeft size={16} />
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={handleNext}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {DAYS.map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {d}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                    {days.map((d, i) => {
                        const dayData = d ? expenseMap[d] : null;
                        const amount = dayData?.total || 0;
                        const hasExpense = amount > 0;
                        const isToday = d === today;

                        let titleText = '';
                        if (hasExpense) {
                            titleText = dayData.items.map(t => `${t.description || 'Unknown'}: ${currency} ${t.amount.toFixed(2)}`).join('\n');
                        }

                        return (
                            <div
                                key={i}
                                title={titleText}
                                style={{
                                    height: '2.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'var(--radius-sm)',
                                    background: isToday ? 'var(--accent-glow)' : hasExpense ? 'var(--bg-glass)' : 'transparent',
                                    border: isToday ? '1px solid var(--accent)' : '1px solid transparent',
                                    position: 'relative',
                                    cursor: hasExpense ? 'help' : 'default',
                                }}
                            >
                                {d && (
                                    <>
                                        <span style={{ fontSize: '0.85rem', color: isToday ? 'var(--accent)' : 'var(--text-primary)', fontWeight: isToday ? 600 : 400 }}>
                                            {d}
                                        </span>
                                        {hasExpense && (
                                            <span style={{
                                                position: 'absolute',
                                                bottom: '0.25rem',
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                background: 'var(--danger)'
                                            }} />
                                        )}
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
