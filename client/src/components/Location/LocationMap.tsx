import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import { X, Maximize2, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  city: string;
  voivodeship?: string;
  miniHeight?: string;
}

// Helper: invalidates map size after mount so Leaflet recalculates dimensions
function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    // Small delay to let the container fully render
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function LocationMap({ latitude, longitude, city, voivodeship, miniHeight = '200px' }: LocationMapProps) {
  const [fullscreen, setFullscreen] = useState(false);

  // Block body scroll when fullscreen is open
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setFullscreen(false);
  }, []);

  useEffect(() => {
    if (fullscreen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fullscreen, handleKeyDown]);

  return (
    <>
      {/* Mini map */}
      <div
        className="relative rounded-xl overflow-hidden group/map cursor-pointer"
        onClick={() => setFullscreen(true)}
      >
        <MapContainer
          center={[latitude, longitude]}
          zoom={11}
          style={{ height: miniHeight, width: '100%' }}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          attributionControl={false}
          touchZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={[latitude, longitude]}
            radius={2500}
            pathOptions={{
              color: '#4F46E5',
              fillColor: '#4F46E5',
              fillOpacity: 0.15,
              weight: 2,
            }}
          />
        </MapContainer>
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/map:bg-black/10 transition-colors pointer-events-none z-[400]">
          <span className="opacity-0 group-hover/map:opacity-100 transition-opacity bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Fullscreen modal — rendered via portal to avoid z-index/overflow issues */}
      {fullscreen && createPortal(
        <div
          className="fixed inset-0 flex flex-col"
          style={{ zIndex: 99999, background: '#fff' }}
        >
          {/* Header with close button */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{
              height: '56px',
              borderBottom: '1px solid #e5e7eb',
              background: '#fff',
              zIndex: 100000,
            }}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-800 font-medium text-sm"
            >
              <X className="w-5 h-5" />
              <span>Zamknij</span>
            </button>
            <h3 className="font-semibold text-sm truncate px-4 text-gray-800">
              {city}{voivodeship ? `, ${voivodeship}` : ''}
            </h3>
            <div className="w-[100px]" />
          </div>

          {/* Map area — separate MapContainer for fullscreen */}
          <div className="flex-1 relative" style={{ minHeight: 0 }}>
            <MapContainer
              center={[latitude, longitude]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              dragging={true}
              zoomControl={true}
              doubleClickZoom={true}
              attributionControl={true}
              touchZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Circle
                center={[latitude, longitude]}
                radius={2500}
                pathOptions={{
                  color: '#4F46E5',
                  fillColor: '#4F46E5',
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />
              <InvalidateSize />
            </MapContainer>
          </div>

          {/* Footer */}
          <div
            className="flex items-center gap-2 px-4 text-sm shrink-0"
            style={{
              height: '48px',
              borderTop: '1px solid #e5e7eb',
              background: '#fff',
              color: '#6b7280',
              zIndex: 100000,
            }}
          >
            <MapPin className="w-4 h-4" style={{ color: '#6366f1' }} />
            <span className="text-gray-800">{city}</span>
            {voivodeship && <span className="text-gray-400">· {voivodeship}</span>}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
