import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { authApi, stripeApi } from '../services/api';
import { Link } from 'react-router-dom';
import {
  User, Lock, Crown, BarChart3, Calendar,
  Download, Music, Film, Loader2, CheckCircle2,
  AlertCircle, ExternalLink, TrendingUp, LockKeyhole,
} from 'lucide-react';

interface Stats {
  totalDownloads: number;
  recentDownloads: number;
  byPlatform: { platform: string; count: number }[];
  byFormat: { format: string; count: number }[];
  topPlatform: string | null;
}

interface AccountInfo {
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  hasStripe: boolean;
}

const platformNames: Record<string, string> = {
  YOUTUBE: 'YouTube',
  FACEBOOK: 'Facebook',
  TWITTER: 'Twitter/X',
  TIKTOK: 'TikTok',
  INSTAGRAM: 'Instagram',
};

const platformColors: Record<string, string> = {
  YOUTUBE: 'bg-red-500',
  FACEBOOK: 'bg-blue-600',
  TWITTER: 'bg-sky-500',
  TIKTOK: 'bg-pink-500',
  INSTAGRAM: 'bg-purple-500',
};

export default function AccountPage() {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data } = await authApi.getStats();
      setAccount(data.user);
      setStats(data.stats);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPw !== confirmPw) {
      setPwError(t.passwordsDontMatch);
      return;
    }

    if (newPw.length < 6) {
      setPwError(t.passwordMin6Chars);
      return;
    }

    setPwLoading(true);
    try {
      const { data } = await authApi.changePassword({ currentPassword: currentPw, newPassword: newPw });
      setPwSuccess(data.message);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      setPwError(err.response?.data?.error || t.errorOccurred);
    } finally {
      setPwLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setStripeLoading(true);
    try {
      const { data } = await stripeApi.getPortal();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setStripeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const isPremium = user?.plan === 'PREMIUM';

  const maxPlatformCount = stats?.byPlatform?.length
    ? Math.max(...stats.byPlatform.map((p) => p.count))
    : 1;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <User className="w-8 h-8 text-red-500" />
        {t.myAccount}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Account info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Overview */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              {t.accountInfo}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">{t.accountName}</p>
                <p className="font-medium">{account?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">{t.accountEmail}</p>
                <p className="font-medium">{account?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">{t.plan}</p>
                <p className="font-medium flex items-center gap-2">
                  {account?.plan === 'PREMIUM' ? (
                    <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-sm font-medium">
                      <Crown className="w-3.5 h-3.5" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-gray-400">Free</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">{t.memberSince}</p>
                <p className="font-medium flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {account?.createdAt ? new Date(account.createdAt).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              {t.subscription}
            </h2>

            {account?.plan === 'PREMIUM' ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 font-medium">{t.subscriptionActive}</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {t.subscriptionDesc}
                </p>
                <button
                  onClick={handleManageSubscription}
                  disabled={stripeLoading}
                  className="btn-secondary flex items-center gap-2"
                >
                  {stripeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  {t.manageSubInvoices}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  <span className="text-gray-400 font-medium">{t.planFree}</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {t.freeDesc}
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <Crown className="w-4 h-4" />
                  {t.getPremium}
                </button>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              {t.changePassword}
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase mb-1 block">{t.currentPassword}</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase mb-1 block">{t.newPassword}</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase mb-1 block">{t.confirmPassword}</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>

              {pwError && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {pwSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {t.changePasswordBtn}
              </button>
            </form>
          </div>
        </div>

        {/* Right column - Stats */}
        <div className="space-y-6">
          {isPremium ? (
            <>
              {/* Quick stats */}
              <div className="card">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  {t.statistics}
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{t.allDownloads}</span>
                    <span className="text-2xl font-bold text-white">{stats?.totalDownloads || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{t.last7days}</span>
                    <span className="text-xl font-bold text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {stats?.recentDownloads || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{t.favoritePlatform}</span>
                    <span className="text-sm font-medium">
                      {stats?.topPlatform ? platformNames[stats.topPlatform] || stats.topPlatform : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Downloads by format */}
              <div className="card">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-gray-400" />
                  {t.byFormat}
                </h3>

                {stats?.byFormat && stats.byFormat.length > 0 ? (
                  <div className="space-y-2">
                    {stats.byFormat.map(({ format, count }) => (
                      <div key={format} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          {format === 'VIDEO' ? <Film className="w-4 h-4 text-blue-400" /> : <Music className="w-4 h-4 text-green-400" />}
                          {format === 'VIDEO' ? t.video : t.audio}
                        </span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{t.noData}</p>
                )}
              </div>

              {/* Downloads by platform */}
              <div className="card">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  {t.byPlatform}
                </h3>

                {stats?.byPlatform && stats.byPlatform.length > 0 ? (
                  <div className="space-y-3">
                    {stats.byPlatform
                      .sort((a, b) => b.count - a.count)
                      .map(({ platform, count }) => (
                        <div key={platform}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{platformNames[platform] || platform}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${platformColors[platform] || 'bg-gray-500'}`}
                              style={{ width: `${(count / maxPlatformCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{t.noData}</p>
                )}
              </div>
            </>
          ) : (
            /* FREE user - locked stats with blur */
            <div className="relative">
              {/* Blurred fake stats behind */}
              <div className="space-y-6 select-none pointer-events-none" aria-hidden="true">
                <div className="card" style={{ filter: 'blur(6px)' }}>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    {t.statistics}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{t.allDownloads}</span>
                      <span className="text-2xl font-bold text-white">127</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{t.last7days}</span>
                      <span className="text-xl font-bold text-green-400">23</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{t.favoritePlatform}</span>
                      <span className="text-sm font-medium">YouTube</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ filter: 'blur(6px)' }}>
                  <h3 className="text-sm font-bold mb-3">{t.byFormat}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.video}</span>
                      <span className="text-sm font-medium">89</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.audio}</span>
                      <span className="text-sm font-medium">38</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ filter: 'blur(6px)' }}>
                  <h3 className="text-sm font-bold mb-3">{t.byPlatform}</h3>
                  <div className="space-y-3">
                    {['YouTube', 'TikTok', 'Instagram'].map((p, i) => (
                      <div key={p}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{p}</span>
                          <span className="font-medium">{[45, 32, 18][i]}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${[100, 71, 40][i]}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl px-6 py-8 max-w-[260px]">
                  <div className="w-14 h-14 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LockKeyhole className="w-7 h-7 text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t.premiumStats2}</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {t.premiumStatsDesc}
                  </p>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    {t.getPremiumBtn}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
