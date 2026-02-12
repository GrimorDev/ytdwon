import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Camera, LogOut, Save, Lock, Eye, EyeOff, Bell, BellOff, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersApi, uploadApi, authApi } from '../services/api';
import { useTranslation } from '../i18n';
import SEO from '../components/SEO';

export default function AccountPage() {
  const { t, lang } = useTranslation();
  const isPl = lang === 'pl';
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Notification preferences (stored in localStorage)
  const getNotifPref = (key: string) => localStorage.getItem(`notif_${key}`) !== 'false';
  const [notifMessages, setNotifMessages] = useState(getNotifPref('messages'));
  const [notifReviews, setNotifReviews] = useState(getNotifPref('reviews'));
  const [notifFavorites, setNotifFavorites] = useState(getNotifPref('favorites'));
  const [notifPromotions, setNotifPromotions] = useState(getNotifPref('promotions'));
  const [notifSystem, setNotifSystem] = useState(getNotifPref('system'));

  const handleNotifToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(`notif_${key}`, value.toString());
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let avatarUrl = user?.avatarUrl;

      if (avatarFile) {
        const { data } = await uploadApi.avatar(avatarFile);
        avatarUrl = data.url;
      }

      const { data } = await usersApi.updateProfile({ name, phone, city, bio });
      updateUser({ ...user!, ...data.user, avatarUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || t.account.error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError(t.account.passwordMinLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.account.passwordMismatch);
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordSection(false);
      }, 3000);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setPasswordError(t.account.wrongPassword);
      } else {
        setPasswordError(t.account.passwordError);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <>
      <SEO title={t.account.title} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t.account.title}</h1>
          <Link to="/statystyki" className="btn-secondary !py-2 !px-3 flex items-center gap-1.5 text-sm">
            <BarChart3 className="w-4 h-4" />
            {t.account.myStats}
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg px-4 py-3 text-sm">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg px-4 py-3 text-sm">{t.account.saved}</div>}

          {/* Avatar */}
          <div className="card">
            <h2 className="font-semibold mb-4">{t.account.photo}</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="card space-y-4">
            <h2 className="font-semibold">{t.account.profileInfo}</h2>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                {t.account.name}
              </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required minLength={2} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {t.account.email}
              </label>
              <input type="email" value={user.email} disabled className="input-field opacity-50 cursor-not-allowed" />
              <p className="text-xs text-gray-500 mt-1">{t.account.emailHint}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {t.account.phone}
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="+48 123 456 789" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                {t.account.city}
              </label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field" placeholder={t.account.cityPlaceholder} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.account.bio}</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} className="input-field min-h-[100px]" placeholder={t.account.bioPlaceholder} maxLength={500} />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
            </div>
          </div>

          {/* Password Change */}
          <div className="card">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 font-semibold w-full text-left"
            >
              <Lock className="w-5 h-5 text-gray-400" />
              {t.account.changePassword}
              <span className="ml-auto text-sm text-primary-500">{showPasswordSection ? '−' : '+'}</span>
            </button>

            {showPasswordSection && (
              <div className="mt-4 space-y-3 border-t pt-4 border-gray-200 dark:border-dark-500">
                {passwordError && <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg px-3 py-2 text-sm">{passwordError}</div>}
                {passwordSuccess && <div className="bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg px-3 py-2 text-sm">{t.account.passwordChanged}</div>}

                <div>
                  <label className="block text-sm font-medium mb-1">{t.account.currentPassword}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="input-field pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t.account.newPassword}</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="input-field pr-10"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t.account.confirmNewPassword}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="btn-primary !py-2 w-full flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {passwordLoading ? t.common.loading : t.account.changePassword}
                </button>
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="card">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-400" />
              {t.account.notifPrefs}
            </h2>
            <div className="space-y-3">
              {[
                { key: 'messages', label: t.account.notifMessages, value: notifMessages, setter: setNotifMessages },
                { key: 'reviews', label: t.account.notifReviews, value: notifReviews, setter: setNotifReviews },
                { key: 'favorites', label: t.account.notifFavorites, value: notifFavorites, setter: setNotifFavorites },
                { key: 'promotions', label: t.account.notifPromotions, value: notifPromotions, setter: setNotifPromotions },
                { key: 'system', label: t.account.notifSystem, value: notifSystem, setter: setNotifSystem },
              ].map(({ key, label, value, setter }) => (
                <label key={key} className="flex items-center justify-between py-2 cursor-pointer group">
                  <span className="flex items-center gap-2 text-sm">
                    {value ? <Bell className="w-4 h-4 text-primary-500" /> : <BellOff className="w-4 h-4 text-gray-400" />}
                    {label}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={e => handleNotifToggle(key, e.target.checked, setter)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-300 dark:bg-dark-500 rounded-full peer-checked:bg-primary-500 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button type="button" onClick={handleLogout} className="btn-secondary flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              {t.account.logout}
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? t.common.loading : (<><Save className="w-5 h-5" />{t.account.save}</>)}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
