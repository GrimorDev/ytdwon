import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import {
  Download,
  History,
  CreditCard,
  LogIn,
  LogOut,
  UserPlus,
  Crown,
  Sun,
  Moon,
  Settings,
  Globe,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { lang, t, setLang } = useTranslation();
  const location = useLocation();

  const navLink = (path: string, active: boolean) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
      active
        ? theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'
        : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <nav className="nav-bar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Download className="w-6 h-6 text-red-500" />
            <span className="text-xl font-bold">
              Vipi<span className="text-red-500">le</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'pl' ? 'en' : 'pl')}
              className={navLink('', false)}
              title={lang === 'pl' ? 'English' : 'Polski'}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">{lang}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className={navLink('', false)}
              title={theme === 'dark' ? t.lightTheme : t.darkTheme}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user && (
              <>
                <Link to="/history" className={navLink('/history', location.pathname === '/history')}>
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.history}</span>
                </Link>
                <Link to="/account" className={navLink('/account', location.pathname === '/account')}>
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.account}</span>
                </Link>
              </>
            )}

            <Link to="/pricing" className={navLink('/pricing', location.pathname === '/pricing')}>
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">{t.pricing}</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{user.name}</span>
                  {user.plan === 'PREMIUM' && (
                    <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs font-medium">
                      <Crown className="w-3 h-3" />
                      PRO
                    </span>
                  )}
                </div>
                <button onClick={logout} className={navLink('', false)}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className={navLink('/login', location.pathname === '/login')}>
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.login}</span>
                </Link>
                <Link to="/register" className="flex items-center gap-1.5 btn-primary text-sm !py-2">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.register}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
