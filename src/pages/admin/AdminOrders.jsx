import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Eye, Package } from 'lucide-react';
import { fetchOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import OrderDetailModal from '../../components/admin/OrderDetailModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();

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
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'New', label: 'New', count: orders.filter((o) => o.status === 'New').length },
    {
      value: 'Processing',
      label: 'Processing',
      count: orders.filter((o) => o.status === 'Processing').length,
    },
    {
      value: 'Completed',
      label: 'Completed',
      count: orders.filter((o) => o.status === 'Completed').length,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Orders</h1>
          <p className="text-sm text-muted mt-1">Manage customer orders and track fulfillment</p>
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
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, email, or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
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
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? 'Try a different search term'
                : 'Orders will appear here when customers place them'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Order
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Items
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Total
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Actions
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
                          <span className="w-2 h-2 rounded-full bg-blue-500" title="Unread" />
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
                      <span className="text-sm text-muted">{order.itemCount} items</span>
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
                          title="View Details"
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
