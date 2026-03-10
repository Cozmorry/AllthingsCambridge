import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, GraduationCap, Award, Sparkles } from 'lucide-react'

const levels = [
    { slug: 'checkpoint', label: 'Checkpoint', sub: 'Lower Secondary', icon: BookOpen, color: 'teal', tag: 'Ages 11–14' },
    { slug: 'o-level', label: 'O Level', sub: 'Upper Secondary', icon: GraduationCap, color: 'blue', tag: 'Ages 14–16' },
    { slug: 'igcse', label: 'IGCSE', sub: 'International', icon: Award, color: 'purple', tag: 'Ages 14–16' },
    { slug: 'a-level', label: 'A Level', sub: 'Advanced Level', icon: Sparkles, color: 'rose', tag: 'Ages 16–19' },
]

const colorMap = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-100', icon: 'text-teal-600', hover: 'group-hover:border-teal-300' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-600', hover: 'group-hover:border-blue-300' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-600', hover: 'group-hover:border-purple-300' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-600', hover: 'group-hover:border-rose-300' },
}

const stats = [
    { value: '5,000+', label: 'Active Students' },
    { value: '1,200+', label: 'Study Resources' },
    { value: '4', label: 'Cambridge Levels' },
    { value: '20+', label: 'Subjects' },
]

const HomePage = () => (
    <div>
        {/* ── Hero ── */}
        <section className="relative bg-white border-b border-gray-100 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary-50 opacity-60 blur-3xl" />
                <div className="absolute -top-16 right-0 w-[400px] h-[400px] rounded-full bg-secondary-50 opacity-50 blur-3xl" />
            </div>
            <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-28 relative">
                <div className="max-w-3xl mx-auto text-center stagger">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-100 border border-secondary-200 text-secondary-800 text-sm font-semibold mb-6 animate-fade-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-500" />
                        </span>
                        Trusted by 5,000+ Cambridge students
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 animate-fade-up">
                        Master Cambridge Exams with{' '}
                        <span className="relative text-primary-600">
                            Active Recall
                            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                                <path d="M0 6 Q 100 0 200 6" stroke="#ffc300" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up">
                        Comprehensive notes, past papers, topical questions, and interactive flashcards for the Cambridge curriculum — all in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up">
                        <Link to="/signup" className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-600/35 hover:-translate-y-0.5">
                            Start Learning Free
                        </Link>
                        <Link to="/pricing" className="px-8 py-3.5 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-base transition-all">
                            View Pricing
                        </Link>
                    </div>
                </div>
            </div>
        </section>

        {/* ── Stats ── */}
        <section className="border-b border-gray-100 bg-white">
            <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-3xl font-extrabold text-primary-600">{value}</p>
                            <p className="text-sm text-gray-500 mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── Level Cards ── */}
        <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
            <div className="mb-10">
                <h2 className="text-2xl font-extrabold text-gray-900">Select Your Level</h2>
                <p className="text-gray-500 mt-1">Choose the Cambridge qualification you're studying for</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
                {levels.map(({ slug, label, sub, icon: Icon, color, tag }) => {
                    const c = colorMap[color]
                    return (
                        <Link
                            key={slug}
                            to={`/levels/${slug}`}
                            className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                        >
                            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 transition-colors ${c.bg} ${c.border} ${c.hover}`}>
                                <Icon size={26} className={c.icon} />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.icon} mb-3 inline-block`}>{tag}</span>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{label}</h3>
                            <p className="text-sm text-gray-400 mb-4">{sub}</p>
                            <div className="flex items-center text-primary-600 text-sm font-semibold">
                                View Subjects
                                <ArrowRight size={15} className="ml-1 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>

        {/* ── Flashcard Feature Promo ── */}
        <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-20">
            <div className="relative bg-gray-900 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_70%_50%,rgba(0,155,145,0.15),transparent)]" />
                <div className="grid md:grid-cols-2 gap-0 items-center relative z-10">
                    <div className="p-10 lg:p-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full mb-6">
                            ✨ New — Interactive Flashcards
                        </div>
                        <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
                            Study Smarter, Not Harder
                        </h2>
                        <p className="text-gray-400 text-base leading-relaxed mb-8">
                            Our interactive flashcard engine uses spaced repetition to help you lock in knowledge. Flip cards, track what you know, and master topics faster.
                        </p>
                        <Link to="/levels/igcse" className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition-colors">
                            Explore Flashcards <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center justify-center p-10">
                        {/* Floating card preview */}
                        <div className="animate-float w-full max-w-xs">
                            <div className="relative">
                                <div className="absolute top-3 left-3 w-full h-48 bg-primary-900/30 rounded-2xl" />
                                <div className="absolute top-1.5 left-1.5 w-full h-48 bg-primary-900/20 rounded-2xl" />
                                <div className="relative bg-white rounded-2xl p-6 h-48 flex flex-col shadow-2xl">
                                    <span className="text-xs text-gray-400 font-medium mb-auto">Front · Cell Biology</span>
                                    <p className="text-gray-900 font-semibold text-center text-base leading-snug mt-4">
                                        What are the main characteristics of a eukaryotic organism?
                                    </p>
                                    <div className="flex gap-3 mt-5 justify-center">
                                        <div className="h-8 flex-1 rounded-full border-2 border-red-200 bg-red-50 flex items-center justify-center text-xs font-semibold text-red-500">Still learning</div>
                                        <div className="h-8 flex-1 rounded-full border-2 border-green-200 bg-green-50 flex items-center justify-center text-xs font-semibold text-green-600">Know ✓</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
)

export default HomePage
