import { useState, useEffect } from 'react'
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
    Home, FileText, Layers, HelpCircle, BookMarked,
    Users, MessageSquare, Info, Mail, Menu, Moon, Sun,
    ChevronLeft, LogOut, Settings, Crown, ChevronRight, X
} from 'lucide-react'

const navSections = [
    {
        label: 'Learning Resources',
        items: [
            { to: '/', icon: Home, label: 'Home', exact: true },
            { id: 'past_paper', icon: BookOpenIcon, label: 'Past Papers' },
            { id: 'notes', icon: Layers, label: 'Notes' },
            { id: 'topical_question', icon: HelpCircle, label: 'Topical Questions' },
            { id: 'flashcards', icon: BookMarked, label: 'Flashcards' },
        ],
    },
    {
        label: 'Community',
        items: [
            { to: '/forums', icon: Users, label: 'Forums' },
            { to: '/blog', icon: MessageSquare, label: 'Blog' },
        ],
    },
    {
        label: 'Information',
        items: [
            { to: '/about', icon: Info, label: 'About' },
            { to: '/contact', icon: Mail, label: 'Contact' },
        ],
    },
]

// Custom BookOpen clone since we didn't import it directly above
function BookOpenIcon(props) {
    return <FileText {...props} /> // Fallback placeholder
}


