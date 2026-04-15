import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { usePaywall } from '../hooks/usePaywall'
import PaywallGate from '../components/ui/PaywallGate'
import { Lock, FileText, BookOpen, HelpCircle, BookMarked, Calendar, Crown, FolderOpen, ChevronRight, ArrowRight } from 'lucide-react'
import { useData } from '../contexts/DataContext'

const tabs = [
    { key: 'notes', label: 'Notes', icon: FileText },
    { key: 'past_paper', label: 'Past Papers', icon: BookOpen },
    { key: 'topical_question', label: 'Questions', icon: HelpCircle },
    { key: 'flashcards', label: 'Flashcards', icon: BookMarked },
]

const SubjectPage = () => {
    const { levelSlug, subjectSlug } = useParams()
    const { hasPremiumAccess } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const urlTab = searchParams.get('tab')

    const [activeTab, setActiveTab] = useState(urlTab || 'notes')
    const [subject, setSubject] = useState(null)
    const [level, setLevel] = useState(null)
    const [topics, setTopics] = useState([])
    const [resources, setResources] = useState([])
    const [decks, setDecks] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedYear, setSelectedYear] = useState('all')

    const { recordView } = usePaywall()

    useEffect(() => {
        if (activeTab !== urlTab) {
            setSearchParams({ tab: activeTab }, { replace: true })
        }
    }, [activeTab, setSearchParams, urlTab])

    useEffect(() => {
        if (urlTab && urlTab !== activeTab && tabs.some(t => t.key === urlTab)) {
            setActiveTab(urlTab)
        }
    }, [urlTab])

    const { getLevelBySlug, loading: dataLoading } = useData()

    useEffect(() => {
        const load = async () => {
            const lvl = getLevelBySlug(levelSlug)
            if (lvl) {
                setLevel(lvl)
                const { data: sub } = await supabase.from('subjects').select('*').eq('slug', subjectSlug).eq('level_id', lvl.id).single()
                setSubject(sub)
                if (sub) {
                    const [topicsRes, decksRes] = await Promise.all([
                        supabase.from('topics').select('*').eq('subject_id', sub.id).order('order'),
                        supabase.from('flashcard_decks').select('*, topics(name)').eq('subject_id', sub.id),
                    ])
                    setTopics(topicsRes.data ?? [])
                    setDecks(decksRes.data ?? [])
                }
            }
            setLoading(false)
        }
        if (!dataLoading || levelSlug) load()
    }, [levelSlug, subjectSlug, dataLoading, getLevelBySlug])

    useEffect(() => {
        if (subject) recordView(`subject-${subject.id}-${activeTab}`)
    }, [subject, activeTab, recordView])

    const tabToType = { notes: 'note', past_paper: 'past_paper', topical_question: 'topical_question' }

    useEffect(() => {
        if (!subject) return
        setSelectedYear('all')
        setResources([])
        if (activeTab === 'flashcards') return
        const resourceType = tabToType[activeTab]
        if (!resourceType) return
        const loadResources = async () => {
            const { data } = await supabase.from('resources').select('*').eq('subject_id', subject.id).eq('type', resourceType).order('created_at', { ascending: false })
            setResources(data ?? [])
        }
        loadResources()
    }, [activeTab, subject])

    if (loading) return <PageLoader />
    if (!subject) return <div className="p-32 text-center text-gray-500 font-bold">RESOURCE NOT FOUND</div>

    const isLocked = subject.is_premium && !hasPremiumAccess

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* ── Header Hero Section ── */}
            <div className="bg-[#0c1220] pt-32 pb-24 px-6 lg:px-16 text-white relative overflow-hidden border-b border-white/5">
                <div className="max-w-7xl mx-auto relative z-10">
                    <nav className="flex items-center gap-3 text-sm text-primary-200/40 mb-6 font-bold tracking-tight mb-8">
                        <Link to="/" className="hover:text-white transition-colors uppercase">HOME</Link>
                        <ChevronRight size={14} className="opacity-20" />
                        <Link to={`/levels/${levelSlug}`} className="hover:text-white transition-colors uppercase">{level?.name}</Link>
                        <ChevronRight size={14} className="opacity-20" />
                        <span className="text-white uppercase">{subject.name}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tighter leading-tight animate-fade-up">
                                {subject.name}
                            </h1>
                            <p className="text-primary-100/60 text-lg lg:text-xl font-medium max-w-2xl leading-relaxed animate-fade-up delay-100">
                                {subject.description || 'Access high-quality revision notes, past papers, and topical questions for this subject.'}
                            </p>
                        </div>
                        {subject.is_premium && (
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 animate-fade-up delay-200">
                                <Crown size={20} className="text-yellow-400 fill-yellow-400 opacity-60" />
                                <span className="font-black text-sm uppercase tracking-widest text-primary-100/80">Premium</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Subtle Deep Glows */}
                <div className="absolute top-0 right-0 w-[1000px] h-[700px] bg-primary-600/5 rounded-full blur-[160px] -mr-64 -mt-64"></div>
            </div>

            {/* ── Main Content Area with Navigation ── */}
            <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Navigation Column */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-20 flex flex-col gap-2 p-2 bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100">
                            {tabs.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${activeTab === key ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 translate-x-2' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                                >
                                    <Icon size={20} strokeWidth={activeTab === key ? 3 : 2} className="shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Content Column */}
                    <div className="lg:w-3/4">
                        {/* Year Filter for non-flashcards */}
                        {activeTab !== 'flashcards' && (() => {
                            const years = [...new Set(resources.map(r => r.year).filter(Boolean))].sort((a, b) => b - a)
                            if (years.length === 0) return null
                            return (
                                <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                                    <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-gray-400 shrink-0 shadow-sm"><Calendar size={20} /></div>
                                    <button
                                        onClick={() => setSelectedYear('all')}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${selectedYear === 'all' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white border border-gray-100 text-gray-800 hover:bg-gray-50 shadow-sm'}`}
                                    >
                                        ALL YEARS
                                    </button>
                                    {years.map(y => (
                                        <button
                                            key={y}
                                            onClick={() => setSelectedYear(y)}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${selectedYear === y ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white border border-gray-100 text-gray-800 hover:bg-gray-50 shadow-sm'}`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            )
                        })()}

                        {/* Resource View */}
                        <div className="animate-fade-up">
                            {isLocked ? (
                                <PremiumGate />
                            ) : (
                                <PaywallGate>
                                    {activeTab === 'flashcards' ? (
                                        <FlashcardDecks decks={decks} levelSlug={levelSlug} subjectSlug={subjectSlug} />
                                    ) : (
                                        <ResourceList
                                            resources={selectedYear === 'all' ? resources : resources.filter(r => r.year === selectedYear)}
                                            isNotes={activeTab === 'notes'}
                                        />
                                    )}
                                </PaywallGate>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ResourceList = ({ resources, isNotes }) => {
    if (resources.length === 0) return <EmptyState />
    return (
        <div className="grid grid-cols-1 gap-5">
            {resources.map((r) => {
                const hasUrl = r.file_url && r.file_url.trim().length > 0
                const Tag = hasUrl ? 'a' : 'div'
                const linkProps = hasUrl ? { href: r.file_url, target: '_blank', rel: 'noreferrer' } : {}
                return (
                    <Tag
                        key={r.id}
                        {...linkProps}
                        className={`group flex items-center gap-6 p-6 bg-white rounded-[32px] border border-gray-100 transition-all ${hasUrl ? 'hover:shadow-xl hover:border-primary-100 cursor-pointer hover:-translate-y-1' : 'opacity-70'}`}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                            {isNotes ? <FileText size={28} /> : <BookOpen size={28} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors truncate`}>{r.title}</h4>
                            <div className="flex items-center gap-3 mt-2">
                                {r.year && <span className="text-xs font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-lg uppercase tracking-widest">{r.year}</span>}
                                {!hasUrl && <span className="text-xs font-bold text-gray-400">Restricted File</span>}
                            </div>
                        </div>
                        {hasUrl && (
                            <div className="bg-primary-50 text-primary-600 p-3 rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all">
                                <ArrowRight size={24} strokeWidth={3} />
                            </div>
                        )}
                    </Tag>
                )
            })}
        </div>
    )
}

const FlashcardDecks = ({ decks, levelSlug, subjectSlug }) => {
    if (decks.length === 0) return <EmptyState msg="No flashcard decks available yet." />
    return (
        <div className="grid sm:grid-cols-2 gap-6">
            {decks.map((deck) => (
                <Link
                    key={deck.id}
                    to={`/levels/${levelSlug}/${subjectSlug}/flashcards/${deck.id}`}
                    className="group bg-white rounded-[40px] border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all transition-shadow duration-500"
                >
                    <div className="flex items-start justify-between mb-8">
                        <div className="w-20 h-20 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                            <BookMarked size={36} strokeWidth={2.5} />
                        </div>
                        {deck.is_premium && (
                            <div className="bg-secondary-50 text-secondary-600 p-2 rounded-xl border border-secondary-100 shadow-sm">
                                <Lock size={16} strokeWidth={2.5} />
                            </div>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-primary-600 transition-colors tracking-tight">{deck.title}</h3>
                    <p className="text-gray-400 font-bold text-base mb-6">{deck.topics?.name || 'Comprehensive Deck'}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <span className="text-sm font-black text-gray-400 tracking-widest uppercase">{deck.card_count ?? 0} CARDS</span>
                        <ArrowRight size={20} strokeWidth={3} className="text-primary-600 group-hover:translate-x-2 transition-transform" />
                    </div>
                </Link>
            ))}
        </div>
    )
}

const PremiumGate = () => (
    <div className="bg-white p-16 rounded-[60px] border border-gray-100 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-secondary-100/30 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
            <div className="w-24 h-24 rounded-[32px] bg-secondary-50 flex items-center justify-center mx-auto mb-10 shadow-lg text-secondary-600">
                <Crown size={48} strokeWidth={2.5} fill="currentColor" className="opacity-40" />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Unlock Full Access</h3>
            <p className="text-gray-500 font-medium text-lg mb-12 max-w-sm mx-auto leading-relaxed">This subject's content is exclusive to our Standard and Premium subscribers.</p>
            <Link to="/pricing" className="inline-flex items-center gap-3 px-10 py-5 bg-primary-600 shadow-2xl shadow-primary-500/20 hover:bg-primary-700 text-white rounded-[24px] font-black text-xl transition-all hover:scale-105 active:scale-95">
                Go Premium <ArrowRight size={24} strokeWidth={4} />
            </Link>
        </div>
    </div>
)

const EmptyState = ({ msg = 'No resources available yet.' }) => (
    <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl flex items-center justify-center mb-8 border border-gray-100">
            <FolderOpen size={40} className="text-gray-200" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Resource Coming Soon</h3>
        <p className="text-gray-400 font-medium max-w-sm">{msg}</p>
    </div>
)

const PageLoader = () => (
    <div className="flex flex-col items-center justify-center py-48 gap-6 min-h-screen">
        <div className="w-12 h-12 border-[5px] border-primary-100 border-t-primary-600 rounded-full animate-spin shadow-inner" />
        <p className="text-primary-900/40 font-black text-sm uppercase tracking-widest animate-pulse tracking-tighter">Loading materials...</p>
    </div>
)

export default SubjectPage
