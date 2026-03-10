import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, Link as LinkIcon, FileText, Trash2 } from 'lucide-react'

const RESOURCE_TYPES = ['note', 'past_paper', 'topical_question']

const AdminResources = () => {
    const [subjects, setSubjects] = useState([])
    const [topics, setTopics] = useState([])
    const [resources, setResources] = useState([])
    const [form, setForm] = useState({ subject_id: '', topic_id: '', type: 'note', title: '', file_url: '', is_premium: false })
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        supabase.from('subjects').select('id,name').order('name').then(({ data }) => setSubjects(data ?? []))
        supabase.from('resources').select('*, subjects(name), topics(name)').order('created_at', { ascending: false }).then(({ data }) => setResources(data ?? []))
    }, [])

    useEffect(() => {
        if (!form.subject_id) return setTopics([])
        supabase.from('topics').select('id,name').eq('subject_id', form.subject_id).order('order').then(({ data }) => setTopics(data ?? []))
    }, [form.subject_id])

    const handleUpload = async () => {
        if (!file) return null
        const ext = file.name.split('.').pop()
        const path = `resources/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('content').upload(path, file)
        if (error) return null
        const { data } = supabase.storage.from('content').getPublicUrl(path)
        return data.publicUrl
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        let fileUrl = form.file_url
        if (file) {
            setUploading(true)
            fileUrl = await handleUpload()
            setUploading(false)
        }
        await supabase.from('resources').insert({ ...form, file_url: fileUrl, topic_id: form.topic_id || null })
        const { data } = await supabase.from('resources').select('*, subjects(name), topics(name)').order('created_at', { ascending: false })
        setResources(data ?? [])
        setForm({ subject_id: '', topic_id: '', type: 'note', title: '', file_url: '', is_premium: false })
        setFile(null)
        setSaving(false)
    }

    const handleDelete = async (id) => {
        await supabase.from('resources').delete().eq('id', id)
        setResources(r => r.filter(x => x.id !== id))
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Resources</h1>
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-5">Add Resource</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select label="Subject" value={form.subject_id} onChange={v => setForm(f => ({ ...f, subject_id: v, topic_id: '' }))} options={subjects.map(s => ({ value: s.id, label: s.name }))} required />
                        {topics.length > 0 && <Select label="Topic (optional)" value={form.topic_id} onChange={v => setForm(f => ({ ...f, topic_id: v }))} options={[{ value: '', label: '— No topic —' }, ...topics.map(t => ({ value: t.id, label: t.name }))]} />}
                        <Select label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={RESOURCE_TYPES.map(t => ({ value: t, label: t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }))} />
                        <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Upload PDF</label>
                            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                        </div>
                        <Field label="Or paste URL" value={form.file_url} onChange={v => setForm(f => ({ ...f, file_url: v }))} placeholder="https://..." />
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={form.is_premium} onChange={e => setForm(f => ({ ...f, is_premium: e.target.checked }))} className="rounded" />
                            Premium only
                        </label>
                        <button type="submit" disabled={saving} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                            {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Add Resource'}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-900">All Resources ({resources.length})</h2></div>
                    <div className="overflow-y-auto max-h-[560px]">
                        {resources.length === 0 ? (
                            <div className="flex flex-col items-center py-16 text-gray-400"><FileText size={32} className="mb-2 opacity-30" /><p>No resources yet</p></div>
                        ) : resources.map(r => (
                            <div key={r.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 group">
                                <FileText size={16} className="text-gray-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                                    <p className="text-xs text-gray-400">{r.subjects?.name} · {r.type}</p>
                                </div>
                                <button onClick={() => handleDelete(r.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 transition-all">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const Field = ({ label, value, onChange, placeholder, required }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
        <input required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
    </div>
)

const Select = ({ label, value, onChange, options, required }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
        <select required={required} value={value} onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
            <option value="">Select…</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
)

export default AdminResources
