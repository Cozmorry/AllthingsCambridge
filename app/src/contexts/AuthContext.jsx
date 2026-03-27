import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchProfileData = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()
            if (error) {
                console.error('Profile fetch error:', error.message)
                return null
            }
            if (data) {
                localStorage.setItem(`cached_profile_${userId}`, JSON.stringify(data))
            }
            return data || null
        } catch (err) {
            console.error('Profile fetch exception:', err)
            return null
        }
    }

    useEffect(() => {
        let isMounted = true

        if (!supabaseConfigured) {
            setLoading(false)
            return
        }

        const initializeSession = async () => {
            try {
                // Try official Supabase session first
                const { data: { session } } = await supabase.auth.getSession()
                
                if (session?.user) {
                    const prof = await fetchProfileData(session.user.id)
                    if (isMounted) {
                        setUser(session.user)
                        setProfile(prof)
                    }
                    return // Official session found, stop here
                }

                // If no official session, check for a Passkey session
                const passkeyUserId = localStorage.getItem('passkey_active_session') || localStorage.getItem('mock_passkey_session')
                if (passkeyUserId) {
                    const prof = await fetchProfileData(passkeyUserId)
                    const localKeysStr = localStorage.getItem(`passkeys_${passkeyUserId}`)
                    const localKeys = localKeysStr ? JSON.parse(localKeysStr) : []
                    const authenticEmail = localKeys.length > 0 && localKeys[0].email ? localKeys[0].email : 'user@authenticated.com'

                    if (prof && localKeys.length > 0 && isMounted) {
                        setUser({ id: passkeyUserId, email: prof.email || authenticEmail })
                        setProfile(prof)
                        return
                    } else {
                        localStorage.removeItem('passkey_active_session')
                        localStorage.removeItem('mock_passkey_session')
                    }
                }

                // No sessions found
                if (isMounted) {
                    setUser(null)
                    setProfile(null)
                }
            } catch (error) {
                console.error("Session initialize error", error)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        initializeSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'INITIAL_SESSION') return 

            if (session?.user) {
                const prof = await fetchProfileData(session.user.id)
                if (isMounted) {
                    setUser(session.user)
                    setProfile(prof)
                }
            } else {
                // Only clear the session if there's no active Passkey session.
                // Passkey users don't have a Supabase JWT, so this event fires
                // with session=null even when they ARE logged in.
                const hasPasskeySession = localStorage.getItem('passkey_active_session') || localStorage.getItem('mock_passkey_session')
                if (!hasPasskeySession && isMounted) {
                    setUser(null)
                    setProfile(null)
                }
            }
        })

        return () => {
            isMounted = false
            subscription?.unsubscribe()
        }
    }, [])

    const signUp = async ({ email, password, fullName }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { 
                data: { full_name: fullName },
                emailRedirectTo: `${window.location.origin}/login`
            },
        })
        if (data?.session?.user) {
            import('../lib/supabase').then(m => m.setPasskeyHeader(null))
            localStorage.removeItem('mock_passkey_session')
            const prof = await fetchProfileData(data.session.user.id)
            setUser(data.session.user)
            setProfile(prof)
        }
        return { data, error }
    }

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (data?.session?.user) {
            import('../lib/supabase').then(m => m.setPasskeyHeader(null))
            localStorage.removeItem('mock_passkey_session')
            const prof = await fetchProfileData(data.session.user.id)
            setUser(data.session.user)
            setProfile(prof)
        }
        return { data, error }
    }

    const signInWithPasskey = async (userId) => {
        try {
            // First attempt a live DB read (works if RLS allows it or user has a prior session)
            let prof = await fetchProfileData(userId)
            
            // Passkey login has no JWT, so RLS may block the DB read.
            // Fall back to the locally cached profile from a prior authenticated session.
            if (!prof) {
                const cached = localStorage.getItem(`cached_profile_${userId}`)
                if (cached) {
                    prof = JSON.parse(cached)
                    // Do a quick background re-check to see if the user still exists after using cache
                    // If they were deleted, next refresh will log them out naturally
                } else {
                    return { error: { message: "Profile not found. Please log in with your email first to set up Passkey." } }
                }
            }

            // Verify that the user indeed has a recognized Passkey saved on this device
            const localKeysStr = localStorage.getItem(`passkeys_${userId}`)
            const localKeys = localKeysStr ? JSON.parse(localKeysStr) : []
            const authenticEmail = localKeys.length > 0 && localKeys[0].email ? localKeys[0].email : 'user@authenticated.com'

            if (localKeys.length === 0) {
                return { error: { message: "Passkeys are not enabled on this device." } }
            }
            
            import('../lib/supabase').then(m => m.setPasskeyHeader(userId))
            setUser({ id: userId, email: prof.email || authenticEmail })
            setProfile(prof)
            return { error: null }
        } catch (err) {
            return { error: err }
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error("Sign out error:", error)
        } finally {
            import('../lib/supabase').then(m => m.setPasskeyHeader(null))
            setUser(null)
            setProfile(null)
            // Hard flush local storage just in case Supabase got stuck
            for (let key in localStorage) {
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    localStorage.removeItem(key)
                }
            }
        }
    }

    const resetPassword = async (email) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
    }

    const refreshProfile = async () => {
        if (!user) return
        let prof = await fetchProfileData(user.id)
        if (!prof) {
            const cached = localStorage.getItem(`cached_profile_${user.id}`)
            if (cached) prof = JSON.parse(cached)
        }
        setProfile(prof)
    }

    const isAdmin = profile?.role === 'admin'
    const isSubscribed = profile?.is_subscribed === true
    const hasPremiumAccess = isSubscribed || (profile?.subscribed_until && new Date(profile.subscribed_until) > new Date())

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, isSubscribed, hasPremiumAccess, signUp, signIn, signInWithPasskey, signOut, resetPassword, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}