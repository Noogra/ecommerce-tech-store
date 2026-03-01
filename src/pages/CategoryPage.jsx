import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductGrid from '../components/product/ProductGrid';
import { fetchProducts } from '../api/products';
import { fetchCategories } from '../api/categories';

export default function CategoryPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const subFilter = searchParams.get('sub') || 'all';

  const [category, setCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCategories(),
      fetchProducts({ category: slug }),
    ])
      .then(([cats, prods]) => {
        setCategory(cats.find(c => c.slug === slug) || null);
        setCategoryProducts(prods);
      })
      .catch(() => {
        setCategory(null);
        setCategoryProducts([]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="h-10 w-64 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-64 sm:h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-primary">{t('category.notFound')}</h1>
        <Link to="/" className="text-accent hover:text-accent-dark mt-4 inline-block">
          {t('category.backToHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-8">
        <Link to="/" className="hover:text-accent transition-colors">{t('category.home')}</Link>
        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        <span className="text-primary font-medium">{category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">{category.name}</h1>
        <p className="text-muted mt-2">
          {t('category.productsCount', { count: categoryProducts.length })}
        </p>
      </div>

      <ProductGrid
        products={categoryProducts}
        subcategories={category.subcategories}
        initialFilter={subFilter}
      />
    </div>
  );
}
