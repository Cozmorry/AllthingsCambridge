import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const ForumPostPage = () => {
    const { postId } = useParams()
    const { user } = useAuth()
    const [post, setPost] = useState(null)
    const [replies, setReplies] = useState([])
    const [body, setBody] = useState('')
    const [posting, setPosting] = useState(false)

    const load = async () => {
        const [postRes, repliesRes] = await Promise.all([
            supabase.from('forum_posts').select('*, profiles(full_name)').eq('id', postId).single(),
            supabase.from('forum_replies').select('*, profiles(full_name)').eq('post_id', postId).order('created_at'),
        ])
        setPost(postRes.data)
        setReplies(repliesRes.data ?? [])
        // increment view count
        await supabase.from('forum_posts').update({ view_count: (postRes.data?.view_count ?? 0) + 1 }).eq('id', postId)
    }

    useEffect(() => { load() }, [postId])

    const handleReply = async (e) => {
        e.preventDefault()
        if (!user || !body.trim()) return
        setPosting(true)
        await supabase.from('forum_replies').insert({ post_id: postId, author_id: user.id, body })
        setBody('')
        await load()
        setPosting(false)
    }

    if (!post) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

    return (
        <div className="max-w-3xl mx-auto px-6 py-14">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <p className="text-xs text-gray-400 mb-3">{post.profiles?.full_name} · {new Date(post.created_at).toLocaleDateString()}</p>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-4">{post.title}</h1>
                <p className="text-gray-700 leading-relaxed">{post.body}</p>
            </div>

            <h3 className="font-bold text-gray-700 mb-4">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h3>

            <div className="space-y-4 mb-8">
                {replies.map(r => (
                    <div key={r.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {r.profiles?.full_name?.[0] ?? '?'}
                        </div>
                        <div className="flex-1 bg-white rounded-xl border border-gray-100 px-4 py-3">
                            <p className="text-xs text-gray-400 mb-1">{r.profiles?.full_name}</p>
                            <p className="text-sm text-gray-700">{r.body}</p>
                        </div>
                    </div>
                ))}
            </div>

            {user ? (
                <form onSubmit={handleReply} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="Write a reply…"
                        rows={3}
                        className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                    />
                    <button type="submit" disabled={posting || !body.trim()} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                        {posting ? 'Posting…' : 'Reply'}
                    </button>
                </form>
            ) : (
                <p className="text-sm text-gray-500 text-center p-4 bg-white border border-gray-100 rounded-2xl">
                    <a href="/login" className="text-primary-600 font-semibold hover:underline">Log in</a> to post a reply.
                </p>
            )}
        </div>
    )
}

export default ForumPostPage
