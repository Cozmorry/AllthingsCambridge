import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const DataContext = createContext(null)

export const DataProvider = ({ children }) => {
    const [levels, setLevels] = useState(() => {
        const saved = localStorage.getItem('atc_levels')
        return saved ? JSON.parse(saved) : []
    })
    const [subjectsCache, setSubjectsCache] = useState({}) // { levelId: [subjects] }
    const [loading, setLoading] = useState(levels.length === 0)

    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const { data, error } = await supabase
                    .from('levels')
                    .select('*')
                    .order('name')
                
                if (error) throw error
                if (data) {
                    setLevels(data)
                    localStorage.setItem('atc_levels', JSON.stringify(data))
                }
            } catch (err) {
                console.error('Levels fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchLevels()
    }, [])

    const getLevelBySlug = (slug) => levels.find(l => l.slug === slug)

    const getSubjectsForLevel = async (levelId) => {
        if (subjectsCache[levelId]) return subjectsCache[levelId]
        
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('level_id', levelId)
            .order('name')
            
        if (data && !error) {
            setSubjectsCache(prev => ({ ...prev, [levelId]: data }))
            return data
        }
        return []
    }

    return (
        <DataContext.Provider value={{ levels, loading, getLevelBySlug, getSubjectsForLevel }}>
            {children}
        </DataContext.Provider>
    )
}

export const useData = () => {
    const context = useContext(DataContext)
    if (!context) throw new Error('useData must be used within a DataProvider')
    return context
}
