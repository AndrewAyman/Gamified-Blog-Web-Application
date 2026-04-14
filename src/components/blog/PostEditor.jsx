import { useState, useRef } from 'react'
import { Upload, X, Tag, Image as ImageIcon } from 'lucide-react'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function PostEditor({ initialData = {}, onSubmit, loading }) {
  const [title, setTitle] = useState(initialData.title || '')
  const [content, setContent] = useState(initialData.content || '')
  const [tags, setTags] = useState(
    Array.isArray(initialData.tags)
      ? initialData.tags.join(', ')
      : initialData.tags || ''
  )
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData.image_url || '')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const handleImageSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleImageSelect(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required')
      return
    }
    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .slice(0, 8)

    onSubmit({ title: title.trim(), content, tags: parsedTags, imageFile, existingImageUrl: initialData.image_url })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase">
          Post Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Write an epic title..."
          className="cyber-input text-lg font-display font-semibold"
          maxLength={120}
        />
        <p className="text-xs text-cyber-muted font-mono text-right">{title.length}/120</p>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5" />
          Cover Image
        </label>

        {imagePreview ? (
          <div className="relative group rounded-xl overflow-hidden border border-cyber-border">
            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-cyber-bg/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview('') }}
                className="btn-danger py-2 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragOver
                ? 'border-cyber-cyan bg-cyber-cyan/5'
                : 'border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-surface'
              }`}
          >
            <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? 'text-cyber-cyan' : 'text-cyber-muted'}`} />
            <p className={`text-sm font-display tracking-wider ${dragOver ? 'text-cyber-cyan' : 'text-cyber-muted'}`}>
              Drop image here or click to upload
            </p>
            <p className="text-xs text-cyber-muted font-mono mt-1">PNG, JPG, WebP — max 5MB</p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleImageSelect(e.target.files[0])}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase">
          Content *
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your post content here... (HTML is supported)"
          rows={14}
          className="cyber-input resize-y font-mono text-sm leading-relaxed"
        />
        <p className="text-xs text-cyber-muted font-mono">
          {content.replace(/<[^>]*>/g, '').length} characters
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" />
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="react, typescript, webdev, tutorial"
          className="cyber-input"
        />
        {tags && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="badge-tag"># {tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            initialData.id ? '💾 Update Post' : '🚀 Publish Post (+10 XP)'
          )}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-ghost py-3 px-6"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
