import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'
import { Heart, ArrowLeft, Edit, Trash2, Share2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { awardXP, XP } from '../lib/gamification'
import { useAuth } from '../context/AuthContext'
import { useXP } from '../context/XPContext'
import { MiniLevel } from '../components/gamification/LevelProgress'
import CommentSection from '../components/blog/CommentSection'
import { PageLoader } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function PostDetailPage() {
  const { id } = useParams()
  const { user, refreshProfile } = useAuth()
  const { showXP } = useXP()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, profiles(id, username, points, level, login_streak)`)
        .eq('id', id)
        .single()

      if (error || !data) {
        navigate('/', { replace: true })
        return
      }
      setPost(data)

      // Check if user liked this post
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle()
        setLiked(!!likeData)
      }

      setLoading(false)
    }
    fetchPost()
  }, [id, user, navigate])

  const handleLike = async (e) => {
    if (!user || liking) return
    setLiking(true)
    try {
      if (liked) {
        await supabase.from('likes').delete()
          .eq('user_id', user.id).eq('post_id', id)
        await supabase.from('posts')
          .update({ likes_count: Math.max(0, (post.likes_count || 0) - 1) })
          .eq('id', id)
        setPost(p => ({ ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1) }))
        setLiked(false)
      } else {
        await supabase.from('likes').insert({ user_id: user.id, post_id: id })
        await supabase.from('posts')
          .update({ likes_count: (post.likes_count || 0) + 1 })
          .eq('id', id)

        await awardXP(user.id, XP.LIKE_POST, 'Liked a post')
        if (post.user_id !== user.id) {
          await supabase.rpc('increment_likes_received', { uid: post.user_id })
        }
        showXP(XP.LIKE_POST, e.clientX, e.clientY)
        setPost(p => ({ ...p, likes_count: (p.likes_count || 0) + 1 }))
        setLiked(true)
        await refreshProfile()
      }
    } catch (err) {
      toast.error('Failed to update like')
    } finally {
      setLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post? You will lose 5 XP.')) return
    try {
      if (post.image_url) {
        const path = `posts/${post.image_url.split('/').pop()}`
        await supabase.storage.from('post-images').remove([path])
      }
      await supabase.from('posts').delete().eq('id', id)
      await awardXP(user.id, XP.DELETE_POST, 'Deleted a post')
      await supabase.rpc('decrement_posts_created', { uid: user.id })
      toast.success('Post deleted')
      navigate('/')
      await refreshProfile()
    } catch (err) {
      toast.error('Failed to delete post')
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Could not copy link')
    }
  }

  if (loading) return <PageLoader />
  if (!post) return null

  const isOwner = user?.id === post.user_id
  const tags = Array.isArray(post.tags)
    ? post.tags
    : typeof post.tags === 'string'
      ? post.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-cyber-muted hover:text-cyber-cyan transition-colors mb-6 font-mono text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </button>

      <article className="cyber-card overflow-hidden">
        {/* Cover image */}
        {post.image_url && (
          <div className="aspect-video overflow-hidden bg-cyber-surface">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map(tag => (
                <Link key={tag} to={`/?tag=${encodeURIComponent(tag)}`} className="badge-tag hover:bg-cyber-cyan/20">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-2xl md:text-3xl font-bold text-cyber-text leading-tight mb-4">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-cyber-border mb-6">
            <Link
              to={`/profile/${post.user_id}`}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/30 border border-cyber-border flex items-center justify-center font-bold text-cyber-cyan">
                {post.profiles?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-cyber-text group-hover:text-cyber-cyan transition-colors">
                    {post.profiles?.username}
                  </span>
                  {post.profiles?.points !== undefined && (
                    <MiniLevel points={post.profiles.points} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-cyber-muted font-mono">
                  <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                  <span>·</span>
                  <span>{Math.ceil((post.content?.replace(/<[^>]*>/g, '').length || 0) / 200)} min read</span>
                </div>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                disabled={liking || !user}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-mono transition-all duration-200
                  ${liked
                    ? 'border-cyber-pink/50 bg-cyber-pink/10 text-cyber-pink'
                    : 'border-cyber-border text-cyber-muted hover:border-cyber-pink/50 hover:text-cyber-pink'
                  }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                {post.likes_count || 0}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-cyber-border text-cyber-muted hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => navigate(`/edit/${id}`)}
                    className="p-2 rounded-lg border border-cyber-border text-cyber-muted hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg border border-cyber-border text-cyber-muted hover:text-cyber-pink hover:border-cyber-pink/40 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div
            className="prose-cyber text-cyber-text font-body leading-relaxed text-base mb-10"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Comments */}
          <CommentSection postId={id} />
        </div>
      </article>
    </div>
  )
}
