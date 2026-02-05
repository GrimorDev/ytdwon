// Saved searches management using localStorage
const STORAGE_KEY = 'vipile_saved_searches';
const MAX_ITEMS = 20;

export interface SavedSearch {
  id: string;
  query: string;
  city?: string;
  category?: string;
  categoryName?: string;
  createdAt: number;
}

export function getSavedSearches(): SavedSearch[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addSavedSearch(search: Omit<SavedSearch, 'id' | 'createdAt'>): SavedSearch {
  const searches = getSavedSearches();

  // Check for duplicate (same query + city + category)
  const existing = searches.find(
    s => s.query === search.query && s.city === search.city && s.category === search.category
  );
  if (existing) return existing;

  const newSearch: SavedSearch = {
    ...search,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: Date.now(),
  };

  const updated = [newSearch, ...searches].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newSearch;
}

export function removeSavedSearch(id: string): void {
  const searches = getSavedSearches();
  const updated = searches.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function isSearchSaved(query: string, city?: string, category?: string): boolean {
  const searches = getSavedSearches();
  return searches.some(
    s => s.query === query && (s.city || '') === (city || '') && (s.category || '') === (category || '')
  );
}
