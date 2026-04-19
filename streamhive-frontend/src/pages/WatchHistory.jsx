import { useState, useEffect } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { authAPI } from '../api/index.js';
import VideoCard from '../components/VideoCard.jsx';
import { toast } from '../components/Toast.jsx';

export default function WatchHistory() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await authAPI.getWatchHistory();
        // Response structure: user[0].watchHistory
        const history = data.data?.[0]?.watchHistory || data.data || [];
        setVideos(history);
      } catch {
        toast.error('Failed to load watch history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} style={{ color: 'var(--accent)' }}/>
            </div>
            <h1>Watch History</h1>
          </div>
          <p>{videos.length} video{videos.length !== 1 ? 's' : ''} watched</p>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="empty-state">
          <Clock size={64}/>
          <h3>No watch history</h3>
          <p>Videos you watch will appear here.</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map(v => <VideoCard key={v._id} video={v}/>)}
        </div>
      )}
    </div>
  );
}
