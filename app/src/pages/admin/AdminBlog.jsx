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
        <div className="p-4 sm:p-8 max-w-7xl mx-auto dark:bg-[#0c1220] min-h-full">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Blog</h1>
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col h-fit">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-6">New Post</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Title</label>
                            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: autoSlug(e.target.value) }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-sm" placeholder="Post title" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Slug</label>
                            <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 font-mono shadow-sm" placeholder="post-url-slug" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Cover Image URL</label>
                            <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-sm" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Content (HTML or plain text)</label>
                            <textarea required rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none font-mono shadow-sm" />
                        </div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer mt-2">
                            <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="rounded" />
                            Publish immediately
                        </label>
                        <button type="submit" disabled={saving} className="w-full py-3.5 mt-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:shadow-primary-600/20 disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : 'Publish Post'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-[700px]">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                        <h2 className="font-extrabold text-xl text-gray-900">Posts</h2>
                        <p className="text-sm font-medium text-primary-600 mt-1">{posts.length} published or drafted</p>
                    </div>
                    <div className="overflow-y-auto flex-1 bg-white">
                        {posts.map(p => (
                            <div key={p.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{p.title}</p>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{p.slug}</p>
                                </div>
                                <button onClick={() => togglePublish(p.id, !p.published)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all border ${p.published ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
                                    {p.published ? 'Live' : 'Draft'}
                                </button>
                                <button onClick={() => deletePost(p.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-1">
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

export default AdminBlog
