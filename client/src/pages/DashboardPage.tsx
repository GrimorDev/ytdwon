import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Eye, Heart, Star, Package, ShoppingBag, TrendingUp, Plus, MessageCircle, Settings, Megaphone, Calendar } from 'lucide-react';
import { authApi } from '../services/api';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

interface Stats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  favoritesCount: number;
  avgRating: number;
  reviewsCount: number;
}

export default function DashboardPage() {
  const { t, lang } = useTranslation();
  const { user } = useAuth();
  const isPl = lang === 'pl';
  const [stats, setStats] = useState<Stats | null>(null);
  const [memberSince, setMemberSince] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getStats().then(({ data }) => {
      setStats(data.stats);
      setMemberSince(data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString(isPl ? 'pl-PL' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '');
      setPlan(data.user.plan || 'FREE');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  const statCards = stats ? [
    { label: t.dashboard.activeListings, value: stats.activeListings, icon: Package, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: t.dashboard.soldListings, value: stats.soldListings, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: t.dashboard.totalViews, value: stats.totalViews, icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: t.dashboard.totalFavorites, value: stats.favoritesCount, icon: Heart, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: t.dashboard.avgRating, value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: t.dashboard.reviewsCount, value: stats.reviewsCount, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ] : [];

  const quickActions = [
    { label: t.dashboard.addListing, icon: Plus, to: '/dodaj', color: 'bg-primary-500 hover:bg-primary-600 text-white' },
    { label: t.dashboard.myListings, icon: Package, to: '/moje-ogloszenia', color: 'bg-gray-100 dark:bg-dark-500 hover:bg-gray-200 dark:hover:bg-dark-400' },
    { label: t.dashboard.messages, icon: MessageCircle, to: '/wiadomosci', color: 'bg-gray-100 dark:bg-dark-500 hover:bg-gray-200 dark:hover:bg-dark-400' },
    { label: t.dashboard.favorites, icon: Heart, to: '/ulubione', color: 'bg-gray-100 dark:bg-dark-500 hover:bg-gray-200 dark:hover:bg-dark-400' },
    { label: t.dashboard.promote, icon: Megaphone, to: '/moje-ogloszenia', color: 'bg-gray-100 dark:bg-dark-500 hover:bg-gray-200 dark:hover:bg-dark-400' },
    { label: t.dashboard.account, icon: Settings, to: '/konto', color: 'bg-gray-100 dark:bg-dark-500 hover:bg-gray-200 dark:hover:bg-dark-400' },
  ];

  return (
    <>
      <SEO title={t.dashboard.title} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900/30" />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635985, #443C68)' }}>
                <span className="text-white text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary-500" />
                {t.dashboard.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {t.dashboard.memberSince}: {memberSince}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  {plan}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && stats.totalListings > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {statCards.map((card) => (
                <div key={card.label} className="card text-center">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mx-auto mb-2`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Performance summary */}
            <div className="card mb-8">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                {t.dashboard.performance}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-dark-600">
                  <p className="text-3xl font-bold text-primary-600">{stats.totalListings}</p>
                  <p className="text-sm text-gray-500">{t.dashboard.totalListings}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-dark-600">
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalListings > 0 ? Math.round((stats.totalViews / stats.totalListings)) : 0}
                  </p>
                  <p className="text-sm text-gray-500">{isPl ? 'Sred. wyswietlen / ogl.' : 'Avg. views / listing'}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-dark-600">
                  <p className="text-3xl font-bold text-amber-600">
                    {stats.totalListings > 0 ? Math.round((stats.soldListings / stats.totalListings) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-500">{isPl ? 'Wskaznik sprzedazy' : 'Sell rate'}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="card text-center py-12 mb-8">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t.dashboard.noListingsYet}</p>
            <Link to="/dodaj" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t.dashboard.startSelling}
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold mb-4">{t.dashboard.quickActions}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.to + action.label}
                to={action.to}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs font-medium text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
