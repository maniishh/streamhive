import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, ThumbsUp, Video, ToggleLeft, ToggleRight, Trash2, Edit2, TrendingUp, BarChart2 } from 'lucide-react';
import { dashboardAPI, videoAPI, formatViews, timeAgo } from '../api/index.js';
import { toast } from '../components/Toast.jsx';

export default function Dashboard() {
  const navigate   = useNavigate();
  const [stats, setStats]   = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, vRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getVideos(),
      ]);
      setStats(sRes.data.data);
      setVideos(vRes.data.data || []);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const togglePublish = async (videoId, current) => {
    try {
      await videoAPI.togglePublish(videoId);
      setVideos(prev => prev.map(v => v._id === videoId ? { ...v, isPublished: !current } : v));
      toast.success(current ? 'Video unpublished' : 'Video published');
    } catch { toast.error('Failed to toggle'); }
  };

  const deleteVideo = async (videoId) => {
    if (!confirm('Permanently delete this video?')) return;
    try {
      await videoAPI.delete(videoId);
      setVideos(prev => prev.filter(v => v._id !== videoId));
      toast.success('Video deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  const STAT_CARDS = [
    { label: 'Total Views',       value: formatViews(stats?.totalViews || 0),       icon: <Eye size={22}/>,       color: '#6c63ff', bg: '#6c63ff22' },
    { label: 'Total Subscribers', value: formatViews(stats?.totalSubscribers || 0), icon: <Users size={22}/>,     color: '#f5a623', bg: '#f5a62322' },
    { label: 'Total Likes',       value: formatViews(stats?.totalLikes || 0),       icon: <ThumbsUp size={22}/>,  color: '#22c55e', bg: '#22c55e22' },
    { label: 'Total Videos',      value: stats?.totalVideos || 0,                   icon: <Video size={22}/>,     color: '#ef4444', bg: '#ef444422' },
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={18} style={{ color: 'var(--accent)' }}/>
          </div>
          <h1>Creator Dashboard</h1>
        </div>
        <p>Track your channel performance and manage your content</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 16,
            transition: 'transform 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = s.color + '44'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne', color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Videos Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} style={{ color: 'var(--accent)' }}/> Your Videos
          </h2>
          <button onClick={() => navigate('/upload')} className="btn btn-primary btn-sm">
            + Upload New
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state">
            <Video size={64}/>
            <h3>No videos uploaded</h3>
            <p>Start sharing your content with the world.</p>
            <button onClick={() => navigate('/upload')} className="btn btn-primary" style={{ marginTop: 8 }}>Upload First Video</button>
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Video', 'Views', 'Likes', 'Status', 'Published', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {videos.map((v, i) => (
                  <tr key={v._id} style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-card)'}
                  >
                    {/* Video thumbnail + title */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 80, aspectRatio: '16/9', borderRadius: 6, overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                          {v.thumbnail && <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240,
                          }}>{v.title}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {v.duration ? `${Math.floor(v.duration/60)}:${String(Math.floor(v.duration%60)).padStart(2,'0')}` : '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>{formatViews(v.views)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>—</td>
                    {/* Status toggle */}
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => togglePublish(v._id, v.isPublished)} style={{
                        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                        cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500,
                        color: v.isPublished ? 'var(--success)' : 'var(--text-muted)',
                        padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {v.isPublished ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                        {v.isPublished ? 'Public' : 'Private'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{timeAgo(v.createdAt)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => navigate(`/watch/${v._id}`)} className="btn btn-ghost btn-sm" style={{ padding: '5px 10px' }}>
                          View
                        </button>
                        <button onClick={() => deleteVideo(v._id)} className="btn btn-danger btn-sm" style={{ padding: '5px 10px' }}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
