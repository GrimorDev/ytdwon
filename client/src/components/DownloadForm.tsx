import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, Download, Music, Film, Loader2, AlertCircle, Crown,
  Play, Plus, ListOrdered, CheckCircle2, XCircle, Headphones,
  Image, Scissors, List, ChevronDown, ChevronUp,
} from 'lucide-react';
import { downloadApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import type { VideoInfo, FormatInfo, DownloadJob } from '../types';
import PlaylistModal from './PlaylistModal';

interface Props {
  platform: string;
  placeholder: string;
  accentColor: string;
}

interface QueueEntry {
  id: string;
  url: string;
  quality: string;
  isAudio: boolean;
  outputFormat: string;
  job: DownloadJob | null;
  title: string;
  thumbnail: string;
}

export default function DownloadForm({ platform, placeholder, accentColor }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  // Pre-fill URL from history re-download
  useEffect(() => {
    const state = location.state as { prefillUrl?: string } | null;
    if (state?.prefillUrl) {
      setUrl(state.prefillUrl);
      // Clear state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const statusLabels: Record<string, string> = {
    queued: t.statusQueued,
    fetching_info: t.statusFetchingInfo,
    downloading: t.statusDownloading,
    converting: t.statusConverting,
    done: t.statusDone,
    error: t.statusError,
  };
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Batch mode
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState('');

  // Trim
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [trimStart, setTrimStart] = useState('');
  const [trimEnd, setTrimEnd] = useState('');

  // Thumbnail
  const [thumbLoading, setThumbLoading] = useState(false);

  const isPremium = user?.plan === 'PREMIUM';

  const fetchInfo = async () => {
    if (!url.trim()) return;
    setError('');
    setInfo(null);
    setSelectedFormat(null);
    setShowPreview(false);
    setLoading(true);
    try {
      const { data } = await downloadApi.getInfo(url);
      setInfo(data);
      const freeFormats = data.formats.filter((f) => {
        if (f.isAudioOnly) return false;
        if (isPremium) return true;
        const height = parseInt(f.quality);
        return height <= 1080;
      });
      const best = freeFormats.length > 0 ? freeFormats[0] : null;
      if (best) setSelectedFormat(best);
    } catch (err: any) {
      setError(err.response?.data?.error || t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const startDownload = useCallback(async (entry?: QueueEntry) => {
    const targetFormat = entry ? null : selectedFormat;
    const targetUrl = entry?.url || url;
    const isAudio = entry?.isAudio ?? (targetFormat?.isAudioOnly || false);
    const quality = entry?.quality || (targetFormat?.quality.replace('p', '') || '1080');
    const outputFormat = entry?.outputFormat || (targetFormat?.ext || (isAudio ? 'mp3' : 'mp4'));

    if (!targetUrl) return;

    setError('');

    try {
      const { data } = await downloadApi.start({
        url: targetUrl,
        quality,
        isAudio,
        outputFormat,
        trimStart: trimStart || undefined,
        trimEnd: trimEnd || undefined,
      });

      const jobId = data.jobId;

      const queueId = entry?.id || `q-${Date.now()}`;
      const newEntry: QueueEntry = entry || {
        id: queueId,
        url: targetUrl,
        quality,
        isAudio,
        outputFormat,
        job: null,
        title: info?.title || 'Unknown',
        thumbnail: info?.thumbnail || '',
      };

      if (!entry) {
        setQueue((prev) => [newEntry, ...prev]);
      }

      downloadApi.subscribeProgress(jobId, (jobData) => {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === queueId
              ? { ...q, job: jobData, title: jobData.title || q.title, thumbnail: jobData.thumbnail || q.thumbnail }
              : q
          )
        );

        if (jobData.status === 'done' && jobData.filename) {
          const a = document.createElement('a');
          a.href = downloadApi.getFileUrl(jobData.filename);
          a.download = `${jobData.title}.${outputFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || t.downloadFailed);
    }
  }, [url, selectedFormat, info, trimStart, trimEnd]);

  const addToQueue = () => {
    if (!selectedFormat || !url || !info) return;
    const entry: QueueEntry = {
      id: `q-${Date.now()}`,
      url,
      quality: selectedFormat.quality.replace('p', ''),
      isAudio: selectedFormat.isAudioOnly,
      outputFormat: selectedFormat.ext || (selectedFormat.isAudioOnly ? 'mp3' : 'mp4'),
      job: null,
      title: info.title,
      thumbnail: info.thumbnail,
    };
    setQueue((prev) => [entry, ...prev]);
    startDownload(entry);
  };

  // Batch download
  const startBatchDownload = async () => {
    const urls = batchUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) return;

    const maxBatch = isPremium ? 999 : 5;
    if (urls.length > maxBatch) {
      setError(t.batchLimit);
      return;
    }

    setError('');

    for (const batchUrl of urls) {
      const entry: QueueEntry = {
        id: `q-${Date.now()}-${Math.random()}`,
        url: batchUrl,
        quality: '1080',
        isAudio: false,
        outputFormat: 'mp4',
        job: null,
        title: batchUrl.substring(0, 50),
        thumbnail: '',
      };
      setQueue((prev) => [entry, ...prev]);

      try {
        const { data } = await downloadApi.start({
          url: batchUrl,
          quality: '1080',
          isAudio: false,
          outputFormat: 'mp4',
        });

        downloadApi.subscribeProgress(data.jobId, (jobData) => {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === entry.id
                ? { ...q, job: jobData, title: jobData.title || q.title, thumbnail: jobData.thumbnail || q.thumbnail }
                : q
            )
          );

          if (jobData.status === 'done' && jobData.filename) {
            const a = document.createElement('a');
            a.href = downloadApi.getFileUrl(jobData.filename);
            a.download = `${jobData.title}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        });
      } catch {}
    }

    setBatchUrls('');
  };

  // Thumbnail download
  const handleThumbnail = async () => {
    if (!url) return;
    setThumbLoading(true);
    try {
      const { data } = await downloadApi.downloadThumbnail(url);
      const a = document.createElement('a');
      a.href = downloadApi.getFileUrl(data.filename);
      a.download = `${info?.title || 'thumbnail'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setError('Thumbnail download failed');
    } finally {
      setThumbLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isQualityLocked = (format: FormatInfo) => {
    if (format.isAudioOnly) return false;
    const height = parseInt(format.quality);
    return height > 1080 && !isPremium;
  };

  const getEmbedUrl = (videoUrl: string) => {
    try {
      const u = new URL(videoUrl);
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        const videoId = u.searchParams.get('v') || u.pathname.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch {}
    return null;
  };

  const isFormatSelected = (format: FormatInfo) => {
    if (!selectedFormat) return false;
    return selectedFormat.quality === format.quality && selectedFormat.ext === format.ext;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setBatchMode(false)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            !batchMode ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          {t.singleMode}
        </button>
        <button
          onClick={() => setBatchMode(true)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            batchMode ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          {t.batchMode}
        </button>
      </div>

      {/* Single URL Input */}
      {!batchMode && (
        <div className="flex gap-3 mb-6">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInfo()}
            placeholder={placeholder}
            className="input-field flex-1"
          />
          <button
            onClick={fetchInfo}
            disabled={loading || !url.trim()}
            className={`${accentColor} text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="hidden sm:inline">{t.search}</span>
          </button>
        </div>
      )}

      {/* Batch URL Input */}
      {batchMode && (
        <div className="mb-6">
          <textarea
            value={batchUrls}
            onChange={(e) => setBatchUrls(e.target.value)}
            placeholder={t.batchPlaceholder}
            rows={5}
            className="input-field w-full resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {isPremium ? t.batchLimitPremium : t.batchLimit}
            </p>
            <button
              onClick={startBatchDownload}
              disabled={!batchUrls.trim()}
              className={`${accentColor} text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2`}
            >
              <Download className="w-4 h-4" />
              {t.download} ({batchUrls.split('\n').filter(u => u.trim()).length})
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Video Info */}
      {info && !batchMode && (
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Thumbnail / Preview */}
            <div className="relative w-full sm:w-72 flex-shrink-0">
              {showPreview && getEmbedUrl(url) ? (
                <iframe
                  src={getEmbedUrl(url)!}
                  className="w-full h-44 rounded-lg"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <>
                  {info.thumbnail && (
                    <img
                      src={info.thumbnail}
                      alt={info.title}
                      className="w-full h-44 object-cover rounded-lg"
                    />
                  )}
                  {getEmbedUrl(url) && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg hover:bg-black/50 transition-colors"
                    >
                      <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                        <Play className="w-7 h-7 text-white ml-1" />
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
              {info.duration > 0 && (
                <p className="text-gray-400 text-sm">
                  {Math.floor(info.duration / 60)}:{String(Math.floor(info.duration % 60)).padStart(2, '0')}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1 uppercase">{info.platform}</p>

              {/* Quick actions */}
              <div className="flex items-center gap-2 mt-3">
                {info.isPlaylist && (
                  <button
                    onClick={() => setShowPlaylistModal(true)}
                    className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <ListOrdered className="w-4 h-4" />
                    {t.playlist}: {info.playlistCount} {t.playlistClickToSelect}
                  </button>
                )}
                {/* Thumbnail download */}
                <button
                  onClick={handleThumbnail}
                  disabled={thumbLoading}
                  className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  {thumbLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
                  {t.downloadThumbnail}
                </button>
              </div>
            </div>
          </div>

          {/* Format Selection - Audio (hide for playlists) */}
          {!info.isPlaylist && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                <Headphones className="w-4 h-4" />
                Audio:
              </h4>
              <div className="flex gap-2 flex-wrap">
                {info.formats.filter((f) => f.isAudioOnly).map((format) => {
                  const isPremiumFormat = format.ext === 'wav' || format.ext === 'flac';
                  const locked = isPremiumFormat && !isPremium;
                  return (
                    <button
                      key={`${format.formatId}-${format.ext}`}
                      onClick={() => !locked && setSelectedFormat(format)}
                      disabled={locked}
                      className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-all ${
                        isFormatSelected(format)
                          ? 'border-red-500 bg-red-500/10 text-white'
                          : locked
                            ? 'border-gray-700 bg-gray-800/50 text-gray-600 cursor-not-allowed'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      {format.quality}
                      {locked && (
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          PRO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Format Selection - Video (hide for playlists) */}
          {!info.isPlaylist && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                <Film className="w-4 h-4" />
                {t.video}:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {info.formats.filter((f) => !f.isAudioOnly).map((format) => {
                  const locked = isQualityLocked(format);
                  const isSelected = isFormatSelected(format);
                  return (
                    <button
                      key={format.formatId}
                      onClick={() => !locked && setSelectedFormat(format)}
                      disabled={locked}
                      className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-sm ${
                        isSelected
                          ? 'border-red-500 bg-red-500/10 text-white'
                          : locked
                            ? 'border-gray-700 bg-gray-800/50 text-gray-600 cursor-not-allowed'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:bg-gray-800'
                        }`}
                    >
                      <Film className="w-5 h-5" />
                      <span className="font-medium">{format.quality}</span>
                      {format.filesize && (
                        <span className="text-xs text-gray-500">
                          {formatFileSize(format.filesize)}
                        </span>
                      )}
                      {locked && (
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          PRO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Advanced Options (Trim) */}
          {!info.isPlaylist && (
            <div className="mb-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Scissors className="w-4 h-4" />
                {t.advancedOptions}
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">{t.trimStart}</label>
                      <input
                        type="text"
                        value={trimStart}
                        onChange={(e) => setTrimStart(e.target.value)}
                        placeholder="0:00"
                        className="input-field !py-2 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">{t.trimEnd}</label>
                      <input
                        type="text"
                        value={trimEnd}
                        onChange={(e) => setTrimEnd(e.target.value)}
                        placeholder={info.duration > 0 ? `${Math.floor(info.duration / 60)}:${String(Math.floor(info.duration % 60)).padStart(2, '0')}` : '5:00'}
                        className="input-field !py-2 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{t.trimFreeLimit}</p>
                </div>
              )}
            </div>
          )}

          {/* Download Button (hide for playlists) */}
          {!info.isPlaylist && (
            <>
              {selectedFormat && isQualityLocked(selectedFormat) ? (
                <Link
                  to="/pricing"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 text-lg transition-colors"
                >
                  <Crown className="w-5 h-5" />
                  {t.getPremiumFor} {selectedFormat.quality}
                </Link>
              ) : (
                <button
                  onClick={addToQueue}
                  disabled={!selectedFormat}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-lg"
                >
                  <Download className="w-5 h-5" />
                  {t.download} {selectedFormat?.isAudioOnly ? selectedFormat.ext?.toUpperCase() || 'MP3' : t.video}
                  {selectedFormat && !selectedFormat.isAudioOnly && (
                    <span className="text-sm opacity-75">({selectedFormat.quality})</span>
                  )}
                  {(trimStart || trimEnd) && (
                    <span className="text-sm opacity-75">
                      <Scissors className="w-3.5 h-3.5 inline" /> {trimStart || '0:00'}-{trimEnd || 'end'}
                    </span>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Download Queue */}
      {queue.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-red-500" />
            {t.downloadQueue} ({queue.length})
          </h3>
          <div className="space-y-3">
            {queue.map((entry) => (
              <div key={entry.id} className="card !p-4">
                <div className="flex items-center gap-3">
                  {/* Thumb */}
                  {entry.thumbnail ? (
                    <img src={entry.thumbnail} className="w-16 h-10 object-cover rounded flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-16 h-10 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                      {entry.isAudio ? <Music className="w-4 h-4 text-gray-600" /> : <Film className="w-4 h-4 text-gray-600" />}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.title}</p>
                    <p className="text-xs text-gray-500">
                      {entry.isAudio ? entry.outputFormat.toUpperCase() : `${entry.quality}p`}
                      {' · '}
                      {entry.job ? statusLabels[entry.job.status] || entry.job.status : t.starting}
                      {/* Speed & ETA */}
                      {entry.job?.speed && entry.job.status === 'downloading' && (
                        <span className="ml-2 text-blue-400">
                          {entry.job.speed}
                          {entry.job.eta && ` · ${t.etaLabel} ${entry.job.eta}`}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {entry.job?.status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : entry.job?.status === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {entry.job && entry.job.status !== 'done' && entry.job.status !== 'error' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{statusLabels[entry.job.status]}</span>
                      <span>{entry.job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-red-600 to-red-400"
                        style={{ width: `${entry.job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Done - download link */}
                {entry.job?.status === 'done' && entry.job.filename && (
                  <div className="mt-2">
                    <a
                      href={downloadApi.getFileUrl(entry.job.filename)}
                      download
                      className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t.downloadAgain}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlist Modal */}
      {showPlaylistModal && info && (
        <PlaylistModal
          url={url}
          playlistTitle={info.title}
          playlistCount={info.playlistCount || 0}
          onClose={() => setShowPlaylistModal(false)}
          accentColor={accentColor}
          isPremium={isPremium}
        />
      )}
    </div>
  );
}
