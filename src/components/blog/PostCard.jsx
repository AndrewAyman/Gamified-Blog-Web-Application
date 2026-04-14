import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Trash2, Edit, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { awardXP, XP } from '../../lib/gamification'
import { useAuth } from '../../context/AuthContext'
import { useXP } from '../../context/XPContext'
import { MiniLevel } from '../gamification/LevelProgress'
import toast from 'react-hot-toast'

export default function PostCard({ post, onDelete, onLikeUpdate }) {
  const { user, profile, refreshProfile } = useAuth()
  const { showXP } = useXP()
  const navigate = useNavigate()
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = user?.id === post.user_id
  const liked = post.user_likes?.includes(user?.id)

  const handleLike = async (e) => {
    e.preventDefault()
    if (!user || liking) return
    setLiking(true)

    try {
      if (liked) {
        await supabase.from('likes').delete()
          .eq('user_id', user.id).eq('post_id', post.id)

        await supabase.from('posts')
          .update({ likes_count: Math.max(0, (post.likes_count || 0) - 1) })
          .eq('id', post.id)

        onLikeUpdate?.(post.id, (post.likes_count || 0) - 1, false)
      } else {
        await supabase.from('likes').insert({ user_id: user.id, post_id: post.id })

        await supabase.from('posts')
          .update({ likes_count: (post.likes_count || 0) + 1 })
          .eq('id', post.id)

        // Award XP to liker
        await awardXP(user.id, XP.LIKE_POST, 'Liked a post')

        // Increment likes_received on post author
        if (post.user_id !== user.id) {
          await supabase.rpc('increment_likes_received', { uid: post.user_id })
        }

        showXP(XP.LIKE_POST, e.clientX, e.clientY)
        onLikeUpdate?.(post.id, (post.likes_count || 0) + 1, true)
        await refreshProfile()
      }
    } catch (err) {
      toast.error('Failed to update like')
    } finally {
      setLiking(false)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    if (!isOwner || deleting) return
    if (!confirm('Delete this post? You will lose 5 XP.')) return
    setDeleting(true)

    try {
      // Delete image from storage if exists
      if (post.image_url) {
        const path = post.image_url.split('/').pop()
        await supabase.storage.from('post-images').remove([`posts/${path}`])
      }

      await supabase.from('posts').delete().eq('id', post.id)

      // Deduct XP
      await awardXP(user.id, XP.DELETE_POST, 'Deleted a post')
      await supabase.rpc('decrement_posts_created', { uid: user.id })

      toast.error(`Post deleted. ${XP.DELETE_POST} XP`)
      onDelete?.(post.id)
      await refreshProfile()
    } catch (err) {
      toast.error('Failed to delete post')
    } finally {
      setDeleting(false)
    }
  }

  const tags = Array.isArray(post.tags)
    ? post.tags
    : typeof post.tags === 'string'
      ? post.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

  const authorName = post.profiles?.username || 'Unknown'

  return (
    <article className="cyber-card hover-lift group overflow-hidden">
      {/* Image */}
      {post.image_url && (
        <Link to={`/post/${post.id}`}>
          <div className="aspect-video overflow-hidden bg-cyber-surface">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center justify-between mb-3">
          <Link
            to={`/profile/${post.user_id}`}
            className="flex items-center gap-2 group/author"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/30 border border-cyber-border flex items-center justify-center text-xs font-bold text-cyber-cyan">
              {authorName[0]?.toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-display font-medium text-cyber-text group-hover/author:text-cyber-cyan transition-colors">
                {authorName}
              </span>
              {post.profiles?.points !== undefined && (
                <MiniLevel points={post.profiles.points} />
              )}
            </div>
          </Link>
          <span className="text-cyber-muted text-xs font-mono">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Title */}
        <Link to={`/post/${post.id}`}>
          <h2 className="font-display text-base font-bold text-cyber-text mb-2 line-clamp-2 leading-snug hover:text-cyber-cyan transition-colors duration-200">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-cyber-muted text-sm font-body leading-relaxed line-clamp-2 mb-3">
          {post.content?.replace(/<[^>]*>/g, '').slice(0, 150)}...
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 4).map(tag => (
              <Link
                key={tag}
                to={`/?tag=${encodeURIComponent(tag)}`}
                className="badge-tag hover:bg-cyber-cyan/20 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-cyber-border">
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={liking || !user}
              className={`flex items-center gap-1.5 text-xs font-mono transition-all duration-200 group/like
                ${liked ? 'text-cyber-pink' : 'text-cyber-muted hover:text-cyber-pink'}`}
            >
              <Heart
                className={`w-4 h-4 transition-transform group-hover/like:scale-125 ${liked ? 'fill-current' : ''} ${liking ? 'animate-ping' : ''}`}
              />
              <span>{post.likes_count || 0}</span>
            </button>

            {/* Comments */}
            <Link
              to={`/post/${post.id}#comments`}
              className="flex items-center gap-1.5 text-xs font-mono text-cyber-muted hover:text-cyber-cyan transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count || 0}</span>
            </Link>

            {/* Read */}
            <Link
              to={`/post/${post.id}`}
              className="flex items-center gap-1.5 text-xs font-mono text-cyber-muted hover:text-cyber-cyan transition-colors"
            >
              <Eye className="w-4 h-4" />
              Read
            </Link>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit/${post.id}`)}
                className="p-1.5 rounded text-cyber-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 rounded text-cyber-muted hover:text-cyber-pink hover:bg-cyber-pink/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
