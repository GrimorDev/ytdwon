import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, Package, Star, Clock,
  MessageCircle, StarHalf, Heart, ShieldAlert, Info,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { useNotifications } from '../context/NotificationContext';

interface Notification {
  id: string;
  type: string;
  titlePl: string;
  titleEn: string;
  bodyPl?: string;
  bodyEn?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const typeIconMap: Record<string, any> = {
  LISTING_CREATED: Package,
  LISTING_PROMOTED: Star,
  PROMOTION_EXPIRING: Clock,
  PROMOTION_EXPIRED: Clock,
  NEW_MESSAGE: MessageCircle,
  NEW_REVIEW: StarHalf,
  LISTING_SOLD: Check,
  LISTING_FAVORITED: Heart,
  SYSTEM: Info,
};

const typeColorMap: Record<string, string> = {
  LISTING_CREATED: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  LISTING_PROMOTED: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  PROMOTION_EXPIRING: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  PROMOTION_EXPIRED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  NEW_MESSAGE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  NEW_REVIEW: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  LISTING_SOLD: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  LISTING_FAVORITED: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  SYSTEM: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

export default function NotificationsPage() {
  const { lang } = useTranslation();
  const navigate = useNavigate();
  const { refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async (p: number = 1) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/notifications?page=${p}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      refreshUnreadCount();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      refreshUnreadCount();
    } catch {}
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      refreshUnreadCount();
    } catch {}
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return lang === 'pl' ? `${minutes} min temu` : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return lang === 'pl' ? `${hours} godz. temu` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return lang === 'pl' ? `${days} dni temu` : `${days}d ago`;
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {lang === 'pl' ? 'Powiadomienia' : 'Notifications'}
          </h1>
          {unreadCount > 0 && (
            <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            {lang === 'pl' ? 'Oznacz wszystko jako przeczytane' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse flex items-start gap-3 p-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-dark-600 rounded-full flex items-center justify-center">
            <Bell className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {lang === 'pl' ? 'Brak powiadomien' : 'No notifications'}
          </h3>
          <p className="text-sm text-gray-500">
            {lang === 'pl'
              ? 'Tutaj pojawia sie informacje o Twoich ogloszeniach, wiadomosciach i promocjach.'
              : 'Here you\'ll find updates about your listings, messages, and promotions.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIconMap[n.type] || Bell;
            const colorClass = typeColorMap[n.type] || typeColorMap.SYSTEM;
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer group ${
                  n.read
                    ? 'bg-white dark:bg-dark-700 border-gray-100 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600'
                    : 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200/50 dark:border-primary-800/30 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.read ? 'font-normal' : 'font-semibold'}`}>
                      {lang === 'pl' ? n.titlePl : n.titleEn}
                    </p>
                    {!n.read && (
                      <span className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  {(n.bodyPl || n.bodyEn) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {lang === 'pl' ? n.bodyPl : n.bodyEn}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Actions */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                  title={lang === 'pl' ? 'Usun' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-500 hover:bg-primary-100 dark:hover:bg-primary-900/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
