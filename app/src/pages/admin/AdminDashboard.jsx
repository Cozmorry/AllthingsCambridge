import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, BookOpen, CreditCard, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, subjects: 0, payments: 0, levels: 0 })

    useEffect(() => {
        const load = async () => {
            const [users, subjects, payments, levels] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('subjects').select('id', { count: 'exact', head: true }),
                supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'success'),
                supabase.from('levels').select('id', { count: 'exact', head: true }),
            ])
            setStats({
                users: users.count ?? 0,
                subjects: subjects.count ?? 0,
                payments: payments.count ?? 0,
                levels: levels.count ?? 0,
            })
        }
        load()
    }, [])

    const cards = [
        { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-500', to: '/admin/users' },
        { label: 'Subjects', value: stats.subjects, icon: BookOpen, color: 'bg-primary-600', to: '/admin/subjects' },
        { label: 'Successful Payments', value: stats.payments, icon: CreditCard, color: 'bg-green-600', to: '/admin/payments' },
        { label: 'Levels', value: stats.levels, icon: Layers, color: 'bg-purple-600', to: '/admin/levels' },
    ]

    return (
        <div className="p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Dashboard</h1>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {cards.map(({ label, value, icon: Icon, color, to }) => (
                    <Link key={label} to={to} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md hover:border-gray-200 transition-all">
                        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white`}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                            <p className="text-sm text-gray-500">{label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Quick Links</h2>
                    <div className="space-y-2">
                        {[
                            ['Manage Levels', '/admin/levels'],
                            ['Manage Subjects', '/admin/subjects'],
                            ['Upload Resources', '/admin/resources'],
                            ['Add Flashcards', '/admin/flashcards'],
                            ['Write Blog Post', '/admin/blog'],
                        ].map(([label, to]) => (
                            <Link key={label} to={to} className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">→ {label}</Link>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Getting Started</h2>
                    <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                        <li>Create your <Link to="/admin/levels" className="text-primary-600 hover:underline">Levels</Link> (Checkpoint, O Level, IGCSE, A Level)</li>
                        <li>Add <Link to="/admin/subjects" className="text-primary-600 hover:underline">Subjects</Link> under each level</li>
                        <li>Create <Link to="/admin/topics" className="text-primary-600 hover:underline">Topics</Link> within each subject</li>
                        <li>Upload <Link to="/admin/resources" className="text-primary-600 hover:underline">Resources</Link> (PDFs, notes)</li>
                        <li>Build <Link to="/admin/flashcards" className="text-primary-600 hover:underline">Flashcard Decks</Link> for each topic</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
