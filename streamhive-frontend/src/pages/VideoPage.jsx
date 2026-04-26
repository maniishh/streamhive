import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, Share2, Bell, BellOff, Trash2, Edit2, Send, Play, X, Copy, Check, Link2 } from 'lucide-react';
import { videoAPI, commentAPI, likeAPI, subscriptionAPI, formatViews, formatDuration, timeAgo } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../components/Toast.jsx';
import VideoCard from '../components/VideoCard.jsx';

// ─── NO import of ShareModal from components — it lives at the bottom of this file ───

export default function VideoPage() {
  const { videoId } = useParams();
  const { user }    = useAuth();

  const [video, setVideo]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [liked, setLiked]               = useState(false);
  const [likeCount, setLikeCount]       = useState(0);
  const [subscribed, setSubscribed]     = useState(false);
  const [comments, setComments]         = useState([]);
  const [commentText, setCommentText]   = useState('');
  const [editId, setEditId]             = useState(null);
  const [editText, setEditText]         = useState('');
  const [related, setRelated]           = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showShare, setShowShare]       = useState(false);   // ← single share state
  const [linkCopied, setLinkCopied]     = useState(false);   // ← single copy state

  useEffect(() => {
    fetchVideo();
    fetchRelated();
  }, [videoId]);

  const fetchVideo = async () => {
    setLoading(true);
    try {
      const { data } = await videoAPI.getById(videoId);
      setVideo(data.data);
      fetchComments();
    } catch (err) {
      toast.error('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await commentAPI.getVideoComments(videoId);
      const commentsList = Array.isArray(data.data) ? data.data : data.data?.docs || [];
      setComments(commentsList);
    } catch {}
  };

  const fetchRelated = async () => {
    try {
      const { data } = await videoAPI.getAll({ limit: 8 });
      setRelated((data.data || []).filter(v => v._id !== videoId));
    } catch {}
  };

  const handleLike = async () => {
    if (!user) { toast.warning('Sign in to like videos'); return; }
    try {
      await likeAPI.toggleVideoLike(videoId);
      setLiked(v => !v);
      setLikeCount(c => liked ? c - 1 : c + 1);
    } catch { toast.error('Failed to toggle like'); }
  };

  const handleSubscribe = async () => {
    if (!user) { toast.warning('Sign in to subscribe'); return; }
    if (!video?.owner?._id) return;
    try {
      await subscriptionAPI.toggleSubscription(video.owner._id);
      setSubscribed(v => !v);
      toast.success(subscribed ? 'Unsubscribed' : 'Subscribed!');
    } catch { toast.error('Failed to update subscription'); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) { toast.warning('Sign in to comment'); return; }
    try {
      await commentAPI.addComment(videoId, { content: commentText });
      setCommentText('');
      fetchComments();
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
  };

  const saveEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await commentAPI.updateComment(commentId, { content: editText });
      setEditId(null);
      fetchComments();
      toast.success('Comment updated');
    } catch { toast.error('Failed to update comment'); }
  };

  const deleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentAPI.deleteComment(commentId);
      fetchComments();
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete comment'); }
  };

  // ── Share handlers ──
  const openShare = () => setShowShare(true);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      toast.error('Could not copy link');
    }
  };

  if (loading) return (
    <div className="spinner-wrap" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!video) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <Play size={64} />
      <h3>Video not found</h3>
      <p>This video may have been removed or made private.</p>
    </div>
  );

  const owner = video.owner || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

      {/* Left: Player + info */}
      <div style={{ minWidth: 0 }}>

        {/* Video player */}
        <div style={{
          aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', marginBottom: 20,
          boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
        }}>
          <video
            src={video.videoFile}
            poster={video.thumbnail}
            controls
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 700, marginBottom: 14, lineHeight: 1.3 }}>
          {video.title}
        </h1>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to={`/channel/${owner.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              {owner.avatar
                ? <img src={owner.avatar} alt={owner.fullName} className="avatar" style={{ width: 42, height: 42 }} />
                : <div className="avatar" style={{ width: 42, height: 42, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#07070f', fontSize: 16 }}>
                    {owner.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
              }
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{owner.fullName || owner.username}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{owner.username}</p>
              </div>
            </Link>
            <button onClick={handleSubscribe} className={`btn btn-sm ${subscribed ? 'btn-secondary' : 'btn-primary'}`}>
              {subscribed ? <><BellOff size={14}/> Subscribed</> : <><Bell size={14}/> Subscribe</>}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={handleLike} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
              borderRadius: 999, border: '1px solid var(--border)',
              background: liked ? 'var(--accent-dim)' : 'var(--bg-elevated)',
              color: liked ? 'var(--accent)' : 'var(--text-secondary)',
              fontFamily: 'DM Sans', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} />
              {likeCount > 0 && formatViews(likeCount)}
              {' '}Like
            </button>

            {/* Share button — calls openShare */}
            <button onClick={openShare} className="btn btn-secondary btn-sm">
              <Share2 size={14}/> Share
            </button>
          </div>
        </div>

        {/* Stats + description */}
        <div style={{
          background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
          padding: '16px 20px', marginBottom: 24,
        }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {formatViews(video.views)} views · {timeAgo(video.createdAt)} · {formatDuration(video.duration)}
          </p>
          <p style={{
            fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
            maxHeight: descExpanded ? 'none' : '4.8em',
            overflow: descExpanded ? 'visible' : 'hidden',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {video.description}
          </p>
          {video.description?.length > 200 && (
            <button onClick={() => setDescExpanded(v => !v)} style={{
              background: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600,
              marginTop: 6, cursor: 'pointer', fontFamily: 'DM Sans',
            }}>
              {descExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Comments */}
        <div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </h2>

          {user && (
            <form onSubmit={submitComment} style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'flex-start' }}>
              <div className="avatar" style={{
                width: 36, height: 36, background: 'var(--accent)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: '#07070f', overflow: 'hidden',
              }}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.fullname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user.fullname?.[0]?.toUpperCase()
                }
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  rows={2}
                  className="input-field"
                  style={{ resize: 'vertical', minHeight: 56 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" disabled={!commentText.trim()} className="btn btn-primary btn-sm">
                    <Send size={14}/> Post
                  </button>
                </div>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {comments.map(c => {
              const cOwner = c.owner || {};
              const isOwner = user && (user._id === cOwner._id || user._id === c.owner);
              return (
                <div key={c._id} style={{ display: 'flex', gap: 12 }}>
                  <Link to={`/channel/${cOwner.username}`}>
                    <div className="avatar" style={{
                      width: 36, height: 36, background: 'var(--bg-elevated)',
                      flexShrink: 0, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', overflow: 'hidden',
                    }}>
                      {cOwner.avatar
                        ? <img src={cOwner.avatar} alt={cOwner.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{cOwner.username?.[0]?.toUpperCase() || '?'}</span>
                      }
                    </div>
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{cOwner.fullName || cOwner.username || 'User'}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    {editId === c._id
                      ? (
                        <div>
                          <textarea value={editText} onChange={e => setEditText(e.target.value)}
                            rows={2} className="input-field" style={{ resize: 'vertical', marginBottom: 8 }} />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => saveEdit(c._id)} className="btn btn-primary btn-sm">Save</button>
                            <button onClick={() => setEditId(null)} className="btn btn-ghost btn-sm">Cancel</button>
                          </div>
                        </div>
                      )
                      : <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, wordBreak: 'break-word' }}>{c.content}</p>
                    }
                  </div>
                  {isOwner && editId !== c._id && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => { setEditId(c._id); setEditText(c.content); }}
                        className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                        <Edit2 size={13}/>
                      </button>
                      <button onClick={() => deleteComment(c._id)}
                        className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--error)' }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {comments.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Related */}
      <aside style={{ position: 'sticky', top: 20 }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>
          Up Next
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {related.slice(0, 7).map(v => (
            <RelatedCard key={v._id} video={v} />
          ))}
        </div>
      </aside>

      {/* ── Single ShareModal instance ── */}
      {showShare && (
        <ShareModal
          url={window.location.href}
          title={video?.title || ''}
          onClose={() => setShowShare(false)}
          onCopy={copyLink}
          copied={linkCopied}
        />
      )}

      <style>{`
        @media (max-width: 1100px) {
          aside { display: none; }
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── RelatedCard ── */
function RelatedCard({ video }) {
  const owner = video.owner || {};
  return (
    <Link to={`/watch/${video._id}`} style={{ display: 'flex', gap: 10, textDecoration: 'none' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <div style={{ width: 140, flexShrink: 0, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
        {video.thumbnail && <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 4 }}>
          {video.title}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{owner.fullName || owner.username}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatViews(video.views)} views</p>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   ShareModal — exactly ONE declaration here
   ───────────────────────────────────────────── */
function ShareModal({ url, title, onClose, onCopy, copied }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const encodedUrl   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const platforms = [
    {
      name: 'WhatsApp',
      icon: (
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#25D366"/>
          <path d="M22.9 19.07c-.31-.15-1.84-.91-2.13-1.01-.28-.1-.49-.15-.7.15-.2.3-.79 1.01-.97 1.22-.18.2-.36.23-.67.08-.31-.15-1.31-.48-2.5-1.54-.92-.82-1.55-1.83-1.73-2.14-.18-.31-.02-.47.14-.63.14-.14.31-.36.47-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.03-.54-.08-.15-.7-1.69-.96-2.31-.25-.6-.5-.52-.7-.53-.18-.01-.38-.01-.59-.01s-.54.08-.82.38c-.28.3-1.08 1.05-1.08 2.56s1.1 2.97 1.26 3.17c.15.2 2.17 3.31 5.26 4.64.74.32 1.31.51 1.76.65.74.23 1.41.2 1.94.12.59-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.28-.2-.59-.36z" fill="white"/>
        </svg>
      ),
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Telegram',
      icon: (
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#229ED9"/>
          <path d="M23.5 9.5l-3.25 15.25c-.24 1.07-.88 1.33-1.78.83l-4.93-3.63-2.38 2.3c-.26.26-.48.48-.98.48l.35-4.96 9.02-8.15c.39-.35-.08-.54-.61-.19L7.72 18.44 2.9 16.96c-1.05-.33-1.07-1.05.22-1.55l19.05-7.35c.87-.32 1.63.19 1.33 1.44z" fill="white"/>
        </svg>
      ),
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'X / Twitter',
      icon: (
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#000"/>
          <path d="M17.87 14.74L23.56 8h-1.35l-4.94 5.74L13.1 8H8.5l5.97 8.69L8.5 24h1.35l5.22-6.07L19.5 24H24l-6.13-9.26zm-1.85 2.15-.6-.86-4.8-6.87h2.07l3.88 5.55.6.86 5.04 7.21h-2.07l-4.12-5.89z" fill="white"/>
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'Facebook',
      icon: (
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#1877F2"/>
          <path d="M21.33 16H18v12h-4V16h-2v-4h2v-2.42C14 7.48 15.19 6 18.27 6H21v4h-1.89c-.66 0-.11.74-.11 1.26V12h3l-1.67 4z" fill="white"/>
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Reddit',
      icon: (
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#FF4500"/>
          <path d="M27 16c0-1.38-1.12-2.5-2.5-2.5-.62 0-1.18.22-1.62.58C21.4 13.1 19.3 12.54 17 12.43l.9-4.24 2.93.62a1.75 1.75 0 103.43.19l-3.37-.7-1.1 5.17c-2.27.14-4.34.7-5.8 1.66A2.5 2.5 0 108.5 19a4.62 4.62 0 000 .5c0 3.04 3.58 5.5 8 5.5s8-2.46 8-5.5c0-.17-.02-.34-.05-.5A2.49 2.49 0 0027 16zm-14.5 2a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm8 4.25c-1.03.53-2.24.75-4 .75s-2.97-.22-4-.75a.37.37 0 01.4-.62c.88.45 1.97.63 3.6.63s2.72-.18 3.6-.63a.37.37 0 01.4.62zM20.5 19a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="white"/>
        </svg>
      ),
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: 'Email',
      icon: (
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#6B7280"/>
          <path d="M8 11.5A1.5 1.5 0 019.5 10h13A1.5 1.5 0 0124 11.5v9A1.5 1.5 0 0122.5 22h-13A1.5 1.5 0 018 20.5v-9zm2 .5l6 4.5L22 12v-.5H10V12zm0 2.28V20h12v-6.22L16 18.5l-6-4.22z" fill="white"/>
        </svg>
      ),
      href: `mailto:?subject=${encodedTitle}&body=Check%20this%20out%3A%20${encodedUrl}`,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.72)',
          zIndex: 1000,
          backdropFilter: 'blur(6px)',
          animation: 'shFadeIn 0.18s ease',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '92%', maxWidth: 480,
        background: 'var(--bg-card, #13131f)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.75)',
        animation: 'shSlideUp 0.24s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border, rgba(255,255,255,0.07))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--accent-dim, rgba(245,166,35,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Share2 size={17} style={{ color: 'var(--accent, #f5a623)' }} />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text-primary, #fff)' }}>
              Share Video
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-elevated, rgba(255,255,255,0.06))',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted, #888)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated, rgba(255,255,255,0.06))'}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 26px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted, #666)', marginBottom: 14 }}>
            Share to
          </p>

          {/* Platform grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            {platforms.map(p => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 8, padding: '14px 10px', borderRadius: 14,
                  background: 'var(--bg-elevated, rgba(255,255,255,0.04))',
                  border: '1px solid var(--border, rgba(255,255,255,0.06))',
                  textDecoration: 'none',
                  transition: 'transform 0.15s ease, background 0.15s ease, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'var(--bg-elevated, rgba(255,255,255,0.04))';
                  e.currentTarget.style.borderColor = 'var(--border, rgba(255,255,255,0.06))';
                }}
              >
                {p.icon}
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #aaa)' }}>
                  {p.name}
                </span>
              </a>
            ))}
          </div>

          {/* Copy link */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted, #666)', marginBottom: 10 }}>
            Or copy link
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-input, rgba(255,255,255,0.05))',
            border: '1px solid var(--border, rgba(255,255,255,0.1))',
            borderRadius: 12, padding: '10px 14px',
          }}>
            <Link2 size={14} style={{ color: 'var(--text-muted, #666)', flexShrink: 0 }} />
            <span style={{
              flex: 1, fontSize: 13, color: 'var(--text-secondary, #aaa)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {url}
            </span>
            <button
              onClick={onCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 8, border: 'none',
                background: copied ? '#22c55e' : 'var(--accent, #f5a623)',
                color: copied ? '#fff' : '#07070f',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', flexShrink: 0,
                transition: 'background 0.25s, color 0.25s',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes shSlideUp {
          from { opacity:0; transform:translate(-50%,calc(-50% + 28px)) scale(0.97) }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1) }
        }
      `}</style>
    </>
  );
}
