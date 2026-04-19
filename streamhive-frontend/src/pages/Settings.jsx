import { useState, useRef } from 'react';
import { Camera, ImagePlus, Save, Lock, User, CheckCircle } from 'lucide-react';
import { authAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../components/Toast.jsx';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const avatarRef  = useRef();
  const coverRef   = useRef();

  const [tab, setTab] = useState('profile');

  // Profile form
  const [profile, setProfile] = useState({ fullName: user?.fullname || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [savingPass, setSavingPass] = useState(false);

  // Avatar
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Cover
  const [coverFile, setCoverFile]     = useState(null);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || '');
  const [savingCover, setSavingCover] = useState(false);

  const handleAvatarPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.fullName.trim() || !profile.email.trim()) { toast.error('All fields required'); return; }
    setSavingProfile(true);
    try {
      const { data } = await authAPI.updateAccount({ fullName: profile.fullName, email: profile.email });
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSavingProfile(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPass(true);
    try {
      await authAPI.changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
      setPasswords({ oldPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally { setSavingPass(false); }
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    const fd = new FormData();
    fd.append('avatar', avatarFile);
    try {
      const { data } = await authAPI.updateAvatar(fd);
      updateUser(data.data);
      setAvatarFile(null);
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar update failed');
    } finally { setSavingAvatar(false); }
  };

  const saveCover = async () => {
    if (!coverFile) return;
    setSavingCover(true);
    const fd = new FormData();
    fd.append('coverImage', coverFile);
    try {
      const { data } = await authAPI.updateCoverImage(fd);
      updateUser(data.data);
      setCoverFile(null);
      toast.success('Cover image updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cover update failed');
    } finally { setSavingCover(false); }
  };

  const TABS = [
    { key: 'profile',  label: 'Profile',       icon: <User size={15}/> },
    { key: 'password', label: 'Password',       icon: <Lock size={15}/> },
    { key: 'images',   label: 'Profile Images', icon: <Camera size={15}/> },
  ];

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Account Settings</h1>
        <p>Manage your StreamHive profile and security</p>
      </div>

      {/* User summary card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
      }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent)', background: 'var(--accent)', display:'flex',alignItems:'center',justifyContent:'center', flexShrink: 0 }}>
          {user?.avatar
            ? <img src={user.avatar} alt={user.fullname} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
            : <span style={{ fontSize: 20, fontWeight: 800, color:'#07070f' }}>{user?.fullname?.[0]?.toUpperCase()}</span>
          }
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, fontFamily: 'Syne' }}>{user?.fullname}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>@{user?.username}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>
        <div className="badge badge-amber" style={{ marginLeft: 'auto' }}>Active</div>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card" style={{ padding: '28px 24px' }}>
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                placeholder="Your full name" required className="input-field"/>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" required className="input-field"/>
            </div>
            <div className="form-group">
              <label>Username</label>
              <input value={user?.username || ''} disabled className="input-field"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}/>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Username cannot be changed.</p>
            </div>
            <button type="submit" disabled={savingProfile} className="btn btn-primary">
              {savingProfile ? 'Saving…' : <><Save size={15}/> Save Profile</>}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="card" style={{ padding: '28px 24px' }}>
          <form onSubmit={savePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={passwords.oldPassword}
                onChange={e => setPasswords(p => ({ ...p, oldPassword: e.target.value }))}
                placeholder="Enter current password" required className="input-field"/>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={passwords.newPassword}
                onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="At least 6 characters" required className="input-field"/>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat new password" required className="input-field"
                  style={{ paddingRight: 44 }}/>
                {passwords.confirm && passwords.confirm === passwords.newPassword && (
                  <CheckCircle size={18} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--success)' }}/>
                )}
              </div>
            </div>
            <button type="submit" disabled={savingPass} className="btn btn-primary">
              {savingPass ? 'Changing…' : <><Lock size={15}/> Change Password</>}
            </button>
          </form>
        </div>
      )}

      {/* Images Tab */}
      {tab === 'images' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Avatar */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Profile Avatar</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--border)', background: 'var(--bg-elevated)', display:'flex',alignItems:'center',justifyContent:'center', flexShrink: 0, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onClick={() => avatarRef.current.click()}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="Avatar" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                  : <Camera size={28} style={{ color:'var(--text-muted)' }}/>
                }
              </div>
              <div>
                <button onClick={() => avatarRef.current.click()} className="btn btn-secondary btn-sm" style={{ marginBottom: 8, display: 'block' }}>
                  <Camera size={14}/> Choose Avatar
                </button>
                {avatarFile && (
                  <button onClick={saveAvatar} disabled={savingAvatar} className="btn btn-primary btn-sm">
                    {savingAvatar ? 'Uploading…' : <><Save size={14}/> Save Avatar</>}
                  </button>
                )}
                <p style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 8 }}>JPG, PNG. Recommended 400×400.</p>
              </div>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarPick}/>
          </div>

          {/* Cover Image */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, marginBottom:16 }}>Cover Image</h3>
            <div style={{ aspectRatio:'16/9', borderRadius:'var(--radius-md)', overflow:'hidden', background:'var(--bg-elevated)', cursor:'pointer', border:'2px dashed var(--border)', transition:'border-color 0.2s', marginBottom:16 }}
              onClick={() => coverRef.current.click()}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {coverPreview
                ? <img src={coverPreview} alt="Cover" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                : <div style={{ width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,color:'var(--text-muted)' }}>
                    <ImagePlus size={32}/><span style={{fontSize:14}}>Click to upload cover image</span>
                  </div>
              }
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={() => coverRef.current.click()} className="btn btn-secondary btn-sm">
                <ImagePlus size={14}/> Choose Cover
              </button>
              {coverFile && (
                <button onClick={saveCover} disabled={savingCover} className="btn btn-primary btn-sm">
                  {savingCover ? 'Uploading…' : <><Save size={14}/> Save Cover</>}
                </button>
              )}
            </div>
            <p style={{ fontSize:12,color:'var(--text-muted)',marginTop:10 }}>Recommended 1280×360px or wider.</p>
            <input ref={coverRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleCoverPick}/>
          </div>
        </div>
      )}
    </div>
  );
}
