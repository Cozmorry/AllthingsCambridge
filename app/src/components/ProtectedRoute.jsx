import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Requires user to be logged in
export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()
    if (loading) return <PageSpinner />
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />
    return children
}

// Requires admin role
export const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth()
    const location = useLocation()
    if (loading) return <PageSpinner />
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />
    if (!isAdmin) return <Navigate to="/" replace />
    return children
}

const PageSpinner = () => (
    <div className="flex items-center justify-center h-screen bg-surface">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
)
