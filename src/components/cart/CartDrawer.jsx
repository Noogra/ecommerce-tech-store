import { useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { useTranslation } from 'react-i18next';

export default function CartDrawer() {
  const { state, dispatch, cartCount } = useCart();
  const { isOpen, items } = state;
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch({ type: 'CLOSE_CART' })}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 end-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-primary">
            {t('cart.title')} {cartCount > 0 && <span className="text-muted font-normal">({cartCount})</span>}
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
            className="p-2 text-gray-400 hover:text-primary rounded-lg transition-colors"
            aria-label={t('cart.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {items.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            <div className="px-6 pb-6">
              <CartSummary />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <ShoppingBag className="w-16 h-16 text-gray-200" />
            <div>
              <p className="text-lg font-medium text-primary">{t('cart.empty')}</p>
              <p className="text-sm text-muted mt-1">{t('cart.emptySub')}</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'CLOSE_CART' })}
              className="mt-4 px-6 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-xl transition-colors"
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
