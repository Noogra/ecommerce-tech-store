import { useState, useEffect } from 'react';
import { X, Package, MapPin, CreditCard, Calendar, User } from 'lucide-react';
import { fetchOrder, updateOrderStatus, markOrderAsRead, cancelOrder } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import OrderStatusBadge from './OrderStatusBadge';
import ConfirmDialog from './ConfirmDialog';

export default function OrderDetailModal({ orderId, onClose, onStatusChange }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchOrder(orderId, token)
      .then((order) => {
        setOrder(order);
        if (!order.isRead) {
          markOrderAsRead(orderId, token).catch(console.error);
        }
      })
      .finally(() => setLoading(false));
  }, [orderId, token]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus, token);
      const updated = await fetchOrder(orderId, token);
      setOrder(updated);
      showToast(`Order status updated to ${newStatus}`);
      onStatusChange?.();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    setUpdating(true);
    try {
      await cancelOrder(orderId, token);
      showToast('Order cancelled successfully');
      setConfirmCancel(false);
      setTimeout(() => {
        onClose();
        onStatusChange?.();
      }, 1000);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getAvailableStatuses = (currentStatus) => {
    const transitions = {
      New: ['Processing', 'Cancelled'],
      Processing: ['Completed', 'Cancelled'],
      Completed: [],
      Cancelled: [],
    };
    return transitions[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-xl font-semibold text-primary">Order Details</h2>
              <p className="text-sm text-muted mt-0.5 font-mono">{order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-primary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status & Actions */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted">Status:</span>
                <OrderStatusBadge status={order.status} />
              </div>

              {getAvailableStatuses(order.status).length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">Change to:</span>
                  {getAvailableStatuses(order.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updating}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        status === 'Cancelled'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-accent text-white hover:bg-accent-dark'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted">Customer</p>
                    <p className="text-base font-semibold text-primary mt-0.5">
                      {order.customerFirstName} {order.customerLastName}
                    </p>
                    <p className="text-sm text-muted">{order.customerEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted">Shipping Address</p>
                    <p className="text-sm text-primary mt-0.5">{order.shippingAddress}</p>
                    <p className="text-sm text-primary">
                      {order.shippingCity}, {order.shippingZip}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted">Order Date</p>
                    <p className="text-base font-semibold text-primary mt-0.5">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted">Payment Method</p>
                    <p className="text-base font-semibold text-primary mt-0.5 capitalize">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary">{item.productName}</p>
                      <p className="text-xs text-muted mt-0.5">{item.productBrand}</p>
                      <p className="text-xs text-muted mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        $
                        {item.subtotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        $
                        {item.unitPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}{' '}
                        each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-primary">
                  ${order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Tax</span>
                <span className="font-medium text-primary">
                  ${order.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Shipping</span>
                <span className="font-medium text-green-600">
                  {order.shipping === 0
                    ? 'Free'
                    : `$${order.shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Customer Note */}
            {order.customerNote && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-medium text-blue-900 mb-1">Customer Note</p>
                <p className="text-sm text-blue-700">{order.customerNote}</p>
              </div>
            )}

            {/* Cancel Button (if applicable) */}
            {order.status !== 'Completed' && order.status !== 'Cancelled' && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => setConfirmCancel(true)}
                  disabled={updating}
                  className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] px-6 py-3 rounded-xl shadow-lg text-white animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={confirmCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
        confirmVariant="danger"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  );
}
