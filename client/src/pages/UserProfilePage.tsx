import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Star, MessageCircle, User } from 'lucide-react';
import { usersApi, reviewsApi, listingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/Listing/ListingCard';
import type { Listing, Review } from '../types';
import { useTranslation } from '../i18n';

interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  city?: string;
  bio?: string;
  createdAt: string;
  listingsCount: number;
  reviewsCount: number;
}

export default function UserProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, listingsRes, reviewsRes] = await Promise.all([
        usersApi.getProfile(id!),
        listingsApi.getAll({ userId: id }),
        reviewsApi.getForUser(id!),
      ]);
      setProfile(profileRes.data.user);
      setListings(listingsRes.data.listings);
      setReviews(reviewsRes.data.reviews);
      setRating({ average: reviewsRes.data.stats.avgRating, count: reviewsRes.data.stats.count });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await reviewsApi.create(id!, { rating: reviewRating, comment: reviewComment });
      setReviews(prev => [data.review, ...prev]);
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      // Refresh rating
      const reviewsRes = await reviewsApi.getForUser(id!);
      setRating({ average: reviewsRes.data.stats.avgRating, count: reviewsRes.data.stats.count });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canReview = currentUser && currentUser.id !== id && !reviews.some(r => r.reviewerId === currentUser.id);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <User className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold">{t.user.notFound}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <span className="text-3xl text-primary-600 dark:text-primary-400 font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.name}</h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t.user.memberSince} {new Date(profile.createdAt).toLocaleDateString()}
              </span>
              {rating && rating.count > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {rating.average.toFixed(1)} ({rating.count} {t.user.reviews})
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 text-gray-600 dark:text-gray-300">{profile.bio}</p>
            )}

            <div className="flex gap-3 mt-4 justify-center sm:justify-start">
              <div className="text-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold">{profile.listingsCount}</p>
                <p className="text-xs text-gray-500">{t.user.listings}</p>
              </div>
              <div className="text-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-bold">{profile.reviewsCount}</p>
                <p className="text-xs text-gray-500">{t.user.reviews}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'listings'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t.user.listings} ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'reviews'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t.user.reviews} ({reviews.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'listings' ? (
        listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500">{t.user.noListings}</p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {canReview && (
            <div className="card">
              {showReviewForm ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.reviews.rating}</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= reviewRating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.reviews.comment}</label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      className="input-field min-h-[100px]"
                      placeholder={t.reviews.placeholder}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary">
                      {t.common.cancel}
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary">
                      {submitting ? t.common.loading : t.reviews.submit}
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowReviewForm(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  {t.reviews.addReview}
                </button>
              )}
            </div>
          )}

          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    {review.reviewer.avatarUrl ? (
                      <img src={review.reviewer.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-primary-600 dark:text-primary-400 font-semibold">
                        {review.reviewer.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link to={`/uzytkownik/${review.reviewerId}`} className="font-medium hover:text-primary-500">
                        {review.reviewer.name}
                      </Link>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 dark:text-gray-300 mt-2">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <Star className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500">{t.reviews.noReviews}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
