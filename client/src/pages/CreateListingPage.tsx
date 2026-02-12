import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, ImagePlus, Info, CheckCircle2 } from 'lucide-react';
import { listingsApi, categoriesApi, uploadApi } from '../services/api';
import type { Category } from '../types';
import { useTranslation } from '../i18n';
import { useNotifications } from '../context/NotificationContext';
import AttributeForm from '../components/Listing/AttributeForm';
import CityAutocomplete from '../components/Location/CityAutocomplete';
import { type PolishCity } from '../data/polishCities';

export default function CreateListingPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('USED');
  const [city, setCity] = useState('');
  const [cityData, setCityData] = useState<PolishCity | undefined>();
  const [categoryId, setCategoryId] = useState('');
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [videoUrl, setVideoUrl] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Get category slug for selected category
  const selectedCategorySlug = useMemo(() => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.slug || '';
  }, [categoryId, categories]);

  // Reset attributes when category changes
  useEffect(() => {
    setAttributes({});
  }, [categoryId]);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => {
      const flat: Category[] = [];
      data.categories.forEach(cat => {
        flat.push(cat);
        cat.children?.forEach(child => {
          flat.push(child);
          child.children?.forEach(subChild => flat.push(subChild));
        });
      });
      setCategories(flat);
    }).catch(() => {});
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (images.length + imageFiles.length > 8) {
      setError(t.create.maxImages);
      return;
    }
    setImages(prev => [...prev, ...imageFiles]);
    imageFiles.forEach(f => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  }, [images.length, t.create.maxImages]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
  };

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [addFiles]);

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let imageUrls: { url: string }[] = [];
      if (images.length > 0) {
        const { data } = await uploadApi.images(images);
        imageUrls = data.urls.map(url => ({ url }));
      }

      const { data } = await listingsApi.create({
        title,
        description,
        price: parseFloat(price),
        condition,
        city,
        latitude: cityData?.latitude,
        longitude: cityData?.longitude,
        categoryId,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        images: imageUrls,
        videoUrl: videoUrl.trim() || undefined,
        negotiable,
      });

      addToast({
        type: 'success',
        title: lang === 'pl' ? 'Ogloszenie dodane!' : 'Listing created!',
        message: lang === 'pl' ? 'Twoje ogloszenie zostalo pomyslnie opublikowane.' : 'Your listing has been successfully published.',
        link: `/ogloszenia/${data.listing.id}`,
        duration: 6000,
      });
      navigate(`/ogloszenia/${data.listing.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || t.create.error);
    } finally {
      setLoading(false);
    }
  };

  // Progress calculation
  const completedSteps = [
    images.length > 0,
    title.length >= 3,
    categoryId,
    description.length >= 10,
    price,
    city,
  ].filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / 6) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.create.title}</h1>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-200 dark:bg-dark-500 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-500">{progressPercent}%</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg px-4 py-3 text-sm">{error}</div>}

        {/* Images - Drag & Drop */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-primary-500" />
              {t.create.photos}
            </h2>
            <span className="text-xs text-gray-500">{images.length}/8</span>
          </div>

          {/* Drop zone */}
          {images.length === 0 ? (
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              }`}
            >
              <ImagePlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                {lang === 'pl' ? 'Przeciagnij zdjecia tutaj lub kliknij' : 'Drag photos here or click'}
              </p>
              <p className="text-xs text-gray-500">
                {lang === 'pl' ? 'JPG, PNG, WebP • Max 8 zdjec • Pierwsze zdjecie bedzie okladka' : 'JPG, PNG, WebP • Max 8 photos • First photo will be the cover'}
              </p>
              <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
            </label>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`grid grid-cols-4 gap-3 p-2 rounded-xl transition-all ${
                dragOver ? 'bg-primary-50 dark:bg-primary-900/10 ring-2 ring-primary-500' : ''
              }`}
            >
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded">
                      {lang === 'pl' ? 'Okladka' : 'Cover'}
                    </span>
                  )}
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 8 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                  <Plus className="w-8 h-8 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">{t.create.addPhoto}</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.create.listingTitle} *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder={t.create.titlePlaceholder} required minLength={3} maxLength={100} />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">
                {lang === 'pl' ? 'Krotki, jasny tytul przyciaga wiecej kupujacych' : 'Short, clear title attracts more buyers'}
              </p>
              <span className={`text-xs ${title.length > 80 ? 'text-amber-500' : 'text-gray-400'}`}>{title.length}/100</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.create.categoryLabel} *</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-field" required>
              <option value="">{t.create.selectCategory}</option>
              {categories.map(cat => {
                const depth = cat.parentId ? (categories.find(c => c.id === cat.parentId)?.parentId ? 2 : 1) : 0;
                const prefix = '\u00A0\u00A0'.repeat(depth);
                const isParent = !cat.parentId && !!cat.children?.length;
                return (
                  <option key={cat.id} value={cat.id} disabled={isParent}>
                    {prefix}{depth > 0 ? '└ ' : ''}{lang === 'pl' ? cat.namePl : cat.nameEn}
                  </option>
                );
              })}
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
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">
                {lang === 'pl' ? 'Opisz stan, wady, zalety i co jest w zestawie' : 'Describe condition, defects, advantages, and what\'s included'}
              </p>
              <span className={`text-xs ${description.length > 4500 ? 'text-amber-500' : 'text-gray-400'}`}>{description.length}/5000</span>
            </div>
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
            <CityAutocomplete
              value={city}
              onChange={(val, data) => { setCity(val); setCityData(data); }}
              placeholder={t.create.cityPlaceholder}
              required
            />
          </div>

          {/* Negotiable toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} className="sr-only" />
              <div className={`w-10 h-6 rounded-full transition-colors ${negotiable ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${negotiable ? 'translate-x-4' : ''}`} />
              </div>
            </div>
            <span className="text-sm font-medium">{t.create.negotiable}</span>
          </label>
        </div>

        {/* Video URL */}
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.create.videoUrl}</label>
            <input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="input-field"
              placeholder={t.create.videoPlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">{t.create.videoHint}</p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1.5">
                {lang === 'pl' ? 'Wskazowki dla szybkiej sprzedazy' : 'Tips for quick sale'}
              </h3>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {lang === 'pl' ? 'Dodaj dokladne zdjecia z roznych katow' : 'Add detailed photos from different angles'}
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {lang === 'pl' ? 'Ustaw realistyczna cene - sprawdz podobne ogloszenia' : 'Set a realistic price — check similar listings'}
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {lang === 'pl' ? 'Opisz wszystkie wady — uczciwosc buduje zaufanie' : 'Describe all defects — honesty builds trust'}
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {lang === 'pl' ? 'Odpowiadaj szybko na wiadomosci od kupujacych' : 'Reply quickly to buyer messages'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-lg">
          {loading ? t.common.loading : t.create.submit}
        </button>
      </form>
    </div>
  );
}