const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
    const [activeCategory, setActiveCategory] = useState(null)

    useEffect(() => {
        if (dark) localStorage.setItem('theme', 'dark')
        else localStorage.setItem('theme', 'light')
    }, [dark])
    const [levels, setLevels] = useState([])
    const [subjects, setSubjects] = useState([])

    const { user, profile, isAdmin, signOut } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const isStudyMode = location.pathname.includes('/flashcards/')

    // Fetch navigation hierarchy data
    useEffect(() => {
        supabase.from('levels').select('*').order('name').then(({ data }) => setLevels(data || []))
        supabase.from('subjects').select('*').order('name').then(({ data }) => setSubjects(data || []))
    }, [])

    return (
        <div className={`flex h-screen overflow-hidden ${dark ? 'dark' : ''} ${location.pathname === '/' ? 'bg-primary-600 dark:bg-[#0c1220]' : 'bg-[#f3f4f9] dark:bg-[#0c1220]'}`}>
            {/* Mobile Backdrop for Primary Sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden transition-opacity"
                    onClick={() => {
                        setSidebarOpen(false)
                        setActiveCategory(null)
                    }}
                />
            )}

            {/* Main Primary Sidebar */}
            <aside className={`shrink-0 border-r flex flex-col transition-all duration-300 z-40 fixed lg:relative h-full overflow-hidden ${location.pathname === '/' ? 'bg-transparent border-transparent' : 'bg-[#f8fafc] border-[#e5e7eb] dark:bg-[#1e293b] dark:border-gray-800'} ${sidebarOpen ? 'w-[260px] translate-x-0 shadow-2xl lg:shadow-none' : 'w-[260px] -translate-x-full lg:translate-x-0 lg:w-[72px]'
                }`}>
                {/* Logo */}
                <div className={`h-16 flex items-center px-4 shrink-0 border-b ${location.pathname === '/' ? 'border-transparent' : 'border-[#e5e7eb] dark:border-gray-800'}`}>
                    {sidebarOpen ? (
                        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-lg truncate" onClick={() => { setActiveCategory(null); if (window.innerWidth < 1024) setSidebarOpen(false); }}>
                            <img src="/icon.png" alt="ATC" className="w-8 h-8 rounded-lg shrink-0" />
                            <span className={location.pathname === '/' ? 'text-white' : 'text-gray-900 dark:text-white'}>AllThingsCambridge</span>
                        </Link>
                    ) : (
                        <Link to="/" className="mx-auto hidden lg:flex" onClick={() => setActiveCategory(null)}><img src="/icon.png" alt="ATC" className="w-8 h-8 rounded-lg" /></Link>
                    )}
                </div>

                {/* Nav */}
                <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
                    {navSections.map((section) => (
                        <div key={section.label} className="mb-6 px-4">
                            {sidebarOpen && (
                                <p className="text-[11px] font-bold tracking-widest text-[#9ca3af] uppercase mb-3 px-2">{section.label}</p>
                            )}
                            {section.items.map((item) => {
                                const Icon = item.icon
                                const isActiveResource = activeCategory === item.id

                                // If it's a direct link (like Home, Forums, etc)
                                if (item.to) {
                                    return (
                                        <NavLink
                                            key={item.label}
                                            to={item.to}
                                            end={item.exact}
                                            onClick={() => {
                                                if (item.to && window.innerWidth < 1024) setSidebarOpen(false)
                                                setActiveCategory(null)
                                            }}
                                            className={({ isActive }) => {
                                                const isHome = location.pathname === '/';
                                                const activeClass = isHome ? 'bg-white/10 text-white' : 'bg-[#eef1ff] text-[#2d59ff] dark:bg-primary-900/20 dark:text-primary-400';
                                                const inactiveClass = isHome ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-[#4b5563] hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200';
                                                return `flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all group ` +
                                                (isActive && !activeCategory ? activeClass : inactiveClass)
                                            }}
                                            title={!sidebarOpen ? item.label : undefined}
                                        >
                                            <Icon size={18} className="shrink-0" />
                                            {sidebarOpen && <span className="truncate">{item.label}</span>}
                                        </NavLink>
                                    )
                                }

                                // If it's a resource category triggering the secondary sidebar
                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => setActiveCategory(isActiveResource ? null : item.id)}
                                        className={
                                            `w-full flex items-center justify-between ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all ` +
                                            (isActiveResource
                                                ? (location.pathname === '/' ? 'bg-white/20 text-white shadow-sm' : 'bg-[#2d59ff] text-white shadow-md dark:bg-primary-600')
                                                : (location.pathname === '/' ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-[#4b5563] hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'))
                                        }
                                        title={!sidebarOpen ? item.label : undefined}
                                    >
                                        <div className={`flex items-center ${sidebarOpen ? 'gap-3' : ''}`}>
                                            <Icon size={18} className="shrink-0" />
                                            {sidebarOpen && <span className="truncate">{item.label}</span>}
                                        </div>
                                        {sidebarOpen && <ChevronRight size={16} className={`transition-transform duration-300 ${isActiveResource ? 'text-white' : 'text-gray-400'}`} />}
                                    </button>
                                )
                            })}
                        </div>
                    ))}

                    {/* Admin link if admin */}
                    {isAdmin && (
                        <div className="px-4 mb-4">
                            {sidebarOpen && <p className="text-[11px] font-bold tracking-widest text-[#9ca3af] uppercase mb-3 px-2">Admin</p>}
                            <NavLink to="/admin" onClick={() => { setActiveCategory(null); if (window.innerWidth < 1024) setSidebarOpen(false); }} className={({ isActive }) => {
                                const isHome = location.pathname === '/';
                                const activeClass = isHome ? 'bg-white/10 text-white' : 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-400';
                                const inactiveClass = isHome ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-[#4b5563] hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200';
                                return `flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2.5 rounded-xl text-sm font-semibold transition-all ` +
                                (isActive && !activeCategory ? activeClass : inactiveClass)
                            }}>
                                <Settings size={18} className="shrink-0" />
                                {sidebarOpen && <span>Admin Panel</span>}
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Bottom user area */}
                {user && (
                    <div className={`p-3 shrink-0 border-t ${location.pathname === '/' ? 'border-white/10' : 'border-[#e5e7eb] dark:border-gray-800'}`}>
                        <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-2' : 'justify-center'}`}>
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                                    {profile?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
                                </div>
                            )}
                            {sidebarOpen && (
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${location.pathname === '/' ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{profile?.full_name ?? 'Student'}</p>
                                    <p className={`text-xs truncate ${location.pathname === '/' ? 'text-white/60' : 'text-gray-400'}`}>{user.email}</p>
                                </div>
                            )}
                            {sidebarOpen && (
                                <button onClick={signOut} className={`p-1.5 rounded-lg transition-colors shrink-0 ${location.pathname === '/' ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`} title="Sign Out">
                                    <LogOut size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </aside>

            {/* Secondary Navigation Sidebar for Resources */}
            {activeCategory && (
                <>
                    {/* Mobile Backdrop for Secondary Sidebar */}
                    <div
                        className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden transition-opacity"
                        onClick={() => setActiveCategory(null)}
                    />
                    <div className="w-[300px] max-w-[80vw] h-full bg-[#f8fafc] border-r border-[#e5e7eb] flex flex-col shrink-0 overflow-y-auto z-50 lg:z-30 shadow-2xl lg:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all animate-in slide-in-from-left-8 fixed left-0 lg:relative lg:left-0">
                        <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between sticky top-0 bg-[#f8fafc] dark:bg-[#1e293b] z-10 shrink-0">
                            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 truncate pr-4 capitalize">
                                {navSections.flatMap(s => s.items).find(i => i.id === activeCategory)?.label || 'Resources'}
                            </h2>
                            <button onClick={() => setActiveCategory(null)} className="p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 space-y-6">
                            {levels.length === 0 ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {levels.map(level => (
                                        <Link
                                            key={level.id}
                                            to={`/levels/${level.slug}?tab=${activeCategory}`}
                                            onClick={() => {
                                                setActiveCategory(null) // Close sidebar
                                                if (window.innerWidth < 1024) setSidebarOpen(false) // Handle mobile
                                            }}
                                            className="group flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-[#2d59ff] hover:shadow-sm transition-all text-[#4b5563] hover:text-[#2d59ff]"
                                        >
                                            <span className="font-bold text-sm">{level.name}</span>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-[#2d59ff] group-hover:translate-x-0.5 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Main content */}
            <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 ${location.pathname === '/' ? 'bg-transparent' : 'bg-white dark:bg-gray-900'}`}>
                {/* Header */}
                <header className={`h-16 border-b flex items-center justify-between px-4 lg:px-6 shrink-0 z-20 transition-colors sticky top-0 ${location.pathname === '/' ? 'bg-transparent border-transparent -mb-16' : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800'}`}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-xl transition-colors ${location.pathname === '/' ? 'text-primary-800 hover:bg-primary-50/50 hover:text-primary-900' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800'}`}>
                            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                        </button>
                        {location.pathname !== '/' && (() => {
                            // Determine smart back behavior based on current route
                            const pathParts = location.pathname.split('/').filter(Boolean)
                            const searchTab = new URLSearchParams(location.search).get('tab')

                            const handleBack = () => {
                                if (pathParts.includes('flashcards') && pathParts.length >= 5) {
                                    // Specifically handle jumping back from a flashcard deck to the subject page
                                    navigate(`/levels/${pathParts[1]}/${pathParts[2]}?tab=flashcards`)
                                } else if (pathParts.length > 2) {
                                    // Go back one level (e.g., from subject back to level)
                                    navigate('/' + pathParts.slice(0, pathParts.length - 1).join('/'))
                                } else if (pathParts.length === 2) {
                                    navigate('/')
                                } else {
                                    navigate(-1)
                                }
                            }

                            return (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shrink-0"
                                >
                                    <ChevronLeft size={16} />
                                    <span className="hidden md:inline">Back</span>
                                </button>
                            )
                        })()}
                        {isStudyMode && (
                            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-primary-50 text-primary-700 rounded-full border border-primary-100 dark:bg-primary-900/20 dark:border-primary-800 uppercase tracking-tight">
                                <BookMarked size={12} /> Study Mode
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setDark(!dark)} className={`p-2 rounded-xl transition-colors ${location.pathname === '/' ? 'text-primary-800 hover:bg-primary-50/50 hover:text-primary-900' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800'}`}>
                            {dark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        {!user ? (
                            <>
                                <Link to="/login" className={`hidden sm:block px-4 py-2 text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary-800 hover:text-primary-900' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}>Log In</Link>
                                <Link to="/signup" className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow-sm ${location.pathname === '/' ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-900/20' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/20'}`}>Sign Up</Link>
                            </>
                        ) : (
                            <Link to="/account" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100 shadow-sm" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                                        {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                                    </div>
                                )}
                                {profile?.is_subscribed && <Crown size={14} className="text-secondary-500" />}
                            </Link>
                        )}
                    </div>
                </header>

                {/* Page outlet */}
                <main className="flex-1 flex flex-col min-h-0">
                    <div className="page-enter flex-1">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default MainLayout
