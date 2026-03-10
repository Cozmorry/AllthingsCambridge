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
        <div className="p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Users</h1>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email hint</th>
                            <th>Role</th>
                            <th>Subscribed</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id}>
                                <td className="font-medium text-gray-900">{u.full_name ?? '—'}</td>
                                <td className="text-gray-500 text-xs font-mono">{u.id.slice(0, 8)}…</td>
                                <td>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {u.role ?? 'student'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.is_subscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {u.is_subscribed ? 'Premium' : 'Free'}
                                    </span>
                                </td>
                                <td className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    {u.role !== 'admin' ? (
                                        <button onClick={() => setRole(u.id, 'admin')} className="text-xs text-purple-600 hover:underline font-medium">Make Admin</button>
                                    ) : (
                                        <button onClick={() => setRole(u.id, 'student')} className="text-xs text-gray-400 hover:underline">Remove Admin</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminUsers
