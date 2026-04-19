import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, Share2, Bell, BellOff, Trash2, Edit2, MoreVertical, Send, Play } from 'lucide-react';
import { videoAPI, commentAPI, likeAPI, subscriptionAPI, formatViews, formatDuration, timeAgo } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../components/Toast.jsx';
import VideoCard from '../components/VideoCard.jsx';

export default function VideoPage() {
  const { videoId } = useParams();
  const { user }    = useAuth();

  const [video, setVideo]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [comments, setComments]     = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editId, setEditId]         = useState(null);
  const [editText, setEditText]     = useState('');
  const [related, setRelated]       = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);

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

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
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
            <button onClick={share} className="btn btn-secondary btn-sm">
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

          {/* Add comment */}
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

          {/* Comment list */}
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

      {/* Responsive: hide aside on mobile */}
      <style>{`
        @media (max-width: 1100px) {
          aside { display: none; }
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

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
