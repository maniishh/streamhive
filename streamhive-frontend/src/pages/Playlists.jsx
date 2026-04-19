import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListVideo, Plus, Trash2, Edit2, X, Video, Lock } from 'lucide-react';
import { playlistAPI, timeAgo } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../components/Toast.jsx';

export default function Playlists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState({ name: '', description: '' });
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await playlistAPI.getUserPlaylists(user._id);
      setPlaylists(data.data || []);
    } catch { toast.error('Failed to load playlists'); }
    finally { setLoading(false); }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await playlistAPI.create({ name: form.name, description: form.description });
      toast.success('Playlist created!');
      setShowCreate(false);
      setForm({ name: '', description: '' });
      load();
    } catch { toast.error('Failed to create playlist'); }
    finally { setSaving(false); }
  };

  const update = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await playlistAPI.update(editId, { name: form.name, description: form.description });
      toast.success('Playlist updated!');
      setEditId(null);
      setForm({ name: '', description: '' });
      load();
    } catch { toast.error('Failed to update playlist'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await playlistAPI.delete(id);
      setPlaylists(prev => prev.filter(p => p._id !== id));
      toast.success('Playlist deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const startEdit = (p) => {
    setEditId(p._id);
    setForm({ name: p.name, description: p.description || '' });
    setShowCreate(false);
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ListVideo size={18} style={{ color: 'var(--accent)' }}/>
            </div>
            <h1>Your Playlists</h1>
          </div>
          <p>{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowCreate(true); setEditId(null); setForm({ name: '', description: '' }); }} className="btn btn-primary">
          <Plus size={16}/> New Playlist
        </button>
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editId) && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowCreate(false); setEditId(null); } }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? 'Edit Playlist' : 'Create Playlist'}</h2>
              <button onClick={() => { setShowCreate(false); setEditId(null); }} className="btn btn-ghost" style={{ padding: 6 }}>
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={editId ? update : create}>
              <div className="form-group">
                <label>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="My awesome playlist" required className="input-field" autoFocus/>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your playlist…" rows={3} className="input-field" style={{ resize: 'vertical' }}/>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowCreate(false); setEditId(null); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {playlists.length === 0 ? (
        <div className="empty-state">
          <ListVideo size={64}/>
          <h3>No playlists yet</h3>
          <p>Create your first playlist to organize your favourite videos.</p>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ marginTop: 8 }}>
            <Plus size={16}/> Create Playlist
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {playlists.map(p => (
            <div key={p._id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {/* Playlist cover */}
              <div style={{
                aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--bg-elevated), #1a1a3e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              }}>
                <ListVideo size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }}/>
                {p.videos?.length > 0 && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 8, background: 'rgba(7,7,15,0.8)',
                    borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 600,
                  }}>
                    <Video size={11} style={{ display: 'inline', marginRight: 4 }}/>{p.videos.length}
                  </div>
                )}
              </div>

              <div style={{ padding: '16px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, fontFamily: 'Syne' }}>{p.name}</h3>
                {p.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>{p.description}</p>
                )}
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Created {timeAgo(p.createdAt)}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(p)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    <Edit2 size={13}/> Edit
                  </button>
                  <button onClick={() => remove(p._id)} className="btn btn-danger btn-sm">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
