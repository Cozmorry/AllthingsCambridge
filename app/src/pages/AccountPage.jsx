import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Crown, LogOut, User, Camera, CheckCircle } from 'lucide-react'

const AccountPage = () => {
    const { user, profile, signOut, isSubscribed, refreshProfile } = useAuth()
    const [payments, setPayments] = useState([])
    const [uploading, setUploading] = useState(false)
    const [saved, setSaved] = useState(false)
    const fileRef = useRef(null)

    useEffect(() => {
        if (!user) return
        supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            .then(({ data }) => setPayments(data ?? []))
    }, [user])

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setUploading(true)
        setSaved(false)

        const ext = file.name.split('.').pop()
        const path = `avatars/${user.id}.${ext}`

        // Upload to Supabase storage (overwrite existing)
        const { error: uploadError } = await supabase.storage
            .from('content')
            .upload(path, file, { upsert: true })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            setUploading(false)
            return
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('content').getPublicUrl(path)
        const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}` // cache bust

        // Update profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', user.id)

        if (updateError) {
            console.error('Profile update error:', updateError)
        } else {
            await refreshProfile()
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }

        setUploading(false)
    }

    const avatarUrl = profile?.avatar_url
    const initial = profile?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase()

    return (
        <div className="max-w-3xl mx-auto px-6 py-14">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Account</h1>

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-5">
                    {/* Avatar with upload */}
                    <div className="relative group">
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                            className="relative w-20 h-20 rounded-2xl overflow-hidden bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl shrink-0 group cursor-pointer border-2 border-transparent hover:border-primary-300 transition-all"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{initial ?? <User size={28} />}</span>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                {uploading ? (
                                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Camera size={20} className="text-white" />
                                )}
                            </div>
                        </button>
                        {saved && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                <CheckCircle size={14} className="text-white" />
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-lg font-bold text-gray-900">{profile?.full_name ?? 'Student'}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Click photo to change</p>
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
            </div>

            {/* Subscription status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h2 className="font-bold text-gray-900 mb-3">Subscription</h2>
                {isSubscribed ? (
                    <div>
                        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                            <CheckCircle size={16} /> Active — expires {profile?.subscribed_until ? new Date(profile.subscribed_until).toLocaleDateString() : 'N/A'}
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
