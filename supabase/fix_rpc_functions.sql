-- ============================================================
-- Run this in Supabase → SQL Editor → New Query → Run
-- These functions are called by the app but may be missing
-- ============================================================

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

-- Increment likes_received on post author
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

-- Increment points safely
CREATE OR REPLACE FUNCTION increment_points(uid UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET points = GREATEST(0, points + amount),
      updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_posts_created(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_posts_created(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_comments_made(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_likes_received(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_comments_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_comments_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_points(UUID, INTEGER) TO authenticated;
