import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Check, Star, FileText, Layers, MessageCircle, Lightbulb } from 'lucide-react'

const features = [
    {
        title: 'Past Papers & Notes',
        desc: 'Explore exam papers and detailed notes',
        icon: FileText,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
    },
    {
        title: 'Flashcards & Quizzes',
        desc: 'Boost your memory with interactive tools',
        icon: Layers,
        color: 'text-orange-500',
        bg: 'bg-orange-50'
    },
    {
        title: 'Community Forum',
        desc: 'Connect with students & educators',
        icon: MessageCircle,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
    },
    {
        title: 'Exam Tips & Blogs',
        desc: 'Get expert advice and study tips',
        icon: Lightbulb,
        color: 'text-yellow-500',
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
        img: "https://placehold.co/100x100/e2e8f0/475569?text=SK"
    },
    {
        quote: "This site has Cambridge I need to excel in my exams.",
        name: "James L.",
        img: "https://placehold.co/100x100/e2e8f0/475569?text=JL"
    },
    {
        quote: "The forums are amazing for getting study help.",
        name: "Anita M.",
        img: "https://placehold.co/100x100/e2e8f0/475569?text=AM"
    }
]

const plans = [
    {
        name: 'Free',
        price: 'BASIC ACCESS',
        features: ['Basic Access', 'Past Papers & Forums'],
        button: 'Get Started',
        color: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-200',
        btnBg: 'bg-[#1a56db]',
        headerBg: 'bg-white text-gray-900',
        priceColor: 'text-gray-500 text-sm font-semibold'
    },
    {
        name: 'Standard',
        price: '$9.99 / month',
        features: ['Full Access to Notes', 'Flashcards & Quizzes', 'Progress Tracking'],
        button: 'Set Sccrribe', // Keeping original typo for accuracy, or "Subscribe"
        color: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-200',
        btnBg: 'bg-[#3b82f6]',
        headerBg: 'bg-[#3b82f6] text-white',
        priceColor: 'text-blue-100 text-sm'
    },
    {
        name: 'Premium',
        price: '$19.99 / month',
        features: ['All Access Features', 'Exclusive Webinars', 'Priority Support'],
        button: 'Get Sscribe', // Keeping typo or "Subscribe"
        color: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-200',
        btnBg: 'bg-[#1e40af]',
        headerBg: 'bg-[#1e40af] text-white',
        priceColor: 'text-blue-200 text-sm'
    }
]

const blogs = [
    {
        title: 'Top 10 Study Hacks for',
        img: 'https://placehold.co/400x250/e2e8f0/475569?text=Blog+1'
    },
    {
        title: 'How to Omar Exam Stress', // Typo from image
        img: 'https://placehold.co/400x250/e2e8f0/475569?text=Blog+2'
    },
    {
        title: 'A Go to Acing Your Stress', // Typo from image
        img: 'https://placehold.co/400x250/e2e8f0/475569?text=Blog+3'
    },
    {
        title: 'A aid to Your IGSiSes', // Typo from image
        img: 'https://placehold.co/400x250/e2e8f0/475569?text=Blog+4'
    }
]

