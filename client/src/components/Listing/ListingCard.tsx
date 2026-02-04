import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock } from 'lucide-react';
import type { Listing } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { favoritesApi } from '../../services/api';
import { useState } from 'react';
import { useTranslation } from '../../i18n';

interface Props {
  listing: Listing;
  onFavoriteChange?: () => void;
}

export default function ListingCard({ listing, onFavoriteChange }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(listing.isFavorited || false);

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
        {listing.promoted && (
          <span className="absolute top-2 left-2 badge-promoted">{t.listings.promoted}</span>
        )}
        {user && (
          <button onClick={handleFavorite} className="absolute top-2 right-2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{listing.title}</h3>
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
