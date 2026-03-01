import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useTranslation } from 'react-i18next';

export default function CartSummary() {
  const { cartTotal, dispatch } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tax = cartTotal * 0.1;
  const total = cartTotal + tax;

  const handleCheckout = () => {
    dispatch({ type: 'CLOSE_CART' });
    navigate('/checkout');
  };

  return (
    <div className="border-t border-gray-200 pt-4 space-y-3">
      <div className="flex justify-between text-sm text-muted">
        <span>{t('cart.subtotal')}</span>
        <span>${cartTotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm text-muted">
        <span>{t('cart.estimatedTax')}</span>
        <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between text-base font-semibold text-primary pt-2 border-t border-gray-100">
        <span>{t('cart.total')}</span>
        <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <button
        onClick={handleCheckout}
        className="w-full mt-4 bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {t('cart.proceedToCheckout')}
      </button>
    </div>
  );
}
