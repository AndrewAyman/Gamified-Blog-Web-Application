-- ============================================================
-- XP BLOG — COMPLETE SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT,
  username          TEXT UNIQUE NOT NULL,
  avatar_url        TEXT,
  bio               TEXT,
  points            INTEGER NOT NULL DEFAULT 0,
  level             INTEGER NOT NULL DEFAULT 1,
  posts_created     INTEGER NOT NULL DEFAULT 0,
  comments_made     INTEGER NOT NULL DEFAULT 0,
  likes_received    INTEGER NOT NULL DEFAULT 0,
  login_streak      INTEGER NOT NULL DEFAULT 0,
  last_login_date   DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── POSTS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  image_url       TEXT DEFAULT '',
  tags            TEXT[] DEFAULT '{}',
  likes_count     INTEGER NOT NULL DEFAULT 0,
  comments_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COMMENTS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LIKES TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ─── BADGES TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT,
  color       TEXT DEFAULT '#00d4ff',
  condition   TEXT,
  secret      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USER BADGES TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ─── USER MISSIONS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_missions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id   TEXT NOT NULL,
  progress     INTEGER NOT NULL DEFAULT 0,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, mission_id)
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON public.posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON public.user_missions(user_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike (delete own likes)"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT USING (true);

CREATE POLICY "System can insert user badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User missions policies
CREATE POLICY "Users can view own missions"
  ON public.user_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions"
  ON public.user_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions"
  ON public.user_missions FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── HELPER FUNCTIONS ────────────────────────────────────────

-- Increment points
CREATE OR REPLACE FUNCTION increment_points(uid UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET points = GREATEST(0, points + amount),
      updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment posts_created
CREATE OR REPLACE FUNCTION increment_posts_created(uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET posts_created = posts_created + 1, updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement posts_created
CREATE OR REPLACE FUNCTION decrement_posts_created(uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET posts_created = GREATEST(0, posts_created - 1), updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment comments_made
CREATE OR REPLACE FUNCTION increment_comments_made(uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET comments_made = comments_made + 1, updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment likes_received (on post author)
CREATE OR REPLACE FUNCTION increment_likes_received(uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET likes_received = likes_received + 1, updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment comments_count on a post
CREATE OR REPLACE FUNCTION increment_comments_count(pid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = comments_count + 1
  WHERE id = pid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement comments_count on a post
CREATE OR REPLACE FUNCTION decrement_comments_count(pid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE id = pid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── SEED: BADGES ────────────────────────────────────────────
INSERT INTO public.badges (name, description, icon, color, condition, secret) VALUES
  ('First Post',       'Published your first blog post',         '✍️', '#00d4ff', 'posts_created >= 1',      false),
  ('Prolific Writer',  'Published 10 blog posts',                '📚', '#7c3aed', 'posts_created >= 10',     false),
  ('Comment Master',   'Left 50 comments on posts',              '💬', '#00ff88', 'comments_made >= 50',     false),
  ('Popular Creator',  'Received 100 likes on your posts',       '🔥', '#ff006e', 'likes_received >= 100',   false),
  ('Early Adopter',    'One of the first to join the platform',  '🌅', '#ffd60a', 'early_adopter',           false),
  ('XP Hunter',        'Earned 500 total XP',                    '💎', '#00d4ff', 'points >= 500',            false),
  ('Streak Master',    'Maintained a 7-day login streak',        '🔥', '#ff6b35', 'login_streak >= 7',       false),
  ('Night Owl',        'Published a post after midnight',        '🦉', '#4a5568', 'night_post',              true),
  ('Speed Writer',     'Published 3 posts in a single day',      '⚡', '#ffd60a', 'posts_in_day >= 3',       true)
ON CONFLICT (name) DO NOTHING;

-- ─── STORAGE BUCKET ──────────────────────────────────────────
-- Run in Supabase Dashboard → Storage → Create bucket "post-images"
-- Or run this in SQL (requires storage extension):

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('post-images', 'post-images', true)
-- ON CONFLICT DO NOTHING;

-- Storage policies (run in SQL editor after bucket creation):
-- CREATE POLICY "Anyone can view post images"
--   ON storage.objects FOR SELECT USING (bucket_id = 'post-images');

-- CREATE POLICY "Authenticated users can upload post images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can delete own post images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
