import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const AdminPayments = () => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('payments').select('*, profiles(full_name)').order('created_at', { ascending: false })
            .then(({ data }) => { setPayments(data ?? []); setLoading(false) })
    }, [])

    const total = payments.filter(p => p.status === 'success').reduce((s, p) => s + (p.amount ?? 0), 0)

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900">Payments</h1>
                <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl text-sm font-bold text-green-800">
                    Total Revenue: GHS {(total / 100).toFixed(2)}
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Reference</th>
                            <th>Plan</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">No payments yet.</td></tr>
                        ) : payments.map(p => (
                            <tr key={p.id}>
                                <td className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                <td className="font-medium text-gray-900">{p.profiles?.full_name ?? '—'}</td>
                                <td className="text-xs font-mono text-gray-400">{p.paystack_reference}</td>
                                <td className="capitalize text-gray-700">{p.plan}</td>
                                <td className="text-gray-900 font-semibold">GHS {(p.amount / 100).toFixed(2)}</td>
                                <td>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.status === 'success' ? 'bg-green-100 text-green-700' :
                                            p.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>{p.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminPayments
