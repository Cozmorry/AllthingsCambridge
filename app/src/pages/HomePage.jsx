import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Check, Star, FileText, Layers, MessageCircle, Lightbulb } from 'lucide-react'

const features = [
    {
        title: 'Past Papers & Notes',
        desc: 'Explore exam papers and detailed notes',
        icon: FileText,
        color: 'text-primary-600',
        bg: 'bg-primary-50'
    },
    {
        title: 'Flashcards & Quizzes',
        desc: 'Boost your memory with interactive tools',
        icon: Layers,
        color: 'text-orange-600',
        bg: 'bg-orange-50'
    },
    {
        title: 'Community Forum',
        desc: 'Connect with students & educators',
        icon: MessageCircle,
        color: 'text-primary-700',
        bg: 'bg-primary-100'
    },
    {
        title: 'Exam Tips & Blogs',
        desc: 'Get expert advice and study tips',
        icon: Lightbulb,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50'
    }
]

const reasons = [
    'Affordable Plans',
    'Global Cambridge Coverage',
    'Progress Tracking',
    'Supportive Community'
]

const testimonials = [
    {
        quote: "All Things Cambridge helped me improve my grades!",
        name: "Sarah K.",
        img: "https://placehold.co/100x100/3b46ff/ffffff?text=SK"
    },
    {
        quote: "This site has Cambridge I need to excel in my exams.",
        name: "James L.",
        img: "https://placehold.co/100x100/3b46ff/ffffff?text=JL"
    },
    {
        quote: "The forums are amazing for getting study help.",
        name: "Anita M.",
        img: "https://placehold.co/100x100/3b46ff/ffffff?text=AM"
    }
]

const plans = [
    {
        name: 'Free',
        price: 'BASIC ACCESS',
        features: ['5 Free Resource Views', 'Access to Free Notes', 'Community Forums', 'Basic Flashcards'],
        button: 'Get Started',
        color: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-100',
        btnBg: 'bg-primary-600',
        headerBg: 'bg-white text-gray-900 border-b border-gray-100',
        priceColor: 'text-gray-500 text-sm font-bold'
    },
    {
        name: 'Standard',
        price: '$9.99 / month',
        features: ['Full Access to Notes', 'All Past Papers', 'Flashcards & Quizzes', 'Progress Tracking'],
        button: 'Subscribe Now',
        color: 'bg-white',
        text: 'text-gray-900',
        border: 'border-primary-100',
        btnBg: 'bg-primary-500',
        headerBg: 'bg-primary-500 text-white',
        priceColor: 'text-primary-100 text-sm'
    },
    {
        name: 'Premium',
        price: '$99.99 / year',
        features: ['Everything in Standard', 'Priority Support', 'Exclusive Webinars', 'Download Materials'],
        button: 'Subscribe Now',
        color: 'bg-white',
        text: 'text-gray-900',
        border: 'border-primary-200',
        btnBg: 'bg-primary-800',
        headerBg: 'bg-primary-800 text-white',
        priceColor: 'text-primary-200 text-sm'
    }
]

const BlogSkeleton = () => (
    <div className="bg-white rounded-[40px] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden text-left">
        <div className="h-56 bg-gray-100 animate-pulse relative">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-200/50 to-transparent"></div>
        </div>
        <div className="p-8 space-y-4">
            <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded-full w-1/2 animate-pulse"></div>
            <div className="pt-4 flex items-center justify-between">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
)

