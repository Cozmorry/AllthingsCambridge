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
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    const prof = await fetchProfileData(session.user.id)
                    if (isMounted) {
                        setUser(session.user)
                        setProfile(prof)
                    }
                } else {
                    if (isMounted) {
                        setUser(null)
                        setProfile(null)
                    }
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
                if (isMounted) {
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
            options: { data: { full_name: fullName } },
        })
        if (data?.session?.user) {
            const prof = await fetchProfileData(data.session.user.id)
            setUser(data.session.user)
            setProfile(prof)
        }
        return { data, error }
    }

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (data?.session?.user) {
            const prof = await fetchProfileData(data.session.user.id)
            setUser(data.session.user)
            setProfile(prof)
        }
        return { data, error }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error("Sign out error:", error)
        } finally {
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
        const prof = await fetchProfileData(user.id)
        setProfile(prof)
    }

    const isAdmin = profile?.role === 'admin'
    const isSubscribed = profile?.is_subscribed === true

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, isSubscribed, signUp, signIn, signOut, resetPassword, refreshProfile }}>
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
