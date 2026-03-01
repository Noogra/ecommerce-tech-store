import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Star, Minus, Plus, ShoppingCart, Shield, Truck, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchProduct, fetchProducts } from '../api/products';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/product/ProductCard';
import Toast from '../components/ui/Toast';

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setSelectedImage(0);
    setQuantity(1);
    fetchProduct(id)
      .then(p => {
        setProduct(p);
        return fetchProducts({ category: p.category });
      })
      .then(related => {
        setRelatedProducts(related.filter(p => p.id !== Number(id)).slice(0, 4));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const hideToast = useCallback(() => setToast({ visible: false, message: '' }), []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-80 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 w-48 bg-gray-100 rounded animate-pulse mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-primary">{t('product.notFound')}</h1>
        <Link to="/" className="text-accent hover:underline">{t('product.backToHome')}</Link>
      </div>
    );
  }

  const hasDiscount = product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const galleryImages = [
    product.image,
    product.image.replace('/400/400', '/400/401'),
    product.image.replace('/400/400', '/401/400'),
    product.image.replace('/400/400', '/401/401'),
  ];

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
    setToast({ visible: true, message: `${product.name} (x${quantity}) ${t('product.addedToCart')}` });
    setQuantity(1);
  };

  return (
    <>
      <Toast message={toast.message} isVisible={toast.visible} onClose={hideToast} />

      <div className="bg-white min-h-screen">
        {/* Back Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:translate-x-1" />
            <span className="text-sm font-medium">{t('product.backToCatalog')}</span>
          </button>
        </div>

        {/* Product Main Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <img
                  src={galleryImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? 'border-accent shadow-md'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-accent uppercase tracking-widest">
                {product.brand}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mt-2 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                <span className="text-sm text-muted">({t('product.reviews')})</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-6">
                <span className="text-4xl font-bold text-primary">
                  ${product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-muted line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Quick Specs Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {product.specs.map((spec) => (
                  <span
                    key={spec}
                    className="text-xs font-medium text-primary bg-gray-100 px-3 py-1.5 rounded-lg"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <div className="border-t border-gray-100 my-8" />

              {/* Quantity Selector + Add to Cart */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-primary" />
                  </button>
                  <span className="w-14 text-center font-semibold text-primary text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 flex items-center justify-center gap-3 bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 px-8 rounded-xl transition-all hover:shadow-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock ? t('product.addToCart') : t('product.outOfStock')}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { icon: Truck, labelKey: 'product.freeShipping' },
                  { icon: Shield, labelKey: 'product.warranty' },
                  { icon: RotateCcw, labelKey: 'product.returns' },
                ].map(({ icon: Icon, labelKey }) => (
                  <div key={labelKey} className="flex flex-col items-center gap-1.5 text-center">
                    <Icon className="w-5 h-5 text-muted" />
                    <span className="text-xs font-medium text-muted">{t(labelKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        {product.detailedSpecs && Object.keys(product.detailedSpecs).length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
            <div className="bg-surface rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-primary mb-6">{t('product.specifications')}</h2>
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-1">
                {Object.entries(product.detailedSpecs).map(([key, value], i) => (
                  <div
                    key={key}
                    className={`flex justify-between gap-4 py-3 ${
                      i < Object.keys(product.detailedSpecs).length - (Object.keys(product.detailedSpecs).length % 2 === 0 ? 2 : 1)
                        ? 'border-b border-gray-200'
                        : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-muted whitespace-nowrap">{key}</span>
                    <span className="text-sm font-semibold text-primary text-end">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
            <h2 className="text-xl font-bold text-primary mb-6">{t('product.youMayAlsoLike')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
