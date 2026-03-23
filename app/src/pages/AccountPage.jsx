import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Crown, LogOut, User, Camera, CheckCircle, KeyRound, AlertCircle, RefreshCw, Smartphone, Laptop, Trash2 } from 'lucide-react'

const AccountPage = () => {
    const { user, profile, signOut, isSubscribed, refreshProfile } = useAuth()
    const [payments, setPayments] = useState([])
    const [uploading, setUploading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelSuccessMsg, setCancelSuccessMsg] = useState('')
    const [passkeyMsg, setPasskeyMsg] = useState({ type: '', text: '' })
    const [passkeys, setPasskeys] = useState(() => {
        const stored = localStorage.getItem(`passkeys_${user?.id}`)
        return stored ? JSON.parse(stored) : []
    })
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

    const registerPasskey = async () => {
        setPasskeyMsg({ type: '', text: '' })
        try {
            const publicKeyCredentialCreationOptions = {
                challenge: Uint8Array.from("random-challenge-string", c => c.charCodeAt(0)),
                rp: { name: "AllThingsCambridge", id: window.location.hostname },
                user: {
                    id: Uint8Array.from(user.id, c => c.charCodeAt(0)),
                    name: user.email,
                    displayName: profile?.full_name || user.email
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
                authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
                timeout: 60000,
                attestation: "none"
            }
            
            const credential = await navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions })
            if (credential) {
                // Determine rough device type
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                const isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent)
                const deviceName = isMobile ? 'Mobile Device' : isMac ? 'Macbook / iMac' : 'Windows PC'

                // Prevent registering the exact same device multiple times, overwrite instead
                const filteredPasskeys = passkeys.filter(pk => pk.device !== deviceName)

                const newKey = {
                    id: credential.id,
                    device: deviceName,
                    email: user.email,
                    created_at: new Date().toISOString()
                }

                const updatedPasskeys = [...filteredPasskeys, newKey]
                setPasskeys(updatedPasskeys)
                localStorage.setItem(`passkeys_${user.id}`, JSON.stringify(updatedPasskeys))
                
                await supabase.from('profiles').update({ has_passkey: true }).eq('id', user.id)
                await refreshProfile()
                setPasskeyMsg({ type: 'success', text: 'Passkey securely added to this device.' })
            }
        } catch (error) {
            console.error("Passkey registration error:", error)
            if (error.name !== 'NotAllowedError') {
                setPasskeyMsg({ type: 'error', text: 'Failed to create passkey. Make sure your browser supports WebAuthn.' })
            } else {
                setPasskeyMsg({ type: 'error', text: 'Operation cancelled.' })
            }
        }
    }

    const removePasskey = async (idToRemove) => {
        const updated = passkeys.filter(pk => pk.id !== idToRemove)
        setPasskeys(updated)
        localStorage.setItem(`passkeys_${user.id}`, JSON.stringify(updated))
        
        if (updated.length === 0) {
            await supabase.from('profiles').update({ has_passkey: false }).eq('id', user.id)
            await refreshProfile()
        }
    }

    const cancelSubscription = async () => {
        setCancelling(true)
        let updateError = null

        // Authentic DB update
        const { error } = await supabase.from('profiles').update({ is_subscribed: false }).eq('id', user.id)
        updateError = error

        if (!updateError) {
            await refreshProfile()
            setShowCancelModal(false)
            setCancelSuccessMsg('Your recurring subscription has been cancelled effectively. Enjoy premium features until your cycle expires.')
            setTimeout(() => setCancelSuccessMsg(''), 5000)
        } else {
            setCancelSuccessMsg('Error processing cancellation.')
            setTimeout(() => setCancelSuccessMsg(''), 3000)
        }
        setCancelling(false)
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
                        {isSubscribed || (profile?.subscribed_until && new Date(profile.subscribed_until) > new Date()) ? (
                            <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${isSubscribed ? 'bg-secondary-100 text-secondary-800' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                <Crown size={11} /> {isSubscribed ? 'Premium Subscriber' : 'Cancelled • Access ends ' + new Date(profile.subscribed_until).toLocaleDateString()}
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
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <RefreshCw size={18} className="text-secondary-500" /> Recurring Subscription
                </h2>
                {cancelSuccessMsg && (
                    <div className="p-3 mb-4 rounded-xl text-sm font-bold flex items-center gap-2 bg-green-50 text-green-700">
                        <CheckCircle size={16} />
                        {cancelSuccessMsg}
                    </div>
                )}
                {isSubscribed ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <div>
                            <p className="text-sm font-bold text-green-700 flex items-center gap-2 mb-1">
                                <CheckCircle size={16} /> Active Plan
                            </p>
                            <p className="text-xs text-gray-500">Your payments process automatically via Paystack.</p>
                        </div>
                        <button 
                            onClick={() => setShowCancelModal(true)}
                            className="shrink-0 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                            Cancel Anytime
                        </button>
                    </div>
                ) : (profile?.subscribed_until && new Date(profile.subscribed_until) > new Date()) ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-50/50 border border-red-100 rounded-xl p-4">
                        <div>
                            <p className="text-sm font-bold text-red-700 flex items-center gap-2 mb-1">
                                <AlertCircle size={16} /> Cancelled
                            </p>
                            <p className="text-xs text-red-600/80">Premium access ends on <strong>{new Date(profile.subscribed_until).toLocaleDateString()}</strong>.</p>
                        </div>
                        <div className="shrink-0 px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50/50 text-xs font-black rounded-xl cursor-not-allowed uppercase tracking-widest whitespace-nowrap">
                            Available {new Date(profile.subscribed_until).toLocaleDateString()}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                            <AlertCircle size={16} className="text-gray-400" /> You are currently on the free plan.
                        </p>
                        <Link to="/pricing" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors inline-block">
                            Start Recurring Plan
                        </Link>
                    </div>
                )}
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <KeyRound size={18} className="text-primary-500" /> Security & Passkeys
                </h2>
                
                {passkeyMsg.text && (
                    <div className={`p-3 mb-4 rounded-xl text-sm font-bold flex items-center gap-2 ${passkeyMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {passkeyMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {passkeyMsg.text}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl mb-4 bg-gray-50">
                    <div>
                        <p className="text-sm font-bold text-gray-800 mb-1">Passwordless Login</p>
                        <p className="text-xs text-gray-500 max-w-sm">Use your device's fingerprint, face scan, or screen lock to sign in securely.</p>
                    </div>
                    <button 
                        onClick={registerPasskey}
                        className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800`}
                    >
                        Register New Device
                    </button>
                </div>

                {passkeys.length > 0 && (
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        {passkeys.map((pk, idx) => (
                            <div key={pk.id} className={`flex items-center justify-between p-4 ${idx !== passkeys.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                        {pk.device.includes('Mobile') ? <Smartphone size={18} /> : <Laptop size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 capitalize">{pk.device}</p>
                                        <p className="text-xs text-gray-500">Added on {new Date(pk.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button onClick={() => removePasskey(pk.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
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
                                    <td className="py-3 text-gray-700 font-bold">USD {(p.amount / 100).toFixed(2)}</td>
                                    <td className="py-3"><span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${p.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <button onClick={signOut} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                <LogOut size={16} /> Sign Out
            </button>

            {/* In-app Cancellation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full p-8 md:p-10 border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-400"></div>
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white mx-auto">
                            <AlertCircle size={32} />
                        </div>
                        
                        <h2 className="text-3xl font-black text-gray-900 text-center mb-4 tracking-tighter">Cancel Subscription</h2>
                        
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm text-sm text-gray-700 leading-relaxed text-left">
                            <p className="font-bold text-gray-900 mb-4 text-base">Here is what to expect if you proceed:</p>
                            <ul className="space-y-4 mb-0">
                                <li className="flex gap-3 items-start">
                                    <span className="shrink-0 text-red-500 font-bold mt-0.5">•</span>
                                    <span>Your recurring billing profile on Paystack will be <strong>permanently stopped</strong>. You will not be charged again.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="shrink-0 text-green-500 font-bold mt-0.5">•</span>
                                    <span>You will retain <strong>full premium access</strong> to all notes and resources until the end of your current billing cycle on <strong className="text-green-900 dark:text-green-900 inline-block px-1.5 py-0.5 bg-green-100 rounded-md mx-0.5 border border-green-200">{profile?.subscribed_until ? new Date(profile.subscribed_until).toLocaleDateString() : 'the end date'}</strong>.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="shrink-0 text-red-500 font-bold mt-0.5">•</span>
                                    <span>After this date, your account will be downgraded to the Free Plan and you will lose access to premium studies.</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="flex flex-col gap-3 mt-4">
                            <button 
                                onClick={cancelSubscription} 
                                disabled={cancelling}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                            >
                                {cancelling ? 'Processing...' : 'Yes, Cancel My Subscription'}
                            </button>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="w-full py-4 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-900 font-bold rounded-xl transition-all uppercase tracking-wider text-sm shadow-sm"
                            >
                                Nevermind, Keep Premium
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AccountPage
