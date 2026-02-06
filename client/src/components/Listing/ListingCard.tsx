import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, Eye, Check, Image, Ban } from 'lucide-react';
import type { Listing } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { favoritesApi } from '../../services/api';
import { useState } from 'react';
import { useTranslation } from '../../i18n';
import { getCardAttributes, formatAttributeValue } from '../../config/categoryAttributes';

interface Props {
  listing: Listing;
  viewMode?: 'grid' | 'list';
  onFavoriteChange?: () => void;
}

export default function ListingCard({ listing, viewMode = 'grid', onFavoriteChange }: Props) {
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
        const formatted = formatAttributeValue(attr, value, lang);
        if (formatted) pills.push(formatted);
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
    if (minutes < 60) return lang === 'pl' ? `${minutes} min temu` : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return lang === 'pl' ? `${hours} godz. temu` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return lang === 'pl' ? `${days} dni temu` : `${days}d ago`;
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const imageUrl = listing.images?.[0]?.url || '';
  const imageCount = listing.images?.length || 0;

  const isSold = listing.status === 'SOLD';
  const isReserved = listing.status === 'RESERVED';
  const isInactive = isSold || isReserved;

  const statusBadge = isSold
    ? { label: lang === 'pl' ? 'Sprzedane' : 'Sold', className: 'bg-red-600 text-white' }
    : isReserved
    ? { label: lang === 'pl' ? 'Zarezerwowane' : 'Reserved', className: 'bg-amber-500 text-white' }
    : null;

  // Automatic badges
  const isNew = !isInactive && (Date.now() - new Date(listing.createdAt).getTime()) < 24 * 60 * 60 * 1000;
  const isHot = !isInactive && (listing.views > 50 || (listing.favoritesCount !== undefined && listing.favoritesCount > 5));

  // LIST VIEW - horizontal layout like OLX
  if (viewMode === 'list') {
    return (
      <Link
        to={`/ogloszenia/${listing.id}`}
        className={`card-hover flex gap-4 p-0 overflow-hidden group ${isInactive ? 'opacity-80' : ''}`}
      >
        {/* Image */}
        <div className="relative w-[220px] h-[165px] flex-shrink-0 overflow-hidden bg-gray-200 dark:bg-gray-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isInactive ? 'grayscale-[30%]' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <PackageIcon className="w-12 h-12" />
            </div>
          )}

          {/* Image count badge */}
          {imageCount > 1 && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded flex items-center gap-1">
              <Image className="w-3 h-3" />
              {imageCount}
            </span>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {listing.promoted && !isInactive && (
              <span className="badge-promoted">
                {t.listings.promoted}
              </span>
            )}
            {isNew && (
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full shadow">
                {t.home.badgeNew}
              </span>
            )}
            {isHot && !isNew && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow flex items-center gap-0.5">
                🔥 {t.home.badgeHot}
              </span>
            )}
          </div>

          {/* Sold/Reserved overlay */}
          {statusBadge && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 py-3 pr-4 flex flex-col min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-base mb-1 group-hover:text-primary-500 transition-colors line-clamp-2">
            {listing.title}
          </h3>

          {/* Location & Time */}
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {listing.city}
            </span>
            <span>•</span>
            <span>{timeAgo(listing.createdAt)}</span>
          </div>

          {/* Attributes / Description preview */}
          {pills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {pills.map((pill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                >
                  {pill}
                </span>
              ))}
            </div>
          ) : listing.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
              {listing.description}
            </p>
          )}

          {/* Bottom row: condition badge + status */}
          <div className="mt-auto flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${conditionColor(listing.condition)}`}>
              {conditionLabel(listing.condition)}
            </span>
            {statusBadge && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            )}
            {listing.user?.isVerified && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Check className="w-3 h-3" />
                {lang === 'pl' ? 'Zweryfikowany' : 'Verified'}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Price & Actions */}
        <div className="flex flex-col items-end justify-between py-3 pr-4 flex-shrink-0 min-w-[140px]">
          {/* Price */}
          <div className="text-right">
            {isSold ? (
              <span className="text-xl font-bold text-gray-400 line-through">
                {listing.price.toLocaleString('pl-PL')} {listing.currency}
              </span>
            ) : listing.isOnSale && listing.originalPrice ? (
              <>
                <span className="text-sm text-gray-400 line-through block">
                  {listing.originalPrice.toLocaleString('pl-PL')} {listing.currency}
                </span>
                <span className="text-xl font-bold text-red-500">
                  {listing.price.toLocaleString('pl-PL')} {listing.currency}
                </span>
              </>
            ) : (
              <span className={`text-xl font-bold ${isReserved ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                {listing.price.toLocaleString('pl-PL')} {listing.currency}
              </span>
            )}
          </div>

          {/* Favorite button */}
          {user && (
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full transition-colors ${
                favorited
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </Link>
    );
  }

  // GRID VIEW - original card layout
  return (
    <Link to={`/ogloszenia/${listing.id}`} className={`card-hover overflow-hidden group block ${isInactive ? 'opacity-80' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-800">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isInactive ? 'grayscale-[30%]' : ''}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <PackageIcon className="w-12 h-12" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {listing.promoted && !isInactive && (
            <span className="badge-promoted">{t.listings.promoted}</span>
          )}
          {listing.isOnSale && listing.originalPrice && !isInactive && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              -{Math.round((1 - listing.price / listing.originalPrice) * 100)}%
            </span>
          )}
          {isNew && (
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full shadow">
              {t.home.badgeNew}
            </span>
          )}
          {isHot && !isNew && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow flex items-center gap-0.5">
              🔥 {t.home.badgeHot}
            </span>
          )}
        </div>
        {user && (
          <button onClick={handleFavorite} className="absolute top-2 right-2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        )}
        {/* Image count */}
        {imageCount > 1 && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded flex items-center gap-1">
            <Image className="w-3 h-3" />
            {imageCount}
          </span>
        )}
        {/* Sold/Reserved overlay */}
        {statusBadge && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        {/* Condition badge + status */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${conditionColor(listing.condition)}`}>
            {conditionLabel(listing.condition)}
          </span>
          {statusBadge && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          )}
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

        {isSold ? (
          <p className="text-lg font-bold text-gray-400 line-through">
            {listing.price.toLocaleString('pl-PL')} {listing.currency}
          </p>
        ) : listing.isOnSale && listing.originalPrice ? (
          <div>
            <span className="text-sm text-gray-400 line-through mr-2">
              {listing.originalPrice.toLocaleString('pl-PL')} {listing.currency}
            </span>
            <span className="text-lg font-bold text-red-500">
              {listing.price.toLocaleString('pl-PL')} {listing.currency}
            </span>
          </div>
        ) : (
          <p className={`text-lg font-bold ${isReserved ? 'text-amber-600 dark:text-amber-400' : 'text-primary-500'}`}>
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
