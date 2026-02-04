import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MapPin, Eye, Clock, MessageCircle, Star, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { listingsApi, favoritesApi, chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import type { Listing } from '../types';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    if (!id) return;
    listingsApi.getById(id)
      .then(({ data }) => {
        setListing(data.listing);
        setFavorited(data.listing.isFavorited || false);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFavorite = async () => {
    if (!user || !listing) return;
    try {
      const { data } = await favoritesApi.toggle(listing.id);
      setFavorited(data.favorited);
    } catch {}
  };

  const handleSendMessage = async () => {
    if (!user || !listing || !message.trim()) return;
    setSending(true);
    try {
      const { data } = await chatApi.startConversation(listing.id, message.trim());
      navigate(`/wiadomosci/${data.conversation.id}`);
    } catch {} finally {
      setSending(false);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl mb-6" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImage].url}
                  alt={listing.title}
                  className="w-full aspect-video object-contain bg-black"
                />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentImage(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setCurrentImage(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="aspect-video flex items-center justify-center text-gray-400">
                <span className="text-lg">{t.detail.noPhotos}</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setCurrentImage(i)} className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-indigo-500' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title + Price */}
          <div>
            {listing.promoted && <span className="badge-promoted mb-2 inline-block">{t.listings.promoted}</span>}
            {listing.isOnSale && <span className="inline-block mb-2 ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{t.detail.sale}</span>}
            <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
            <div className="mt-2">
              {listing.isOnSale && listing.originalPrice ? (
                <>
                  <span className="text-lg text-gray-400 line-through mr-3">
                    {listing.originalPrice.toLocaleString('pl-PL')} {listing.currency}
                  </span>
                  <span className="text-3xl font-bold text-red-500">
                    {listing.price.toLocaleString('pl-PL')} {listing.currency}
                  </span>
                  {listing.lowestPrice30d !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t.detail.lowestPrice30d}: {listing.lowestPrice30d.toLocaleString('pl-PL')} {listing.currency}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-3xl font-bold text-indigo-500">
                  {listing.price.toLocaleString('pl-PL')} {listing.currency}
                </p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.city}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {listing.views} {t.detail.views}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(listing.createdAt).toLocaleDateString('pl-PL')}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800">{conditionLabel(listing.condition)}</span>
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="font-semibold text-lg mb-3">{t.detail.description}</h2>
            <p className="whitespace-pre-wrap leading-relaxed">{listing.description}</p>
          </div>
        </div>

        {/* Right: Seller + Actions */}
        <div className="space-y-4">
          {/* Seller card */}
          {listing.user && (
            <div className="card">
              <Link to={`/uzytkownik/${listing.user.id}`} className="flex items-center gap-3 mb-4">
                {listing.user.avatarUrl ? (
                  <img src={listing.user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{listing.user.name[0].toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{listing.user.name}</p>
                  {listing.user.avgRating ? (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{listing.user.avgRating.toFixed(1)}</span>
                    </div>
                  ) : null}
                </div>
              </Link>

              {/* Phone */}
              {listing.user.phone && (
                <button onClick={() => setShowPhone(!showPhone)} className="w-full btn-secondary !py-2.5 flex items-center justify-center gap-2 mb-3">
                  <Phone className="w-4 h-4" />
                  {showPhone ? listing.user.phone : t.detail.showPhone}
                </button>
              )}

              {/* Actions */}
              {user && user.id !== listing.userId && (
                <>
                  <button onClick={handleFavorite} className={`w-full !py-2.5 flex items-center justify-center gap-2 mb-3 ${favorited ? 'btn-danger' : 'btn-outline'}`}>
                    <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
                    {favorited ? t.detail.removeFromFavorites : t.detail.addToFavorites}
                  </button>

                  {/* Message seller */}
                  <div className="space-y-2">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.detail.messagePlaceholder}
                      className="input-field !py-2 min-h-[80px] resize-none"
                    />
                    <button onClick={handleSendMessage} disabled={!message.trim() || sending} className="w-full btn-primary !py-2.5 flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {sending ? '...' : t.detail.sendMessage}
                    </button>
                  </div>
                </>
              )}

              {user && user.id === listing.userId && (
                <div className="space-y-2">
                  <Link to={`/edytuj/${listing.id}`} className="w-full btn-primary !py-2.5 block text-center">
                    {t.detail.edit}
                  </Link>
                  {!listing.promoted && (
                    <Link to={`/promuj/${listing.id}`} className="w-full btn-outline !py-2.5 block text-center">
                      {t.detail.promote}
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Category */}
          {listing.category && (
            <div className="card">
              <p className="text-sm text-gray-500">{t.detail.category}</p>
              <Link to={`/kategoria/${listing.category.slug}`} className="text-indigo-500 font-medium hover:underline">
                {lang === 'pl' ? listing.category.namePl : listing.category.nameEn}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