const HomePage = () => {
    const { user, isSubscribed } = useAuth()

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans">
            {/* ── Navbar ── */}
            {/* The MainLayout handles the sidebar/header, but the image shows a full top navbar.
                Assuming the image is a standalone landing page design.
                We will integrate the hero section seamlessly. */}

            {/* ── Hero ── */}
            <section className="bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#3b82f6] pt-12 pb-20 px-6 lg:px-16 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between z-10 relative">
                    <div className="md:w-1/2 mb-12 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                            Master Cambridge Exams<br />with Confidence
                        </h1>
                        <p className="text-blue-100 text-lg mb-8 max-w-md">
                            Access past papers, notes, flashcards, and community support—all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {user ? (
                                <Link to="/account" className="bg-[#fbbf24] hover:bg-[#f59e0b] text-gray-900 font-semibold px-6 py-3 rounded-md transition-colors text-center">
                                    Browse Subjects
                                </Link>
                            ) : (
                                <Link to="/signup" className="bg-[#fbbf24] hover:bg-[#f59e0b] text-gray-900 font-semibold px-6 py-3 rounded-md transition-colors text-center">
                                    Start Learning Free
                                </Link>
                            )}
                            {isSubscribed ? (
                                <Link to="/account" className="border border-blue-300 hover:bg-blue-700/50 text-white font-semibold px-6 py-3 rounded-md transition-colors text-center">
                                    My Account
                                </Link>
                            ) : (
                                <Link to="/pricing" className="border border-blue-300 hover:bg-blue-700/50 text-white font-semibold px-6 py-3 rounded-md transition-colors text-center">
                                    View Pricing Plans
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-end">
                        <img
                            src="https://placehold.co/600x400/1e40af/ffffff?text=Students+Illustration"
                            alt="Students studying"
                            className="w-full max-w-lg rounded-xl shadow-2xl"
                        />
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-10 right-1/4 w-12 h-12 bg-green-400 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
            </section>

            {/* ── Our Features ── */}
            <section className="py-16 px-6 lg:px-16 max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-[#1e3a8a] mb-10">Our Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start text-left hover:shadow-md transition-shadow">
                            <div className={`p-3 rounded-lg ${feat.bg} ${feat.color} mb-4 flex items-center gap-3`}>
                                <feat.icon size={24} />
                                <h3 className="font-semibold text-gray-800">{feat.title}</h3>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Why Choose Us? ── */}
            <section className="py-16 px-6 lg:px-16 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-[#1e3a8a] mb-10 text-center">Why Choose Us?</h2>
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <img
                            src="https://placehold.co/600x400/e2e8f0/475569?text=Students+Group"
                            alt="Students Group"
                            className="w-full rounded-xl shadow-lg"
                        />
                    </div>
                    <div className="md:w-1/2 space-y-4">
                        {reasons.map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-3 border-b border-gray-200 pb-4">
                                <div className="text-teal-500">
                                    <Check size={24} strokeWidth={3} />
                                </div>
                                <span className="text-lg text-gray-700 font-medium">{reason}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Success Stories ── */}
            <section className="py-16 px-6 lg:px-16 max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-[#1e3a8a] mb-10">Success Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((test, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 text-left">
                            <img src={test.img} alt={test.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                            <div>
                                <p className="text-gray-700 text-sm mb-2">{test.quote}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                    <span className="text-gray-500 text-xs font-medium">-{test.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Choose Your Plan ── */}
            <section className="py-16 px-6 lg:px-16 max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-[#1e3a8a] mb-10">Choose Your Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">
                    {plans.map((plan, idx) => (
                        <div key={idx} className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col h-full ${idx === 1 ? 'md:-translate-y-4' : ''}`}>
                            <div className={`${plan.headerBg} py-6`}>
                                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                                <div className={plan.priceColor}>{plan.price}</div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                {idx === 0 && <div className="w-full h-px bg-gray-200 mb-6 relative"><span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-2 text-xs text-gray-500 font-bold">BASIC ACCESS</span></div>}
                                <ul className="space-y-4 text-left mb-8 flex-1">
                                    {plan.features.map((feat, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 text-sm text-gray-700">
                                            <Check size={16} className={idx === 0 ? "text-blue-600" : "text-teal-500"} />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <Link to={idx === 0 ? "/signup" : "/pricing"} className={`w-full py-3 rounded-md text-white font-semibold transition-colors ${plan.btnBg} hover:opacity-90 text-center inline-block`}>
                                    {plan.button}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Latest from Our Blog ── */}
            <section className="py-16 px-6 lg:px-16 max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-[#1e3a8a] mb-10">Latest from Our Blog</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {blogs.map((blog, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left hover:shadow-md transition-shadow">
                            <img src={blog.img} alt={blog.title} className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{blog.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default HomePage
