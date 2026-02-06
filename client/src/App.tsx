import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import MyListingsPage from './pages/MyListingsPage';
import FavoritesPage from './pages/FavoritesPage';
import ChatPage from './pages/ChatPage';
import UserProfilePage from './pages/UserProfilePage';
import AccountPage from './pages/AccountPage';
import PromotePage from './pages/PromotePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminListingsPage from './pages/admin/AdminListingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminLayout from './components/Admin/AdminLayout';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;
  if (!user) return <Navigate to="/logowanie" />;
  return <>{children}</>;
}

function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/a-panel/login" />;
  return <AdminLayout />;
}

function StandardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin routes - no Navbar/Footer */}
      <Route path="/a-panel/login" element={<AdminLoginPage />} />
      <Route path="/a-panel" element={<AdminRoute />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="listings" element={<AdminListingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
      </Route>

      {/* Standard user-facing routes with Navbar/Footer */}
      <Route element={<StandardLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ogloszenia" element={<ListingsPage />} />
        <Route path="/ogloszenia/:id" element={<ListingDetailPage />} />
        <Route path="/kategoria/:slug" element={<ListingsPage />} />
        <Route path="/dodaj" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
        <Route path="/edytuj/:id" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
        <Route path="/moje-ogloszenia" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
        <Route path="/ulubione" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/wiadomosci" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/wiadomosci/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/uzytkownik/:id" element={<UserProfilePage />} />
        <Route path="/konto" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/promuj/:id" element={<ProtectedRoute><PromotePage /></ProtectedRoute>} />
        <Route path="/regulamin" element={<TermsPage />} />
        <Route path="/polityka-prywatnosci" element={<PrivacyPage />} />
        <Route path="/kontakt" element={<ContactPage />} />
        <Route path="/logowanie" element={<LoginPage />} />
        <Route path="/rejestracja" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
