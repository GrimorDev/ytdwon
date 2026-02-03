import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { listingsApi, categoriesApi, uploadApi } from '../services/api';
import type { Category } from '../types';
import { useTranslation } from '../i18n';

export default function CreateListingPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('USED');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => {
      const flat: Category[] = [];
      data.categories.forEach(cat => {
        flat.push(cat);
        cat.children?.forEach(child => flat.push(child));
      });
      setCategories(flat);
    }).catch(() => {});
  }, []);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) {
      setError(t.create.maxImages);
      return;
    }
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

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
        categoryId,
        images: imageUrls,
      });

      navigate(`/ogloszenia/${data.listing.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || t.create.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t.create.title}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg px-4 py-3 text-sm">{error}</div>}

        {/* Images */}
        <div className="card">
          <h2 className="font-semibold mb-3">{t.create.photos}</h2>
          <div className="grid grid-cols-4 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
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

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-lg">
          {loading ? t.common.loading : t.create.submit}
        </button>
      </form>
    </div>
  );
}
