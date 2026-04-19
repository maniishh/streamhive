import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Clock, TrendingUp, Search, SlidersHorizontal } from 'lucide-react';
import { videoAPI } from '../api/index.js';
import VideoCard from '../components/VideoCard.jsx';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest',   icon: <Clock size={15}/> },
  { value: 'views',     label: 'Popular',  icon: <Flame size={15}/> },
  { value: 'title',     label: 'A–Z',      icon: <TrendingUp size={15}/> },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy]   = useState('createdAt');
  const LIMIT = 12;

  const fetchVideos = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const { data } = await videoAPI.getAll({ page: currentPage, limit: LIMIT, query, sortBy });
      const fetched = data.data || [];
      setVideos(prev => reset ? fetched : [...prev, ...fetched]);
      setHasMore(fetched.length === LIMIT);
      if (reset) setPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, sortBy, page]);

  useEffect(() => { fetchVideos(true); }, [query, sortBy]);

  const loadMore = () => {
    setPage(p => p + 1);
    fetchVideos(false);
  };

  return (
    <div>
      {/* Hero / Search banner */}
      {!query && (
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-elevated) 0%, #0f0f22 50%, var(--bg-base) 100%)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
          padding: '40px 32px', marginBottom: 36, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
            background: 'var(--accent-dim)', border: '1px solid #f5a62333',
            borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'var(--accent)',
            marginBottom: 14,
          }}>
            <Flame size={13} /> Trending Now
          </span>
          <h1 style={{
            fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 44px)',
            lineHeight: 1.1, marginBottom: 10, color: 'var(--text-primary)',
          }}>
            Discover Amazing<br />
            <span style={{ color: 'var(--accent)' }}>Stories &amp; Creators</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 460 }}>
            Stream the best videos, follow your favourite creators, and explore what's trending today.
          </p>
        </div>
      )}

      {/* Query heading */}
      {query && (
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={20} style={{ color: 'var(--accent)' }} />
            <h1>Results for <span style={{ color: 'var(--accent)' }}>&ldquo;{query}&rdquo;</span></h1>
          </div>
          <p>{videos.length} video{videos.length !== 1 ? 's' : ''} found</p>
        </div>
      )}

      {/* Sort bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, gap: 12, flexWrap: 'wrap',
      }}>
        {!query && (
          <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700 }}>
            {sortBy === 'createdAt' ? 'Latest Videos' : sortBy === 'views' ? 'Most Popular' : 'All Videos'}
          </h2>
        )}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setSortBy(opt.value)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: sortBy === opt.value ? 'var(--accent)' : 'var(--bg-elevated)',
              color: sortBy === opt.value ? '#07070f' : 'var(--text-secondary)',
              border: '1px solid ' + (sortBy === opt.value ? 'var(--accent)' : 'var(--border)'),
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans',
            }}>
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading && videos.length === 0 ? (
        <div className="video-grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <Search size={64} />
          <h3>No videos found</h3>
          <p>{query ? `No results for "${query}". Try different keywords.` : 'No videos have been published yet.'}</p>
        </div>
      ) : (
        <>
          <div className="video-grid">
            {videos.map(v => <VideoCard key={v._id} video={v} />)}
          </div>

          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
              <button onClick={loadMore} disabled={loading} className="btn btn-secondary"
                style={{ minWidth: 160 }}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Loading…</> : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SkeletonCard() {
  const pulse = {
    background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 8,
  };
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '16/9', ...pulse }} />
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, ...pulse }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: '85%', marginBottom: 8, ...pulse }} />
            <div style={{ height: 14, width: '60%', ...pulse }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
