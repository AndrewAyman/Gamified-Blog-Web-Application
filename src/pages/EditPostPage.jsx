import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PostEditor from '../components/blog/PostEditor'
import { PageLoader } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function EditPostPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts').select('*').eq('id', id).single()

      if (error || !data) { navigate('/'); return }
      if (data.user_id !== user?.id) { navigate('/'); return }

      setPost(data)
      setLoading(false)
    }
    fetchPost()
  }, [id, user, navigate])

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop()
    const filename = `${user.id}-${Date.now()}.${ext}`
    const path = `posts/${filename}`

    const { error } = await supabase.storage
      .from('post-images').upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('post-images').getPublicUrl(path)

    return publicUrl
  }

  const handleSubmit = async ({ title, content, tags, imageFile, existingImageUrl }) => {
    setSaving(true)
    try {
      let imageUrl = existingImageUrl || ''

      if (imageFile) {
        // Remove old image if exists
        if (post.image_url) {
          const oldPath = `posts/${post.image_url.split('/').pop()}`
          await supabase.storage.from('post-images').remove([oldPath])
        }
        imageUrl = await uploadImage(imageFile)
      } else if (!existingImageUrl && post.image_url) {
        // User removed image
        const oldPath = `posts/${post.image_url.split('/').pop()}`
        await supabase.storage.from('post-images').remove([oldPath])
        imageUrl = ''
      }

      const { error } = await supabase.from('posts').update({
        title,
        content,
        tags,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }).eq('id', id)

      if (error) throw error

      toast.success('Post updated!')
      navigate(`/post/${id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-cyber-text tracking-wider">
          ✏️ Edit Post
        </h1>
        <p className="text-cyber-muted text-sm font-mono mt-1">
          Update your post content
        </p>
      </div>

      <div className="cyber-card p-6">
        <PostEditor
          initialData={post}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>
    </div>
  )
}
