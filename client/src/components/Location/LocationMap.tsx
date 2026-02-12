import { useState } from 'react';
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

function MapContent({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.setView([lat, lng], 12);
  return null;
}

export default function LocationMap({ latitude, longitude, city, voivodeship, miniHeight = '200px' }: LocationMapProps) {
  const [fullscreen, setFullscreen] = useState(false);

  const mapContent = (zoom: number, height: string, interactive: boolean) => (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      style={{ height, width: '100%' }}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      doubleClickZoom={interactive}
      attributionControl={false}
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
      {interactive && <MapContent lat={latitude} lng={longitude} />}
    </MapContainer>
  );

  return (
    <>
      {/* Mini map */}
      <div className="relative rounded-xl overflow-hidden group/map cursor-pointer" onClick={() => setFullscreen(true)}>
        {mapContent(11, miniHeight, false)}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/map:bg-black/10 transition-colors pointer-events-none">
          <span className="opacity-0 group-hover/map:opacity-100 transition-opacity bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-dark-700 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-600">
            <button onClick={() => setFullscreen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-500 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-semibold text-sm truncate px-4">{city}{voivodeship ? `, ${voivodeship}` : ''}</h3>
            <div className="w-9" />
          </div>

          {/* Map */}
          <div className="flex-1">
            {mapContent(13, '100%', true)}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-600 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 text-primary-500" />
            <span>{city}</span>
            {voivodeship && <span className="text-gray-400">· {voivodeship}</span>}
          </div>
        </div>
      )}
    </>
  );
}
