import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, MessageCircle, Plus, User, Sun, Moon, Menu, X, LogOut, Package, Settings, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { chatApi } from '../../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { t, lang, setLang } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/ogloszenia?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <nav className="nav-bar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Vipile
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="input-field !pl-10 !py-2"
              />
            </div>
          </form>

          {/* Desktop actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button onClick={() => setLang(lang === 'pl' ? 'en' : 'pl')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={lang === 'pl' ? 'English' : 'Polski'}>
              <Globe className="w-5 h-5" />
            </button>

            {/* Theme toggle */}
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* Add listing */}
                <Link to="/dodaj" className="btn-primary !py-2 !px-4 flex items-center gap-1.5 hidden sm:flex">
                  <Plus className="w-4 h-4" />
                  <span>{t.nav.addListing}</span>
                </Link>

                {/* Favorites */}
                <Link to="/ulubione" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block">
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Messages */}
                <Link to="/wiadomosci" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative hidden sm:block">
                  <MessageCircle className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{user.name[0].toUpperCase()}</span>
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 card !p-2 shadow-xl z-50">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-1">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link to="/moje-ogloszenia" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                          <Package className="w-4 h-4" /> {t.nav.myListings}
                        </Link>
                        <Link to="/ulubione" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                          <Heart className="w-4 h-4" /> {t.nav.favorites}
                        </Link>
                        <Link to="/wiadomosci" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                          <MessageCircle className="w-4 h-4" /> {t.nav.messages}
                          {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                        </Link>
                        <Link to="/konto" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                          <Settings className="w-4 h-4" /> {t.nav.account}
                        </Link>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-red-500">
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

        {/* Mobile search */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.nav.searchPlaceholder}
                  className="input-field !pl-10 !py-2"
                />
              </div>
            </form>
            {user && (
              <div className="flex gap-2">
                <Link to="/dodaj" className="btn-primary !py-2 flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>
                  <Plus className="w-4 h-4 inline mr-1" />{t.nav.addListing}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
