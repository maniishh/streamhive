import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { likeAPI } from '../api/index.js';
import VideoCard from '../components/VideoCard.jsx';
import { toast } from '../components/Toast.jsx';

export default function LikedVideos() {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await likeAPI.getLikedVideos();
        // API may return liked objects with a video field, or direct video objects
        const raw = data.data || [];
        const vids = raw.map(item => item.video || item).filter(Boolean);
        setVideos(vids);
      } catch {
        toast.error('Failed to load liked videos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, background: '#22c55e22', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ThumbsUp size={18} style={{ color: 'var(--success)' }}/>
          </div>
          <h1>Liked Videos</h1>
        </div>
        <p>{videos.length} liked video{videos.length !== 1 ? 's' : ''}</p>
      </div>

      {videos.length === 0 ? (
        <div className="empty-state">
          <ThumbsUp size={64}/>
          <h3>No liked videos</h3>
          <p>Videos you like will appear here. Start exploring and hit that like button!</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map(v => v?._id ? <VideoCard key={v._id} video={v}/> : null)}
        </div>
      )}
    </div>
  );
}
