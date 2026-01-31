import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { UserPlus, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(t.passwordMinError);
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || t.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6 text-center">{t.registerTitle}</h1>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t.name}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t.email}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{t.passwordMin6}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" minLength={6} required />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {t.registerButton}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">
          {t.hasAccount}{' '}
          <Link to="/login" className="text-red-400 hover:text-red-300">{t.loginLink}</Link>
        </p>
      </div>
    </div>
  );
}
