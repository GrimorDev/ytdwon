// Simple view history management using localStorage
const STORAGE_KEY = 'vipile_view_history';
const MAX_ITEMS = 20;

export interface ViewHistoryItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  thumbnailUrl?: string;
  viewedAt: number;
}

export function getViewHistory(): ViewHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addToViewHistory(item: Omit<ViewHistoryItem, 'viewedAt'>): void {
  try {
    const history = getViewHistory();

    // Remove existing entry for this item (to move it to front)
    const filtered = history.filter(h => h.id !== item.id);

    // Add new entry at the beginning
    const newHistory = [
      { ...item, viewedAt: Date.now() },
      ...filtered
    ].slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch {
    // Ignore localStorage errors
  }
}

export function clearViewHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
