import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';

const COOKIE_KEY = 'vipile_cookie_consent';

export default function CookieConsent() {
  const { lang } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <div className="max-w-4xl mx-auto bg-white dark:bg-dark-600 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-500 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {lang === 'pl'
                  ? 'Uzywamy plikow cookie, aby zapewnic najlepsze doswiadczenie na naszej stronie. Korzystajac z serwisu, zgadzasz sie na ich uzycie.'
                  : 'We use cookies to ensure the best experience on our site. By using our service, you agree to their use.'}
              </p>
              <Link
                to="/polityka-prywatnosci"
                className="text-xs text-primary-500 hover:text-primary-600 mt-1 inline-block"
              >
                {lang === 'pl' ? 'Polityka prywatnosci' : 'Privacy Policy'}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={decline}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-500 rounded-xl transition-colors"
            >
              {lang === 'pl' ? 'Odmow' : 'Decline'}
            </button>
            <button
              onClick={accept}
              className="flex-1 sm:flex-none px-6 py-2 text-sm font-medium bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              {lang === 'pl' ? 'Akceptuje' : 'Accept'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
