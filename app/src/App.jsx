import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

// Layouts
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import AuthLayout from './layouts/AuthLayout'

// Public Pages
import HomePage from './pages/HomePage'
import LevelPage from './pages/LevelPage'
import SubjectPage from './pages/SubjectPage'
import FlashcardStudyPage from './pages/FlashcardStudyPage'
import BlogListPage from './pages/BlogListPage'
import BlogPostPage from './pages/BlogPostPage'
import ForumsPage from './pages/ForumsPage'
import ForumPostPage from './pages/ForumPostPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PricingPage from './pages/PricingPage'
import PaymentCallbackPage from './pages/PaymentCallbackPage'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Protected Student Pages
import AccountPage from './pages/AccountPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLevels from './pages/admin/AdminLevels'
import AdminSubjects from './pages/admin/AdminSubjects'
import AdminTopics from './pages/admin/AdminTopics'
import AdminResources from './pages/admin/AdminResources'
import AdminFlashcards from './pages/admin/AdminFlashcards'
import AdminBlog from './pages/admin/AdminBlog'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPayments from './pages/admin/AdminPayments'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Auth routes (minimal layout) ── */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* ── Main public + student routes ── */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/levels/:levelSlug" element={<LevelPage />} />
            <Route path="/levels/:levelSlug/:subjectSlug" element={<SubjectPage />} />
            <Route path="/levels/:levelSlug/:subjectSlug/flashcards/:deckId" element={<FlashcardStudyPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/forums" element={<ForumsPage />} />
            <Route path="/forums/:postId" element={<ForumPostPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/payment/callback" element={<PaymentCallbackPage />} />
            <Route path="/account" element={
              <ProtectedRoute><AccountPage /></ProtectedRoute>
            } />
          </Route>

          {/* ── Admin routes ── */}
          <Route path="/admin" element={
            <AdminRoute><AdminLayout /></AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="levels" element={<AdminLevels />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="topics" element={<AdminTopics />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="flashcards" element={<AdminFlashcards />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
