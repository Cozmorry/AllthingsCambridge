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
        <div className="p-4 sm:p-8 max-w-7xl mx-auto dark:bg-[#0c1220] min-h-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payments</h1>
                <div className="bg-green-50 border border-green-200 px-5 py-2.5 rounded-xl text-sm font-bold text-green-800 shadow-sm flex items-center gap-2">
                    Total Revenue: GHS {(total / 100).toFixed(2)}
                </div>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full admin-table min-w-[700px]">
                        <thead>
                            <tr>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 pl-6 text-left">Date</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-left">User</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-left">Reference</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-left">Plan</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-right">Amount</th>
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 pr-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No payments yet.</td></tr>
                            ) : payments.map(p => (
                                <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                    <td className="text-sm font-medium text-gray-500 py-4 pl-6">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="font-bold text-gray-900 py-4">{p.profiles?.full_name ?? '—'}</td>
                                    <td className="text-xs font-mono text-gray-400 py-4">{p.paystack_reference}</td>
                                    <td className="capitalize text-gray-700 py-4 font-bold">{p.plan}</td>
                                    <td className="text-gray-900 font-black py-4 text-right">GHS {(p.amount / 100).toFixed(2)}</td>
                                    <td className="py-4 pr-6 text-right">
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${p.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                                                p.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>{p.status}</span>
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

export default AdminPayments
