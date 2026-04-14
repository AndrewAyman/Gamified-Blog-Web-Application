import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/blog/PostCard";
import { SkeletonCard } from "../components/ui/LoadingSpinner";
import LevelProgress from "../components/gamification/LevelProgress";
import { PenSquare, TrendingUp, Clock, Search, X, Filter } from "lucide-react";

const POPULAR_TAGS = [
  "webdev",
  "react",
  "javascript",
  "tutorial",
  "css",
  "typescript",
  "python",
  "design",
];
const SORTS = [
  { id: "new", label: "Latest", icon: Clock },
  { id: "top", label: "Top", icon: TrendingUp },
];

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("new");

  const searchQuery = searchParams.get("search") || "";
  const activeTag = searchParams.get("tag") || "";

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("posts").select(`
          *,
          profiles(username, points),
          likes(user_id)
        `);

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`,
        );
      }

      if (activeTag) {
        query = query.contains("tags", [activeTag]);
      }

      if (sort === "top") {
        query = query.order("likes_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      query = query.limit(30);

      const { data, error } = await query;
      if (error) throw error;

      // Add user_likes array for like state tracking
      const enriched = (data || []).map((post) => ({
        ...post,
        user_likes: (post.likes || []).map((l) => l.user_id),
        comments_count: post.comments_count || 0,
      }));

      setPosts(enriched);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTag, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLikeUpdate = (postId, newCount, liked) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newLikes = liked
          ? [...(p.user_likes || []), user?.id]
          : (p.user_likes || []).filter((id) => id !== user?.id);
        return { ...p, likes_count: newCount, user_likes: newLikes };
      }),
    );
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-cyber-text tracking-wider">
                {searchQuery
                  ? `Search: "${searchQuery}"`
                  : activeTag
                    ? `#${activeTag}`
                    : "// FEED"}
              </h1>
              {!loading && (
                <p className="text-cyber-muted text-xs font-mono mt-0.5">
                  {posts.length} post{posts.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="flex items-center bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
                {SORTS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSort(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-display tracking-wider transition-all duration-200
                      ${sort === id ? "bg-cyber-cyan/15 text-cyber-cyan" : "text-cyber-muted hover:text-cyber-text"}`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Clear filters */}
              {(searchQuery || activeTag) && (
                <button
                  onClick={clearFilters}
                  className="btn-ghost py-1.5 text-xs flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active filters */}
          {(searchQuery || activeTag) && (
            <div className="flex items-center gap-2 py-2">
              <Filter className="w-3.5 h-3.5 text-cyber-muted" />
              {searchQuery && (
                <span className="badge-tag flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  {searchQuery}
                </span>
              )}
              {activeTag && (
                <span className="badge-tag flex items-center gap-1">
                  # {activeTag}
                </span>
              )}
            </div>
          )}

          {/* Posts grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="cyber-card p-12 text-center">
              <p className="text-5xl mb-4">📭</p>
              <h3 className="font-display text-lg font-bold text-cyber-text mb-2">
                {searchQuery || activeTag ? "No posts found" : "No posts yet"}
              </h3>
              <p className="text-cyber-muted text-sm font-body mb-6">
                {searchQuery || activeTag
                  ? "Try different search terms or clear the filter"
                  : "Be the first to write something!"}
              </p>
              {user && !searchQuery && !activeTag && (
                <Link
                  to="/create"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <PenSquare className="w-4 h-4" />
                  Write First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDelete}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* User XP Card */}
          {user && profile && (
            <div className="cyber-card p-5">
              <p className="font-display text-xs font-bold text-cyber-muted tracking-widest uppercase mb-3">
                Your Progress
              </p>
              <LevelProgress points={profile.points} />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  {
                    label: "Posts",
                    value: profile.posts_created || 0,
                    color: "#00d4ff",
                  },
                  {
                    label: "Comments",
                    value: profile.comments_made || 0,
                    color: "#7c3aed",
                  },
                  {
                    label: "Streak",
                    value: `${profile.login_streak || 0}🔥`,
                    color: "#ff6b35",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-cyber-surface rounded-lg p-2">
                    <p
                      className="font-mono text-sm font-bold"
                      style={{ color }}
                    >
                      {value}
                    </p>
                    <p className="text-cyber-muted text-xs font-body">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                to="/create"
                className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-2.5"
              >
                <PenSquare className="w-4 h-4" />
                Write Post (+10 XP)
              </Link>
            </div>
          )}

          {/* Popular tags */}
          <div className="cyber-card p-5">
            <p className="font-display text-xs font-bold text-cyber-muted tracking-widest uppercase mb-3">
              Popular Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchParams({ tag })}
                  className={`badge-tag cursor-pointer transition-all hover:bg-cyber-cyan/20
                    ${activeTag === tag ? "bg-cyber-cyan/20 border-cyber-cyan/40" : ""}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard teaser */}
          <div className="cyber-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-xs font-bold text-cyber-muted tracking-widest uppercase">
                Top Writers
              </p>
              <Link
                to="/leaderboard"
                className="text-cyber-cyan text-xs font-mono hover:underline"
              >
                View All →
              </Link>
            </div>
            <TopWritersWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

function TopWritersWidget() {
  const [writers, setWriters] = useState([]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, username, points, level")
      .order("points", { ascending: false })
      .limit(5)
      .then(({ data }) => setWriters(data || []));
  }, []);

  const MEDALS = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-2">
      {writers.map((w, i) => (
        <Link
          key={w.id}
          to={`/profile/${w.id}`}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-cyber-surface transition-colors group"
        >
          <span className="text-sm w-5 text-center">
            {MEDALS[i] || `#${i + 1}`}
          </span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/30 border border-cyber-border flex items-center justify-center text-[10px] font-bold text-cyber-cyan">
            {w.username?.[0]?.toUpperCase()}
          </div>
          <span className="flex-1 text-xs font-display text-cyber-text truncate group-hover:text-cyber-cyan transition-colors">
            {w.username}
          </span>
          <span className="text-xs font-mono text-cyber-yellow">
            {w.points?.toLocaleString()}
          </span>
        </Link>
      ))}
    </div>
  );
}
