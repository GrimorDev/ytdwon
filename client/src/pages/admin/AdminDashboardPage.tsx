import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Flag, Activity, TrendingUp, AlertCircle, Image, Mail, FolderTree } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { AdminStats } from '../../types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-dark-700 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: 'Uzytkownicy',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/a-panel/users',
    },
    {
      label: 'Ogloszenia',
      value: stats.totalListings,
      icon: ShoppingBag,
      color: 'bg-green-500',
      lightBg: 'bg-green-50 dark:bg-green-900/20',
      link: '/a-panel/listings',
    },
    {
      label: 'Aktywne ogloszenia',
      value: stats.totalActiveListings,
      icon: Activity,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/a-panel/listings',
    },
    {
      label: 'Oczekujace zgloszenia',
      value: stats.pendingReports,
      icon: Flag,
      color: stats.pendingReports > 0 ? 'bg-red-500' : 'bg-gray-500',
      lightBg: stats.pendingReports > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900/20',
      link: '/a-panel/reports',
      highlight: stats.pendingReports > 0,
    },
    {
      label: 'Kategorie',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'bg-amber-500',
      lightBg: 'bg-amber-50 dark:bg-amber-900/20',
      link: '/a-panel/categories',
    },
    {
      label: 'Bannery',
      value: stats.totalBanners,
      icon: Image,
      color: 'bg-indigo-500',
      lightBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      link: '/a-panel/banners',
    },
    {
      label: 'Newsletter',
      value: stats.totalSubscribers,
      icon: Mail,
      color: 'bg-teal-500',
      lightBg: 'bg-teal-50 dark:bg-teal-900/20',
      link: '/a-panel',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link
            key={card.label}
            to={card.link}
            className={`rounded-2xl p-6 transition-all hover:shadow-lg border ${
              card.highlight
                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:border-red-300'
                : 'bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-medium ${card.highlight ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {card.label}
              </span>
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${card.highlight ? 'text-red-600 dark:text-red-400' : ''}`}>
                {card.value.toLocaleString('pl-PL')}
              </span>
              {card.highlight && (
                <AlertCircle className="w-5 h-5 text-red-500 mb-1" />
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-700 rounded-2xl p-6 border border-gray-200 dark:border-dark-600">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Podsumowanie
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Wszystkie zgloszenia</span>
              <span className="font-semibold">{stats.totalReports}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Oczekujace zgloszenia</span>
              <span className={`font-semibold ${stats.pendingReports > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.pendingReports}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Aktywne / wszystkie ogloszenia</span>
              <span className="font-semibold">
                {stats.totalActiveListings} / {stats.totalListings}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Kategorie</span>
              <span className="font-semibold">{stats.totalCategories}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Aktywne bannery</span>
              <span className="font-semibold">{stats.totalBanners}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subskrybenci newsletter</span>
              <span className="font-semibold">{stats.totalSubscribers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-700 rounded-2xl p-6 border border-gray-200 dark:border-dark-600">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            Szybkie akcje
          </h3>
          <div className="space-y-2">
            <Link
              to="/a-panel/reports"
              className="block p-3 rounded-xl border border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all text-sm"
            >
              Przejrzyj zgloszenia ({stats.pendingReports} oczekujacych)
            </Link>
            <Link
              to="/a-panel/users"
              className="block p-3 rounded-xl border border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all text-sm"
            >
              Zarzadzaj uzytkownikami ({stats.totalUsers})
            </Link>
            <Link
              to="/a-panel/listings"
              className="block p-3 rounded-xl border border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all text-sm"
            >
              Zarzadzaj ogloszeniami ({stats.totalListings})
            </Link>
            <Link
              to="/a-panel/categories"
              className="block p-3 rounded-xl border border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all text-sm"
            >
              Zarzadzaj kategoriami ({stats.totalCategories})
            </Link>
            <Link
              to="/a-panel/banners"
              className="block p-3 rounded-xl border border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all text-sm"
            >
              Zarzadzaj bannerami ({stats.totalBanners})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
