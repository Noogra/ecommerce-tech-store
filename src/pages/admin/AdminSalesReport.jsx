import { useState, useEffect } from 'react';
import { DollarSign, Package, TrendingUp, RefreshCw } from 'lucide-react';
import { fetchSalesStats, fetchSalesTrends } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import SalesTrendChart from '../../components/admin/SalesTrendChart';

export default function AdminSalesReport() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const loadSalesData = async () => {
    setLoading(true);
    try {
      const [statsData, trendsData] = await Promise.all([
        fetchSalesStats(token),
        fetchSalesTrends(7, token),
      ]);
      setStats(statsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Failed to load sales data:', error);
      alert('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, [token]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-primary mb-8">Sales Report</h1>
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Sales Report</h1>
          <p className="text-sm text-muted mt-1">Overview of your store performance</p>
        </div>
        <button
          onClick={loadSalesData}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-primary font-medium text-sm px-5 py-2.5 rounded-xl border border-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Revenue</p>
              <p className="text-3xl font-bold text-primary mt-1">
                ${stats?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
              <p className="text-xs text-green-600 mt-1">All-time earnings</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Units Sold */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Units Sold</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {stats?.totalUnitsSold?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-blue-600 mt-1">Total products sold</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Avg Order Value</p>
              <p className="text-3xl font-bold text-primary mt-1">
                ${stats?.averageOrderValue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-purple-600 mt-1">Per order</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-primary mb-4">7-Day Sales Trend</h2>
        {trends.length > 0 ? (
          <SalesTrendChart data={trends} />
        ) : (
          <div className="h-64 flex items-center justify-center text-muted">
            <p>No sales data available</p>
          </div>
        )}
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-primary">Top Selling Products</h2>
          <p className="text-sm text-muted mt-1">Best performers by units sold</p>
        </div>

        {!stats?.topSellingProducts || stats.topSellingProducts.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-medium">No sales data yet</p>
            <p className="text-sm mt-1">Top products will appear here after orders are placed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Rank
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Units Sold
                  </th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topSellingProducts.map((product, index) => (
                  <tr
                    key={product.productId}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span
                          className={`text-2xl font-bold ${
                            index === 0
                              ? 'text-yellow-500'
                              : index === 1
                              ? 'text-gray-400'
                              : index === 2
                              ? 'text-orange-500'
                              : 'text-muted'
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                        />
                        <p className="text-sm font-medium text-primary">{product.productName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-primary">{product.unitsSold}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-emerald-600">
                        ${product.revenue.toFixed(2)}
                      </span>
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
