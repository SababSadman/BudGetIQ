import { useAppStore } from '../stores/useAppStore';

export default function CategoryBadge({ categoryId, size = 'sm' }) {
    const categories = useAppStore(s => s.categories);
    const cat = categories.find(c => c.id === categoryId);

    if (!cat) return null;

    const pad = size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.7rem';
    const fontSize = size === 'sm' ? '0.72rem' : '0.8rem';

    return (
        <span
            className="badge"
            style={{
                background: `${cat.color}18`,
                color: cat.color,
                border: `1px solid ${cat.color}40`,
                padding: pad,
                fontSize,
            }}
        >
            <span>{cat.icon}</span>
            {cat.name}
        </span>
    );
}
