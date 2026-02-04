import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MapPin, Eye, Clock, MessageCircle, Star, ChevronLeft, ChevronRight, Phone, Share2, Shield, Package, Tag } from 'lucide-react';
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
  const [lightbox, setLightbox] = useState(false);

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

  const conditionColor = (c: string) => {
    switch (c) {
      case 'NEW': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'USED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DAMAGED': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const prevImage = () => {
    if (!listing) return;
    setCurrentImage(i => (i - 1 + listing.images.length) % listing.images.length);
  };

  const nextImage = () => {
    if (!listing) return;
    setCurrentImage(i => (i + 1) % listing.images.length);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="animate-pulse aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            <div className="flex gap-2 mt-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="animate-pulse h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images || [];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        {listing.category && (
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/ogloszenia" className="hover:text-indigo-500 transition-colors">{t.listings.title}</Link>
            <span>/</span>
            <Link to={`/kategoria/${listing.category.slug}`} className="hover:text-indigo-500 transition-colors">
              {lang === 'pl' ? listing.category.namePl : listing.category.nameEn}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{listing.title}</span>
          </nav>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group">
              {images.length > 0 ? (
                <>
                  <div
                    className="aspect-square cursor-pointer"
                    onClick={() => setLightbox(true)}
                  >
                    <img
                      src={images[currentImage].url}
                      alt={listing.title}
                      className="w-full h-full object-contain bg-white dark:bg-gray-900"
                    />
                  </div>

                  {/* Nav arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Image counter */}
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                        {currentImage + 1} / {images.length}
                      </div>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {listing.promoted && (
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                        {t.listings.promoted}
                      </span>
                    )}
                    {listing.isOnSale && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                        {t.detail.sale}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="aspect-square flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Package className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <span className="text-lg">{t.detail.noPhotos}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === currentImage
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description (below gallery on desktop) */}
            <div className="mt-8 hidden lg:block">
              <div className="card !p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-500" />
                  {t.detail.description}
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info + Actions */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-4 space-y-5">
              {/* Title + Price Card */}
              <div className="card !p-6">
                {/* Condition badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${conditionColor(listing.condition)}`}>
                    {conditionLabel(listing.condition)}
                  </span>
                  {listing.category && (
                    <Link
                      to={`/kategoria/${listing.category.slug}`}
                      className="text-xs text-gray-500 hover:text-indigo-500 transition-colors"
                    >
                      {lang === 'pl' ? listing.category.namePl : listing.category.nameEn}
                    </Link>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold leading-tight mb-4">{listing.title}</h1>

                {/* Price */}
                <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                  {listing.isOnSale && listing.originalPrice ? (
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-lg text-gray-400 line-through">
                          {listing.originalPrice.toLocaleString('pl-PL')} {listing.currency}
                        </span>
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded">
                          -{Math.round((1 - listing.price / listing.originalPrice) * 100)}%
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-red-500 mt-1">
                        {listing.price.toLocaleString('pl-PL')} {listing.currency}
                      </p>
                      {listing.lowestPrice30d !== undefined && listing.lowestPrice30d !== null && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {t.detail.lowestPrice30d}: {listing.lowestPrice30d.toLocaleString('pl-PL')} {listing.currency}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {listing.price.toLocaleString('pl-PL')} {listing.currency}
                    </p>
                  )}
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{listing.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span>{listing.views} {t.detail.views}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{t.detail.postedOn} {new Date(listing.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Favorite + Share buttons */}
                {user && user.id !== listing.userId && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleFavorite}
                      className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all text-sm ${
                        favorited
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500' : ''}`} />
                      {favorited ? t.detail.removeFromFavorites : t.detail.addToFavorites}
                    </button>
                  </div>
                )}
              </div>

              {/* Seller Card */}
              {listing.user && (
                <div className="card !p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t.detail.seller}</h3>
                  <Link to={`/uzytkownik/${listing.user.id}`} className="flex items-center gap-3 group">
                    {listing.user.avatarUrl ? (
                      <img src={listing.user.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700" />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                        <span className="text-white font-bold text-lg">{listing.user.name[0].toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold group-hover:text-indigo-500 transition-colors">{listing.user.name}</p>
                      {listing.user.city && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {listing.user.city}
                        </p>
                      )}
                      {listing.user.avgRating ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{listing.user.avgRating.toFixed(1)}</span>
                          {listing.user.reviewsCount !== undefined && (
                            <span className="text-xs text-gray-500">({listing.user.reviewsCount} {t.user.reviews})</span>
                          )}
                        </div>
                      ) : null}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </Link>

                  {/* Phone button */}
                  {listing.user.phone && (
                    <button
                      onClick={() => setShowPhone(!showPhone)}
                      className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                    >
                      <Phone className="w-4 h-4" />
                      {showPhone ? listing.user.phone : t.detail.showPhone}
                    </button>
                  )}

                  {/* Message seller */}
                  {user && user.id !== listing.userId && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t.detail.messagePlaceholder}
                        className="input-field !py-3 min-h-[100px] resize-none text-sm"
                        rows={3}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sending}
                        className="w-full btn-primary !py-3 flex items-center justify-center gap-2 text-base font-semibold rounded-xl"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {sending ? '...' : t.detail.sendMessage}
                      </button>
                    </div>
                  )}

                  {/* Owner actions */}
                  {user && user.id === listing.userId && (
                    <div className="mt-4 space-y-2">
                      <Link
                        to={`/edytuj/${listing.id}`}
                        className="w-full btn-primary !py-3 block text-center rounded-xl font-semibold"
                      >
                        {t.detail.edit}
                      </Link>
                      {!listing.promoted && (
                        <Link
                          to={`/promuj/${listing.id}`}
                          className="w-full btn-outline !py-3 block text-center rounded-xl font-semibold"
                        >
                          {t.detail.promote}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Safety tip */}
              <div className="card !p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">{lang === 'pl' ? 'Bezpieczne zakupy' : 'Safe shopping'}</p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs leading-relaxed">
                      {lang === 'pl'
                        ? 'Sprawdz towar przed zakupem. Umawiaj sie w miejscach publicznych. Nie przesylaj przedplat.'
                        : 'Check the item before buying. Meet in public places. Don\'t send prepayments.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description - mobile only (shown below on smaller screens) */}
        <div className="mt-8 lg:hidden">
          <div className="card !p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" />
              {t.detail.description}
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
              {listing.description}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <img
            src={images[currentImage].url}
            alt={listing.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentImage ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
