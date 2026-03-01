import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { fetchOrderStats, markAllOrdersAsRead } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const { token } = useAuth();
  const { t } = useTranslation();

  const loadUnreadCount = () => {
    fetchOrderStats(token)
      .then((stats) => setUnreadCount(stats.unread))
      .catch(console.error);
  };

  useEffect(() => {
    loadUnreadCount();

    // Poll every 30 seconds for new orders
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      await markAllOrdersAsRead(token);
      setUnreadCount(0);
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute start-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-primary">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-accent hover:text-accent-dark font-medium"
                >
                  {t('notifications.markAllRead')}
                </button>
              )}
            </div>
            <div className="p-4">
              {unreadCount === 0 ? (
                <p className="text-sm text-muted text-center py-4">{t('notifications.noNew')}</p>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/admin/orders"
                    onClick={() => setShowDropdown(false)}
                    className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-primary">
                      {t('notifications.newOrder', { count: unreadCount })}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {t('notifications.clickToView')}
                    </p>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
