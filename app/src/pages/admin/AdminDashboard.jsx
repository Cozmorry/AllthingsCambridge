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

            if (users.error) console.error("Admin: Profiles check blocked by RLS. Authenticated session required for real counts.")
            if (payments.error) console.error("Admin: Payments check blocked by RLS.")

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
                    <Link key={label} to={to} className="group relative bg-white rounded-3xl border border-gray-100 p-6 overflow-hidden hover:shadow-2xl hover:shadow-primary-100 hover:-translate-y-1 transition-all duration-300">
                        {/* Soft background glow */}
                        <div className={`absolute -right-6 -top-6 w-32 h-32 opacity-10 rounded-full blur-2xl ${color} transition-opacity group-hover:opacity-20`} />
                        
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon size={22} />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary-600 transition-colors">
                                <span className="text-xl font-bold leading-none translate-x-[1px] -translate-y-[1px]">↗</span>
                            </div>
                        </div>
                        
                        <div className="relative z-10 mt-2">
                            <p className="text-4xl font-black text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">{value}</p>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-1">{label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-extrabold text-xl text-gray-900 mb-6">Quick Links</h2>
                    <div className="space-y-3">
                        {[
                            ['Levels', '/admin/levels', 'Manage your academic structure'],
                            ['Subjects', '/admin/subjects', 'Add or update curriculums'],
                            ['Resources', '/admin/resources', 'Upload past papers and notes'],
                            ['Flashcards', '/admin/flashcards', 'Build interactive study decks'],
                            ['Blog', '/admin/blog', 'Publish news and articles'],
                        ].map(([label, to, desc]) => (
                            <Link key={label} to={to} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-[#f8fafc] border border-transparent hover:border-gray-100 transition-all">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{label}</p>
                                    <p className="text-xs text-gray-400">{desc}</p>
                                </div>
                                <span className="text-gray-300 group-hover:text-primary-600 transition-colors transform group-hover:translate-x-1">→</span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-lg transition-shadow duration-300">
                    <h2 className="font-extrabold text-xl text-gray-900 mb-6">Launch Sequence</h2>
                    <div className="space-y-6">
                        {[
                            { title: 'Create Levels', desc: 'Define your main stages (e.g. IGCSE).', link: '/admin/levels' },
                            { title: 'Add Subjects', desc: 'Assign mathematics, sciences, etc.', link: '/admin/subjects' },
                            { title: 'Define Topics', desc: 'Break subjects into modules.', link: '/admin/topics' },
                            { title: 'Populate Content', desc: 'Upload PDFs and create flashcards.', link: '/admin/resources' }
                        ].map((step, i) => (
                            <div key={step.title} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-100">{i + 1}</div>
                                <div>
                                    <Link to={step.link} className="font-bold text-sm text-gray-900 hover:text-primary-600 transition-colors">{step.title}</Link>
                                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
