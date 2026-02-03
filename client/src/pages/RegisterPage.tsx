import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    if (!acceptTerms) {
      setError(t.auth.acceptTermsRequired);
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || t.auth.registerError);
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength();
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = [t.auth.weak, t.auth.fair, t.auth.good, t.auth.strong];

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-500">
            Vipile
          </Link>
          <h1 className="text-2xl font-bold mt-6">{t.auth.registerTitle}</h1>
          <p className="text-gray-500 mt-2">{t.auth.registerSubtitle}</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">{t.auth.name}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field !pl-10"
                  placeholder={t.auth.namePlaceholder}
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.auth.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.auth.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field !pl-10 !pr-10"
                  placeholder="********"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < strength ? strengthColors[strength - 1] : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {strength > 0 && strengthLabels[strength - 1]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.auth.confirmPassword}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="********"
                  required
                />
                {confirmPassword && password === confirmPassword && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-500">
                {t.auth.acceptTerms}{' '}
                <a href="#" className="text-indigo-500 hover:underline">{t.auth.termsLink}</a>{' '}
                {t.auth.and}{' '}
                <a href="#" className="text-indigo-500 hover:underline">{t.auth.privacyLink}</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
            >
              {loading ? (
                t.common.loading
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t.auth.register}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {t.auth.hasAccount}{' '}
            <Link to="/logowanie" className="text-indigo-500 hover:text-indigo-400 font-medium">
              {t.auth.loginLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
