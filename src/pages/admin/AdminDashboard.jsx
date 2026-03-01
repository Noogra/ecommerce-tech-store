import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import { fetchProducts } from '../../api/products';
import { fetchCategories } from '../../api/categories';
import { fetchOrderStats } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchOrderStats(token)])
      .then(([prods, cats, orders]) => {
        setProducts(prods);
        setCategories(cats);
        setOrderStats(orders);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const lowStockCount = products.filter(p => p.stock_quantity < 5).length;

  const stats = [
    {
      label: t('dashboard.totalOrders'),
      value: orderStats?.total || 0,
      icon: ShoppingCart,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: t('dashboard.revenue'),
      value: `$${(orderStats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: t('dashboard.lowStock'),
      value: lowStockCount,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      link: '/admin/inventory',
    },
    {
      label: t('dashboard.totalProducts'),
      value: products.length,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8">{t('dashboard.title')}</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ label, value, icon: Icon, color, link }) => {
            const content = (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">{label}</p>
                  <p className="text-3xl font-bold text-primary mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );

            return (
              <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {link ? (
                  <Link to={link} className="block hover:bg-gray-50 transition-colors rounded-xl -m-6 p-6">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Products */}
      {!loading && products.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-primary mb-4">{t('dashboard.recentProducts')}</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('dashboard.colProduct')}</th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('dashboard.colCategory')}</th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('dashboard.colPrice')}</th>
                  <th className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">{t('dashboard.colStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                        <div>
                          <p className="text-sm font-medium text-primary">{p.name}</p>
                          <p className="text-xs text-muted">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{p.category}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">${p.price}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        p.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {p.inStock ? t('dashboard.inStock') : t('dashboard.outOfStock')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
