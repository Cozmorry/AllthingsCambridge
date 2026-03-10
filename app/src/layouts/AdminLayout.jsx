import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    LayoutDashboard, Layers, BookOpen, AlignLeft, FileText,
    BookMarked, Newspaper, Users, CreditCard, LogOut, ChevronLeft
} from 'lucide-react'

const adminNav = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/levels', icon: Layers, label: 'Levels' },
    { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/admin/topics', icon: AlignLeft, label: 'Topics' },
    { to: '/admin/resources', icon: FileText, label: 'Resources' },
    { to: '/admin/flashcards', icon: BookMarked, label: 'Flashcards' },
    { to: '/admin/blog', icon: Newspaper, label: 'Blog' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
]

const AdminLayout = () => {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-950">
            {/* Admin Sidebar */}
            <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-800">
                    <span className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center text-xs font-bold">A</span>
                    <span className="font-bold text-white text-sm truncate">Admin Panel</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    {adminNav.map(({ to, icon: Icon, label, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all ` +
                                (isActive
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white')
                            }
                        >
                            <Icon size={17} className="shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-gray-800 p-4 shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{profile?.full_name ?? 'Admin'}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors">
                            <ChevronLeft size={13} /> Main Site
                        </Link>
                        <button onClick={handleSignOut} className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-gray-700 hover:border-red-800 rounded-lg transition-colors">
                            <LogOut size={13} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Admin Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
