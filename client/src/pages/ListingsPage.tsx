import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, List, X, ChevronRight, Smartphone, Car, Home, Sofa, Shirt, Dumbbell, Baby, Briefcase, HandHelping, MoreHorizontal } from 'lucide-react';

const iconMap: Record<string, any> = {
  Smartphone, Car, Home, Sofa, Shirt, Dumbbell, Baby, Briefcase, HandHelping, MoreHorizontal
};
import { listingsApi, categoriesApi } from '../services/api';
import type { Listing, Category } from '../types';
import ListingCard from '../components/Listing/ListingCard';
import { useTranslation } from '../i18n';
import CategoryFilters from '../components/Listing/CategoryFilters';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Layout/Breadcrumbs';

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
  const [attrFilters, setAttrFilters] = useState<Record<string, string>>({});

  // Parse attr_* params from URL on load
  useEffect(() => {
    const attrs: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('attr_')) {
        attrs[key.replace('attr_', '')] = value;
      }
    });
    setAttrFilters(attrs);
  }, []);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  // Build attributes object from URL params
  const urlAttrFilters = useMemo(() => {
    const attrs: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('attr_')) {
        attrs[key.replace('attr_', '')] = value;
      }
    });
    return attrs;
  }, [searchParams]);

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
      attributes: Object.keys(urlAttrFilters).length > 0 ? urlAttrFilters : undefined,
    }).then(({ data }) => {
      setListings(data.listings);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search, category, city, minPrice, maxPrice, condition, sort, urlAttrFilters]);

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterCity) params.city = filterCity;
    if (filterMinPrice) params.minPrice = filterMinPrice;
    if (filterMaxPrice) params.maxPrice = filterMaxPrice;
    if (filterCondition) params.condition = filterCondition;
    if (filterSort !== 'newest') params.sort = filterSort;
    // Add attribute filters with attr_ prefix
    Object.entries(attrFilters).forEach(([key, value]) => {
      if (value) params[`attr_${key}`] = value;
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilterCity('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterCondition('');
    setFilterSort('newest');
    setAttrFilters({});
    setSearchParams(search ? { search } : {});
    setShowFilters(false);
  };

  // Reset attribute filters when category changes
  useEffect(() => {
    setAttrFilters({});
  }, [slug]);

  const currentCategory = categories.find(c => c.slug === slug);

  // Find parent category if current is a subcategory
  const parentCategory = currentCategory?.parentId
    ? categories.find(c => c.id === currentCategory.parentId)
    : undefined;

  // Check if current category is a parent with children (show landing page)
  const isParentCategory = currentCategory && currentCategory.children && currentCategory.children.length > 0;

  const getCategoryIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || MoreHorizontal;
    return <Icon className="w-8 h-8" />;
  };

  // Build breadcrumb items
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: t.listings.title || (lang === 'pl' ? 'Ogłoszenia' : 'Listings'), href: '/ogloszenia' }
    ];

    if (search) {
      items.push({ label: `"${search}"` });
    } else if (currentCategory) {
      if (parentCategory) {
        items.push({
          label: lang === 'pl' ? parentCategory.namePl : parentCategory.nameEn,
          href: `/kategoria/${parentCategory.slug}`
        });
      }
      items.push({ label: lang === 'pl' ? currentCategory.namePl : currentCategory.nameEn });
    }

    return items;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumbs items={getBreadcrumbItems()} />
      </div>

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
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Parent category landing - Big subcategory tiles */}
      {isParentCategory && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            {lang === 'pl' ? 'Wybierz podkategorię' : 'Choose a subcategory'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategory.children!.map(sub => (
              <Link
                key={sub.id}
                to={`/kategoria/${sub.slug}`}
                className="card-hover p-6 flex items-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:from-primary-100 group-hover:to-primary-200 dark:group-hover:from-primary-900/50 dark:group-hover:to-primary-800/50 transition-colors">
                  {getCategoryIcon(sub.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {lang === 'pl' ? sub.namePl : sub.nameEn}
                  </h3>
                  {sub._count?.listings !== undefined && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {sub._count.listings} {lang === 'pl' ? 'ogłoszeń' : 'listings'}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Optional: Show some promoted listings from parent category */}
          {listings.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                {lang === 'pl' ? 'Polecane w tej kategorii' : 'Featured in this category'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {listings.slice(0, 4).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters panel - only show for leaf categories */}
      {!isParentCategory && showFilters && (
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

          {/* Category-specific filters */}
          {currentCategory?.slug && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <CategoryFilters
                categorySlug={currentCategory.slug}
                values={attrFilters}
                onChange={setAttrFilters}
              />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={applyFilters} className="btn-primary !py-2">{t.listings.apply}</button>
            <button onClick={clearFilters} className="btn-secondary !py-2">{t.listings.clear}</button>
          </div>
        </div>
      )}

      {/* Listings - only show full grid for leaf categories */}
      {!isParentCategory && (
        loading ? (
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
        )
      )}

      {/* Pagination - only for leaf categories */}
      {!isParentCategory && totalPages > 1 && (
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
                p === page ? 'bg-primary-600 text-white' : 'btn-secondary'
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
