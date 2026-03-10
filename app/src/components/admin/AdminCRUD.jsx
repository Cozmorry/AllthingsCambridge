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
const AdminCRUD = ({ table, title, fields, select = '*', displayCol = 'name' }) => {
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
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-colors">
                    <Plus size={17} /> Add {title.replace(/s$/, '')}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold text-gray-900">{editId ? 'Edit' : 'New'} {title.replace(/s$/, '')}</h2>
                        <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"><X size={18} /></button>
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
                        <div className="sm:col-span-2 flex gap-3">
                            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60">
                                {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full admin-table">
                    <thead>
                        <tr>
                            {fields.slice(0, 4).map(f => <th key={f.key}>{f.label}</th>)}
                            <th>Actions</th>
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
                                            ? (row[f.key] ? <span className="text-green-600 font-semibold text-xs">Yes</span> : <span className="text-gray-400 text-xs">No</span>)
                                            : f.type === 'select'
                                                ? (f.options?.find(o => o.value === row[f.key])?.label ?? row[f.key])
                                                : (String(row[f.key] ?? '—').slice(0, 60))
                                        }
                                    </td>
                                ))}
                                <td>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => startEdit(row)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                                            <Pencil size={15} />
                                        </button>
                                        <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminCRUD
