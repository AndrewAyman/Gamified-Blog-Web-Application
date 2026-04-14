import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { awardXP, XP } from '../lib/gamification'
import { useAuth } from '../context/AuthContext'
import { useXP } from '../context/XPContext'
import PostEditor from '../components/blog/PostEditor'
import toast from 'react-hot-toast'

export default function CreatePostPage() {
  const { user, refreshProfile } = useAuth()
  const { showXP } = useXP()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop()
    const filename = `${user.id}-${Date.now()}.${ext}`
    const path = `posts/${filename}`
    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw new Error(`Image upload failed: ${error.message}`)
    const { data: { publicUrl } } = supabase.storage
      .from('post-images').getPublicUrl(path)
    return publicUrl
  }

  const handleSubmit = async ({ title, content, tags, imageFile }) => {
    setLoading(true)
    try {
      // Step 1: Upload image (optional)
      let imageUrl = ''
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile)
        } catch (imgErr) {
          console.warn('Image upload failed, continuing without image:', imgErr)
          toast.error('Image upload failed — post will be saved without image')
        }
      }

      // Step 2: Insert the post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          tags,
          image_url: imageUrl,
          user_id: user.id,
          likes_count: 0,
          comments_count: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (postError) throw new Error(`Failed to save post: ${postError.message}`)

      // Step 3: Award XP + update counters — all non-blocking, failures won't crash the page
      try {
        await awardXP(user.id, XP.CREATE_POST, 'Created a post')
      } catch (e) { console.warn('awardXP failed:', e) }

      try {
        await supabase.rpc('increment_posts_created', { uid: user.id })
      } catch (e) { console.warn('increment_posts_created failed:', e) }

      // Step 4: Night Owl badge check (silent)
      try {
        const hour = new Date().getHours()
        if (hour >= 0 && hour < 5) {
          const { data: nightBadge } = await supabase
            .from('badges').select('id').eq('name', 'Night Owl').single()
          if (nightBadge) {
            await supabase.from('user_badges').upsert(
              { user_id: user.id, badge_id: nightBadge.id },
              { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
            )
          }
        }
      } catch (e) { /* silent */ }

      // Step 5: Show reward and navigate
      showXP(XP.CREATE_POST, window.innerWidth / 2, 200)
      toast.success(`🚀 Post published! +${XP.CREATE_POST} XP`)

      try { await refreshProfile() } catch (e) { /* non-critical */ }

      navigate(`/post/${post.id}`)
    } catch (err) {
      console.error('CreatePost error:', err)
      toast.error(err.message || 'Failed to create post. Please try again.')
      setLoading(false)  // Only reset on error; navigation handles success case
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-cyber-text tracking-wider">
          ✍️ Create Post
        </h1>
        <p className="text-cyber-muted text-sm font-mono mt-1">
          Share your knowledge and earn <span className="text-cyber-green font-bold">+{XP.CREATE_POST} XP</span>
        </p>
      </div>

      <div className="cyber-card p-4 mb-6 border-cyber-green/20 bg-cyber-green/5">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-cyber-green text-xs font-mono font-bold">XP TIP</p>
            <p className="text-cyber-muted text-xs font-body mt-0.5">
              Publishing earns <strong className="text-cyber-green">+10 XP</strong>.
              Get 100 likes to unlock the <strong className="text-cyber-yellow">Popular Creator</strong> badge!
            </p>
          </div>
        </div>
      </div>

      <div className="cyber-card p-6">
        <PostEditor onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}
