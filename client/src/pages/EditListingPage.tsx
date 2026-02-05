import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { listingsApi, categoriesApi, uploadApi } from '../services/api';
import type { Category, Listing } from '../types';
import { useTranslation } from '../i18n';
import AttributeForm from '../components/Listing/AttributeForm';

export default function EditListingPage() {
  const { t, lang } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('USED');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // Get category slug for selected category
  const selectedCategorySlug = useMemo(() => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.slug || '';
  }, [categoryId, categories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingRes, categoriesRes] = await Promise.all([
          listingsApi.getById(id!),
          categoriesApi.getAll()
        ]);

        const listing = listingRes.data.listing;
        setTitle(listing.title);
        setDescription(listing.description);
        setPrice(listing.price.toString());
        setCondition(listing.condition);
        setCity(listing.city);
        setCategoryId(listing.categoryId);
        setStatus(listing.status);
        setAttributes(listing.attributes || {});
        setExistingImages(listing.images || []);

        const flat: Category[] = [];
        categoriesRes.data.categories.forEach(cat => {
          flat.push(cat);
          cat.children?.forEach(child => flat.push(child));
        });
        setCategories(flat);
      } catch (err) {
        setError(t.edit.notFound);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 8) {
      setError(t.create.maxImages);
      return;
    }
    setNewImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onloadend = () => setNewPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let allImages = existingImages.map(img => ({ url: img.url }));

      if (newImages.length > 0) {
        const { data } = await uploadApi.images(newImages);
        allImages = [...allImages, ...data.urls.map(url => ({ url }))];
      }

      await listingsApi.update(id!, {
        title,
        description,
        price: parseFloat(price),
        condition,
        city,
        categoryId,
        status,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        images: allImages,
      });

      navigate(`/ogloszenia/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || t.edit.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t.edit.title}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg px-4 py-3 text-sm">{error}</div>}

        {/* Status */}
        <div className="card">
          <h2 className="font-semibold mb-3">{t.edit.statusLabel}</h2>
          <div className="flex gap-3">
            {['ACTIVE', 'SOLD', 'ARCHIVED'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  status === s
                    ? s === 'ACTIVE' ? 'bg-green-600 text-white' : s === 'SOLD' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t.listings[`status${s.charAt(0) + s.slice(1).toLowerCase()}` as keyof typeof t.listings]}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <h2 className="font-semibold mb-3">{t.create.photos}</h2>
          <div className="grid grid-cols-4 gap-3">
            {existingImages.map((img, i) => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {existingImages.length + newImages.length < 8 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">{t.create.addPhoto}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">{t.create.maxPhotosHint}</p>
        </div>

        {/* Details */}
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.create.listingTitle} *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder={t.create.titlePlaceholder} required minLength={3} maxLength={100} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.create.categoryLabel} *</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-field" required>
              <option value="">{t.create.selectCategory}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} disabled={!cat.parentId && !!cat.children?.length}>
                  {cat.parentId ? '\u00A0\u00A0' : ''}{lang === 'pl' ? cat.namePl : cat.nameEn}
                </option>
              ))}
            </select>
          </div>

          {selectedCategorySlug && (
            <AttributeForm
              categorySlug={selectedCategorySlug}
              values={attributes}
              onChange={setAttributes}
            />
          )}

          <div>
            <label className="block text-sm font-medium mb-1">{t.create.descriptionLabel} *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field min-h-[120px]" placeholder={t.create.descriptionPlaceholder} required minLength={10} maxLength={5000} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.create.price} (PLN) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="input-field" placeholder="0" required min={0} step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.create.conditionLabel} *</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="input-field">
                <option value="NEW">{t.listings.conditionNew}</option>
                <option value="USED">{t.listings.conditionUsed}</option>
                <option value="DAMAGED">{t.listings.conditionDamaged}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.create.cityLabel} *</label>
            <input value={city} onChange={e => setCity(e.target.value)} className="input-field" placeholder={t.create.cityPlaceholder} required />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 !py-3">
            {t.common.cancel}
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 !py-3 text-lg">
            {saving ? t.common.loading : t.edit.save}
          </button>
        </div>
      </form>
    </div>
  );
}
