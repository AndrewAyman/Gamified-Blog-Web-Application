# ⚡ XP Blog — Gamified Blogging Platform

A production-ready gamified blog where users earn XP, unlock badges, and compete on a leaderboard. Built with React + Vite + Supabase.

![XP Blog Screenshot](https://via.placeholder.com/1200x600/07070f/00d4ff?text=XP+Blog+%E2%80%94+Gamified+Blogging)

## ✨ Features

| Category | Features |
|----------|----------|
| 🔐 Auth | Sign up / login / logout via Supabase Auth |
| 📝 Blog | Create, edit, delete posts with image upload |
| ❤️ Social | Likes system, comment system, post sharing |
| 🪙 XP | Real-time points for every action |
| 🏅 Badges | 9 badges (7 visible + 2 secret) |
| 🧬 Levels | 6 levels from Initiate → Grandmaster |
| 🏆 Leaderboard | Ranked by XP, posts, likes, comments, streak |
| 🎯 Missions | 6 challenges with bonus XP rewards |
| 🔥 Streaks | Daily login streak tracker |
| 🔍 Search | Full-text post search + tag filtering |
| 📱 Responsive | Mobile-first, works on all devices |

## 🪙 XP System

| Action | XP |
|--------|----|
| Create post | +10 |
| Like a post | +2 |
| Post a comment | +5 |
| Daily login | +3 |
| Delete a post | -5 |

## 🧬 Level Thresholds

| Level | Name | XP Required |
|-------|------|-------------|
| 1 | 🔰 Initiate | 0 |
| 2 | ⚡ Apprentice | 100 |
| 3 | 🔮 Adept | 300 |
| 4 | 🌟 Expert | 600 |
| 5 | 👑 Master | 1000 |
| 6 | 🏆 Grandmaster | 2000 |

---

## 🚀 Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/xp-blog.git
cd xp-blog
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name, password, and region
3. Wait for the project to launch (~2 min)

### 3. Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Paste the entire contents of `supabase/schema.sql`
4. Click **Run**

This creates all tables, RLS policies, indexes, functions, and seeds the badge data.

### 4. Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name it exactly: `post-images`
4. ✅ Check **Public bucket**
5. Click **Save**

Then add storage policies in **SQL Editor**:

```sql
-- Allow anyone to view images
CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT USING (bucket_id = 'post-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Enable Realtime

1. Go to **Database → Replication** in Supabase
2. Enable replication for the `comments` table

### 6. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in **Supabase Dashboard → Settings → API**.

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🚀 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy**

> The `vercel.json` in the project root handles SPA routing automatically.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx     # Route guard
│   ├── blog/
│   │   ├── PostCard.jsx           # Feed card with like/delete
│   │   ├── PostEditor.jsx         # Create/edit form with image upload
│   │   └── CommentSection.jsx     # Realtime comments
│   ├── gamification/
│   │   ├── LevelProgress.jsx      # XP bar + level display
│   │   ├── BadgeCard.jsx          # Badge display (earned/locked)
│   │   └── MissionCard.jsx        # Mission progress tracker
│   ├── layout/
│   │   ├── Layout.jsx             # App shell
│   │   └── Navbar.jsx             # Nav with search + user menu
│   └── ui/
│       ├── LoadingSpinner.jsx      # Spinner, skeleton, page loader
│       └── XPPopupLayer.jsx        # Floating XP animations
├── context/
│   ├── AuthContext.jsx             # Auth state + session management
│   └── XPContext.jsx               # XP popup animations
├── lib/
│   ├── supabase.js                 # Supabase client
│   └── gamification.js            # XP, badges, missions, levels logic
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── FeedPage.jsx               # Main blog feed with filters
│   ├── PostDetailPage.jsx          # Full post + comments
│   ├── CreatePostPage.jsx
│   ├── EditPostPage.jsx
│   ├── ProfilePage.jsx            # Stats, badges, missions tabs
│   ├── LeaderboardPage.jsx        # Top 50 ranked users
│   └── MissionsPage.jsx
├── styles/
│   └── globals.css                 # Tailwind + cyber theme
├── App.jsx                         # Router
└── main.jsx                        # Entry point
```

---

## 🗄️ Database Schema

```
profiles         → User stats (points, level, streaks, counters)
posts            → Blog posts (title, content, image_url, tags)
comments         → Post comments (realtime enabled)
likes            → Post likes (unique per user+post)
badges           → Badge definitions (seeded)
user_badges      → Earned badges per user
user_missions    → Mission progress per user
```

---

## 🔒 Security Notes

- All tables use **Row Level Security (RLS)**
- Users can only modify their own data
- Supabase anon key is safe to expose (RLS enforces access)
- Image uploads are scoped to `posts/{userId}-{timestamp}.ext`
- Never commit `.env` — it's in `.gitignore`

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open a PR

---

## 📄 License

MIT — free to use, modify, and distribute.
