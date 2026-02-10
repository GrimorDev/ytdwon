import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function NotFoundPage() {
  const { lang } = useTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 number */}
        <div className="relative mb-6">
          <span className="text-[150px] md:text-[200px] font-black text-gray-100 dark:text-dark-600 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Search className="w-12 h-12 text-primary-500" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          {lang === 'pl' ? 'Strona nie znaleziona' : 'Page not found'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {lang === 'pl'
            ? 'Przepraszamy, ale strona ktorej szukasz nie istnieje lub zostala przeniesiona.'
            : 'Sorry, the page you are looking for does not exist or has been moved.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
            <Home className="w-4 h-4" />
            {lang === 'pl' ? 'Strona glowna' : 'Go home'}
          </Link>
          <Link to="/ogloszenia" className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center">
            <Search className="w-4 h-4" />
            {lang === 'pl' ? 'Przegladaj ogloszenia' : 'Browse listings'}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'pl' ? 'Wstecz' : 'Go back'}
          </button>
        </div>
      </div>
    </div>
  );
}
