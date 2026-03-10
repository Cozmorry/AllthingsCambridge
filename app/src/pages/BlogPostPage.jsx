import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BlogPostPage = () => {
    const { slug } = useParams()
    const [post, setPost] = useState(null)
    useEffect(() => {
        supabase.from('blog_posts').select('*').eq('slug', slug).single().then(({ data }) => setPost(data))
    }, [slug])
    if (!post) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
    return (
        <div className="max-w-2xl mx-auto px-6 py-14">
            {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-full h-64 object-cover rounded-2xl mb-8" />}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{post.title}</h1>
            <p className="text-sm text-gray-400 mb-8">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</p>
            <div className="prose text-gray-700" dangerouslySetInnerHTML={{ __html: post.content ?? '' }} />
        </div>
    )
}

export default BlogPostPage
