import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Check, Zap, TrendingUp, Eye } from 'lucide-react';
import { listingsApi, stripeApi } from '../services/api';
import type { Listing } from '../types';
import { useTranslation } from '../i18n';

const PROMOTION_PLANS = [
  { id: '7days', days: 7, price: 9.99, popular: false },
  { id: '14days', days: 14, price: 17.99, popular: true },
  { id: '30days', days: 30, price: 29.99, popular: false },
];

export default function PromotePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('14days');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data } = await listingsApi.getById(id!);
      setListing(data.listing);
      if (data.listing.promoted) {
        // Already promoted
      }
    } catch (err) {
      navigate('/moje-ogloszenia');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!listing || processing) return;
    setProcessing(true);

    try {
      const plan = PROMOTION_PLANS.find(p => p.id === selectedPlan)!;
      const { data } = await stripeApi.createPromoteSession(listing.id, plan.days);
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  if (listing.promoted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="card">
          <Star className="w-16 h-16 mx-auto text-amber-500 fill-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t.promote.alreadyPromoted}</h1>
          <p className="text-gray-500 mb-4">
            {t.promote.activeUntil} {new Date(listing.promotedUntil!).toLocaleDateString()}
          </p>
          <Link to={`/ogloszenia/${listing.id}`} className="btn-primary">
            {t.promote.viewListing}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{t.promote.title}</h1>
      <p className="text-gray-500 mb-8">{t.promote.subtitle}</p>

      {/* Listing Preview */}
      <div className="card mb-8">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            {listing.images?.[0] ? (
              <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Eye className="w-8 h-8" />
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{listing.title}</h2>
            <p className="text-lg font-bold text-indigo-500">{listing.price.toLocaleString()} PLN</p>
            <p className="text-sm text-gray-500">{listing.city}</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="card mb-8">
        <h2 className="font-semibold mb-4">{t.promote.benefits}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium">{t.promote.benefit1Title}</h3>
              <p className="text-sm text-gray-500">{t.promote.benefit1Desc}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium">{t.promote.benefit2Title}</h3>
              <p className="text-sm text-gray-500">{t.promote.benefit2Desc}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium">{t.promote.benefit3Title}</h3>
              <p className="text-sm text-gray-500">{t.promote.benefit3Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {PROMOTION_PLANS.map(plan => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`card relative text-left transition-all ${
              selectedPlan === plan.id
                ? 'ring-2 ring-indigo-500 border-indigo-500'
                : 'hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {t.promote.popular}
              </span>
            )}
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-500">{plan.days}</p>
              <p className="text-sm text-gray-500 mb-3">{t.promote.days}</p>
              <p className="text-2xl font-bold">{plan.price} PLN</p>
              <p className="text-xs text-gray-500">
                {(plan.price / plan.days).toFixed(2)} PLN/{t.promote.perDay}
              </p>
            </div>
            {selectedPlan === plan.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="flex gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1">
          {t.common.cancel}
        </button>
        <button onClick={handlePromote} disabled={processing} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {processing ? (
            t.common.loading
          ) : (
            <>
              <Star className="w-5 h-5" />
              {t.promote.pay} {PROMOTION_PLANS.find(p => p.id === selectedPlan)?.price} PLN
            </>
          )}
        </button>
      </div>
    </div>
  );
}
