import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Camera, LogOut, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersApi, uploadApi } from '../services/api';
import { useTranslation } from '../i18n';

export default function AccountPage() {
  const { t } = useTranslation();
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t.account.title}</h1>

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
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {t.account.email}
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input-field opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">{t.account.emailHint}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {t.account.phone}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input-field"
              placeholder="+48 123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              {t.account.city}
            </label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="input-field"
              placeholder={t.account.cityPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.account.bio}</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder={t.account.bioPlaceholder}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            {t.account.logout}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              t.common.loading
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t.account.save}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
