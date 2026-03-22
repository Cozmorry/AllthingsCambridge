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
        <div className={`flex h-screen overflow-hidden ${dark ? 'dark' : ''} bg-[#f3f4f9] dark:bg-[#0c1220]`}>
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
            <aside className={`shrink-0 bg-white border-r border-[#e5e7eb] flex flex-col transition-all duration-300 z-40 fixed lg:relative h-full overflow-hidden ${sidebarOpen ? 'w-[260px] translate-x-0 shadow-2xl lg:shadow-none' : 'w-[260px] -translate-x-full lg:translate-x-0 lg:w-[72px]'
                }`}>
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-[#e5e7eb] shrink-0">
                    {sidebarOpen ? (
                        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-lg text-gray-900 truncate" onClick={() => { setActiveCategory(null); if (window.innerWidth < 1024) setSidebarOpen(false); }}>
                            <img src="/icon.png" alt="ATC" className="w-8 h-8 rounded-lg shrink-0" />
                            AllThingsCambridge
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
                                            className={({ isActive }) =>
                                                `flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all group ` +
                                                (isActive && !activeCategory
                                                    ? 'bg-[#eef1ff] text-[#2d59ff]'
                                                    : 'text-[#4b5563] hover:bg-gray-50 hover:text-gray-900')
                                            }
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
                                                ? 'bg-[#2d59ff] text-white shadow-md'
                                                : 'text-[#4b5563] hover:bg-gray-50 hover:text-gray-900')
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
                            <NavLink to="/admin" onClick={() => { setActiveCategory(null); if (window.innerWidth < 1024) setSidebarOpen(false); }} className={({ isActive }) =>
                                `flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2.5 rounded-xl text-sm font-semibold transition-all ` +
                                (isActive && !activeCategory ? 'bg-secondary-50 text-secondary-700' : 'text-[#4b5563] hover:bg-gray-50 hover:text-gray-900')
                            }>
                                <Settings size={18} className="shrink-0" />
                                {sidebarOpen && <span>Admin Panel</span>}
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Bottom user area */}
                {user && (
                    <div className="border-t border-gray-100 p-3 shrink-0">
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
                                    <p className="text-sm font-medium text-gray-800 truncate">{profile?.full_name ?? 'Student'}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                            )}
                            {sidebarOpen && (
                                <button onClick={signOut} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0" title="Sign Out">
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
                        <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between sticky top-0 bg-[#f8fafc] z-10 shrink-0">
                            <h2 className="text-lg font-extrabold text-gray-900 capitalize">
                                {navSections[0].items.find(i => i.id === activeCategory)?.label || 'Resources'}
                            </h2>
                            <button onClick={() => setActiveCategory(null)} className="p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition-colors">
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
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 bg-white">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                        </button>
                        {location.pathname !== '/' && (() => {
                            // Determine smart back behavior based on current route
                            const pathParts = location.pathname.split('/').filter(Boolean)
                            const searchTab = new URLSearchParams(location.search).get('tab')

                            const handleBack = () => {
                                if (pathParts[0] === 'levels' && pathParts.length >= 3) {
                                    // On a subject page → go back to the level page
                                    navigate(`/levels/${pathParts[1]}${searchTab ? `?tab=${searchTab}` : ''}`)
                                } else if (pathParts[0] === 'levels' && pathParts.length === 2) {
                                    // On a level page → reopen the secondary sidebar with the right category
                                    const tab = searchTab || 'notes'
                                    const categoryMap = { notes: 'notes', past_paper: 'past_paper', topical_question: 'topical_question', flashcards: 'flashcards' }
                                    setActiveCategory(categoryMap[tab] || 'notes')
                                    navigate('/')
                                } else {
                                    navigate(-1)
                                }
                            }

                            return (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                    <span className="hidden sm:inline">Back</span>
                                </button>
                            )
                        })()}
                        {isStudyMode && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full border border-primary-100">
                                <BookMarked size={14} /> Study Mode
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setDark(!dark)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                            {dark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        {!user ? (
                            <>
                                <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log In</Link>
                                <Link to="/signup" className="px-4 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-sm shadow-primary-600/20">Sign Up</Link>
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
                <main className="flex-1 overflow-y-auto">
                    <div className="page-enter">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default MainLayout
