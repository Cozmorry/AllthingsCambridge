import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const AdminUsers = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
            .then(({ data }) => { setUsers(data ?? []); setLoading(false) })
    }, [])

    const setRole = async (id, role) => {
        await supabase.from('profiles').update({ role }).eq('id', id)
        setUsers(u => u.map(x => x.id === id ? { ...x, role } : x))
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto dark:bg-[#0c1220] min-h-full">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Users</h1>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full admin-table min-w-[700px]">
                        <thead>
                            <tr>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 pl-6 text-left">Name</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-left">Email hint</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-left">Role</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-left">Subscribed</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-left">Joined</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="font-bold text-gray-900 py-4 pl-6">{u.full_name ?? '—'}</td>
                                    <td className="text-gray-500 text-xs font-mono py-4">{u.id.slice(0, 8)}…</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {u.role ?? 'student'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${u.is_subscribed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {u.is_subscribed ? 'Premium' : 'Free'}
                                        </span>
                                    </td>
                                    <td className="text-sm font-medium text-gray-500 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="py-4 pr-6 text-right">
                                        {u.role !== 'admin' ? (
                                            <button onClick={() => setRole(u.id, 'admin')} className="text-xs text-purple-600 hover:text-purple-700 font-bold transition-colors">Make Admin</button>
                                        ) : (
                                            <button onClick={() => setRole(u.id, 'student')} className="text-xs text-gray-400 hover:text-red-600 font-bold transition-colors">Remove Admin</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AdminUsers
