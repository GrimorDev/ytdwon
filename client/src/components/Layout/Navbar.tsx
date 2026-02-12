import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Plus, Sun, Moon, Menu, X, LogOut, Package, Settings, Globe, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { chatApi } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import SearchAutocomplete from '../Search/SearchAutocomplete';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { t, lang, setLang } = useTranslation();
  const navigate = useNavigate();
  const { unreadCount: notifCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      chatApi.getUnreadCount().then(({ data }) => setUnreadCount(data.count)).catch(() => {});
      const interval = setInterval(() => {
        chatApi.getUnreadCount().then(({ data }) => setUnreadCount(data.count)).catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <nav className="nav-bar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <Logo size="md" showText={true} />
          </Link>

          {/* Search */}
          <SearchAutocomplete className="flex-1 max-w-xl mx-4 hidden md:block" />

          {/* Desktop actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button onClick={() => setLang(lang === 'pl' ? 'en' : 'pl')} className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500 transition-colors" title={lang === 'pl' ? 'English' : 'Polski'}>
              <Globe className="w-5 h-5" />
            </button>

            {/* Theme toggle */}
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-primary-600" />}
            </button>

            {user ? (
              <>
                {/* Add listing */}
                <Link to="/dodaj" className="btn-primary !py-2 !px-4 flex items-center gap-1.5 hidden sm:flex">
                  <Plus className="w-4 h-4" />
                  <span>{t.nav.addListing}</span>
                </Link>

                {/* Favorites */}
                <Link to="/ulubione" className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500 transition-colors hidden sm:block">
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Messages */}
                <Link to="/wiadomosci" className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500 transition-colors relative hidden sm:block">
                  <MessageCircle className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <Link to="/powiadomienia" className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500 transition-colors relative hidden sm:block">
                  <Bell className="w-5 h-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500 transition-colors">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-400/30" />
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #635985, #443C68)' }}>
                        <span className="text-white text-xs font-bold">{user.name[0].toUpperCase()}</span>
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 card !p-2 shadow-xl z-50">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-dark-500 mb-1">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link to="/moje-ogloszenia" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500">
                          <Package className="w-4 h-4" /> {t.nav.myListings}
                        </Link>
                        <Link to="/ulubione" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500">
                          <Heart className="w-4 h-4" /> {t.nav.favorites}
                        </Link>
                        <Link to="/wiadomosci" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500">
                          <MessageCircle className="w-4 h-4" /> {t.nav.messages}
                          {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                        </Link>
                        <Link to="/powiadomienia" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500">
                          <Bell className="w-4 h-4" /> {lang === 'pl' ? 'Powiadomienia' : 'Notifications'}
                          {notifCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{notifCount}</span>}
                        </Link>
                        <Link to="/konto" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-primary-100 dark:hover:bg-dark-500">
                          <Settings className="w-4 h-4" /> {t.nav.account}
                        </Link>
                        <hr className="my-1 border-gray-200 dark:border-dark-500" />
                        <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-red-500">
                          <LogOut className="w-4 h-4" /> {t.nav.logout}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/logowanie" className="btn-secondary !py-2 !px-4 text-sm">{t.nav.login}</Link>
                <Link to="/rejestracja" className="btn-primary !py-2 !px-4 text-sm hidden sm:block">{t.nav.register}</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 md:hidden">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <SearchAutocomplete />
            {user ? (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-dark-500">
                <Link to="/dodaj" className="btn-primary !py-2.5 w-full text-center text-sm flex items-center justify-center gap-1.5" onClick={() => setMobileOpen(false)}>
                  <Plus className="w-4 h-4" />{t.nav.addListing}
                </Link>
                <div className="grid grid-cols-4 gap-2">
                  <Link to="/ulubione" onClick={() => setMobileOpen(false)} className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-white/10 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-xs">{t.nav.favorites}</span>
                  </Link>
                  <Link to="/wiadomosci" onClick={() => setMobileOpen(false)} className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-white/10 transition-colors relative">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs">{t.nav.messages}</span>
                    {unreadCount > 0 && <span className="absolute top-1 right-1/4 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </Link>
                  <Link to="/powiadomienia" onClick={() => setMobileOpen(false)} className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-white/10 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="text-xs">{lang === 'pl' ? 'Powiadom.' : 'Notifs'}</span>
                    {notifCount > 0 && <span className="absolute top-1 right-1/4 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{notifCount > 9 ? '9+' : notifCount}</span>}
                  </Link>
                  <Link to="/moje-ogloszenia" onClick={() => setMobileOpen(false)} className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-white/10 transition-colors">
                    <Package className="w-5 h-5" />
                    <span className="text-xs">{t.nav.myListings}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-500">
                <Link to="/logowanie" className="btn-secondary !py-2.5 flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>{t.nav.login}</Link>
                <Link to="/rejestracja" className="btn-primary !py-2.5 flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>{t.nav.register}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
