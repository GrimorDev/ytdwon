import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, TrendingUp, Shield, Zap, Star, Plus, Clock,
  Smartphone, Car, Home, Sofa, Shirt, Dumbbell, Baby, Briefcase, HandHelping, MoreHorizontal,
  Package, Monitor, ShoppingBag, PawPrint, BookOpen, Music, Camera, Wrench, Bike, Gem, Watch,
  Gamepad2, Tv, Headphones, Printer, Cpu, Heart, TreePine, Flower2, Palette, Scissors, UtensilsCrossed,
} from 'lucide-react';
import { categoriesApi, listingsApi } from '../services/api';
import type { Category, Listing } from '../types';
import ListingCard from '../components/Listing/ListingCard';
import { useTranslation } from '../i18n';
import SearchAutocomplete from '../components/Search/SearchAutocomplete';
import SEO from '../components/SEO';
import BannerSlider from '../components/Home/BannerSlider';
import { getViewHistory, type ViewHistoryItem } from '../utils/viewHistory';

const iconMap: Record<string, any> = {
  Smartphone, Car, Home, Sofa, Shirt, Dumbbell, Baby, Briefcase, HandHelping, MoreHorizontal,
  Package, Monitor, ShoppingBag, PawPrint, BookOpen, Music, Camera, Wrench, Bike, Gem, Watch,
  Gamepad2, Tv, Headphones, Printer, Cpu, Heart, TreePine, Flower2, Palette, Scissors, UtensilsCrossed,
};

export default function HomePage() {
  const { t, lang } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [promoted, setPromoted] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<ViewHistoryItem[]>([]);

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(),
      listingsApi.getPromoted(8),
    ]).then(([catRes, promRes]) => {
      setCategories(catRes.data.categories);
      setPromoted(promRes.data.listings);
    }).catch(() => {}).finally(() => setLoading(false));

    // Load recently viewed from localStorage
    setRecentlyViewed(getViewHistory().slice(0, 4));
  }, []);

  const getCategoryIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || MoreHorizontal;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div>
      <SEO
        title={lang === 'pl' ? 'Kupuj i sprzedawaj lokalnie' : 'Buy and sell locally'}
        description={lang === 'pl' ? 'Vipile - portal ogloszeniowy. Tysiace ogloszen w jednym miejscu. Kupuj i sprzedawaj lokalnie w calej Polsce.' : 'Vipile - classifieds portal. Thousands of listings in one place. Buy and sell locally across Poland.'}
      />
      {/* Hero with Banner Slider as background */}
      <BannerSlider>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {t.home.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto drop-shadow">
            {t.home.heroSubtitle}
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchAutocomplete size="lg" className="shadow-2xl" />
          </div>
        </div>
      </BannerSlider>

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
                {cat.imageUrl ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                    {getCategoryIcon(cat.icon)}
                  </div>
                )}
                <span className="text-sm font-medium">{lang === 'pl' ? cat.namePl : cat.nameEn}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Promoted Listings */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              {t.home.promoted}
            </h2>
            <Link to="/ogloszenia" className="text-primary-500 hover:text-primary-600 flex items-center gap-1 text-sm font-medium">
              {t.home.seeAll} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : promoted.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {promoted.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            /* CTA when no promoted listings */
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {lang === 'pl' ? 'Wyrozniij swoje ogloszenie!' : 'Promote your listing!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {lang === 'pl'
                  ? 'Promowane ogloszenia pojawiaja sie na stronie glownej i na gorze list w kategoriach. Zwieksz widocznosc swojego ogłoszenia!'
                  : 'Promoted listings appear on the homepage and at the top of category lists. Increase your listing visibility!'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/dodaj" className="btn-primary flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {t.nav.addListing}
                </Link>
                <Link to="/ogloszenia" className="text-primary-500 hover:text-primary-600 flex items-center gap-1 font-medium">
                  {t.home.browseAll} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-gray-400" />
                {lang === 'pl' ? 'Ostatnio ogladane' : 'Recently viewed'}
              </h2>
              <Link to="/ogloszenia" className="text-primary-500 hover:text-primary-600 flex items-center gap-1 text-sm font-medium">
                {t.home.seeAll} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recentlyViewed.map((item) => (
                <Link
                  key={item.id}
                  to={`/ogloszenia/${item.id}`}
                  className="card-hover p-3 flex gap-3 group"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate group-hover:text-primary-500 transition-colors">{item.title}</p>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">
                      {item.price.toLocaleString('pl-PL')} {item.currency}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
              <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
