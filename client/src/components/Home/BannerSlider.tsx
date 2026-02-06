import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannersApi } from '../../services/api';
import type { Banner } from '../../types';

export default function BannerSlider() {
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

  if (!loaded || banners.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full flex-shrink-0 relative h-[250px] md:h-[400px]"
          >
            <img
              src={banner.imageUrl}
              alt={banner.title || ''}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            {(banner.title || banner.subtitle || banner.buttonText) && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
                <div className="max-w-7xl mx-auto px-4 w-full">
                  <div className="max-w-lg">
                    {banner.title && (
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p className="text-sm md:text-lg text-white/90 mb-4 drop-shadow">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.buttonText && banner.linkUrl && (
                      <a
                        href={banner.linkUrl}
                        className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg"
                      >
                        {banner.buttonText}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
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
