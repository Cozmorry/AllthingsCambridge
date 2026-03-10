import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Crown, LogOut, User } from 'lucide-react'

const AccountPage = () => {
    const { user, profile, signOut, isSubscribed } = useAuth()
    const [payments, setPayments] = useState([])

    useEffect(() => {
        if (!user) return
        supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            .then(({ data }) => setPayments(data ?? []))
    }, [user])

    return (
        <div className="max-w-3xl mx-auto px-6 py-14">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Account</h1>

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl">
                    {profile?.full_name?.[0]?.toUpperCase() ?? <User size={24} />}
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-900">{profile?.full_name ?? 'Student'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {isSubscribed ? (
                        <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 bg-secondary-100 text-secondary-800 text-xs font-semibold rounded-full">
                            <Crown size={11} /> Premium Subscriber
                        </span>
                    ) : (
                        <Link to="/pricing" className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full hover:bg-primary-50 hover:text-primary-700 transition-colors">
                            Upgrade to Premium →
                        </Link>
                    )}
                </div>
            </div>

            {/* Subscription status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h2 className="font-bold text-gray-900 mb-3">Subscription</h2>
                {isSubscribed ? (
                    <div>
                        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                            ✅ Active — expires {profile?.subscribed_until ? new Date(profile.subscribed_until).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-500 mb-4">You are on the free plan. Upgrade to access all content.</p>
                        <Link to="/pricing" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors inline-block">
                            Upgrade to Premium
                        </Link>
                    </div>
                )}
            </div>

            {/* Payment history */}
            {payments.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                    <h2 className="font-bold text-gray-900 mb-4">Payment History</h2>
                    <table className="w-full text-sm">
                        <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
                            <th className="pb-2 text-left">Date</th>
                            <th className="pb-2 text-left">Plan</th>
                            <th className="pb-2 text-left">Amount</th>
                            <th className="pb-2 text-left">Status</th>
                        </tr></thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                                    <td className="py-3 text-gray-700">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="py-3 text-gray-700 capitalize">{p.plan}</td>
                                    <td className="py-3 text-gray-700">GHS {(p.amount / 100).toFixed(2)}</td>
                                    <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <button onClick={signOut} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                <LogOut size={16} /> Sign Out
            </button>
        </div>
    )
}

export default AccountPage
