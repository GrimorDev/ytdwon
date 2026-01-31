import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { historyApi, downloadApi } from '../services/api';
import type { Download } from '../types';
import {
  History,
  Trash2,
  Download as DownloadIcon,
  Music,
  Film,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const platformColors: Record<string, string> = {
  YOUTUBE: 'bg-red-500/20 text-red-400',
  FACEBOOK: 'bg-blue-500/20 text-blue-400',
  TWITTER: 'bg-sky-400/20 text-sky-400',
  TIKTOK: 'bg-pink-500/20 text-pink-400',
  INSTAGRAM: 'bg-purple-500/20 text-purple-400',
};

export default function HistoryPage() {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    historyApi
      .getAll(page)
      .then(({ data }) => {
        setDownloads(data.downloads);
        setTotalPages(data.pagination.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, user]);

  const handleDelete = async (id: string) => {
    try {
      await historyApi.delete(id);
      setDownloads((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t.downloadHistory}</h1>
        <p className="text-gray-400 mb-6">{t.loginToSeeHistory}</p>
        <Link to="/login" className="btn-primary inline-block">{t.loginButton}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <History className="w-8 h-8 text-red-500" />
        {t.downloadHistory}
      </h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : downloads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <DownloadIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t.noHistory}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {downloads.map((dl) => (
              <div key={dl.id} className="card flex items-center gap-4 !p-4">
                {dl.thumbnailUrl ? (
                  <img src={dl.thumbnailUrl} alt={dl.title} className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-24 h-16 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    {dl.format === 'AUDIO' ? <Music className="w-6 h-6 text-gray-600" /> : <Film className="w-6 h-6 text-gray-600" />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{dl.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${platformColors[dl.platform] || 'bg-gray-700 text-gray-300'}`}>
                      {dl.platform}
                    </span>
                    <span className="text-xs text-gray-500">{dl.format === 'AUDIO' ? 'MP3' : dl.quality}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(dl.createdAt).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={dl.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors p-2" title={t.openSource}>
                    <DownloadIcon className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDelete(dl.id)} className="text-gray-400 hover:text-red-400 transition-colors p-2" title={t.deleteFromHistory}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-2 !px-3 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-gray-400 text-sm">{t.page} {page} {t.ofPages} {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary !py-2 !px-3 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
