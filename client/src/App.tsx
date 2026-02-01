import { Routes, Route } from 'react-router-dom';
import { useTranslation } from './i18n';
import Navbar from './components/Navbar';
import YouTubePage from './pages/YouTubePage';
import FacebookPage from './pages/FacebookPage';
import TwitterPage from './pages/TwitterPage';
import TikTokPage from './pages/TikTokPage';
import InstagramPage from './pages/InstagramPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import PricingPage from './pages/PricingPage';
import AccountPage from './pages/AccountPage';

export default function App() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<YouTubePage />} />
          <Route path="/facebook" element={<FacebookPage />} />
          <Route path="/twitter" element={<TwitterPage />} />
          <Route path="/tiktok" element={<TikTokPage />} />
          <Route path="/instagram" element={<InstagramPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </main>

      <footer className="footer-bar py-6 text-center text-sm">
        <p>Vipile &copy; {new Date().getFullYear()} - {t.footer}</p>
      </footer>
    </div>
  );
}
