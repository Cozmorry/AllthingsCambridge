import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
    ChevronLeft, ChevronRight, RotateCcw,
    Settings, Maximize2, Check, X, BookMarked,
    ArrowRight, ChevronDown, ChevronUp, Menu
} from 'lucide-react'

const FlashcardStudyPage = () => {
    const { levelSlug, subjectSlug, deckId } = useParams()
    const { user } = useAuth()
    const [deck, setDeck] = useState(null)
    const [cards, setCards] = useState([])
    const [progress, setProgress] = useState({}) // { cardId: 'learning' | 'known' }
    const [index, setIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [loading, setLoading] = useState(true)

    const [allTopics, setAllTopics] = useState([])
    const [allDecks, setAllDecks] = useState([])
    const [expandedTopic, setExpandedTopic] = useState(null)

    useEffect(() => {
        const load = async () => {
            const [deckRes, cardsRes] = await Promise.all([
                supabase.from('flashcard_decks').select('*, subjects(name), topics(name)').eq('id', deckId).single(),
                supabase.from('flashcards').select('*').eq('deck_id', deckId).order('order'),
            ])
            setDeck(deckRes.data)
            setCards(cardsRes.data ?? [])

            // Fetch the secondary sidebar structures
            if (deckRes.data) {
                const subId = deckRes.data.subject_id
                const [topicsR, decksR] = await Promise.all([
                    supabase.from('topics').select('*').eq('subject_id', subId).order('order'),
                    supabase.from('flashcard_decks').select('*').eq('subject_id', subId).order('order')
                ])
                setAllTopics(topicsR.data ?? [])
                setAllDecks(decksR.data ?? [])
                setExpandedTopic(deckRes.data.topic_id)
            }

            // Load user progress
            if (user) {
                const { data: prog } = await supabase
                    .from('user_flashcard_progress')
                    .select('flashcard_id, status')
                    .eq('user_id', user.id)
                    .in('flashcard_id', (cardsRes.data ?? []).map(c => c.id))
                if (prog) {
                    const map = {}
                    prog.forEach(p => { map[p.flashcard_id] = p.status })
                    setProgress(map)
                }
            }
            setLoading(false)
        }
        load()
    }, [deckId, user])

    const saveProgress = useCallback(async (cardId, status) => {
        if (!user) return
        await supabase.from('user_flashcard_progress').upsert(
            { user_id: user.id, flashcard_id: cardId, status },
            { onConflict: 'user_id,flashcard_id' }
        )
    }, [user])

    const advance = (cardId, status) => {
        const updated = { ...progress, [cardId]: status }
        setProgress(updated)
        saveProgress(cardId, status)
        goNext()
    }

    const goNext = () => {
        setFlipped(false)
        setTimeout(() => setIndex(i => Math.min(i + 1, cards.length - 1)), 150)
    }
    const goPrev = () => {
        setFlipped(false)
        setTimeout(() => setIndex(i => Math.max(i - 1, 0)), 150)
    }
    const restart = () => { setIndex(0); setFlipped(false) }

    if (loading) return <PageLoader />
    if (!deck || cards.length === 0) return (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <span className="text-5xl mb-4">🃏</span>
            <p className="font-medium">No flashcards in this deck yet.</p>
        </div>
    )

    const card = cards[index]
    const knowCount = Object.values(progress).filter(v => v === 'known').length
    const learningCount = Object.values(progress).filter(v => v === 'learning').length
    const pct = ((index + 1) / cards.length) * 100

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden w-full">
            {/* Secondary Navbar (Topics & Decks Accordion) */}
            <div className="hidden lg:flex w-[320px] bg-white border-r border-[#e5e7eb] flex-col shrink-0 overflow-y-auto z-10">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Flashcards</h2>
                    <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"><Menu size={18} /></button>
                </div>

                <div className="p-5 flex-1">
                    <Link to={`/levels/${levelSlug}/${subjectSlug}`} className="group flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl mb-6 hover:bg-gray-100 hover:border-gray-200 transition-all shadow-[0_2px_4px_-2px_rgba(0,0,0,0.05)]">
                        <span className="font-semibold text-gray-800 text-sm">View all topics</span>
                        <ArrowRight size={18} className="text-gray-400 group-hover:text-gray-800 group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <div className="space-y-3">
                        {allTopics.map(topic => {
                            const topicDecks = allDecks.filter(d => d.topic_id === topic.id)
                            const isExpanded = expandedTopic === topic.id

                            return (
                                <div key={topic.id} className={`border rounded-xl overflow-hidden transition-colors ${isExpanded ? 'border-gray-200 shadow-sm' : 'border-gray-100'}`}>
                                    <button
                                        onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm tracking-tight">{topic.name}</p>
                                            <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wide">{topicDecks.length} Topics</p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isExpanded ? 'bg-blue-100 text-[#2d59ff]' : 'bg-gray-100 text-gray-500'}`}>
                                            {isExpanded ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="bg-[#f4f6fc] border-t border-gray-100 py-1">
                                            {topicDecks.map(td => (
                                                <Link
                                                    key={td.id}
                                                    to={`/levels/${levelSlug}/${subjectSlug}/flashcards/${td.id}`}
                                                    className={`block px-5 py-3 text-[13px] font-semibold border-l-4 transition-colors ${td.id === deck.id
                                                        ? 'border-[#2d59ff] bg-[#eef1ff] text-[#2d59ff]'
                                                        : 'border-transparent text-gray-600 hover:bg-[#eaf0fb] hover:text-gray-900'
                                                        }`}
                                                >
                                                    {td.title}
                                                </Link>
                                            ))}
                                            {topicDecks.length === 0 && (
                                                <div className="px-5 py-3 text-xs font-medium text-gray-400">No content available.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Main Flashcard Container */}
            <div className="flex-1 flex flex-col h-full bg-[#f3f4f9] overflow-hidden">
                {/* Top Area (scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 flex flex-col items-center">
                    <div className="w-full max-w-4xl flex flex-col gap-6">
                        {/* Breadcrumbs & Badge */}
                        <div className="flex items-center justify-between text-sm text-gray-500 flex-wrap gap-4">
                            <nav className="flex items-center gap-2">
                                <span className="cursor-pointer hover:text-gray-900">{levelSlug.toUpperCase()}</span>
                                <span>/</span>
                                <span className="cursor-pointer hover:text-gray-900">{deck.subjects?.name}</span>
                                <span>/</span>
                                <span className="cursor-pointer hover:text-gray-900">Flashcards</span>
                                <span>/</span>
                                <span className="cursor-pointer hover:text-gray-900">{deck.topics?.name || 'Topic'}</span>
                                <span>/</span>
                                <span className="cursor-pointer hover:text-gray-900">{deck.title}</span>
                            </nav>
                            <span className="bg-gray-100 px-3 py-1 rounded-md text-gray-600 font-mono text-xs hidden sm:block">Exam code: 8461</span>
                        </div>

                        {/* Title Area */}
                        <div>
                            <span className="inline-block bg-[#e5f59e] text-[#1c1d1a] px-2 py-0.5 rounded font-medium text-sm mb-4">
                                {deck.subjects?.name} <span className="font-bold">Revision</span>
                            </span>
                            <h1 className="text-4xl font-bold text-gray-900 mb-1">
                                {deck.title} <span className="text-gray-500 font-medium">({levelSlug.toUpperCase()} {deck.subjects?.name}):</span>
                            </h1>
                            <h2 className="text-4xl font-bold text-gray-500 mb-6">Flashcards</h2>
                        </div>

                        {/* Progress Bar & Download */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-sm font-medium">{index + 1}/{cards.length}</span>
                                <button className="bg-[#2d59ff] hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
                                    Download
                                </button>
                            </div>
                            <div className="w-full h-[3px] bg-gray-200 mt-2">
                                <div className="h-full bg-[#2d59ff] transition-all duration-300" style={{ width: `${pct}%` }} />
                            </div>
                        </div>

                        {/* Stats above card */}
                        <div className="flex items-center justify-between mt-2 mb-2 px-1 text-sm font-medium">
                            <div className="flex items-center gap-3 text-[#f25e43]">
                                <span className="border border-[#f25e43] rounded-full px-2.5 py-0.5 text-xs">{learningCount}</span>
                                <span>Still learning</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#11b76b]">
                                <span>Know</span>
                                <span className="border border-[#11b76b] rounded-full px-2.5 py-0.5 text-xs">{knowCount}</span>
                            </div>
                        </div>

                        {/* Card stack container */}
                        <div className="w-full relative perspective mb-8 mt-4 mx-auto" style={{ maxWidth: '800px', height: '420px' }}>
                            {/* Background stack cards */}
                            {index < cards.length - 1 && (
                                <div className="absolute inset-x-4 top-[-8px] h-full bg-white rounded-xl border border-gray-200 shadow-sm opacity-90 -z-10" />
                            )}
                            {index < cards.length - 2 && (
                                <div className="absolute inset-x-8 top-[-16px] h-full bg-white rounded-xl border border-gray-200 shadow-sm opacity-60 -z-20" />
                            )}

                            {/* The interactive card wrapper */}
                            <div className="absolute inset-0 preserve-3d">
                                <div
                                    className={`w-full h-full preserve-3d cursor-pointer transition-transform duration-500`}
                                    onClick={() => setFlipped(f => !f)}
                                    style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                                >
                                    {/* Front Face */}
                                    <div className="absolute inset-0 bg-white rounded-xl border border-gray-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] backface-hidden flex flex-col">
                                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 text-sm">
                                            <div className="flex-1" />
                                            <span className="flex-1 text-center font-medium text-gray-500">Front</span>
                                            <div className="flex-1 flex justify-end">
                                                <span className="flex items-center gap-1.5 text-gray-600 border-b border-gray-800 pb-[1px] hover:text-gray-900 transition-colors">
                                                    {deck.topics?.name || 'Topic'}
                                                    <div className="bg-[#2d59ff] p-1 rounded-sm text-white shrink-0 ml-1">
                                                        <BookMarked size={12} fill="currentColor" />
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex px-12 py-10 items-center justify-center text-center">
                                            <p className="text-3xl text-gray-900 font-medium leading-[1.4] tracking-tight">{card.front}</p>
                                        </div>
                                    </div>

                                    {/* Back Face */}
                                    <div className="absolute inset-0 bg-white rounded-xl border border-gray-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] backface-hidden rotate-y-180 flex flex-col">
                                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 text-sm">
                                            <div className="flex-1" />
                                            <span className="flex-1 text-center font-medium text-gray-500">Back</span>
                                            <div className="flex-1 flex justify-end">
                                                <span className="flex items-center gap-1.5 text-gray-600 border-b border-gray-800 pb-[1px] hover:text-gray-900 transition-colors">
                                                    {deck.topics?.name || 'Topic'}
                                                    <div className="bg-[#2d59ff] p-1 rounded-sm text-white shrink-0 ml-1">
                                                        <BookMarked size={12} fill="currentColor" />
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex px-12 py-10 items-center justify-center text-center">
                                            <p className="text-2xl text-gray-700 leading-relaxed font-medium">{card.back}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="max-w-[800px] w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                            <div className="flex items-center gap-2">
                                <ControlBtn onClick={restart} title="Restart"><RotateCcw size={18} /></ControlBtn>
                                <ControlBtn title="Settings"><Settings size={18} /></ControlBtn>
                                <ControlBtn title="Fullscreen"><Maximize2 size={18} /></ControlBtn>
                            </div>
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full p-2 shadow-sm">
                                <button
                                    onClick={goPrev}
                                    disabled={index === 0}
                                    className={`p-2.5 rounded-full transition-colors ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => advance(card.id, 'learning')}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-[#f25e43] hover:bg-red-50 font-bold transition-colors text-sm"
                                >
                                    <X size={18} strokeWidth={2.5} />
                                    Still learning
                                </button>
                                <button
                                    onClick={() => advance(card.id, 'known')}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#11b76b] text-white rounded-full hover:bg-green-600 font-bold transition-colors text-sm shadow-sm"
                                >
                                    <Check size={18} strokeWidth={2.5} />
                                    Know
                                </button>
                                <button
                                    onClick={goNext}
                                    disabled={index === cards.length - 1}
                                    className={`p-2.5 rounded-full transition-colors ${index === cards.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

const ControlBtn = ({ children, onClick, title }) => (
    <button
        onClick={onClick}
        title={title}
        className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
    >
        {children}
    </button>
)

const PageLoader = () => (
    <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
)

export default FlashcardStudyPage
