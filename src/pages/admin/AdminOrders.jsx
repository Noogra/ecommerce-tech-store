import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Eye, Package } from 'lucide-react';
import { fetchOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import { useTranslation } from 'react-i18next';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();
  const { t } = useTranslation();

  const loadOrders = () => {
    setLoading(true);
    const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
    fetchOrders(filters, token)
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(loadOrders, [statusFilter, token]);

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerEmail.toLowerCase().includes(query) ||
      `${order.customerFirstName} ${order.customerLastName}`.toLowerCase().includes(query)
    );
  });

  const tabs = [
    { value: 'all', label: t('adminOrders.allOrders'), count: orders.length },
    { value: 'New', label: t('orderStatus.New'), count: orders.filter((o) => o.status === 'New').length },
    { value: 'Processing', label: t('orderStatus.Processing'), count: orders.filter((o) => o.status === 'Processing').length },
    { value: 'Completed', label: t('orderStatus.Completed'), count: orders.filter((o) => o.status === 'Completed').length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('adminOrders.title')}</h1>
          <p className="text-sm text-muted mt-1">{t('adminOrders.subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-accent text-white'
                : 'bg-white text-muted hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
            <span
              className={`ms-2 px-2 py-0.5 rounded-full text-xs ${
                statusFilter === tab.value ? 'bg-white/20' : 'bg-gray-100'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('adminOrders.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-12 pe-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-medium">{t('adminOrders.noOrders')}</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? t('adminOrders.trySearch')
                : t('adminOrders.awaitingOrders')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    {t('adminOrders.colOrder')}
                  </th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    {t('adminOrders.colCustomer')}
                  </th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    {t('adminOrders.colItems')}
                  </th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    {t('adminOrders.colTotal')}
                  </th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    {t('adminOrders.colStatus')}
                  </th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    {t('adminOrders.colDate')}
                  </th>
                  <th className="text-end text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    {t('adminOrders.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                      !order.isRead ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-medium text-primary">
                          {order.orderNumber}
                        </span>
                        {!order.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" title={t('adminOrders.unread')} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {order.customerFirstName} {order.customerLastName}
                        </p>
                        <p className="text-xs text-muted">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted">
                        {t('adminOrders.itemCount', { count: order.itemCount })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-primary">
                        $
                        {order.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                          title={t('adminOrders.viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          orderId={selectedOrder.id}
          onClose={() => {
            setSelectedOrder(null);
            loadOrders(); // Reload to update read status
          }}
          onStatusChange={loadOrders}
        />
      )}
    </div>
  );
}
