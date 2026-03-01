import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, Tag, Upload, LogOut, Store, ShoppingCart, Warehouse, TrendingUp, MessageSquare, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/admin/NotificationBell';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.dashboard'), end: true },
    { to: '/admin/orders', icon: ShoppingCart, label: t('admin.orders'), end: false },
    { to: '/admin/products', icon: Package, label: t('admin.products'), end: false },
    { to: '/admin/inventory', icon: Warehouse, label: t('admin.inventory'), end: false },
    { to: '/admin/products/new', icon: PlusCircle, label: t('admin.addProduct'), end: false },
    { to: '/admin/categories', icon: Tag, label: t('admin.categories'), end: false },
    { to: '/admin/products/bulk-upload', icon: Upload, label: t('admin.bulkUpload'), end: false },
    { to: '/admin/sales', icon: TrendingUp, label: t('admin.salesReport'), end: false },
    { to: '/admin/chat', icon: MessageSquare, label: t('admin.aiAgent'), end: false },
    { to: '/admin/finance', icon: Wallet, label: t('admin.finance'), end: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — fixed on inline-start side */}
      <aside className="w-64 bg-primary text-white flex flex-col fixed h-full start-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{t('admin.title')}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{t('admin.subtitle')}</p>
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
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Store className="w-4.5 h-4.5 shrink-0" />
            {t('admin.viewStore')}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {t('admin.logout')}
          </button>
          <div className="pt-2">
            <LanguageSwitcher className="w-full justify-center border-white/20 text-gray-300 hover:border-white/40 hover:text-white" />
          </div>
        </div>
      </aside>

      {/* Main Content — offset by sidebar width on inline-start */}
      <main className="flex-1 ms-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
