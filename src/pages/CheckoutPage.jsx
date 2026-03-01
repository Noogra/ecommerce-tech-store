import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Shield, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../hooks/useCart';
import { createOrder } from '../api/orders';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { state, cartTotal, dispatch } = useCart();
  const { items } = state;
  const navigate = useNavigate();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tax = cartTotal * 0.1;
  const shipping = 0;
  const total = cartTotal + tax + shipping;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    customerNote: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.address ||
      !formData.city ||
      !formData.zipCode
    ) {
      setError(t('checkout.requiredFields'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderData = {
        customerFirstName: formData.firstName,
        customerLastName: formData.lastName,
        customerEmail: formData.email,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingZip: formData.zipCode,
        paymentMethod: 'card',
        items: items,
        subtotal: cartTotal,
        tax: tax,
        shipping: shipping,
        total: total,
        customerNote: formData.customerNote,
      };

      const result = await createOrder(orderData);

      dispatch({ type: 'CLEAR_CART' });
      alert(
        `Order placed successfully! Your order number is ${result.orderNumber}.\n\nThank you for shopping at PhoneStop!`
      );
      navigate('/');
    } catch (err) {
      setError(err.message || t('checkout.orderFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto" />
        <h1 className="text-2xl font-bold text-primary mt-6">{t('checkout.emptyCart')}</h1>
        <p className="text-muted mt-2">{t('checkout.emptyCartSub')}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-colors"
        >
          {t('checkout.continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">{t('checkout.title')}</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">{t('checkout.shippingInfo')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('checkout.firstName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('checkout.lastName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="Doe"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('checkout.email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('checkout.address')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('checkout.city')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('checkout.zipCode')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="10001"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('checkout.orderNotes')}
                  </label>
                  <textarea
                    value={formData.customerNote}
                    onChange={(e) => handleInputChange('customerNote', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                    placeholder={t('checkout.orderNotesPlaceholder')}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">{t('checkout.paymentMethod')}</h2>
              <div className="flex items-center gap-3 p-4 border border-accent/20 bg-accent/5 rounded-xl">
                <CreditCard className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-primary">{t('checkout.paymentMethodCard')}</span>
              </div>
              <p className="text-xs text-muted mt-3">
                {t('checkout.paymentSecurity')}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Shield, labelKey: 'checkout.secureCheckout' },
                { icon: Truck, labelKey: 'checkout.freeShipping' },
                { icon: CreditCard, labelKey: 'checkout.safePayment' },
              ].map(({ icon: Icon, labelKey }) => (
                <div
                  key={labelKey}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl text-center"
                >
                  <Icon className="w-5 h-5 text-accent" />
                  <span className="text-xs font-medium text-muted">{t(labelKey)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-primary mb-4">{t('checkout.orderSummary')}</h2>

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{item.name}</p>
                      <p className="text-xs text-muted">{t('checkout.qty')} {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-primary">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-muted">
                  <span>{t('checkout.subtotal')}</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted">
                  <span>{t('checkout.shipping')}</span>
                  <span className="text-green-600 font-medium">{t('checkout.free')}</span>
                </div>
                <div className="flex justify-between text-sm text-muted">
                  <span>{t('checkout.tax')}</span>
                  <span>
                    $
                    {tax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary pt-3 border-t border-gray-100">
                  <span>{t('checkout.total')}</span>
                  <span>
                    $
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
