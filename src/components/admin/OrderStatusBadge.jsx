const STATUS_CONFIG = {
  New: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: '🆕',
  },
  Processing: {
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '⚙️',
  },
  Completed: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: '✅',
  },
  Cancelled: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: '❌',
  },
};

export default function OrderStatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.New;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      {status}
    </span>
  );
}
