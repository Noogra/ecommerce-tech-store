import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function SalesTrendChart({ data }) {
  const { t } = useTranslation();

  // Format date for display (e.g., "Feb 10")
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
        <p className="text-sm font-semibold text-primary mb-1">
          {formatDate(payload[0].payload.date)}
        </p>
        <p className="text-sm text-emerald-600 font-medium">
          {t('salesChart.revenue')} ${payload[0].value.toFixed(2)}
        </p>
        <p className="text-sm text-muted">
          {t('salesChart.orders')} {payload[0].payload.orderCount}
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          stroke="#e5e7eb"
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
          stroke="#e5e7eb"
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
