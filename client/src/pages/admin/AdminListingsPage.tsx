import { useEffect, useState } from 'react';
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ExternalLink, X, Image } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { Listing } from '../../types';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  SOLD: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  RESERVED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ARCHIVED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Edit modal
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', status: '', condition: '' });
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchListings = () => {
    setLoading(true);
    adminApi.getListings({ page, search, status: statusFilter })
      .then(({ data }) => {
        setListings(data.listings);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, [page, search, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const openEdit = (listing: Listing) => {
    setEditListing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      price: String(listing.price),
      status: listing.status,
      condition: listing.condition,
    });
  };

  const handleSave = async () => {
    if (!editListing) return;
    setSaving(true);
    try {
      await adminApi.updateListing(editListing.id, editForm);
      setEditListing(null);
      fetchListings();
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.deleteListing(deleteId);
      setDeleteId(null);
      fetchListings();
    } catch {} finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ogloszenia</h1>
          <p className="text-sm text-gray-500">{total} ogloszen</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[250px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Szukaj ogloszen..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
            Szukaj
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Wszystkie statusy</option>
          <option value="ACTIVE">Aktywne</option>
          <option value="SOLD">Sprzedane</option>
          <option value="RESERVED">Zarezerwowane</option>
          <option value="ARCHIVED">Zarchiwizowane</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-700 rounded-2xl border border-gray-200 dark:border-dark-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ogloszenie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Cena</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sprzedajacy</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-dark-600">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Brak ogloszen
                  </td>
                </tr>
              ) : (
                listings.map(listing => (
                  <tr key={listing.id} className="border-b border-gray-100 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-600 flex-shrink-0">
                          {listing.images?.[0] ? (
                            <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[250px]">{listing.title}</p>
                          <p className="text-xs text-gray-500">{listing.category?.namePl || listing.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {listing.price.toLocaleString('pl-PL')} {listing.currency}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {listing.user?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[listing.status] || 'bg-gray-100'}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(listing.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/ogloszenia/${listing.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-500 rounded-lg transition-colors"
                          title="Zobacz"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </a>
                        <button
                          onClick={() => openEdit(listing)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edytuj"
                        >
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => setDeleteId(listing.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Archiwizuj"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-dark-600">
            <p className="text-sm text-gray-500">
              Strona {page} z {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditListing(null)}>
          <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-dark-600">
              <h3 className="text-lg font-bold">Edytuj ogloszenie</h3>
              <button onClick={() => setEditListing(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tytul</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opis</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cena</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stan</label>
                  <select
                    value={editForm.condition}
                    onChange={e => setEditForm(f => ({ ...f, condition: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="NEW">Nowy</option>
                    <option value="USED">Uzywany</option>
                    <option value="DAMAGED">Uszkodzony</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ACTIVE">Aktywne</option>
                  <option value="SOLD">Sprzedane</option>
                  <option value="RESERVED">Zarezerwowane</option>
                  <option value="ARCHIVED">Zarchiwizowane</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditListing(null)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-dark-500 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Zapisywanie...' : 'Zapisz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setDeleteId(null)}>
          <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Archiwizuj ogloszenie</h3>
            <p className="text-sm text-gray-500 mb-6">Czy na pewno chcesz zarchiwizowac to ogloszenie? Bedzie ono niewidoczne dla uzytkownikow.</p>
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
                {deleting ? 'Archiwizowanie...' : 'Archiwizuj'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
