import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Zap, Smartphone, Car, Home, Sofa, Shirt, Dumbbell, Baby, Briefcase, HandHelping, MoreHorizontal } from 'lucide-react';
import { categoriesApi, listingsApi } from '../services/api';
import type { Category, Listing } from '../types';
import ListingCard from '../components/Listing/ListingCard';
import { useTranslation } from '../i18n';
import SearchAutocomplete from '../components/Search/SearchAutocomplete';

const iconMap: Record<string, any> = {
  Smartphone, Car, Home, Sofa, Shirt, Dumbbell, Baby, Briefcase, HandHelping, MoreHorizontal
};

export default function HomePage() {
  const { t, lang } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [promoted, setPromoted] = useState<Listing[]>([]);
  const [recent, setRecent] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(),
      listingsApi.getAll({ limit: 8, sort: 'newest' }),
    ]).then(([catRes, listRes]) => {
      setCategories(catRes.data.categories);
      const allListings = listRes.data.listings;
      setPromoted(allListings.filter(l => l.promoted).slice(0, 4));
      setRecent(allListings);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getCategoryIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || MoreHorizontal;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 py-16 md:py-24">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {t.home.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            {t.home.heroSubtitle}
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchAutocomplete size="lg" className="shadow-2xl" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Categories */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6">{t.home.categories}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/kategoria/${cat.slug}`}
                className="card-hover p-4 flex flex-col items-center gap-2 text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="text-sm font-medium">{lang === 'pl' ? cat.namePl : cat.nameEn}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Promoted */}
        {promoted.length > 0 && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-amber-500" />
                {t.home.promoted}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {promoted.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t.home.recent}</h2>
            <Link to="/ogloszenia" className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium">
              {t.home.seeAll} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recent.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>

        {/* Features */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">{t.home.feature1Title}</h3>
              <p className="text-sm text-gray-500">{t.home.feature1Desc}</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">{t.home.feature2Title}</h3>
              <p className="text-sm text-gray-500">{t.home.feature2Desc}</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">{t.home.feature3Title}</h3>
              <p className="text-sm text-gray-500">{t.home.feature3Desc}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
