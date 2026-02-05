import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import Logo from './Logo';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer-bar py-8 mt-12">
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
    </footer>
  );
}
