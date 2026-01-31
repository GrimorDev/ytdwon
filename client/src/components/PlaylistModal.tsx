import { useState, useEffect } from 'react';
import {
  X, CheckSquare, Square, Loader2, Music, Film,
  Download, Package, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { downloadApi } from '../services/api';
import { useTranslation } from '../i18n';
import type { PlaylistItem, PlaylistJob } from '../types';

interface Props {
  url: string;
  playlistTitle: string;
  playlistCount: number;
  onClose: () => void;
  accentColor: string;
  isPremium: boolean;
}

export default function PlaylistModal({ url, playlistTitle, playlistCount, onClose, accentColor, isPremium }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAudio, setIsAudio] = useState(false);
  const [quality, setQuality] = useState('1080');
  const [outputFormat, setOutputFormat] = useState('mp4');

  // Download state
  const [downloading, setDownloading] = useState(false);
  const [playlistJob, setPlaylistJob] = useState<PlaylistJob | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await downloadApi.getPlaylistItems(url);
      setItems(data.items);
      // Select all by default
      setSelected(new Set(data.items.map((i) => i.id)));
    } catch (err: any) {
      setError(err.response?.data?.error || t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(items.map((i) => i.id)));
  const deselectAll = () => setSelected(new Set());

  const formatDuration = (sec: number) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const maxFreePlaylist = 15;
  const isOverFreeLimit = !isPremium && selected.size > maxFreePlaylist;

  const startPlaylistDownload = async () => {
    if (isOverFreeLimit) return;

    const selectedItems = items
      .filter((i) => selected.has(i.id))
      .map((i) => ({ id: i.id, title: i.title, url: i.url }));

    if (selectedItems.length === 0) return;

    setDownloading(true);
    setError('');

    try {
      const fmt = isAudio ? outputFormat : outputFormat;
      const { data } = await downloadApi.startPlaylist({
        items: selectedItems,
        quality: isAudio ? 'bestaudio' : quality,
        isAudio,
        outputFormat: fmt,
      });

      // Subscribe to progress
      downloadApi.subscribePlaylistProgress(data.jobId, (job) => {
        setPlaylistJob(job);

        // Auto-download ZIP when done
        if (job.status === 'done' && job.zipFilename) {
          const a = document.createElement('a');
          a.href = downloadApi.getFileUrl(job.zipFilename);
          a.download = `${playlistTitle}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }, () => {
        setError(t.connectionLost);
        setDownloading(false);
      });
    } catch (err: any) {
      setError(err.response?.data?.error || t.downloadFailed);
      setDownloading(false);
    }
  };

  const isDone = playlistJob?.status === 'done';
  const isError = playlistJob?.status === 'error';
  const progressPercent = playlistJob
    ? Math.round((playlistJob.completedItems / playlistJob.totalItems) * 100)
    : 0;

  const itemWord = (count: number) => {
    if (count === 1) return t.item1;
    if (count >= 2 && count <= 4) return t.items2to4;
    return t.items5plus;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-bold">{playlistTitle}</h2>
            <p className="text-sm text-gray-400">
              {selected.size} {t.selectedOf} {items.length} {t.selectedItems}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-3" />
              <p className="text-gray-400">{t.fetchingPlaylist} ({playlistCount} {t.videos})...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mt-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Items List */}
        {!loading && items.length > 0 && (
          <>
            {/* Select/Deselect All */}
            <div className="flex items-center gap-3 py-3 border-b border-gray-800">
              <button
                onClick={selectAll}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t.selectAll}
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={deselectAll}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t.deselectAll}
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto py-2 min-h-0" style={{ maxHeight: '350px' }}>
              {items.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => !downloading && toggleItem(item.id)}
                    disabled={downloading}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      isSelected
                        ? 'bg-red-500/5 hover:bg-red-500/10'
                        : 'opacity-50 hover:opacity-70'
                    } ${downloading ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {/* Checkbox */}
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-red-500 flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}

                    {/* Thumbnail */}
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="w-16 h-10 object-cover rounded flex-shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-10 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                        <Film className="w-4 h-4 text-gray-600" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.duration > 0 && (
                        <p className="text-xs text-gray-500">{formatDuration(item.duration)}</p>
                      )}
                    </div>

                    {/* Index */}
                    <span className="text-xs text-gray-600 flex-shrink-0">#{item.index + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Format options */}
            {!downloading && (
              <div className="border-t border-gray-800 pt-4 mt-2">
                <div className="flex items-center gap-4 mb-4">
                  {/* Audio/Video toggle */}
                  <div className="flex rounded-lg border border-gray-700 overflow-hidden">
                    <button
                      onClick={() => { setIsAudio(false); setOutputFormat('mp4'); }}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors ${
                        !isAudio ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Film className="w-4 h-4" />
                      {t.video}
                    </button>
                    <button
                      onClick={() => { setIsAudio(true); setOutputFormat('mp3'); }}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors ${
                        isAudio ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      {t.audio}
                    </button>
                  </div>

                  {/* Quality / Format */}
                  {isAudio ? (
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      className="input-field !w-auto !py-2 text-sm"
                    >
                      <option value="mp3">MP3</option>
                      {isPremium && <option value="wav">WAV (PRO)</option>}
                      {isPremium && <option value="flac">FLAC (PRO)</option>}
                    </select>
                  ) : (
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="input-field !w-auto !py-2 text-sm"
                    >
                      <option value="480">480p</option>
                      <option value="720">720p</option>
                      <option value="1080">1080p</option>
                      {isPremium && <option value="1440">1440p (PRO)</option>}
                      {isPremium && <option value="2160">4K (PRO)</option>}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Download Progress */}
            {downloading && playlistJob && (
              <div className="border-t border-gray-800 pt-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {isDone ? (
                      <span className="text-green-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {t.downloadCompleted}
                      </span>
                    ) : playlistJob.status === 'zipping' ? (
                      <span className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-blue-400" />
                        {t.packingZip}
                      </span>
                    ) : (
                      <span>
                        {t.downloading}: {playlistJob.completedItems} {t.of} {playlistJob.totalItems}
                      </span>
                    )}
                  </span>
                  {playlistJob.failedItems > 0 && (
                    <span className="text-xs text-red-400">
                      {playlistJob.failedItems} {t.errors}
                    </span>
                  )}
                </div>

                {/* Current item */}
                {!isDone && playlistJob.currentItemTitle && (
                  <p className="text-xs text-gray-500 truncate mb-2">
                    {playlistJob.currentItemTitle}
                  </p>
                )}

                {/* Progress bar */}
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      isDone
                        ? 'bg-gradient-to-r from-green-600 to-green-400'
                        : 'bg-gradient-to-r from-red-600 to-red-400'
                    }`}
                    style={{ width: `${isDone ? 100 : progressPercent}%` }}
                  />
                </div>

                {/* Done - download zip */}
                {isDone && playlistJob.zipFilename && (
                  <a
                    href={downloadApi.getFileUrl(playlistJob.zipFilename)}
                    download={`${playlistTitle}.zip`}
                    className="mt-3 w-full btn-primary flex items-center justify-center gap-2 py-3"
                  >
                    <Package className="w-5 h-5" />
                    {t.downloadZip} ({playlistJob.completedItems} {t.files})
                  </a>
                )}
              </div>
            )}

            {/* Free limit warning */}
            {isOverFreeLimit && (
              <div className="mt-3 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{t.freePlaylistLimit} {maxFreePlaylist} {t.itemsFromPlaylist}</p>
                  <p className="text-yellow-500/70 text-xs mt-0.5">{t.deselectAll} {selected.size - maxFreePlaylist} {t.items5plus} {t.selectedOf.toLowerCase()} <a href="/pricing" className="underline hover:text-yellow-300">{t.upgradePremium}</a> {t.forUnlimitedPlaylists}</p>
                </div>
              </div>
            )}

            {/* Start button */}
            {!downloading && (
              <button
                onClick={startPlaylistDownload}
                disabled={selected.size === 0 || isOverFreeLimit}
                className="mt-4 w-full btn-primary flex items-center justify-center gap-2 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {t.download} {selected.size} {itemWord(selected.size)} {t.downloadAsZip}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
