import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, Link as LinkIcon, FileText, Trash2 } from 'lucide-react'

const RESOURCE_TYPES = ['note', 'past_paper', 'topical_question']

const AdminResources = () => {
    const [levels, setLevels] = useState([])
    const [subjects, setSubjects] = useState([])
    const [filteredSubjects, setFilteredSubjects] = useState([])
    const [topics, setTopics] = useState([])
    const [resources, setResources] = useState([])
    const [form, setForm] = useState({ level_id: '', subject_id: '', topic_id: '', type: 'note', title: '', file_url: '', is_premium: false, year: '' })
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        supabase.from('levels').select('id,name').order('name').then(({ data }) => setLevels(data ?? []))
        supabase.from('subjects').select('id,name,level_id').order('name').then(({ data }) => setSubjects(data ?? []))
        supabase.from('resources').select('*, subjects(name), topics(name)').order('created_at', { ascending: false }).then(({ data }) => setResources(data ?? []))
    }, [])

    // Filter subjects when level changes
    useEffect(() => {
        if (!form.level_id) {
            setFilteredSubjects(subjects)
        } else {
            setFilteredSubjects(subjects.filter(s => s.level_id === form.level_id))
        }
    }, [form.level_id, subjects])

    useEffect(() => {
        if (!form.subject_id) return setTopics([])
        supabase.from('topics').select('id,name').eq('subject_id', form.subject_id).order('order').then(({ data }) => setTopics(data ?? []))
    }, [form.subject_id])

    const handleUpload = async () => {
        if (!file) return null
        const ext = file.name.split('.').pop()
        const path = `resources/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('content').upload(path, file, { upsert: true })
        if (error) {
            console.error('Storage upload error:', error)
            alert(`File upload failed: ${error.message}`)
            return null
        }
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
            if (!fileUrl) {
                // Upload failed — error already shown by handleUpload
                setSaving(false)
                return
            }
        }
        const { level_id, ...insertData } = form
        const finalUrl = fileUrl && fileUrl.trim() ? fileUrl.trim() : null
        if (!finalUrl) {
            alert('Please select a file to upload or paste a file URL.')
            setSaving(false)
            return
        }
        await supabase.from('resources').insert({ ...insertData, file_url: finalUrl, topic_id: form.topic_id || null, year: form.year ? parseInt(form.year) : null })
        const { data } = await supabase.from('resources').select('*, subjects(name), topics(name)').order('created_at', { ascending: false })
        setResources(data ?? [])
        setForm({ level_id: '', subject_id: '', topic_id: '', type: 'note', title: '', file_url: '', is_premium: false, year: '' })
        setFile(null)
        setSaving(false)
    }

    const handleDelete = async (id) => {
        await supabase.from('resources').delete().eq('id', id)
        setResources(r => r.filter(x => x.id !== id))
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto dark:bg-[#0c1220] min-h-full">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Resources</h1>
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col h-fit">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-6">Upload Resource</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select label="Level" value={form.level_id} onChange={v => setForm(f => ({ ...f, level_id: v, subject_id: '', topic_id: '' }))} options={levels.map(l => ({ value: l.id, label: l.name }))} />
                        <Select label="Subject" value={form.subject_id} onChange={v => setForm(f => ({ ...f, subject_id: v, topic_id: '' }))} options={filteredSubjects.map(s => ({ value: s.id, label: s.name }))} required />
                        {topics.length > 0 && <Select label="Topic (optional)" value={form.topic_id} onChange={v => setForm(f => ({ ...f, topic_id: v }))} options={[{ value: '', label: '— No topic —' }, ...topics.map(t => ({ value: t.id, label: t.name }))]} />}
                        <Select label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={RESOURCE_TYPES.map(t => ({ value: t, label: t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }))} />
                        <Select label="Year" value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))} options={Array.from({ length: 15 }, (_, i) => { const y = new Date().getFullYear() - i; return { value: String(y), label: String(y) } })} />
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
                        <button type="submit" disabled={saving || uploading} className="w-full py-3.5 mt-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:shadow-primary-600/20 disabled:opacity-60 flex items-center justify-center gap-2">
                            {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</> : saving ? 'Saving…' : <><Upload size={16} /> Add Resource</>}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-[700px]">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                        <h2 className="font-extrabold text-xl text-gray-900">Library</h2>
                        <p className="text-sm font-medium text-primary-600 mt-1">{resources.length} resources available</p>
                    </div>
                    <div className="overflow-y-auto flex-1 bg-white">
                        {resources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 bg-gray-50/30">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <FileText size={36} className="opacity-40" />
                                </div>
                                <p className="font-medium">No resources uploaded yet</p>
                            </div>
                        ) : resources.map(r => (
                            <div key={r.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                                    <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{r.title}</p>
                                    <p className="text-xs font-medium text-gray-500 mt-0.5">{r.subjects?.name} <span className="text-gray-300 mx-1">•</span> <span className="uppercase tracking-wider text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{r.type.replace('_',' ')}</span>{r.year && <><span className="text-gray-300 mx-1">•</span><span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{r.year}</span></>}</p>
                                </div>
                                <button onClick={() => handleDelete(r.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 size={16} />
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
