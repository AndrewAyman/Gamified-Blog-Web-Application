import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { XPProvider } from './context/XPContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import FeedPage from './pages/FeedPage'
import PostDetailPage from './pages/PostDetailPage'
import CreatePostPage from './pages/CreatePostPage'
import EditPostPage from './pages/EditPostPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import MissionsPage from './pages/MissionsPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <XPProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={10}
            containerStyle={{ top: 70 }}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0d0d1a',
                color: '#e2e8f0',
                border: '1px solid #1e1e3a',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '14px',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
              },
              success: {
                iconTheme: { primary: '#00ff88', secondary: '#07070f' },
                style: {
                  border: '1px solid rgba(0,255,136,0.3)',
                },
              },
              error: {
                iconTheme: { primary: '#ff006e', secondary: '#07070f' },
                style: {
                  border: '1px solid rgba(255,0,110,0.3)',
                },
              },
            }}
          />

          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected app routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<FeedPage />} />
              <Route path="post/:id" element={<PostDetailPage />} />
              <Route path="create" element={<CreatePostPage />} />
              <Route path="edit/:id" element={<EditPostPage />} />
              <Route path="profile/:userId" element={<ProfilePage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="missions" element={<MissionsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </XPProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
