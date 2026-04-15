import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

const FREE_VIEW_LIMIT = 5
const STORAGE_KEY = 'atc_resource_views'

/**
 * Metered paywall hook.
 * Tracks resource views in localStorage (works for both anonymous & logged-in users).
 * Subscribed users always have full access.
 */
export const usePaywall = () => {
    const { user, hasPremiumAccess } = useAuth()

    const getViews = () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        } catch {
            return []
        }
    }

    const [viewedIds, setViewedIds] = useState(getViews)

    const viewCount = viewedIds.length
    const viewsRemaining = Math.max(0, FREE_VIEW_LIMIT - viewCount)
    const isLocked = !hasPremiumAccess && viewCount >= FREE_VIEW_LIMIT

    const recordView = useCallback((resourceId) => {
        if (hasPremiumAccess) return // subscribers don't get metered
        const current = getViews()
        const id = String(resourceId)
        if (current.includes(id)) return // already counted
        const updated = [...current, id]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        setViewedIds(updated)
    }, [hasPremiumAccess])

    const hasViewed = useCallback((resourceId) => {
        return viewedIds.includes(String(resourceId))
    }, [viewedIds])

    return {
        isLocked,
        viewCount,
        viewsRemaining,
        freeLimit: FREE_VIEW_LIMIT,
        recordView,
        hasViewed,
        isSubscribed: hasPremiumAccess,
        isLoggedIn: !!user,
    }
}
