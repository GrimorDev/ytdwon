import { useEffect, useState } from 'react';
import { Flag, ChevronLeft, ChevronRight, ChevronDown, ExternalLink, X, MessageSquare, Ban, Trash2, CheckCircle, Eye, XCircle } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { Report } from '../../types';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  REVIEWED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DISMISSED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const categoryLabels: Record<string, string> = {
  FRAUD: 'Oszustwo',
  ABUSE: 'Naduzycie',
  ITEM_PROBLEM: 'Problem z przedmiotem',
  INCORRECT_SELLER_DATA: 'Nieprawidlowe dane',
  MISLEADING_LISTING: 'Mylace ogloszenie',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Oczekujace',
  REVIEWED: 'Przegladniete',
  RESOLVED: 'Rozwiazane',
  DISMISSED: 'Odrzucone',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Status/note modal
  const [editReport, setEditReport] = useState<Report | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    adminApi.getReports({ page, status: statusFilter })
      .then(({ data }) => {
        setReports(data.reports);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter]);

  const handleSave = async () => {
    if (!editReport) return;
    setSaving(true);
    try {
      await adminApi.updateReport(editReport.id, {
        status: editStatus || undefined,
        adminNote: editNote || undefined,
      });
      setEditReport(null);
      fetchReports();
    } catch {} finally {
      setSaving(false);
    }
  };

  const quickStatus = async (reportId: string, status: string) => {
    try {
      await adminApi.updateReport(reportId, { status });
      fetchReports();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flag className="w-6 h-6 text-red-500" />
          Zgloszenia
        </h1>
        <p className="text-sm text-gray-500">{total} zgloszen</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED', 'ALL'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600'
            }`}
          >
            {s === 'ALL' ? 'Wszystkie' : statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-700 rounded-2xl p-6 border border-gray-200 dark:border-dark-600 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))
        ) : reports.length === 0 ? (
          <div className="bg-white dark:bg-dark-700 rounded-2xl p-12 border border-gray-200 dark:border-dark-600 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500">Brak zgloszen</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-white dark:bg-dark-700 rounded-2xl border border-gray-200 dark:border-dark-600 overflow-hidden">
              {/* Report header */}
              <div
                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-600/50 transition-colors"
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[report.status]}`}>
                      {statusLabels[report.status]}
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-600 px-2 py-0.5 rounded-full">
                      {categoryLabels[report.category] || report.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {report.subcategory}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {report.listing ? (
                      <span className="font-medium truncate">{report.listing.title}</span>
                    ) : (
                      <span className="text-gray-400 italic">Ogloszenie usuniete</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>Zglaszajacy: {report.reporter?.name || 'Nieznany'}</span>
                    {report.listing?.user && (
                      <span>Sprzedajacy: {report.listing.user.name}</span>
                    )}
                    <span>{new Date(report.createdAt).toLocaleDateString('pl-PL')}</span>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 mt-1 ${expandedId === report.id ? 'rotate-180' : ''}`} />
              </div>

              {/* Expanded details */}
              {expandedId === report.id && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-dark-600 pt-4 space-y-4">
                  {/* Explanation */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Wyjasnienie</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-dark-600 p-3 rounded-xl">
                      {report.explanation}
                    </p>
                  </div>

                  {/* Admin note */}
                  {report.adminNote && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notatka admina</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        {report.adminNote}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {report.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => quickStatus(report.id, 'REVIEWED')}
                          className="px-3 py-2 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Oznacz jako przegladniete
                        </button>
                        <button
                          onClick={() => quickStatus(report.id, 'RESOLVED')}
                          className="px-3 py-2 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Rozwiaz
                        </button>
                        <button
                          onClick={() => quickStatus(report.id, 'DISMISSED')}
                          className="px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Odrzuc
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setEditReport(report);
                        setEditStatus(report.status);
                        setEditNote(report.adminNote || '');
                      }}
                      className="px-3 py-2 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Edytuj / Dodaj notatke
                    </button>

                    {report.listing && (
                      <a
                        href={`/ogloszenia/${report.listing.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Zobacz ogloszenie
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Strona {page} z {totalPages}</p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-white dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-white dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {editReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditReport(null)}>
          <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-dark-600">
              <h3 className="text-lg font-bold">Edytuj zgloszenie</h3>
              <button onClick={() => setEditReport(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="PENDING">Oczekujace</option>
                  <option value="REVIEWED">Przegladniete</option>
                  <option value="RESOLVED">Rozwiazane</option>
                  <option value="DISMISSED">Odrzucone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notatka admina</label>
                <textarea
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-600 border border-gray-200 dark:border-dark-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                  rows={4}
                  placeholder="Dodaj notatke..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditReport(null)}
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
    </div>
  );
}