const HomePage = () => {
    const { user, hasPremiumAccess } = useAuth()
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(4)
                if (error) throw error
                setBlogs(data || [])
            } catch (err) {
                console.error('Blog fetch error:', err)
                setBlogs([])
            } finally {
                setTimeout(() => setLoading(false), 1200)
            }
        }
        fetchBlogs()
    }, [])

    useEffect(() => {
        // Intersection Observer for scroll reveal (Streaming effect)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed')
                }
            })
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

        const reveals = document.querySelectorAll('.reveal')
        reveals.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [loading])

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* ── Hero ── */}
            <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 pt-44 pb-32 px-6 lg:px-16 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between z-10 relative">
                    <div className="md:w-[55%] mb-12 md:mb-0">
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight mb-8 tracking-tighter animate-fade-up">
                            Master Cambridge Exams<br />with Confidence
                        </h1>
                        <p className="text-primary-50 font-medium text-xl mb-12 max-w-xl opacity-90 leading-relaxed animate-fade-up style-animation-delay" style={{ animationDelay: '200ms' }}>
                            Access past papers, notes, flashcards, and community support—all in one place with AllThingsCambridge.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 animate-fade-up" style={{ animationDelay: '400ms' }}>
                            {user ? (
                                <Link to={hasPremiumAccess ? "/levels/a-level" : "/pricing"} className="bg-yellow-400 hover:bg-yellow-500 text-primary-950 shadow-2xl shadow-yellow-900/20 font-black px-10 py-5 rounded-2xl transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 text-center text-xl">
                                    {hasPremiumAccess ? "Continue Learning" : "Unlock Premium"}
                                </Link>
                            ) : (
                                <Link to="/signup" className="bg-yellow-400 hover:bg-yellow-500 text-primary-950 shadow-2xl shadow-yellow-900/20 font-black px-10 py-5 rounded-2xl transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 text-center text-xl">
                                    Start Learning Free
                                </Link>
                            )}
                            <Link to="/pricing" className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/20 text-white font-bold px-10 py-5 rounded-2xl transition-all text-center text-xl">
                                View Pricing Plans
                            </Link>
                        </div>
                    </div>
                    <div className="md:w-[45%] flex justify-end animate-fade-up" style={{ animationDelay: '600ms' }}>
                        <div className="animate-float">
                            <img
                                src="/hero.png"
                                alt="Students studying"
                                className="w-full max-w-lg drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                            />
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-800/40 rounded-full blur-[100px] -ml-32 -mb-32"></div>
            </section>

            {/* ── Our Features ── */}
            <section className="py-28 px-6 lg:px-16 max-w-7xl mx-auto text-center reveal">
                <h2 className="text-5xl font-black text-primary-950 mb-4 tracking-tighter uppercase">Our Features</h2>
                <p className="text-gray-500 text-lg mb-20 max-w-2xl mx-auto font-medium">Everything you need to excel in your IGCSE, O-Level, and A-Level journey.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {features.map((feat, idx) => (
                        <div key={idx} className="group bg-white p-10 rounded-[32px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col items-center text-center hover:shadow-2xl transition-all hover:-translate-y-2 reveal" style={{ transitionDelay: `${idx * 150}ms` }}>
                            <div className={`w-20 h-20 rounded-3xl ${feat.bg} ${feat.color} mb-8 flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm`}>
                                <feat.icon size={36} strokeWidth={2.5} />
                            </div>
                            <h3 className="font-black text-gray-900 text-2xl mb-4">{feat.title}</h3>
                            <p className="text-gray-500 text-base leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Why Choose Us? ── */}
            <section className="py-28 px-6 lg:px-16 bg-gray-50/50 reveal">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2 relative reveal">
                            <div className="absolute -inset-4 bg-primary-200/30 rounded-[40px] blur-2xl"></div>
                            <img
                                src="/group.png"
                                alt="Students Group"
                                className="relative w-full rounded-[40px] shadow-2xl"
                            />
                        </div>
                        <div className="lg:w-1/2 space-y-10">
                            <div>
                                <h2 className="text-5xl font-black text-primary-950 mb-6 leading-tight">Empowering Students<br />Globally</h2>
                                <p className="text-gray-600 text-lg leading-relaxed">Join thousands of students who have already transformed their learning experience with our platform.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {reasons.map((reason, idx) => (
                                    <div key={idx} className="flex items-center gap-5 p-5 bg-white rounded-3xl shadow-sm border border-gray-100 group hover:border-primary-200 transition-colors">
                                        <div className="text-primary-600 bg-primary-50 p-2.5 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                            <Check size={24} strokeWidth={4} />
                                        </div>
                                        <span className="text-lg text-gray-800 font-black">{reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Success Stories ── */}
            <section className="py-28 px-6 lg:px-16 max-w-7xl mx-auto text-center reveal">
                <h2 className="text-5xl font-black text-primary-950 mb-20 tracking-tighter uppercase">Success Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {testimonials.map((test, idx) => (
                        <div key={idx} className="bg-white p-10 rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center text-center relative hover:shadow-xl transition-shadow reveal" style={{ transitionDelay: `${idx * 200}ms` }}>
                            <img src={test.img} alt={test.name} className="w-24 h-24 rounded-full object-cover mb-8 border-8 border-primary-50 shadow-inner" />
                            <p className="text-gray-800 text-xl font-bold italic leading-relaxed mb-8">"{test.quote}"</p>
                            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center flex-col gap-3 w-full">
                                <div className="flex text-yellow-400 gap-1.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                                </div>
                                <span className="text-gray-400 text-sm font-black tracking-widest uppercase">-{test.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Choose Your Plan ── */}
            <section className="py-28 px-6 lg:px-16 bg-gray-900 rounded-[60px] mx-4 lg:mx-10 my-10 overflow-hidden relative reveal">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/10 rounded-full blur-[100px]"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h2 className="text-5xl font-black text-white mb-6 uppercase tracking-tighter">Choose Your Plan</h2>
                    <p className="text-gray-400 text-lg mb-20 max-w-xl mx-auto font-medium">Get the best resources for your academic success today.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
                        {plans.map((plan, idx) => (
                            <div key={idx} className={`bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-800 flex flex-col transition-all hover:scale-[1.03] reveal ${idx === 1 ? 'md:-translate-y-4 ring-4 ring-primary-500 shadow-primary-500/20' : ''}`} style={{ transitionDelay: `${idx * 150}ms` }}>
                                <div className={`${plan.headerBg} py-8 px-6 text-center`}>
                                    <p className={`uppercase tracking-widest font-black text-[10px] mb-3 opacity-70`}>{idx === 1 ? 'Most Popular' : idx === 2 ? 'Ultimate Support' : ''}</p>
                                    <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                    <div className={`font-black text-xl tracking-tight ${plan.priceColor}`}>{plan.price}</div>
                                </div>
                                <div className="p-8 flex flex-col flex-1 bg-white">
                                    <ul className="space-y-4 text-left mb-8 flex-1">
                                        {plan.features.map((feat, fIdx) => (
                                            <li key={fIdx} className="flex items-center gap-3 text-gray-700 font-bold text-sm leading-snug">
                                                <div className="bg-primary-50 p-1.5 rounded-lg text-primary-600 shadow-sm shrink-0">
                                                    <Check size={16} strokeWidth={4} />
                                                </div>
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to={idx === 0 ? (user ? "/account" : "/signup") : "/pricing"} className={`w-full py-4 rounded-2xl text-white font-black text-base lg:text-lg transition-all ${plan.btnBg} hover:opacity-95 text-center shadow-xl tracking-wider ${user && idx === 0 && !hasPremiumAccess ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {idx === 0 
                                            ? (user ? (hasPremiumAccess ? 'Included' : 'Current Plan') : plan.button) 
                                            : (hasPremiumAccess ? 'Active' : plan.button)}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Latest from Our Blog ── */}
            <section className="py-28 px-6 lg:px-16 max-w-7xl mx-auto text-center">
                <div className="flex items-center justify-between mb-20">
                    <div className="text-left">
                        <h2 className="text-5xl font-black text-primary-950 mb-4">Latest from Blog</h2>
                        <p className="text-gray-500 text-lg">Stay updated with study tips and community news.</p>
                    </div>
                    <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 px-8 py-4 bg-primary-50 text-primary-700 rounded-2xl font-black hover:bg-primary-100 transition-all">
                        View All Posts
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {loading ? (
                        [...Array(4)].map((_, i) => <BlogSkeleton key={i} />)
                    ) : blogs.length > 0 ? (
                        blogs.map((blog, idx) => (
                            <Link to={`/blog/${blog.slug || idx}`} key={idx} className="group bg-white rounded-[40px] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden text-left hover:shadow-2xl transition-all hover:-translate-y-2">
                                <div className="relative h-56 overflow-hidden">
                                    <img src={blog.img || blog.image_url || 'https://placehold.co/400x250/f1f5f9/94a3b8?text=Post'} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-black text-gray-900 line-clamp-2 mb-6 leading-tight group-hover:text-primary-600 transition-colors uppercase tracking-tight">{blog.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-1.5 bg-primary-100 rounded-full group-hover:w-full group-hover:bg-primary-500 transition-all duration-500"></div>
                                        <span className="text-primary-600 font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-4 whitespace-nowrap">Read More</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        // If no blogs, still show skeletons but with a "Coming Soon" styling or just empty?
                        // The user wants them to appear as in the screenshot but as skeletons.
                        [...Array(4)].map((_, i) => <BlogSkeleton key={i} />)
                    )}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-16 bg-white border-t border-gray-50 px-6 lg:px-16 text-center">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <img src="/icon.png" alt="ATC" className="w-8 h-8 rounded-lg" />
                        <span className="font-black text-xl text-primary-950 tracking-tighter">AllThingsCambridge</span>
                    </div>
                    <div className="flex gap-8 text-gray-400 font-bold text-sm">
                        <Link to="/about" className="hover:text-primary-600">About Us</Link>
                        <Link to="/contact" className="hover:text-primary-600">Contact</Link>
                        <Link to="/privacy" className="hover:text-primary-600">Privacy Policy</Link>
                    </div>
                    <p className="text-gray-400 text-sm font-bold">&copy; {new Date().getFullYear()} AllThingsCambridge.</p>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
