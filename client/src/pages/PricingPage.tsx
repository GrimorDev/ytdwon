import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { stripeApi } from '../services/api';
import {
  Check, X, Crown, Loader2, ExternalLink,
  Download, Music, Film, ListOrdered, Zap,
  Shield, Headphones, Monitor,
} from 'lucide-react';

export default function PricingPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    try {
      const { data } = await stripeApi.createCheckout();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data } = await stripeApi.getPortal();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  interface FeatureRow {
    name: string;
    free: string | boolean;
    premium: string | boolean;
  }

  const features: FeatureRow[] = [
    { name: t.tableMaxQuality, free: t.upTo1080, premium: t.upTo8k },
    { name: t.tableAudioFormats, free: t.mp3Only, premium: t.mp3WavFlac },
    { name: t.tablePlaylists, free: t.max15items, premium: t.noLimit },
    { name: t.tablePlatforms, free: true, premium: true },
    { name: t.tableConversion, free: true, premium: true },
    { name: t.tableQueue, free: true, premium: true },
    { name: t.tableHistory, free: true, premium: true },
    { name: t.tableStats, free: false, premium: true },
    { name: t.tablePriority, free: false, premium: true },
    { name: t.tableNoAds, free: false, premium: true },
  ];

  const renderValue = (val: string | boolean) => {
    if (val === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    if (val === false) return <X className="w-5 h-5 text-gray-600 mx-auto" />;
    return <span className="text-sm">{val}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">{t.choosePlan}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {t.pricingSubtitle}
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-8 text-center">
          {t.premiumActivated}
        </div>
      )}

      {canceled && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg mb-8 text-center">
          {t.paymentCanceled}
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Free Plan */}
        <div className="card border-gray-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{t.free}</h2>
            <p className="text-4xl font-bold">
              0 PLN<span className="text-lg font-normal text-gray-500">{t.perMonth}</span>
            </p>
            <p className="text-gray-500 text-sm mt-1">{t.noCommitment}</p>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              { icon: Monitor, text: t.freeVideo1080 },
              { icon: Music, text: t.freeAudioMp3 },
              { icon: ListOrdered, text: t.freePlaylist15 },
              { icon: Film, text: t.freePlatforms },
              { icon: Download, text: t.freeConversion },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-gray-300">
                <Icon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          {user?.plan === 'FREE' ? (
            <div className="text-center text-gray-500 text-sm py-2.5 border border-gray-700 rounded-lg">
              {t.currentPlan}
            </div>
          ) : !user ? (
            <div className="text-center text-gray-500 text-sm py-2.5 border border-gray-700 rounded-lg">
              {t.availableWithoutReg}
            </div>
          ) : null}
        </div>

        {/* Premium Plan */}
        <div className="card border-yellow-500/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
            PREMIUM
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Premium
            </h2>
            <p className="text-4xl font-bold mt-2">
              5.99 PLN<span className="text-lg font-normal text-gray-500">{t.perMonth}</span>
            </p>
            <p className="text-gray-500 text-sm mt-1">{t.cancelAnytime}</p>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              { icon: Monitor, text: t.premiumVideo8k },
              { icon: Headphones, text: t.premiumAudioLossless },
              { icon: ListOrdered, text: t.premiumUnlimitedPlaylists },
              { icon: Zap, text: t.premiumPriorityServers },
              { icon: Shield, text: t.premiumStats },
              { icon: Download, text: t.premiumNoAds },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-gray-300">
                <Icon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          {user?.plan === 'PREMIUM' ? (
            <button
              onClick={handleManage}
              disabled={loading}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              {t.manageSubscription}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
              {user ? `${t.subscribePremium} — 5.99 PLN${t.perMonth}` : t.loginAndSubscribe}
            </button>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-xl font-bold mb-6 text-center">{t.comparePlans}</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium">{t.feature}</th>
              <th className="text-center py-3 px-4 text-sm font-medium w-36">{t.free}</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-yellow-500 w-36">
                <div className="flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4" />
                  Premium
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, i) => (
              <tr key={feature.name} className={`border-b border-gray-800 ${i % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
                <td className="py-3 px-4 text-sm">{feature.name}</td>
                <td className="py-3 px-4 text-center text-gray-400">{renderValue(feature.free)}</td>
                <td className="py-3 px-4 text-center">{renderValue(feature.premium)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
