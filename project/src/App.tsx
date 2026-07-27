import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { ClubProfilePage } from './pages/ClubProfilePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { BrowseClubsPage } from './pages/student/BrowseClubsPage';
import { OwnerDashboard } from './pages/clubOwner/OwnerDashboard';
import { CreateClubPage } from './pages/clubOwner/CreateClubPage';
import { ManageClubPage } from './pages/clubOwner/ManageClubPage';
import { ManageOpeningsPage } from './pages/clubOwner/ManageOpeningsPage';
import { ManageEventsPage } from './pages/clubOwner/ManageEventsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PendingClubsPage } from './pages/admin/PendingClubsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        }} />
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/clubs/:id" element={<ClubProfilePage />} />

            {/* Student routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
            } />
            <Route path="/student/clubs" element={
              <ProtectedRoute roles={['student']}><BrowseClubsPage /></ProtectedRoute>
            } />

            {/* Club Owner routes */}
            <Route path="/club-owner/dashboard" element={
              <ProtectedRoute roles={['clubOwner']}><OwnerDashboard /></ProtectedRoute>
            } />
            <Route path="/club-owner/create-club" element={
              <ProtectedRoute roles={['clubOwner']}><CreateClubPage /></ProtectedRoute>
            } />
            <Route path="/club-owner/manage" element={
              <ProtectedRoute roles={['clubOwner']}><ManageClubPage /></ProtectedRoute>
            } />
            <Route path="/club-owner/openings" element={
              <ProtectedRoute roles={['clubOwner']}><ManageOpeningsPage /></ProtectedRoute>
            } />
            <Route path="/club-owner/events" element={
              <ProtectedRoute roles={['clubOwner']}><ManageEventsPage /></ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/pending-clubs" element={
              <ProtectedRoute roles={['admin']}><PendingClubsPage /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
