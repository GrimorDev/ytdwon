import { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { searchCities, findCity, type PolishCity } from '../../data/polishCities';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string, data?: PolishCity) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function CityAutocomplete({ value, onChange, placeholder = 'Np. Warszawa', required, className }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PolishCity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(-1);
    if (val.length >= 2) {
      const results = searchCities(val, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    // If user types and doesn't select, clear the parent value
    onChange(val, undefined);
  };

  const selectCity = (city: PolishCity) => {
    setQuery(city.name);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(city.name, city);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      selectCity(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleBlur = () => {
    // On blur, try to match to a real city
    setTimeout(() => {
      const match = findCity(query);
      if (match) {
        onChange(match.name, match);
      }
      setShowSuggestions(false);
    }, 200);
  };

  const clearInput = () => {
    setQuery('');
    onChange('', undefined);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className || ''}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => {
            if (query.length >= 2) {
              const results = searchCities(query, 8);
              setSuggestions(results);
              setShowSuggestions(results.length > 0);
            }
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className="input-field !pl-10 !pr-8"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={clearInput} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-dark-600 rounded-lg shadow-xl border border-gray-200 dark:border-dark-500 overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((city, idx) => (
            <button
              key={city.name}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectCity(city);
              }}
              className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${
                idx === selectedIndex
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-500'
              }`}
            >
              <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-medium block">{city.name}</span>
                <span className="text-xs text-gray-500">{city.voivodeship}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
