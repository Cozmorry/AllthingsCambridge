import { useAuth } from '../contexts/AuthContext'
import { Check, CheckCircle, Shield } from 'lucide-react'

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

const plans = [
    {
        id: 'monthly',
        label: 'Monthly',
        price: '$5',
        priceRaw: 65000, // 650 KES in cents (approx $5)
        period: '/month',
        features: ['Access all subjects', 'All flashcard decks', 'Past papers & notes', 'Topical questions', 'Community access'],
        popular: false,
    },
    {
        id: 'annual',
        label: 'Annual',
        price: '$48',
        priceRaw: 620000, // 6200 KES in cents (approx $48)
        period: '/year',
        save: 'Save $12',
        features: ['Everything in Monthly', 'Priority support', 'Download resources', 'Early access to new content', 'Study streak tracking'],
        popular: true,
    },
]

const PricingPage = () => {
    const { user, profile, isSubscribed } = useAuth()

    const initPaystack = (plan) => {
        if (!user) return window.location.href = '/signup'

        const handler = window.PaystackPop.setup({
            key: PAYSTACK_KEY,
            email: user.email,
            amount: plan.priceRaw,
            currency: 'KES', // Defaulting to KES since the account is Kenyan
            ref: `ATC-${Date.now()}-${user.id.slice(0, 8)}`,
            metadata: { user_id: user.id, plan: plan.id },
            callback: (response) => {
                window.location.href = `/payment/callback?reference=${response.reference}`
            },
            onClose: () => { },
        })
        handler.openIframe()
    }

    return (
        <>
            {/* Load Paystack inline JS */}
            <script async src="https://js.paystack.co/v1/inline.js" />

            <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">Unlock full access to all study materials with one affordable subscription.</p>
                </div>

                {isSubscribed && (
                    <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl text-center text-green-800 font-semibold flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> You have an active subscription — enjoy full access!
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`relative bg-white rounded-3xl border-2 p-8 flex flex-col ${plan.popular ? 'border-primary-500 shadow-xl shadow-primary-600/10' : 'border-gray-100'}`}>
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                                    Most Popular
                                </div>
                            )}
                            {plan.save && (
                                <div className="inline-flex self-start mb-3 px-2.5 py-0.5 bg-secondary-100 text-secondary-700 text-xs font-bold rounded-full">{plan.save}</div>
                            )}
                            <h2 className="text-xl font-extrabold text-gray-900 mb-1">{plan.label}</h2>
                            <div className="flex items-end gap-1 mb-6">
                                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                                        <Check size={16} className="text-primary-600 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => initPaystack(plan)}
                                disabled={isSubscribed}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${plan.popular
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/25'
                                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSubscribed ? 'Already Subscribed' : `Get ${plan.label}`}
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
