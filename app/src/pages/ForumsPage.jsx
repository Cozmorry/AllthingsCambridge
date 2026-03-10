import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { MessageSquare, Eye } from 'lucide-react'

const ForumsPage = () => {
    const { user } = useAuth()
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [newPost, setNewPost] = useState({ title: '', body: '' })
    const [posting, setPosting] = useState(false)

    const load = async () => {
        const { data } = await supabase.from('forum_posts').select('*, profiles(full_name)').order('created_at', { ascending: false })
        setPosts(data ?? [])
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const handlePost = async (e) => {
        e.preventDefault()
        if (!user) return
        setPosting(true)
        await supabase.from('forum_posts').insert({ ...newPost, author_id: user.id })
        setNewPost({ title: '', body: '' })
        await load()
        setPosting(false)
    }

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-14">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Community Forums</h1>
            <p className="text-gray-500 mb-10">Ask questions, share tips, and connect with fellow Cambridge students.</p>

            {user && (
                <form onSubmit={handlePost} className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
                    <h3 className="font-bold text-gray-900 mb-4">New Post</h3>
                    <input
                        required value={newPost.title}
                        onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                        placeholder="Post title"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                    <textarea
                        required value={newPost.body}
                        onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))}
                        placeholder="What's on your mind?"
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                    />
                    <button type="submit" disabled={posting} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                        {posting ? 'Posting…' : 'Post'}
                    </button>
                </form>
            )}

            {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
                : posts.length === 0 ? <div className="text-center py-20 text-gray-400"><p className="text-4xl mb-3">💬</p><p>No posts yet. Be the first!</p></div>
                    : (
                        <div className="space-y-3">
                            {posts.map(p => (
                                <Link key={p.id} to={`/forums/${p.id}`} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-primary-100 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                                        {p.profiles?.full_name?.[0] ?? '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{p.title}</h3>
                                        <p className="text-sm text-gray-400 mt-0.5 truncate">{p.body}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span>{p.profiles?.full_name ?? 'User'}</span>
                                            <span className="flex items-center gap-1"><Eye size={12} /> {p.view_count ?? 0}</span>
                                            <span>{new Date(p.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <MessageSquare size={18} className="text-gray-300 group-hover:text-primary-400 transition-colors shrink-0 mt-1" />
                                </Link>
                            ))}
                        </div>
                    )}
        </div>
    )
}

export default ForumsPage
