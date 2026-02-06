import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannersApi } from '../../services/api';
import type { Banner } from '../../types';

interface Props {
  children?: ReactNode;
}

export default function BannerSlider({ children }: Props) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    bannersApi.getActive()
      .then(({ data }) => {
        setBanners(data.banners);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-rotation
  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, paused, next]);

  const hasBanners = loaded && banners.length > 0;

  return (
    <div
      className="relative w-full overflow-hidden group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background layer: banners or gradient fallback */}
      {hasBanners ? (
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="w-full flex-shrink-0 relative h-full"
            >
              <img
                src={banner.imageUrl}
                alt={banner.title || ''}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-800 to-dark-900">
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
        </div>
      )}

      {/* Dark overlay for readability when banners are shown */}
      {hasBanners && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      {/* Content overlay (hero title + search) */}
      <div className="relative z-10 py-16 md:py-24">
        {children}

        {/* Banner-specific info (title/subtitle from current banner) */}
        {hasBanners && banners[current] && (banners[current].title || banners[current].buttonText) && (
          <div className="max-w-7xl mx-auto px-4 mt-8">
            <div className="flex items-center justify-center gap-4">
              {banners[current].title && (
                <span className="text-white/70 text-sm font-medium">
                  {banners[current].title}
                  {banners[current].subtitle && (
                    <span className="text-white/50 ml-2">— {banners[current].subtitle}</span>
                  )}
                </span>
              )}
              {banners[current].buttonText && banners[current].linkUrl && (
                <a
                  href={banners[current].linkUrl!}
                  className="inline-flex items-center px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full transition-colors backdrop-blur-sm"
                >
                  {banners[current].buttonText}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {hasBanners && banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/20 backdrop-blur-sm rounded-full shadow-lg text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/20 backdrop-blur-sm rounded-full shadow-lg text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current
                    ? 'bg-white scale-110 shadow-lg'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
