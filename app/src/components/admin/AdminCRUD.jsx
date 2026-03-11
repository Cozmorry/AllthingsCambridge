import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react'

/**
 * Reusable admin CRUD table component.
 * Props:
 *   table      - Supabase table name
 *   title      - Page title
 *   fields     - Array of field configs: { key, label, type, required, options, placeholder, help }
 *   select     - Supabase select string (default '*')
 *   displayCol - Column to show in table (default 'name')
 */
const AdminCRUD = ({ table, title, fields, select = '*' }) => {
    const [rows, setRows] = useState([])
    const [form, setForm] = useState({})
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)

    const emptyForm = () => fields.reduce((a, f) => ({ ...a, [f.key]: f.type === 'checkbox' ? false : '' }), {})

    const load = async () => {
        setLoading(true)
        const { data } = await supabase.from(table).select(select).order('created_at', { ascending: false })
        setRows(data ?? [])
        setLoading(false)
    }

    useEffect(() => { load() }, [table])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        const payload = { ...form }
        // Remove empty strings for non-required fields
        Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })

        if (editId) {
            await supabase.from(table).update(payload).eq('id', editId)
        } else {
            await supabase.from(table).insert(payload)
        }
        setForm(emptyForm())
        setEditId(null)
        setShowForm(false)
        await load()
        setSaving(false)
    }

    const startEdit = (row) => {
        const f = fields.reduce((a, field) => ({ ...a, [field.key]: row[field.key] ?? '' }), {})
        setForm(f)
        setEditId(row.id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this record?')) return
        await supabase.from(table).delete().eq('id', id)
        setRows(r => r.filter(x => x.id !== id))
    }

    const openNew = () => {
        setForm(emptyForm())
        setEditId(null)
        setShowForm(true)
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto dark:bg-[#0c1220] min-h-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h1>
                <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 text-white rounded-xl font-bold text-sm transition-all transform hover:-translate-y-0.5">
                    <Plus size={18} /> Add {title.replace(/s$/, '')}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-10 shadow-xl shadow-gray-200/40 transition-all animate-in slide-in-from-top-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600" />
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-extrabold text-gray-900">{editId ? 'Edit' : 'New'} {title.replace(/s$/, '')}</h2>
                        <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-5">
                        {fields.map((field) => (
                            <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                                </label>
                                {field.type === 'select' ? (
                                    <select
                                        required={field.required}
                                        value={form[field.key] ?? ''}
                                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                                    >
                                        <option value="">Select…</option>
                                        {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                ) : field.type === 'checkbox' ? (
                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                        <input type="checkbox" checked={!!form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.checked }))} className="rounded w-4 h-4 accent-primary-600" />
                                        <span className="text-sm text-gray-600">{field.label}</span>
                                    </label>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        required={field.required}
                                        rows={4}
                                        value={form[field.key] ?? ''}
                                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                                    />
                                ) : (
                                    <input
                                        type={field.type ?? 'text'}
                                        required={field.required}
                                        value={form[field.key] ?? ''}
                                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                                    />
                                )}
                                {field.help && <p className="text-xs text-gray-400 mt-1">{field.help}</p>}
                            </div>
                        ))}
                        <div className="sm:col-span-2 flex gap-3 mt-4 pt-6 border-t border-gray-100">
                            <button type="submit" disabled={saving} className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-primary-600/20 disabled:opacity-60 flex items-center justify-center min-w-[120px]">
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : editId ? 'Save Changes' : 'Create Record'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold transition-all shadow-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full admin-table min-w-[700px]">
                        <thead>
                            <tr>
                                {fields.slice(0, 4).map(f => <th key={f.key} className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4">{f.label}</th>)}
                                <th className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider py-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading…</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">No records yet. Click "Add" to create one.</td></tr>
                        ) : rows.map(row => (
                            <tr key={row.id}>
                                {fields.slice(0, 4).map(f => (
                                    <td key={f.key} className="text-sm text-gray-700">
                                        {f.type === 'checkbox'
                                            ? (row[f.key] ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md font-bold text-[10px] uppercase tracking-wider border border-green-200"><Check size={12}/> Yes</span> : <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-500 rounded-md font-bold text-[10px] uppercase tracking-wider border border-gray-200">No</span>)
                                            : f.type === 'select'
                                                ? (f.options?.find(o => o.value === row[f.key])?.label ?? row[f.key])
                                                : (String(row[f.key] ?? '—').slice(0, 60))
                                        }
                                    </td>
                                ))}
                                <td className="py-4 pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => startEdit(row)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Edit">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(row.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
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

export default AdminCRUD
