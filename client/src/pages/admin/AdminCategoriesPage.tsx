import { useState, useEffect, useRef } from 'react';
import {
  FolderTree, Plus, Pencil, Trash2, Upload, ChevronDown, ChevronRight,
  Package, Globe, X, AlertCircle, CheckCircle, Loader2,
  ArrowUp, ArrowDown, Link as LinkIcon,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import type { Category } from '../../types';

// Lucide icon names we support for categories
const ICON_OPTIONS = [
  'Package', 'Smartphone', 'Monitor', 'Car', 'Home', 'ShoppingBag',
  'Shirt', 'Dumbbell', 'Baby', 'PawPrint', 'Briefcase', 'BookOpen',
  'Music', 'Camera', 'Wrench', 'Sofa', 'Bike', 'Gem', 'Watch',
  'Gamepad2', 'Tv', 'Headphones', 'Printer', 'Cpu', 'Heart',
  'TreePine', 'Flower2', 'Palette', 'Scissors', 'UtensilsCrossed',
];

interface CategoryFormData {
  namePl: string;
  nameEn: string;
  descriptionPl: string;
  descriptionEn: string;
  icon: string;
  parentId: string;
  image: File | null;
  existingImageUrl: string;
}

const emptyForm: CategoryFormData = {
  namePl: '',
  nameEn: '',
  descriptionPl: '',
  descriptionEn: '',
  icon: 'Package',
  parentId: '',
  image: null,
  existingImageUrl: '',
};

// Collect all categories with level for parent selection (flat list)
function flattenForSelect(categories: Category[], prefix = '', excludeId?: string): Array<{ id: string; name: string; depth: number }> {
  const result: Array<{ id: string; name: string; depth: number }> = [];
  for (const cat of categories) {
    if (cat.id === excludeId) continue;
    const depth = prefix ? prefix.split(' > ').length : 0;
    // Only allow nesting up to 2 levels deep (max depth=1 can be parent)
    if (depth < 2) {
      result.push({ id: cat.id, name: prefix ? `${prefix} > ${cat.namePl}` : cat.namePl, depth });
    }
    if (cat.children && cat.children.length > 0) {
      const childResults = flattenForSelect(cat.children, prefix ? `${prefix} > ${cat.namePl}` : cat.namePl, excludeId);
      result.push(...childResults);
    }
  }
  return result;
}

// Recursively count all nested categories
function countAll(categories: Category[]): number {
  let count = 0;
  for (const cat of categories) {
    count += 1;
    if (cat.children) count += countAll(cat.children);
  }
  return count;
}

// Find a category by ID in the tree
function findCatById(categories: Category[], id: string): Category | null {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const found = findCatById(cat.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Reorder loading
  const [reordering, setReordering] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      const { data } = await adminApi.getCategories();
      setCategories(data.categories);
    } catch {
      setError('Nie udalo sie pobrac kategorii');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectExpandable = (cats: Category[]) => {
      cats.forEach(c => {
        if (c.children && c.children.length > 0) {
          allIds.add(c.id);
          collectExpandable(c.children);
        }
      });
    };
    collectExpandable(categories);
    setExpanded(allIds);
  };

  const collapseAll = () => setExpanded(new Set());

  const openAddModal = (parentId?: string) => {
    setForm({ ...emptyForm, parentId: parentId || '' });
    setEditingId(null);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setForm({
      namePl: cat.namePl,
      nameEn: cat.nameEn,
      descriptionPl: cat.descriptionPl || '',
      descriptionEn: cat.descriptionEn || '',
      icon: cat.icon,
      parentId: cat.parentId || '',
      image: null,
      existingImageUrl: cat.imageUrl || '',
    });
    setEditingId(cat.id);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namePl.trim()) {
      setError('Nazwa PL jest wymagana');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('namePl', form.namePl.trim());
      if (form.nameEn.trim()) formData.append('nameEn', form.nameEn.trim());
      formData.append('descriptionPl', form.descriptionPl.trim());
      formData.append('descriptionEn', form.descriptionEn.trim());
      formData.append('icon', form.icon);
      if (form.parentId) formData.append('parentId', form.parentId);
      if (form.image) formData.append('image', form.image);

      if (editingId) {
        await adminApi.updateCategory(editingId, formData);
        setSuccess('Kategoria zaktualizowana');
      } else {
        await adminApi.createCategory(formData);
        setSuccess('Kategoria utworzona');
      }

      await fetchCategories();
      setTimeout(() => {
        closeModal();
        setSuccess('');
      }, 800);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Wystapil blad';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setDeleteError('');

    try {
      await adminApi.deleteCategory(deleteId);
      await fetchCategories();
      setDeleteId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Nie udalo sie usunac kategorii';
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Find category name by ID (for delete confirmation)
  const findCategoryName = (id: string): string => {
    const cat = findCatById(categories, id);
    return cat?.namePl || '';
  };

  // Move category up/down among its siblings
  const moveCategory = async (id: string, direction: 'up' | 'down', siblings: Category[]) => {
    const idx = siblings.findIndex(s => s.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === siblings.length - 1) return;

    setReordering(true);
    try {
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;

      // Build new order for all siblings
      const newOrder = siblings.map((s, i) => ({
        id: s.id,
        order: i,
      }));

      // Swap the two
      const temp = newOrder[idx].order;
      newOrder[idx].order = newOrder[swapIdx].order;
      newOrder[swapIdx].order = temp;

      await adminApi.reorderCategories(newOrder);
      await fetchCategories();
    } catch {
      // silent fail
    } finally {
      setReordering(false);
    }
  };

  // Get all parent options for select (flat with indentation)
  const parentOptions = flattenForSelect(categories, '', editingId || undefined);

  // Count total categories
  const totalCategories = countAll(categories);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-primary-500" />
            Zarzadzanie kategoriami
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCategories} kategorii ({categories.length} glownych)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
          >
            Rozwin wszystkie
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
          >
            Zwin
          </button>
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nowa kategoria
          </button>
        </div>
      </div>

      {/* Categories tree */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="card !p-12 text-center">
            <FolderTree className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak kategorii</h3>
            <p className="text-sm text-gray-500 mb-6">Dodaj pierwsza kategorie, aby zaczac</p>
            <button
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Dodaj kategorie
            </button>
          </div>
        ) : (
          categories.map((cat, idx) => (
            <CategoryTreeItem
              key={cat.id}
              category={cat}
              siblings={categories}
              index={idx}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onEdit={openEditModal}
              onDelete={setDeleteId}
              onAddSub={(parentId) => openAddModal(parentId)}
              onMove={moveCategory}
              reordering={reordering}
            />
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-dark-600">
              <h2 className="text-lg font-bold">
                {editingId ? 'Edytuj kategorie' : 'Nowa kategoria'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Polish name */}
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa (PL) *</label>
                <input
                  type="text"
                  value={form.namePl}
                  onChange={e => setForm(f => ({ ...f, namePl: e.target.value }))}
                  placeholder="Np. Elektronika"
                  className="input-field"
                  required
                />
              </div>

              {/* English name (auto-generated if empty) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nazwa (EN)
                  <span className="text-gray-400 font-normal ml-1">- auto-generowana jesli pusta</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                    placeholder="Np. Electronics (auto)"
                    className="input-field pr-8"
                  />
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Description PL */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Opis (PL)
                  <span className="text-gray-400 font-normal ml-1">- opcjonalny, widoczny na stronie kategorii</span>
                </label>
                <textarea
                  value={form.descriptionPl}
                  onChange={e => setForm(f => ({ ...f, descriptionPl: e.target.value }))}
                  placeholder="Np. Znajdz najlepsze oferty elektroniki..."
                  className="input-field resize-none"
                  rows={2}
                />
              </div>

              {/* Description EN */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Opis (EN)
                  <span className="text-gray-400 font-normal ml-1">- opcjonalny</span>
                </label>
                <textarea
                  value={form.descriptionEn}
                  onChange={e => setForm(f => ({ ...f, descriptionEn: e.target.value }))}
                  placeholder="E.g. Find the best electronics deals..."
                  className="input-field resize-none"
                  rows={2}
                />
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-sm font-medium mb-1">Ikona</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon: iconName }))}
                      className={`p-2 rounded-lg text-xs text-center border-2 transition-all ${
                        form.icon === iconName
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                          : 'border-gray-200 dark:border-dark-500 hover:border-gray-300'
                      }`}
                      title={iconName}
                    >
                      <span className="text-[10px] leading-none block truncate">{iconName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Parent category */}
              <div>
                <label className="block text-sm font-medium mb-1">Kategoria nadrzedna</label>
                <select
                  value={form.parentId}
                  onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                  className="input-field"
                >
                  <option value="">-- Kategoria glowna --</option>
                  {parentOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {'  '.repeat(p.depth)}{p.depth > 0 ? '└ ' : ''}{p.name.split(' > ').pop()}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Max 3 poziomy zaglebienia</p>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Obrazek kategorii</label>
                <div className="flex items-center gap-3">
                  {form.image ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-500">
                      <img
                        src={URL.createObjectURL(form.image)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, image: null }))}
                        className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : form.existingImageUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-dark-500">
                      <img
                        src={form.existingImageUrl}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        title="Zmien obrazek"
                      >
                        <Upload className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-500 flex items-center justify-center hover:border-primary-400 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                  <div className="text-xs text-gray-500">
                    <p>JPG, PNG, WebP</p>
                    <p>Max 5MB, 400x400px</p>
                    {form.existingImageUrl && !form.image && (
                      <p className="text-green-600 dark:text-green-400">Obecny obrazek zapisany</p>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setForm(f => ({ ...f, image: file }));
                    e.target.value = '';
                  }}
                />
              </div>

              {/* Auto-generated info */}
              {form.namePl.trim() && (
                <div className="p-3 bg-gray-50 dark:bg-dark-600 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Slug: <code className="text-primary-600 dark:text-primary-400">/kategoria/{slugify(form.namePl)}</code></span>
                  </div>
                  {!form.nameEn.trim() && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Globe className="w-3.5 h-3.5" />
                      <span>EN name: auto-generated by server</span>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 dark:bg-red-900/10 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm p-3 bg-green-50 dark:bg-green-900/10 rounded-xl">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-xl transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 text-sm font-medium bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Zapisz' : 'Dodaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold">Usun kategorie</h3>
                <p className="text-sm text-gray-500">
                  Czy na pewno chcesz usunac "{findCategoryName(deleteId)}"?
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 dark:bg-red-900/10 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setDeleteId(null); setDeleteError(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-xl transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Usun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper for slug preview
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Tree item component
function CategoryTreeItem({
  category,
  siblings,
  index,
  expanded,
  toggleExpand,
  onEdit,
  onDelete,
  onAddSub,
  onMove,
  reordering,
  depth = 0,
}: {
  category: Category;
  siblings: Category[];
  index: number;
  expanded: Set<string>;
  toggleExpand: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onAddSub: (parentId: string) => void;
  onMove: (id: string, direction: 'up' | 'down', siblings: Category[]) => void;
  reordering: boolean;
  depth?: number;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expanded.has(category.id);
  const listingCount = category._count?.listings || 0;
  const isFirst = index === 0;
  const isLast = index === siblings.length - 1;

  const depthColors = [
    '',
    'ml-8 border-l-4 border-l-primary-200 dark:border-l-primary-800',
    'ml-8 border-l-4 border-l-amber-200 dark:border-l-amber-800',
  ];

  return (
    <div>
      <div className={`card !p-0 overflow-hidden ${depthColors[depth] || depthColors[2]}`}>
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors">
          {/* Expand toggle */}
          <button
            onClick={() => hasChildren && toggleExpand(category.id)}
            className={`p-1 rounded ${hasChildren ? 'hover:bg-gray-200 dark:hover:bg-dark-500 cursor-pointer' : 'opacity-30 cursor-default'}`}
            disabled={!hasChildren}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Image / icon */}
          {category.imageUrl ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-dark-500">
              <img src={category.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-primary-500" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">{category.namePl}</span>
              <span className="text-xs text-gray-400 truncate">/ {category.nameEn}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                /{category.slug}
              </span>
              <span>{listingCount} ogloszen</span>
              {hasChildren && (
                <span>{category.children!.length} podkategorii</span>
              )}
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-dark-500 rounded">
                {category.icon}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                #{category.displayOrder ?? 0}
              </span>
            </div>
          </div>

          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onMove(category.id, 'up', siblings)}
              disabled={isFirst || reordering}
              className={`p-1 rounded transition-colors ${isFirst ? 'opacity-20 cursor-default' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-500'}`}
              title="W gore"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMove(category.id, 'down', siblings)}
              disabled={isLast || reordering}
              className={`p-1 rounded transition-colors ${isLast ? 'opacity-20 cursor-default' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-500'}`}
              title="W dol"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Allow adding subcategory up to depth 1 (so max 3 levels total) */}
            {depth < 2 && (
              <button
                onClick={() => onAddSub(category.id)}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                title="Dodaj podkategorie"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Edytuj"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Usun"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-2 mt-2">
          {category.children!.map((sub, subIdx) => (
            <CategoryTreeItem
              key={sub.id}
              category={sub}
              siblings={category.children!}
              index={subIdx}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSub={onAddSub}
              onMove={onMove}
              reordering={reordering}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
