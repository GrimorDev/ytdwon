import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { favoritesApi } from '../services/api';
import ListingCard from '../components/Listing/ListingCard';
import type { Listing } from '../types';
import { useTranslation } from '../i18n';

export default function FavoritesPage() {
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await favoritesApi.getAll();
      setListings(data.favorites.map((f: any) => f.listing));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (listingId: string) => {
    setListings(prev => prev.filter(l => l.id !== listingId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" />
        {t.favorites.title}
      </h1>

      {listings.length === 0 ? (
        <div className="card text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t.favorites.empty}</h2>
          <p className="text-gray-500 mb-6">{t.favorites.emptyHint}</p>
          <Link to="/ogloszenia" className="btn-primary inline-flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t.favorites.browse}
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-500 mb-4">{t.favorites.count.replace('{count}', listings.length.toString())}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onFavoriteChange={() => handleRemove(listing.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
