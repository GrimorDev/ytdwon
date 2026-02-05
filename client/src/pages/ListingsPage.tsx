import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal, Grid3X3, List, X, ChevronRight, ChevronDown, ChevronUp,
  Smartphone, Car, Home, Sofa, Shirt, Dumbbell, Baby, Briefcase, HandHelping, MoreHorizontal,
  MapPin, Search, Heart, Bell
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Smartphone, Car, Home, Sofa, Shirt, Dumbbell, Baby, Briefcase, HandHelping, MoreHorizontal
};
import { listingsApi, categoriesApi } from '../services/api';
import type { Listing, Category } from '../types';
import ListingCard from '../components/Listing/ListingCard';
import { useTranslation } from '../i18n';
import CategoryFilters from '../components/Listing/CategoryFilters';
import Breadcrumbs, { type BreadcrumbItem } from '../components/Layout/Breadcrumbs';
import { addSavedSearch, removeSavedSearch, isSearchSaved, getSavedSearches, type SavedSearch } from '../utils/savedSearches';

// Polish cities for autocomplete
const POLISH_CITIES = [
  'Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz',
  'Lublin', 'Białystok', 'Katowice', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec',
  'Toruń', 'Kielce', 'Rzeszów', 'Gliwice', 'Zabrze', 'Olsztyn', 'Bielsko-Biała',
  'Bytom', 'Zielona Góra', 'Rybnik', 'Ruda Śląska', 'Opole', 'Tychy', 'Gorzów Wielkopolski'
];

