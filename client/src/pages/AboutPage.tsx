import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, DollarSign, MapPin, Users, Package, ShoppingBag, Building2, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n';
import { siteStatsApi } from '../services/api';
import SEO from '../components/SEO';

export default function AboutPage() {
  const { t, lang } = useTranslation();
  const isPl = lang === 'pl';
  const [stats, setStats] = useState<{ users: number; listings: number; transactions: number; cities: number } | null>(null);

  useEffect(() => {
    siteStatsApi.get().then(({ data }) => {
      setStats({
        users: data.users || 0,
        listings: data.listings || 0,
        transactions: data.transactions || 0,
        cities: data.cities || 0,
      });
    }).catch(() => {});
  }, []);

  const features = [
    { icon: Zap, title: t.about.why1Title, desc: t.about.why1Desc, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: Shield, title: t.about.why2Title, desc: t.about.why2Desc, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: DollarSign, title: t.about.why3Title, desc: t.about.why3Desc, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: MapPin, title: t.about.why4Title, desc: t.about.why4Desc, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const statItems = stats ? [
    { label: t.home.statsUsers, value: stats.users, icon: Users },
    { label: t.home.statsListings, value: stats.listings, icon: Package },
    { label: t.home.statsTransactions, value: stats.transactions, icon: ShoppingBag },
    { label: t.home.statsCities, value: stats.cities, icon: Building2 },
  ] : [];

  return (
    <>
      <SEO
        title={t.about.title}
        description={isPl ? 'Vipile - polski portal ogloszeniowy. Kupuj i sprzedawaj lokalnie w calej Polsce.' : 'Vipile - Polish classifieds portal. Buy and sell locally across Poland.'}
      />
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            {t.about.heroTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.about.heroSubtitle}
          </p>
        </div>

        {/* Mission */}
        <div className="card mb-12">
          <h2 className="text-2xl font-bold mb-4">{t.about.missionTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            {t.about.missionText}
          </p>
        </div>

        {/* Why Vipile */}
        <h2 className="text-2xl font-bold mb-6 text-center">{t.about.whyTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {features.map((f) => (
            <div key={f.title} className="card flex gap-4">
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">{t.about.statsTitle}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statItems.map((s) => (
                <div key={s.label} className="card text-center">
                  <s.icon className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{s.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div className="card text-center bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
          <h2 className="text-2xl font-bold mb-2">{t.about.contactTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t.about.contactText}</p>
          <Link to="/kontakt" className="btn-primary inline-flex items-center gap-2">
            {t.about.contactButton}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
