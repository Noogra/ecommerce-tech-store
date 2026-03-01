import { Star, ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);
  const hasDiscount = product.originalPrice > product.price;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'ADD_TO_CART', payload: product });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute top-2 start-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs font-medium text-muted uppercase tracking-wider">{product.brand}</p>
        <h3 className="text-xs sm:text-sm font-semibold text-primary mt-1 leading-snug line-clamp-2">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-[10px] sm:text-xs font-medium text-gray-700">{product.rating}</span>
        </div>

        {/* Specs — hide 3rd on mobile */}
        <div className="flex flex-wrap gap-1 mt-2">
          {product.specs.slice(0, 3).map((spec, i) => (
            <span
              key={spec}
              className={`text-[10px] text-muted bg-gray-50 px-1.5 py-0.5 rounded-md ${i >= 2 ? 'hidden sm:inline-block' : ''}`}
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 gap-2">
          <div className="min-w-0">
            <span className="text-sm sm:text-lg font-bold text-primary">${product.price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="hidden sm:inline text-sm text-muted line-through ms-1.5">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all flex-shrink-0 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-accent hover:bg-accent-dark text-white hover:shadow-md'
            } disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
            aria-label={added ? t('product.addedToCart') : t('product.addToCart')}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Link>
  );
}
