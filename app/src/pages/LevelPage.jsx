import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowRight, Lock, BookOpen, FolderOpen } from 'lucide-react'

const LevelPage = () => {
    const { levelSlug } = useParams()
    const [searchParams] = useSearchParams()
    const urlTab = searchParams.get('tab')

    const [level, setLevel] = useState(null)
    const [subjects, setSubjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const { data: lvl } = await supabase.from('levels').select('*').eq('slug', levelSlug).single()
            if (lvl) {
                setLevel(lvl)
                const { data: subs } = await supabase.from('subjects').select('*').eq('level_id', lvl.id).order('name')
                setSubjects(subs ?? [])
            }
            setLoading(false)
        }
        load()
    }, [levelSlug])

    if (loading) return <PageLoader />

    return (
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">{level?.name ?? levelSlug}</span>
            </nav>

            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{level?.name ?? 'Subjects'}</h1>
                <p className="text-gray-500">{level?.description ?? 'Select a subject to explore study materials.'}</p>
            </div>

            {subjects.length === 0 ? (
                <EmptyState msg="No subjects available yet for this level." />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {subjects.map((sub) => (
                        <Link
                            key={sub.id}
                            to={`/levels/${levelSlug}/${sub.slug}${urlTab ? `?tab=${urlTab}` : ''}`}
                            className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl">
                                    <BookOpen size={20} className="text-primary-500" />
                                </div>
                                {sub.is_premium && <Lock size={14} className="text-secondary-500 mt-1" />}
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{sub.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-4">{sub.description}</p>
                            <div className="flex items-center text-primary-600 text-sm font-semibold">
                                Study Now <ArrowRight size={15} className="ml-1 group-hover:translate-x-1.5 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

const PageLoader = () => (
    <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
)

const EmptyState = ({ msg }) => (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"><FolderOpen size={32} className="opacity-40" /></div>
        <p className="font-medium">{msg}</p>
    </div>
)

export default LevelPage
