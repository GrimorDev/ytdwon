const STORAGE_KEY = 'vipile_recently_viewed';
const MAX_ITEMS = 12;

export interface RecentlyViewedItem {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  slug?: string;
  viewedAt: number;
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const items: RecentlyViewedItem[] = JSON.parse(data);
    // Filter out items older than 7 days
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return items.filter(i => i.viewedAt > weekAgo);
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, 'viewedAt'>) {
  try {
    const items = getRecentlyViewed().filter(i => i.id !== item.id);
    items.unshift({ ...item, viewedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // silently fail
  }
}

export function clearRecentlyViewed() {
  localStorage.removeItem(STORAGE_KEY);
}
