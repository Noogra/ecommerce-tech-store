import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchProducts, deleteProduct } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import StockBadge from '../../components/admin/StockBadge';
import { useTranslation } from 'react-i18next';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { t } = useTranslation();

  const loadProducts = () => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('adminProducts.deleteConfirm', { name }))) return;
    await deleteProduct(id, token);
    loadProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">{t('adminProducts.title')}</h1>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('adminProducts.addBtn')}
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <p className="text-lg font-medium">{t('adminProducts.noProducts')}</p>
            <p className="text-sm mt-1">{t('adminProducts.noProductsSub')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('adminProducts.colId')}</th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('adminProducts.colProduct')}</th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('adminProducts.colBrand')}</th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('adminProducts.colCategory')}</th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('adminProducts.colPrice')}</th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('adminProducts.colStock')}</th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('adminProducts.colFeatured')}</th>
                  <th className="text-end text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('adminProducts.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted font-mono">{p.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                        <span className="text-sm font-medium text-primary">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{p.brand}</td>
                    <td className="px-6 py-4 text-sm text-muted">{p.category}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">${p.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">{p.stock_quantity} {t('adminProducts.units')}</span>
                        <StockBadge quantity={p.stock_quantity} size="sm" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.featured ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {p.featured ? t('adminProducts.yes') : t('adminProducts.no')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                          title={t('adminProducts.editTitle')}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('adminProducts.deleteTitle')}
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
