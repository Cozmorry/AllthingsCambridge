import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Check, CheckCircle, Shield } from 'lucide-react'

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

const plans = [
    {
        id: 'free',
        label: 'Free',
        price: 'Basic Access',
        priceRaw: 0,
        period: '',
        features: ['5 Free Resource Views', 'Access to Free Notes', 'Community Forums', 'Basic Flashcards'],
        popular: false,
    },
    {
        id: 'monthly',
        label: 'Standard',
        price: '$9.99',
        priceRaw: 130000, 
        period: '/month',
        paystackPlanCode: 'PLN_ied29jmbg2ga4ov',
        features: ['Full Access to Notes', 'All Past Papers', 'Flashcards & Quizzes', 'Progress Tracking'],
        popular: true,
    },
    {
        id: 'annual',
        label: 'Premium',
        price: '$99.99',
        priceRaw: 1300000, 
        period: '/year',
        paystackPlanCode: 'PLN_ofb9qld32da9sh5',
        save: 'Save $20/yr',
        features: ['Everything in Standard', 'Priority Support', 'Exclusive Webinars', 'Download Materials'],
        popular: false,
    },
]

const PricingPage = () => {
    const { user, profile, isSubscribed } = useAuth()
    const navigate = useNavigate()
    
    // Check if user has an active-but-cancelled subscription (grace period)
    const isGracePeriod = !isSubscribed && profile?.subscribed_until && new Date(profile.subscribed_until) > new Date()

    const initPaystack = (plan) => {
        if (!user) return window.location.href = '/signup'

        const handler = window.PaystackPop.setup({
            key: PAYSTACK_KEY,
            email: user.email,
            amount: plan.priceRaw,
            currency: 'KES', // Defaulting to KES since the account is Kenyan
            plan: plan.paystackPlanCode, // This enforces the auto-recurring billing cycle on Paystack
            ref: `ATC-${Date.now()}-${user.id.slice(0, 8)}`,
            metadata: { user_id: user.id, plan: plan.id },
            callback: (response) => {
                window.location.href = `/payment/callback?reference=${response.reference}&plan=${plan.id}`
            },
            onClose: () => { },
        })
        handler.openIframe()
    }

    return (
        <>
            {/* Load Paystack inline JS */}
            <script async src="https://js.paystack.co/v1/inline.js" />

            <div className="max-w-5xl mx-auto px-6 lg:px-16 py-20 animate-fade-up">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-primary-950 mb-6 tracking-tighter uppercase">Transparent Pricing</h1>
                    <p className="text-gray-500 text-xl max-w-xl mx-auto font-medium">Unlock full access to all high-quality study materials with one affordable subscription.</p>
                </div>

                {isSubscribed && (
                    <div className="mb-12 p-6 bg-green-50 border-2 border-green-100 rounded-[32px] text-center text-green-800 font-black flex items-center justify-center gap-3 shadow-sm uppercase tracking-widest text-sm">
                        <CheckCircle size={24} /> You have an active subscription — enjoy full access!
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`relative bg-white rounded-[32px] border-2 p-8 lg:p-10 flex flex-col transition-all hover:scale-[1.02] ${plan.popular ? 'border-primary-600 shadow-2xl shadow-primary-600/20' : 'border-gray-100 shadow-xl shadow-gray-200/50'}`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary-600 text-white text-xs font-black rounded-xl shadow-lg uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-8 text-center">
                                <h2 className="text-xl font-black text-gray-900 mb-1.5 uppercase tracking-wide">{plan.label}</h2>
                                {plan.save && (
                                    <div className="inline-flex px-3 py-1 bg-secondary-100 text-secondary-800 text-[10px] font-black rounded-lg uppercase tracking-widest border border-secondary-200">{plan.save}</div>
                                )}
                            </div>
                            
                            <div className="flex items-baseline justify-center gap-1.5 mb-8">
                                <span className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">{plan.price}</span>
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-sm font-bold text-gray-700 leading-snug">
                                        <div className="bg-primary-50 p-1.5 rounded-lg text-primary-600 shadow-sm shrink-0">
                                            <Check size={16} strokeWidth={4} />
                                        </div>
                                        <span className="capitalize">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => plan.priceRaw === 0 ? (!user ? window.location.href = '/signup' : window.location.href = '/account') : initPaystack(plan)}
                                disabled={(isSubscribed && plan.priceRaw > 0) || (isGracePeriod && plan.priceRaw > 0) || (user && plan.priceRaw === 0 && !isSubscribed)}
                                className={`w-full py-4 rounded-2xl font-black text-base lg:text-lg transition-all shadow-xl ${plan.popular
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30'
                                        : plan.priceRaw === 0 ? 'bg-white border-2 border-gray-100 text-gray-900 hover:bg-gray-50 shadow-none' : 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-900/30'
                                    } disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider`}
                            >
                                { (isSubscribed || isGracePeriod) && plan.priceRaw > 0 
                                    ? (isGracePeriod ? `Active until ${new Date(profile.subscribed_until).toLocaleDateString()}` : 'Active')
                                    : plan.priceRaw === 0 
                                        ? (user ? (isSubscribed ? 'Included' : 'Current Plan') : 'Join Free') 
                                        : `Get ${plan.label}`}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-400">
                    <Shield size={14} />
                    Payments are processed securely by Paystack. Cancel anytime.
                </div>
            </div>
        </>
    )
}

export default PricingPage
