import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Lock, BookOpen, FolderOpen, ChevronRight } from 'lucide-react'
import { useData } from '../contexts/DataContext'

const LevelPage = () => {
    const { levelSlug } = useParams()
    const [searchParams] = useSearchParams()
    const urlTab = searchParams.get('tab')

    const { getLevelBySlug, getSubjectsForLevel, loading: dataLoading } = useData()
    const [level, setLevel] = useState(() => getLevelBySlug(levelSlug))
    const [subjects, setSubjects] = useState([])
    const [loading, setLoading] = useState(!level)

    useEffect(() => {
        const load = async () => {
            const foundLevel = getLevelBySlug(levelSlug)
            if (foundLevel) {
                setLevel(foundLevel)
                const subs = await getSubjectsForLevel(foundLevel.id)
                setSubjects(subs ?? [])
                setLoading(false)
            } else if (!dataLoading) {
                setLoading(false)
            }
        }
        load()
    }, [levelSlug, dataLoading, getLevelBySlug, getSubjectsForLevel])

    if (loading) return <PageLoader />

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* ── Premium Hero Header ── */}
            <div className="bg-[#0c1220] pt-32 pb-20 px-6 lg:px-16 text-white relative overflow-hidden border-b border-white/5">
                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-primary-200/40 mb-8 font-bold tracking-tight">
                        <Link to="/" className="hover:text-white transition-colors uppercase">HOME</Link>
                        <ChevronRight size={14} className="opacity-20" />
                        <span className="text-white uppercase">{level?.name ?? levelSlug}</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tighter leading-tight animate-fade-up">
                        {level?.name ?? 'Subjects'}
                    </h1>
                    <p className="text-primary-100/60 text-lg lg:text-xl max-w-2xl font-medium leading-relaxed animate-fade-up delay-100">
                        {level?.description ?? 'Select a subject to explore high-quality past papers, notes, and flashcards.'}
                    </p>
                </div>
                {/* Subtle Deep Glow */}
                <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary-600/5 rounded-full blur-[140px] -mr-48 -mt-48"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
                {subjects.length === 0 ? (
                    <EmptyState msg="No subjects available yet for this level." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {subjects.map((sub) => (
                            <Link
                                key={sub.id}
                                to={`/levels/${levelSlug}/${sub.slug}${urlTab ? `?tab=${urlTab}` : ''}`}
                                className="group bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-fade-up"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                                        <BookOpen size={28} strokeWidth={2.5} />
                                    </div>
                                    {sub.is_premium && (
                                        <div className="bg-secondary-50 text-secondary-600 p-2 rounded-xl border border-secondary-100 shadow-sm">
                                            <Lock size={16} strokeWidth={2.5} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary-600 transition-colors tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{sub.name}</h3>
                                <p className="text-base text-gray-400 font-medium line-clamp-2 mb-8 leading-relaxed">{sub.description || 'Access notes, past papers, and flashcards for this subject.'}</p>
                                <div className="flex items-center text-primary-600 font-black text-sm uppercase tracking-widest gap-2">
                                    Study Now <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const PageLoader = () => (
    <div className="flex flex-col items-center justify-center py-48 gap-6">
        <div className="w-12 h-12 border-[5px] border-primary-100 border-t-primary-600 rounded-full animate-spin shadow-inner" />
        <p className="text-primary-900/40 font-black text-sm uppercase tracking-widest animate-pulse">Loading subjects...</p>
    </div>
)

const EmptyState = ({ msg }) => (
    <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl flex items-center justify-center mb-8 border border-gray-50">
            <FolderOpen size={40} className="text-gray-200" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Nothing here yet</h3>
        <p className="text-gray-400 font-medium max-w-sm">{msg}</p>
    </div>
)

export default LevelPage
