import { useTranslation } from 'react-i18next';

const STOCK_CONFIG = {
  outOfStock: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: '❌',
    labelKey: 'stockStatus.outOfStock',
  },
  critical: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: '⚠️',
    labelKey: 'stockStatus.lowStock',
  },
  low: {
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: '⚡',
    labelKey: 'stockStatus.limited',
  },
  normal: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: '✅',
    labelKey: 'stockStatus.inStock',
  },
};

function getStockLevel(quantity) {
  if (quantity === 0) return 'outOfStock';
  if (quantity < 3) return 'critical';      // Red badge (user preference)
  if (quantity <= 5) return 'low';          // Yellow badge (user preference)
  return 'normal';                          // Green badge
}

export default function StockBadge({ quantity, size = 'sm' }) {
  const { t } = useTranslation();
  const level = getStockLevel(quantity);
  const config = STOCK_CONFIG[level];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      <span>{t(config.labelKey)}</span>
      {quantity > 0 && <span className="opacity-70">({quantity})</span>}
    </span>
  );
}
