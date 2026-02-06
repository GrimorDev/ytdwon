import { useEffect, useState } from 'react';
import { Image, Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, X, Upload } from 'lucide-react';
import { adminApi, uploadApi } from '../../services/api';
import type { Banner } from '../../types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/create modal
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '', buttonText: '', enabled: true });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    adminApi.getBanners()
      .then(({ data }) => setBanners(data.banners))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => {
    setEditBanner(null);
    setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', buttonText: '', enabled: true });
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (banner: Banner) => {
    setEditBanner(banner);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      buttonText: banner.buttonText || '',
      enabled: banner.enabled,
    });
    setImagePreview(banner.imageUrl);
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.images([file]);
      if (data.urls[0]) {
        setForm(f => ({ ...f, imageUrl: data.urls[0] }));
        setImagePreview(data.urls[0]);
      }
    } catch {} finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.imageUrl) return;
    setSaving(true);
    try {
      if (editBanner) {
        await adminApi.updateBanner(editBanner.id, form);
      } else {
        await adminApi.createBanner(form);
      }
      setShowModal(false);
      fetchBanners();
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteBanner(deleteId);
      setDeleteId(null);
      fetchBanners();
    } catch {} finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (banner: Banner) => {
    try {
      await adminApi.updateBanner(banner.id, { enabled: !banner.enabled });
      fetchBanners();
    } catch {}
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];

    setBanners(newBanners);
    try {
      await adminApi.reorderBanners(
        newBanners.map((b, i) => ({ id: b.id, order: i }))
      );
    } catch {
      fetchBanners();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image className="w-6 h-6 text-primary-500" />
            Bannery
          </h1>
          <p className="text-sm text-gray-500">{banners.length} bannerow</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Dodaj banner
        </button>
      </div>

      {/* Banner list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-700 rounded-2xl p-4 border border-gray-200 dark:border-dark-600 animate-pulse">
              <div className="flex gap-4">
                <div className="w-48 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : banners.length === 0 ? (
          <div className="bg-white dark:bg-dark-700 rounded-2xl p-12 border border-gray-200 dark:border-dark-600 text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Brak bannerow</p>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700"
            >
              Dodaj pierwszy banner
            </button>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-white dark:bg-dark-700 rounded-2xl border overflow-hidden transition-all ${
                banner.enabled
                  ? 'border-gray-200 dark:border-dark-600'
                  : 'border-gray-200 dark:border-dark-600 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                {/* Image preview */}
                <div className="w-full sm:w-48 h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-600 flex-shrink-0">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm">
                        {banner.title || <span className="text-gray-400 italic">Bez tytulu</span>}
                      </h3>
                      {banner.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">{banner.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          banner.enabled
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {banner.enabled ? 'Aktywny' : 'Wylaczony'}
                        </span>
                        {banner.linkUrl && (
                          <span className="text-xs text-gray-400 truncate max-w-[200px]">
                            {banner.linkUrl}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleReorder(index, 'up')}
                    disabled={index === 0}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg disabled:opacity-30 transition-colors"
                    title="W gore"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReorder(index, 'down')}
                    disabled={index === banners.length - 1}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg disabled:opacity-30 transition-colors"
                    title="W dol"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(banner)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors"
                    title={banner.enabled ? 'Wylacz' : 'Wlacz'}
                  >
                    {banner.enabled ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edytuj"
                  >
                    <Pencil className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => setDeleteId(banner.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Usun"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-dark-600">
              <h3 className="text-lg font-bold">{editBanner ? 'Edytuj banner' : 'Nowy banner'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Zdjecie bannera *</label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden mb-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => { setImagePreview(''); setForm(f => ({ ...f, imageUrl: '' })); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-dark-500 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">{imagePreview ? 'Zmien zdjecie' : 'Wgraj zdjecie'}</span>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tytul (opcjonalnie)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="np. Wielka wyprzedaz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Podtytul (opcjonalnie)</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="np. Do -50% na elektronike"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL linku (opcjonalnie)</label>
                  <input
                    type="text"
                    value={form.linkUrl}
                    onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="/kategoria/elektronika"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tekst przycisku</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="np. Zobacz oferty"
                  />
                </div>
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-600 rounded-xl">
                <span className="text-sm font-medium">Aktywny</span>
                <button
                  onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-dark-500'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.enabled ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-dark-500 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.imageUrl}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Zapisywanie...' : editBanner ? 'Zapisz' : 'Utworz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setDeleteId(null)}>
          <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Usun banner</h3>
            <p className="text-sm text-gray-500 mb-6">Czy na pewno chcesz usunac ten banner? Ta akcja jest nieodwracalna.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-dark-500 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Usuwanie...' : 'Usun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
