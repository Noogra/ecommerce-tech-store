import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchProducts, deleteProduct } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import StockBadge from '../../components/admin/StockBadge';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const loadProducts = () => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteProduct(id, token);
    loadProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Products</h1>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
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
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm mt-1">Add your first product to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">ID</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Brand</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Price</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Stock</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Featured</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Actions</th>
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
                        <span className="text-sm font-medium text-primary">{p.stock_quantity} units</span>
                        <StockBadge quantity={p.stock_quantity} size="sm" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.featured ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {p.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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