export default function ListingsPage() {
  const { t, lang } = useTranslation();
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Filter sections expanded state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: true,
    price: true,
    condition: true,
    category: false,
  });

  // Search bar state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('city') || '');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [searchWatched, setSearchWatched] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // URL params
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = slug || searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const condition = searchParams.get('condition') || '';
  const sort = searchParams.get('sort') || 'newest';

  // Filter state
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

  // Check if current search is watched
  useEffect(() => {
    const hasContent = search || city || slug;
    if (hasContent) {
      setSearchWatched(isSearchSaved(search, city, slug));
    } else {
      setSearchWatched(false);
    }
    setSavedSearches(getSavedSearches());
  }, [search, city, slug]);

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

  // Apply filters (from sidebar)
  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
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
    setShowMobileFilters(false);
  };

  // Handle search bar submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (locationQuery) params.city = locationQuery;
    setFilterCity(locationQuery);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilterCity('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterCondition('');
    setFilterSort('newest');
    setAttrFilters({});
    setSearchParams(search ? { search } : {});
    setShowMobileFilters(false);
  };

  // Reset attribute filters when category changes
  useEffect(() => {
    setAttrFilters({});
  }, [slug]);

  const currentCategory = categories.find(c => c.slug === slug);
  const parentCategory = currentCategory?.parentId
    ? categories.find(c => c.id === currentCategory.parentId)
    : undefined;
  const isParentCategory = currentCategory && currentCategory.children && currentCategory.children.length > 0;

  const getCategoryIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || MoreHorizontal;
    return <Icon className="w-8 h-8" />;
  };

  // Filter city suggestions
  const citySuggestions = POLISH_CITIES.filter(c =>
    c.toLowerCase().includes(locationQuery.toLowerCase())
  ).slice(0, 5);

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Count active filters
  const activeFiltersCount = [filterCity, filterMinPrice, filterMaxPrice, filterCondition]
    .filter(f => f).length + Object.values(attrFilters).filter(v => v).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Bar - like OLX */}
      <div className="bg-white dark:bg-dark-600 rounded-xl shadow-sm border border-gray-200 dark:border-dark-500 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'pl' ? 'Czego szukasz?' : 'What are you looking for?'}
              className="input-field !pl-10 !py-3"
            />
          </div>

          {/* Location input */}
          <div className="w-full md:w-64 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setShowCitySuggestions(true);
              }}
              onFocus={() => setShowCitySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
              placeholder={lang === 'pl' ? 'Cała Polska' : 'All Poland'}
              className="input-field !pl-10 !py-3"
            />
            {/* City suggestions dropdown */}
            {showCitySuggestions && citySuggestions.length > 0 && locationQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-600 rounded-lg shadow-lg border border-gray-200 dark:border-dark-500 z-50 overflow-hidden">
                {citySuggestions.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setLocationQuery(city);
                      setShowCitySuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-500 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search button */}
          <button type="submit" className="btn-primary !py-3 !px-8 flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            <span>{lang === 'pl' ? 'Szukaj' : 'Search'}</span>
          </button>
        </form>

        {/* Quick filter buttons + saved searches */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {(search || city || slug) && (
            <button
              onClick={() => {
                if (searchWatched) {
                  const saved = getSavedSearches().find(
                    s => s.query === search && (s.city || '') === (city || '') && (s.category || '') === (slug || '')
                  );
                  if (saved) {
                    removeSavedSearch(saved.id);
                    setSearchWatched(false);
                    setSavedSearches(getSavedSearches());
                  }
                } else {
                  addSavedSearch({
                    query: search,
                    city: city || undefined,
                    category: slug || undefined,
                    categoryName: currentCategory
                      ? (lang === 'pl' ? currentCategory.namePl : currentCategory.nameEn)
                      : undefined,
                  });
                  setSearchWatched(true);
                  setSavedSearches(getSavedSearches());
                }
              }}
              className={`text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
                searchWatched
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-800'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:border-primary-300 border-gray-200 dark:border-gray-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${searchWatched ? 'fill-red-500' : ''}`} />
              {searchWatched
                ? (lang === 'pl' ? 'Obserwujesz' : 'Watching')
                : (lang === 'pl' ? 'Obserwuj wyszukiwanie' : 'Watch search')
              }
            </button>
          )}
          {/* Saved searches pills */}
          {savedSearches.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Bell className="w-4 h-4 text-gray-400" />
              {savedSearches.slice(0, 5).map(saved => (
                <Link
                  key={saved.id}
                  to={`${saved.category ? `/kategoria/${saved.category}` : '/ogloszenia'}${
                    saved.query || saved.city
                      ? '?' + new URLSearchParams(
                          Object.fromEntries(
                            Object.entries({ search: saved.query || '', city: saved.city || '' }).filter(([, v]) => v)
                          ) as Record<string, string>
                        ).toString()
                      : ''
                  }`}
                  className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 transition-colors"
                >
                  {[saved.query, saved.categoryName, saved.city].filter(Boolean).join(' • ') || (lang === 'pl' ? 'Wszystkie' : 'All')}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumbs items={getBreadcrumbItems()} />
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

          {/* Show promoted listings from parent category */}
          {listings.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                {lang === 'pl' ? 'Polecane w tej kategorii' : 'Featured in this category'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {listings.slice(0, 4).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} viewMode="grid" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main content - Filters sidebar + Listings */}
      {!isParentCategory && (
        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="card sticky top-20">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">{t.listings.filters}</h2>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-primary-500 hover:text-primary-600">
                    {lang === 'pl' ? 'Wyczyść filtry' : 'Clear filters'} ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Location Section */}
              <FilterSection
                title={lang === 'pl' ? 'Lokalizacja' : 'Location'}
                expanded={expandedSections.location}
                onToggle={() => toggleSection('location')}
              >
                <input
                  type="text"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  placeholder={lang === 'pl' ? 'Wpisz miasto...' : 'Enter city...'}
                  className="input-field !py-2 text-sm"
                />
              </FilterSection>

              {/* Price Section */}
              <FilterSection
                title={lang === 'pl' ? 'Cena' : 'Price'}
                expanded={expandedSections.price}
                onToggle={() => toggleSection('price')}
              >
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(e.target.value)}
                    placeholder={lang === 'pl' ? 'Od' : 'From'}
                    className="input-field !py-2 text-sm flex-1"
                  />
                  <input
                    type="number"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    placeholder={lang === 'pl' ? 'Do' : 'To'}
                    className="input-field !py-2 text-sm flex-1"
                  />
                </div>
              </FilterSection>

              {/* Condition Section */}
              <FilterSection
                title={t.listings.condition}
                expanded={expandedSections.condition}
                onToggle={() => toggleSection('condition')}
              >
                <div className="space-y-2">
                  {[
                    { value: '', label: t.listings.allConditions },
                    { value: 'NEW', label: t.listings.conditionNew },
                    { value: 'USED', label: t.listings.conditionUsed },
                    { value: 'DAMAGED', label: t.listings.conditionDamaged },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        checked={filterCondition === opt.value}
                        onChange={() => setFilterCondition(opt.value)}
                        className="w-4 h-4 text-primary-500 border-gray-300"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Category-specific filters */}
              {currentCategory?.slug && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <CategoryFilters
                    categorySlug={currentCategory.slug}
                    values={attrFilters}
                    onChange={setAttrFilters}
                  />
                </div>
              )}

              {/* Apply button */}
              <button onClick={applyFilters} className="btn-primary w-full mt-4">
                {lang === 'pl' ? 'Zastosuj filtry' : 'Apply filters'}
              </button>
            </div>
          </aside>

          {/* Listings */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="min-w-0 flex-shrink">
                <h1 className="text-xl font-bold truncate">
                  {currentCategory
                    ? (lang === 'pl' ? currentCategory.namePl : currentCategory.nameEn)
                    : search
                      ? `${t.listings.resultsFor} "${search}"`
                      : t.listings.allListings
                  }
                </h1>
                <p className="text-sm text-gray-500">
                  {lang === 'pl' ? `Znaleźliśmy ${total} ogłoszeń` : `Found ${total} listings`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden btn-secondary !py-2 !px-3 flex items-center gap-1.5 text-sm"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t.listings.filters}
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <select
                  value={filterSort}
                  onChange={(e) => {
                    setFilterSort(e.target.value);
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value !== 'newest') {
                      params.set('sort', e.target.value);
                    } else {
                      params.delete('sort');
                    }
                    setSearchParams(params);
                  }}
                  className="input-field !py-2 !pr-8 text-sm bg-white dark:bg-dark-600"
                >
                  <option value="newest">{t.listings.sortNewest}</option>
                  <option value="cheapest">{t.listings.sortCheapest}</option>
                  <option value="expensive">{t.listings.sortExpensive}</option>
                  <option value="popular">{t.listings.sortPopular}</option>
                </select>

                {/* View mode toggle */}
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Listings Grid/List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse flex gap-4">
                    <div className="w-[220px] h-[165px] bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="flex-1 py-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 card">
                <p className="text-gray-500 text-lg mb-4">{t.listings.noResults}</p>
                <button onClick={clearFilters} className="btn-primary">
                  {lang === 'pl' ? 'Wyczyść filtry' : 'Clear filters'}
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'space-y-3'
              }>
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} viewMode={viewMode} />
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                      p === page ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-600 border border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-dark-600 shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-dark-500 flex items-center justify-between">
              <h2 className="font-semibold text-lg">{t.listings.filters}</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-1 block">{lang === 'pl' ? 'Lokalizacja' : 'Location'}</label>
                <input
                  type="text"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="input-field !py-2"
                  placeholder={lang === 'pl' ? 'Wpisz miasto...' : 'Enter city...'}
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium mb-1 block">{lang === 'pl' ? 'Cena' : 'Price'}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(e.target.value)}
                    className="input-field !py-2"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    className="input-field !py-2"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="text-sm font-medium mb-1 block">{t.listings.condition}</label>
                <select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  className="input-field !py-2"
                >
                  <option value="">{t.listings.allConditions}</option>
                  <option value="NEW">{t.listings.conditionNew}</option>
                  <option value="USED">{t.listings.conditionUsed}</option>
                  <option value="DAMAGED">{t.listings.conditionDamaged}</option>
                </select>
              </div>

              {/* Category-specific filters */}
              {currentCategory?.slug && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <CategoryFilters
                    categorySlug={currentCategory.slug}
                    values={attrFilters}
                    onChange={setAttrFilters}
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-dark-500 flex gap-2">
              <button onClick={clearFilters} className="btn-secondary flex-1">
                {lang === 'pl' ? 'Wyczyść' : 'Clear'}
              </button>
              <button onClick={applyFilters} className="btn-primary flex-1">
                {lang === 'pl' ? 'Zastosuj' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Section Component
function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium text-sm">{title}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && <div className="mt-3">{children}</div>}
    </div>
  );
}
