import { useEffect, useState } from "react";
import { ChevronLeft, Heart, Inbox, Message, UserPlus, UserCheck, Award } from "../Icons.jsx";
import { API, cloudinaryImageUrl } from "../api/client.js";
import { formatDate } from "../lib/format.js";
import { Avatar } from "../components/Avatar.jsx";

function getReputationBadge(likeCount) {
  if (likeCount >= 50) return [{ label: "Top Contributor", class: "top" }];
  if (likeCount >= 10) return [{ label: "Contributor", class: "contributor" }];
  return [{ label: "Newcomer", class: "newcomer" }];
}

/* =====================================================
   PUBLIC PROFILE
   ===================================================== */

function PublicProfile({
  userId,
  currentUser,
  onBack,
  onOpenPost,
  onEditProfile,
}) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setFailed(false);

      try {
        const [profileRes, postsRes, followRes] = await Promise.all([
          fetch(`${API}/users/${userId}/public`),
          fetch(`${API}/users/${userId}/posts`),
          fetch(`${API}/users/${userId}/follow-status`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);

        if (!profileRes.ok) {
          if (!cancelled) setFailed(true);
          return;
        }

        const profileData = await profileRes.json();
        const postsData = postsRes.ok ? await postsRes.json() : [];
        const followData = followRes.ok ? await followRes.json() : {};

        if (cancelled) return;

        setProfile(profileData);
        setPosts(Array.isArray(postsData) ? postsData : []);
        setFollowing(followData.following || false);
        setFollowersCount(followData.followersCount || 0);
        setFollowingCount(followData.followingCount || 0);
      } catch (error) {
        console.error(error);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isOwn = currentUser && currentUser.id === userId;

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${API}/users/${userId}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      setFollowing(data.following);
      setFollowersCount(data.followersCount);
      setFollowingCount(data.followingCount);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="container">
      <div className="pub-bar">
        <button className="btn pub-back" onClick={onBack}>
          <ChevronLeft size={16} /> Back to feed
        </button>
      </div>

      {loading ? (
        <>
          <section className="pub-profile">
            <span className="skeleton avatar avatar-lg" />
            <div className="pub-info">
              <div className="skeleton skeleton-line w40" />
              <div className="skeleton skeleton-line w85" style={{ marginTop: 12 }} />
              <div className="skeleton skeleton-line w65" style={{ marginTop: 10 }} />
            </div>
          </section>
          <div className="pub-grid">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <span className="skeleton pub-tile" key={index} />
            ))}
          </div>
        </>
      ) : failed || !profile ? (
        <div className="empty">
          <span className="empty-icon">
            <Inbox size={28} />
          </span>
          <h3>Profile not found</h3>
          <p>This student may have removed their account.</p>
          <button className="btn btn-accent" onClick={onBack}>
            Back to feed
          </button>
        </div>
      ) : (
        <>
          <section className="pub-profile">
            <Avatar
              name={profile.name}
              image={profile.profile_image}
              size="lg"
            />

            <div className="pub-info">
              <div className="pub-name-row">
                <h1>{profile.name}</h1>
                {isOwn ? (
                  <button className="btn btn-sm" onClick={onEditProfile}>
                    Edit profile
                  </button>
                ) : (
                  <button
                    className={`btn btn-sm${following ? " following" : ""}`}
                    onClick={handleFollow}
                  >
                    {following ? (
                      <>
                        <UserCheck size={14} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} /> Follow
                      </>
                    )}
                  </button>
                )}
              </div>

              {profile.bio ? (
                <p className="pub-bio">{profile.bio}</p>
              ) : (
                <p className="pub-bio pub-bio-muted">
                  {profile.name} hasn't added a bio yet.
                </p>
              )}

              <div className="pub-stats">
                <span>
                  <strong>{profile.post_count}</strong>{" "}
                  {profile.post_count === 1 ? "post" : "posts"}
                </span>
                <span>
                  <strong>{followersCount}</strong>{" "}
                  {followersCount === 1 ? "follower" : "followers"}
                </span>
                <span>
                  <strong>{followingCount}</strong>{" "}
                  {followingCount === 1 ? "following" : "following"}
                </span>
                <span className="pub-joined">
                  Joined {formatDate(profile.created_at)}
                </span>
              </div>

              <div className="pub-badge">
                {getReputationBadge(profile.like_count || 0).map((badge, i) => (
                  <span key={i} className={`reputation-badge ${badge.class}`}>
                    <Award size={12} /> {badge.label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <div className="pub-tabs">
            <span className="pub-tab is-active">Posts</span>
          </div>

          {posts.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">
                <Inbox size={28} />
              </span>
              <h3>No posts yet</h3>
              <p>
                {isOwn
                  ? "Share your first set of notes to get started."
                  : `${profile.name} hasn't shared anything yet.`}
              </p>
            </div>
          ) : (
            <div className="pub-grid">
              {posts.map((post) => (
                <button
                  type="button"
                  className="pub-tile"
                  key={post.id}
                  onClick={() => onOpenPost(post)}
                  aria-label={`Open post: ${post.title}`}
                >
                  {post.image_url ? (
                    <img src={cloudinaryImageUrl(post.image_url, { width: 400, height: 400, crop: "fill", gravity: "auto" })} alt={post.title} loading="lazy" />
                  ) : (
                    <span className="pub-tile-fallback">
                      <span className="tag">{post.subject || "general"}</span>
                      <span className="pub-tile-title">{post.title}</span>
                    </span>
                  )}

                  <span className="pub-tile-stats">
                    <span>
                      <Heart size={15} /> {post.like_count ?? 0}
                    </span>
                    <span>
                      <Message size={15} /> {post.comment_count ?? 0}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default PublicProfile;
