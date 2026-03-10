import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Lock, FileText, BookOpen, HelpCircle, BookMarked } from 'lucide-react'

const tabs = [
    { key: 'notes', label: 'Notes', icon: FileText },
    { key: 'past_paper', label: 'Past Papers', icon: BookOpen },
    { key: 'topical_question', label: 'Topical Questions', icon: HelpCircle },
    { key: 'flashcards', label: 'Flashcards', icon: BookMarked },
]

const SubjectPage = () => {
    const { levelSlug, subjectSlug } = useParams()
    const { isSubscribed } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const urlTab = searchParams.get('tab')

    const [activeTab, setActiveTab] = useState(urlTab || 'notes')
    const [subject, setSubject] = useState(null)
    const [level, setLevel] = useState(null)
    const [topics, setTopics] = useState([])
    const [resources, setResources] = useState([])
    const [decks, setDecks] = useState([])
    const [loading, setLoading] = useState(true)

    // Update URL when active tab changes manually 
    useEffect(() => {
        if (activeTab !== urlTab) {
            setSearchParams({ tab: activeTab }, { replace: true })
        }
    }, [activeTab, setSearchParams, urlTab])

    // Respect URL tab if it changes from external navigation
    useEffect(() => {
        if (urlTab && urlTab !== activeTab && tabs.some(t => t.key === urlTab)) {
            setActiveTab(urlTab)
        }
    }, [urlTab])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const { data: lvl } = await supabase.from('levels').select('*').eq('slug', levelSlug).single()
            setLevel(lvl)
            if (lvl) {
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
        load()
    }, [levelSlug, subjectSlug])

    useEffect(() => {
        if (!subject) return
        const loadResources = async () => {
            if (activeTab === 'flashcards') return
            const { data } = await supabase
                .from('resources')
                .select('*')
                .eq('subject_id', subject.id)
                .eq('type', activeTab === 'notes' ? 'note' : activeTab)
            setResources(data ?? [])
        }
        loadResources()
    }, [activeTab, subject])

    if (loading) return <PageLoader />
    if (!subject) return <div className="p-10 text-gray-500">Subject not found.</div>

    const isLocked = subject.is_premium && !isSubscribed

    return (
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
                <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                <span>/</span>
                <Link to={`/levels/${levelSlug}`} className="hover:text-primary-600 transition-colors capitalize">{level?.name}</Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">{subject.name}</span>
            </nav>

            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{subject.name}</h1>
                    <p className="text-gray-500">{subject.description}</p>
                </div>
                {subject.is_premium && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-100 text-secondary-800 text-xs font-semibold border border-secondary-200">
                        👑 Premium Content
                    </span>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8 w-fit overflow-x-auto">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLocked ? (
                <PremiumGate />
            ) : activeTab === 'flashcards' ? (
                <FlashcardDecks decks={decks} levelSlug={levelSlug} subjectSlug={subjectSlug} />
            ) : (
                <ResourceList resources={resources} />
            )}
        </div>
    )
}

const ResourceList = ({ resources }) => {
    if (resources.length === 0) return <EmptyState />
    return (
        <div className="space-y-3">
            {resources.map((r) => (
                <a
                    key={r.id}
                    href={r.file_url ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors truncate">{r.title}</p>
                        {r.topic_id && <p className="text-xs text-gray-400 mt-0.5">Topic resource</p>}
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:block">{r.file_url ? 'PDF' : 'View'}</span>
                </a>
            ))}
        </div>
    )
}

const FlashcardDecks = ({ decks, levelSlug, subjectSlug }) => {
    if (decks.length === 0) return <EmptyState msg="No flashcard decks available yet." />
    return (
        <div className="grid sm:grid-cols-2 gap-4">
            {decks.map((deck) => (
                <Link
                    key={deck.id}
                    to={`/levels/${levelSlug}/${subjectSlug}/flashcards/${deck.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    <div className="flex items-start justify-between mb-3">
                        <BookMarked size={20} className="text-primary-500" />
                        {deck.is_premium && <Lock size={14} className="text-secondary-500" />}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{deck.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{deck.topics?.name}</p>
                    <span className="text-xs text-gray-500">{deck.card_count ?? 0} cards</span>
                </Link>
            ))}
        </div>
    )
}

const PremiumGate = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center text-3xl mb-5">👑</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Content</h3>
        <p className="text-gray-500 mb-6 max-w-sm">Subscribe to unlock all notes, past papers, and flashcards for every subject.</p>
        <Link to="/pricing" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors">
            View Pricing
        </Link>
    </div>
)

const EmptyState = ({ msg = 'No resources available yet.' }) => (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <span className="text-5xl mb-4">📂</span>
        <p className="font-medium">{msg}</p>
    </div>
)

const PageLoader = () => (
    <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
)

export default SubjectPage
