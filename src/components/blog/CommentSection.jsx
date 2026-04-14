import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Send, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { awardXP, XP } from '../../lib/gamification'
import { useAuth } from '../../context/AuthContext'
import { useXP } from '../../context/XPContext'
import { MiniLevel } from '../gamification/LevelProgress'
import LoadingSpinner from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function CommentSection({ postId }) {
  const { user, profile, refreshProfile } = useAuth()
  const { showXP } = useXP()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`*, profiles(username, points)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (!error) setComments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchComments()
    // Subscribe to realtime
    const channel = supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'comments',
        filter: `post_id=eq.${postId}`
      }, fetchComments)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [postId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || !user || submitting) return
    setSubmitting(true)

    try {
      const { error } = await supabase.from('comments').insert({
        content: content.trim(),
        user_id: user.id,
        post_id: postId,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      // Update comments count on post
      await supabase.rpc('increment_comments_count', { pid: postId })

      // Award XP
      await awardXP(user.id, XP.COMMENT, 'Posted a comment')
      await supabase.rpc('increment_comments_made', { uid: user.id })

      showXP(XP.COMMENT, window.innerWidth / 2, window.innerHeight * 0.7)
      toast.success(`+${XP.COMMENT} XP for commenting!`)
      setContent('')
      await refreshProfile()
    } catch (err) {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId, authorId) => {
    if (user?.id !== authorId) return
    if (!confirm('Delete this comment?')) return

    try {
      await supabase.from('comments').delete().eq('id', commentId)
      await supabase.rpc('decrement_comments_count', { pid: postId })
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
    } catch (err) {
      toast.error('Failed to delete comment')
    }
  }

  return (
    <div id="comments" className="space-y-6">
      <h2 className="font-display text-lg font-bold text-cyber-text tracking-wider flex items-center gap-2">
        <span className="text-cyber-cyan">💬</span>
        Comments
        <span className="font-mono text-sm text-cyber-muted font-normal">({comments.length})</span>
      </h2>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="cyber-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/30 border border-cyber-border flex items-center justify-center text-xs font-bold text-cyber-cyan">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-display text-cyber-muted">
              {profile?.username}
            </span>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your thoughts... (+5 XP)"
            rows={3}
            className="cyber-input resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-cyber-muted font-mono">
              {content.length}/500
            </span>
            <button
              type="submit"
              disabled={submitting || !content.trim() || content.length > 500}
              className="btn-primary py-2 text-xs flex items-center gap-2"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Post Comment
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="cyber-card p-4 text-center">
          <p className="text-cyber-muted text-sm font-body">
            <a href="/login" className="text-cyber-cyan hover:underline">Sign in</a> to leave a comment
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading comments..." />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 cyber-card">
          <p className="text-4xl mb-2">💬</p>
          <p className="text-cyber-muted text-sm font-body">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="cyber-card p-4 animate-fade-in-up">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-border flex items-center justify-center text-xs font-bold text-cyber-cyan flex-shrink-0">
                  {comment.profiles?.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold text-cyber-text">
                        {comment.profiles?.username}
                      </span>
                      {comment.profiles?.points !== undefined && (
                        <MiniLevel points={comment.profiles.points} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyber-muted text-xs font-mono">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {user?.id === comment.user_id && (
                        <button
                          onClick={() => handleDelete(comment.id, comment.user_id)}
                          className="text-cyber-muted hover:text-cyber-pink transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-cyber-text text-sm font-body leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
