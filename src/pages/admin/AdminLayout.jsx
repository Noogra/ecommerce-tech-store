import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, Tag, Upload, LogOut, Store, ShoppingCart, Warehouse, TrendingUp, MessageSquare, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/admin/NotificationBell';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders', end: false },
  { to: '/admin/products', icon: Package, label: 'Products', end: false },
  { to: '/admin/inventory', icon: Warehouse, label: 'Inventory', end: false },
  { to: '/admin/products/new', icon: PlusCircle, label: 'Add Product', end: false },
  { to: '/admin/categories', icon: Tag, label: 'Categories', end: false },
  { to: '/admin/products/bulk-upload', icon: Upload, label: 'Bulk Upload', end: false },
  { to: '/admin/sales', icon: TrendingUp, label: 'Sales Report', end: false },
  { to: '/admin/chat', icon: MessageSquare, label: 'AI Agent', end: false },
  { to: '/admin/finance', icon: Wallet, label: 'Finance', end: false },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">PhoneStop Admin</h1>
            <p className="text-xs text-gray-400 mt-0.5">Management Dashboard</p>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Store className="w-4.5 h-4.5" />
            View Store
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
