import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock } from 'lucide-react';
import type { Listing } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { favoritesApi } from '../../services/api';
import { useState } from 'react';
import { useTranslation } from '../../i18n';
import { getCardAttributes, resolveSelectLabel, formatAttributeValue } from '../../config/categoryAttributes';

interface Props {
  listing: Listing;
  onFavoriteChange?: () => void;
}

export default function ListingCard({ listing, onFavoriteChange }: Props) {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const [favorited, setFavorited] = useState(listing.isFavorited || false);

  // Get attribute pills to show on card
  const getAttributePills = (): string[] => {
    if (!listing.attributes || !listing.category?.slug) return [];
    const cardAttrs = getCardAttributes(listing.category.slug);
    const pills: string[] = [];
    for (const attr of cardAttrs) {
      const value = listing.attributes[attr.key];
      if (value !== undefined && value !== '' && value !== null) {
        if (attr.type === 'select' && attr.options) {
          pills.push(resolveSelectLabel(attr.options, value, lang));
        } else {
          pills.push(formatAttributeValue(value, attr.unit));
        }
      }
      if (pills.length >= 3) break; // Max 3 pills
    }
    return pills;
  };

  const conditionColor = (c: string) => {
    switch (c) {
      case 'NEW': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'USED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DAMAGED': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const conditionLabel = (c: string) => {
    switch (c) {
      case 'NEW': return t.listings.conditionNew;
      case 'USED': return t.listings.conditionUsed;
      case 'DAMAGED': return t.listings.conditionDamaged;
      default: return c;
    }
  };

  const pills = getAttributePills();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      const { data } = await favoritesApi.toggle(listing.id);
      setFavorited(data.favorited);
      onFavoriteChange?.();
    } catch {}
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const imageUrl = listing.images?.[0]?.url || '';

  return (
    <Link to={`/ogloszenia/${listing.id}`} className="card-hover overflow-hidden group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-800">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <PackageIcon className="w-12 h-12" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {listing.promoted && (
            <span className="badge-promoted">{t.listings.promoted}</span>
          )}
          {listing.isOnSale && listing.originalPrice && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              -{Math.round((1 - listing.price / listing.originalPrice) * 100)}%
            </span>
          )}
        </div>
        {user && (
          <button onClick={handleFavorite} className="absolute top-2 right-2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        )}
      </div>
      <div className="p-3">
        {/* Condition badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${conditionColor(listing.condition)}`}>
            {conditionLabel(listing.condition)}
          </span>
          {listing.category && (
            <span className="text-[10px] text-gray-500 truncate">
              {lang === 'pl' ? listing.category.namePl : listing.category.nameEn}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{listing.title}</h3>

        {/* Attribute pills */}
        {pills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {pills.map((pill, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded-full">
                {pill}
              </span>
            ))}
          </div>
        )}

        {listing.isOnSale && listing.originalPrice ? (
          <div>
            <span className="text-sm text-gray-400 line-through mr-2">
              {listing.originalPrice.toLocaleString('pl-PL')} {listing.currency}
            </span>
            <span className="text-lg font-bold text-red-500">
              {listing.price.toLocaleString('pl-PL')} {listing.currency}
            </span>
          </div>
        ) : (
          <p className="text-lg font-bold text-indigo-500">
            {listing.price.toLocaleString('pl-PL')} {listing.currency}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {listing.city}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}
