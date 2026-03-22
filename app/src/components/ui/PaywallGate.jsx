import { Link, useLocation } from 'react-router-dom'
import { Lock, Sparkles } from 'lucide-react'
import { usePaywall } from '../../hooks/usePaywall'

const PaywallGate = ({ children }) => {
    const { isLocked, viewsRemaining, isLoggedIn, isSubscribed } = usePaywall()
    const location = useLocation()

    // If fully subscribed, render content normally
    if (isSubscribed) return <>{children}</>

    // Not locked yet — show content, with a tiny toast if they're low on views
    if (!isLocked) {
        return (
            <div className="relative">
                {children}

                {/* Show toast when running low on free views */}
                {viewsRemaining > 0 && viewsRemaining <= 2 && (
                    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
                        <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl shadow-gray-900/20 flex items-center gap-3">
                            <Sparkles size={18} className="text-secondary-400" />
                            <div className="text-sm">
                                <p className="font-bold">You're on a roll!</p>
                                <p className="text-gray-300">You have {viewsRemaining} free resource {viewsRemaining === 1 ? 'view' : 'views'} left.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Locked! Show blurred content + paywall CTA
    return (
        <div className="relative overflow-hidden rounded-2xl">
            {/* Blurred Content Behind */}
            <div className="blur-md opacity-40 select-none pointer-events-none" aria-hidden="true">
                {children}
            </div>

            {/* Paywall Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-white/40 backdrop-blur-sm">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border border-gray-100">
                    <div className="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-600 flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-3">You've hit your free limit</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        You've used all 5 of your free resource views. Join AllThingsCambridge to unlock unlimited access to all subjects, past papers, notes, and flashcards.
                    </p>

                    <div className="space-y-3">
                        <Link 
                            to={isLoggedIn ? "/pricing" : "/signup"} 
                            state={{ from: location.pathname + location.search }}
                            className="flex items-center justify-center w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-primary-600/20"
                        >
                            {isLoggedIn ? 'Subscribe for $5/month' : 'Sign Up to Unlock'}
                        </Link>
                        
                        {!isLoggedIn && (
                            <p className="text-sm text-gray-500">
                                Already have an account? <Link to="/login" state={{ from: location.pathname + location.search }} className="text-primary-600 font-semibold hover:underline">Log in</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaywallGate
