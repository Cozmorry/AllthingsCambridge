import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    LayoutDashboard, Layers, BookOpen, AlignLeft, FileText,
    BookMarked, Newspaper, Users, CreditCard, LogOut, ChevronLeft, Sun, Moon
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
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

    useEffect(() => {
        if (dark) localStorage.setItem('theme', 'dark')
        else localStorage.setItem('theme', 'light')
    }, [dark])

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className={`flex h-screen overflow-hidden ${dark ? 'dark' : ''} bg-gray-50 dark:bg-[#0c1220]`}>
            {/* Admin Sidebar */}
            <aside className="w-60 shrink-0 bg-white dark:bg-[#080d17] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors">
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <img src="/icon.png" alt="ATC" className="w-7 h-7 rounded-lg" />
                        <span className="font-bold text-gray-900 dark:text-white text-sm truncate">Admin Panel</span>
                    </div>
                    <button onClick={() => setDark(!dark)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors">
                        {dark ? <Sun size={15} /> : <Moon size={15} />}
                    </button>
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
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white')
                            }
                        >
                            <Icon size={17} className="shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-gray-100 dark:border-gray-800 p-4 shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-xs shrink-0 border border-primary-100 dark:border-primary-800/50">
                            {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{profile?.full_name ?? 'Admin'}</p>
                            <p className="text-xs text-gray-500 font-medium">Administrator</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 dark:text-gray-400 dark:border-gray-800 dark:hover:text-white dark:hover:bg-gray-800/50 rounded-lg transition-all">
                            <ChevronLeft size={13} /> Main Site
                        </Link>
                        <button onClick={handleSignOut} className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 dark:text-red-400 dark:border-red-900/30 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all">
                            <LogOut size={13} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Admin Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-[#0c1220] transition-colors">
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
