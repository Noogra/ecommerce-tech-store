import { useState, useEffect } from 'react';
import { RefreshCw, Package } from 'lucide-react';
import { fetchInventory } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import StockBadge from '../../components/admin/StockBadge';
import EditableStockCell from '../../components/admin/EditableStockCell';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const loadInventory = () => {
    setLoading(true);
    fetchInventory(token)
      .then(setProducts)
      .catch((error) => {
        console.error('Failed to load inventory:', error);
        alert('Failed to load inventory');
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadInventory, [token]);

  // Calculate stats
  const lowStockCount = products.filter((p) => p.stock_quantity < 5).length;
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock_quantity, 0);

  return (
    <div>
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Inventory Management</h1>
          <p className="text-sm text-muted mt-1">Click any stock quantity to edit</p>
        </div>
        <button
          onClick={loadInventory}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-primary font-medium text-sm px-5 py-2.5 rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Stock</p>
              <p className="text-3xl font-bold text-primary mt-1">{totalStock.toLocaleString()}</p>
              <p className="text-xs text-muted mt-1">{products.length} products</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{lowStockCount}</p>
              <p className="text-xs text-muted mt-1">Needs restocking</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
              <p className="text-xs text-muted mt-1">Critical attention</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Add products to manage inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Category
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Price
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Stock Quantity
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                        />
                        <div>
                          <p className="text-sm font-medium text-primary">{p.name}</p>
                          <p className="text-xs text-muted">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted capitalize">
                      {p.category.replace(/-/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">${p.price}</td>
                    <td className="px-6 py-4">
                      <EditableStockCell
                        productId={p.id}
                        initialValue={p.stock_quantity}
                        onSave={loadInventory}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <StockBadge quantity={p.stock_quantity} size="sm" />
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
