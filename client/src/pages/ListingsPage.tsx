import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { listingsApi, categoriesApi } from '../services/api';
import type { Listing, Category } from '../types';
import ListingCard from '../components/Listing/ListingCard';
import { useTranslation } from '../i18n';

export default function ListingsPage() {
  const { t, lang } = useTranslation();
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = slug || searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const condition = searchParams.get('condition') || '';
  const sort = searchParams.get('sort') || 'newest';

  const [filterCity, setFilterCity] = useState(city);
  const [filterMinPrice, setFilterMinPrice] = useState(minPrice);
  const [filterMaxPrice, setFilterMaxPrice] = useState(maxPrice);
  const [filterCondition, setFilterCondition] = useState(condition);
  const [filterSort, setFilterSort] = useState(sort);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    listingsApi.getAll({
      page,
      limit: 20,
      search: search || undefined,
      category: category || undefined,
      city: city || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      condition: condition || undefined,
      sort: sort || undefined,
    }).then(({ data }) => {
      setListings(data.listings);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search, category, city, minPrice, maxPrice, condition, sort]);

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterCity) params.city = filterCity;
    if (filterMinPrice) params.minPrice = filterMinPrice;
    if (filterMaxPrice) params.maxPrice = filterMaxPrice;
    if (filterCondition) params.condition = filterCondition;
    if (filterSort !== 'newest') params.sort = filterSort;
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilterCity('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterCondition('');
    setFilterSort('newest');
    setSearchParams(search ? { search } : {});
    setShowFilters(false);
  };

  const currentCategory = categories.find(c => c.slug === slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {currentCategory
              ? (lang === 'pl' ? currentCategory.namePl : currentCategory.nameEn)
              : search
                ? `${t.listings.resultsFor} "${search}"`
                : t.listings.allListings
            }
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} {t.listings.found}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary !py-2 !px-3 flex items-center gap-1.5 text-sm">
            <SlidersHorizontal className="w-4 h-4" /> {t.listings.filters}
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Subcategories */}
      {currentCategory?.children && currentCategory.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {currentCategory.children.map(sub => (
            <a key={sub.id} href={`/kategoria/${sub.slug}`} className="btn-secondary !py-1.5 !px-3 text-sm">
              {lang === 'pl' ? sub.namePl : sub.nameEn}
            </a>
          ))}
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t.listings.filters}</h3>
            <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t.listings.city}</label>
              <input value={filterCity} onChange={e => setFilterCity(e.target.value)} className="input-field !py-2" placeholder={t.listings.cityPlaceholder} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t.listings.priceRange}</label>
              <div className="flex gap-2">
                <input type="number" value={filterMinPrice} onChange={e => setFilterMinPrice(e.target.value)} className="input-field !py-2" placeholder="Min" />
                <input type="number" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} className="input-field !py-2" placeholder="Max" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t.listings.condition}</label>
              <select value={filterCondition} onChange={e => setFilterCondition(e.target.value)} className="input-field !py-2">
                <option value="">{t.listings.allConditions}</option>
                <option value="NEW">{t.listings.conditionNew}</option>
                <option value="USED">{t.listings.conditionUsed}</option>
                <option value="DAMAGED">{t.listings.conditionDamaged}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t.listings.sort}</label>
              <select value={filterSort} onChange={e => setFilterSort(e.target.value)} className="input-field !py-2">
                <option value="newest">{t.listings.sortNewest}</option>
                <option value="cheapest">{t.listings.sortCheapest}</option>
                <option value="expensive">{t.listings.sortExpensive}</option>
                <option value="popular">{t.listings.sortPopular}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={applyFilters} className="btn-primary !py-2">{t.listings.apply}</button>
            <button onClick={clearFilters} className="btn-secondary !py-2">{t.listings.clear}</button>
          </div>
        </div>
      )}

      {/* Listings */}
      {loading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">{t.listings.noResults}</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(p));
                setSearchParams(params);
              }}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                p === page ? 'bg-indigo-600 text-white' : 'btn-secondary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
