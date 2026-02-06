import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { newsletterApi } from '../../services/api';
import Logo from './Logo';

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setNewsletterState('loading');
    try {
      await newsletterApi.subscribe(email.trim());
      setNewsletterState('success');
      setEmail('');
      setTimeout(() => setNewsletterState('idle'), 5000);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setNewsletterState('duplicate');
      } else {
        setNewsletterState('error');
      }
      setTimeout(() => setNewsletterState('idle'), 4000);
    }
  };

  return (
    <footer className="footer-bar mt-12">
      {/* Newsletter section */}
      <div className="bg-primary-600 dark:bg-primary-900/50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-5 h-5" />
                {t.home.newsletterTitle}
              </h3>
              <p className="text-primary-100 text-sm mt-1">{t.home.newsletterSubtitle}</p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto max-w-md">
              {newsletterState === 'success' ? (
                <div className="flex items-center gap-2 text-green-100 bg-green-600/30 px-4 py-3 rounded-xl w-full">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{t.home.newsletterSuccess}</span>
                </div>
              ) : newsletterState === 'duplicate' ? (
                <div className="flex items-center gap-2 text-amber-100 bg-amber-600/30 px-4 py-3 rounded-xl w-full">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{t.home.newsletterDuplicate}</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t.home.newsletterPlaceholder}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-primary-200 outline-none focus:ring-2 focus:ring-white/30 text-sm min-w-0"
                    required
                  />
                  <button
                    type="submit"
                    disabled={newsletterState === 'loading'}
                    className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors text-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {newsletterState === 'loading' ? '...' : t.home.newsletterButton}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-3">
                <Logo size="sm" />
              </div>
              <p className="text-sm">{t.footer.description}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">{t.footer.links}</h3>
              <div className="space-y-2 text-sm">
                <Link to="/ogloszenia" className="block hover:text-primary-500">{t.footer.allListings}</Link>
                <Link to="/dodaj" className="block hover:text-primary-500">{t.footer.addListing}</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">{t.footer.account}</h3>
              <div className="space-y-2 text-sm">
                <Link to="/logowanie" className="block hover:text-primary-500">{t.nav.login}</Link>
                <Link to="/rejestracja" className="block hover:text-primary-500">{t.nav.register}</Link>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200 dark:border-gray-800" />
          <p className="text-center text-sm">Vipile &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
