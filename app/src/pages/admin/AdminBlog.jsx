import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Trash2 } from 'lucide-react'

const AdminBlog = () => {
    const [posts, setPosts] = useState([])
    const [form, setForm] = useState({ title: '', slug: '', content: '', cover_image: '', published: false })
    const [saving, setSaving] = useState(false)

    const load = () => supabase.from('blog_posts').select('id,title,slug,published,published_at').order('created_at', { ascending: false }).then(({ data }) => setPosts(data ?? []))
    useEffect(() => { load() }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        const { user } = await supabase.auth.getUser()
        await supabase.from('blog_posts').insert({
            ...form,
            author_id: user.user.id,
            published_at: form.published ? new Date().toISOString() : null,
        })
        setForm({ title: '', slug: '', content: '', cover_image: '', published: false })
        await load()
        setSaving(false)
    }

    const togglePublish = async (id, val) => {
        await supabase.from('blog_posts').update({ published: val, published_at: val ? new Date().toISOString() : null }).eq('id', id)
        await load()
    }

    const deletePost = async (id) => {
        await supabase.from('blog_posts').delete().eq('id', id)
        setPosts(p => p.filter(x => x.id !== id))
    }

    const autoSlug = (title) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    return (
        <div className="p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Blog</h1>
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-5">New Post</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: autoSlug(e.target.value) }))}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" placeholder="Post title" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug</label>
                            <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL</label>
                            <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content (HTML or plain text)</label>
                            <textarea required rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none font-mono" />
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="rounded" />
                            Publish immediately
                        </label>
                        <button type="submit" disabled={saving} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60">
                            {saving ? 'Saving…' : 'Publish Post'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-900">Posts ({posts.length})</h2></div>
                    <div className="divide-y divide-gray-50 overflow-y-auto max-h-[600px]">
                        {posts.map(p => (
                            <div key={p.id} className="flex items-center gap-3 px-5 py-3 group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                                    <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                                </div>
                                <button onClick={() => togglePublish(p.id, !p.published)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${p.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                    {p.published ? 'Live' : 'Draft'}
                                </button>
                                <button onClick={() => deletePost(p.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 transition-all">
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

export default AdminBlog
