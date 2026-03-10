import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const BlogListPage = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.from('blog_posts').select('id,title,slug,cover_image,published_at,content').eq('published', true).order('published_at', { ascending: false })
            .then(({ data }) => { setPosts(data ?? []); setLoading(false) })
    }, [])

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-14">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Blog</h1>
            <p className="text-gray-500 mb-10">Study tips, exam guides, and updates from AllThingsCambridge.</p>

            {loading ? <Spinner /> : posts.length === 0 ? (
                <Empty msg="No posts yet. Check back soon." />
            ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                    {posts.map(p => (
                        <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                            {p.cover_image && <img src={p.cover_image} alt={p.title} className="w-full h-44 object-cover" />}
                            <div className="p-5">
                                <p className="text-xs text-gray-400 mb-2">{p.published_at ? new Date(p.published_at).toLocaleDateString() : ''}</p>
                                <h2 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors mb-2">{p.title}</h2>
                                <p className="text-sm text-gray-500 line-clamp-2">{p.content?.slice(0, 120)}…</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

const Spinner = () => <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
const Empty = ({ msg }) => <div className="text-center py-20 text-gray-400"><p className="text-4xl mb-3">📝</p><p>{msg}</p></div>

export default BlogListPage
