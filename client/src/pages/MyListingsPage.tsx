import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Star, MoreVertical } from 'lucide-react';
import { listingsApi } from '../services/api';
import type { Listing } from '../types';
import { useTranslation } from '../i18n';

export default function MyListingsPage() {
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SOLD' | 'ARCHIVED'>('ALL');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data } = await listingsApi.getMy();
      setListings(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'ACTIVE' | 'SOLD' | 'ARCHIVED') => {
    try {
      await listingsApi.updateStatus(id, status);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      setMenuOpen(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.myListings.confirmDelete)) return;
    try {
      await listingsApi.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredListings = filter === 'ALL'
    ? listings
    : listings.filter(l => l.status === filter);

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-500/10 text-green-500',
      SOLD: 'bg-blue-500/10 text-blue-500',
      ARCHIVED: 'bg-gray-500/10 text-gray-500',
    };
    return styles[status as keyof typeof styles] || styles.ARCHIVED;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.myListings.title}</h1>
        <Link to="/dodaj" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t.myListings.addNew}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['ALL', 'ACTIVE', 'SOLD', 'ARCHIVED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {f === 'ALL' ? t.myListings.all : t.listings[`status${f.charAt(0) + f.slice(1).toLowerCase()}` as keyof typeof t.listings]}
            {' '}({f === 'ALL' ? listings.length : listings.filter(l => l.status === f).length})
          </button>
        ))}
      </div>

      {filteredListings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">{t.myListings.empty}</p>
          <Link to="/dodaj" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t.myListings.addFirst}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map(listing => (
            <div key={listing.id} className="card flex gap-4">
              {/* Image */}
              <Link to={`/ogloszenia/${listing.id}`} className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {listing.images?.[0] ? (
                  <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Eye className="w-8 h-8" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/ogloszenia/${listing.id}`} className="font-semibold hover:text-primary-500 transition-colors line-clamp-1">
                      {listing.title}
                    </Link>
                    <p className="text-lg font-bold text-primary-500">{listing.price.toLocaleString()} PLN</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(listing.status)}`}>
                    {t.listings[`status${listing.status.charAt(0) + listing.status.slice(1).toLowerCase()}` as keyof typeof t.listings]}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.views}
                  </span>
                  {listing.promoted && (
                    <span className="badge-promoted flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {t.listings.promoted}
                    </span>
                  )}
                  <span>{listing.city}</span>
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link to={`/edytuj/${listing.id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Edit2 className="w-5 h-5 text-gray-500" />
                </Link>
                {!listing.promoted && listing.status === 'ACTIVE' && (
                  <Link to={`/promuj/${listing.id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Star className="w-5 h-5 text-amber-500" />
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === listing.id ? null : listing.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  {menuOpen === listing.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                      {listing.status !== 'ACTIVE' && (
                        <button onClick={() => handleStatusChange(listing.id, 'ACTIVE')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                          {t.myListings.markActive}
                        </button>
                      )}
                      {listing.status !== 'SOLD' && (
                        <button onClick={() => handleStatusChange(listing.id, 'SOLD')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                          {t.myListings.markSold}
                        </button>
                      )}
                      {listing.status !== 'ARCHIVED' && (
                        <button onClick={() => handleStatusChange(listing.id, 'ARCHIVED')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                          {t.myListings.markArchived}
                        </button>
                      )}
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button onClick={() => handleDelete(listing.id)} className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        {t.common.delete}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
