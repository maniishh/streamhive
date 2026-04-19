import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Camera, ImagePlus, Tv2 } from 'lucide-react';
import { authAPI } from '../api/index.js';
import { toast } from '../components/Toast.jsx';

export default function Register() {
  const navigate = useNavigate();
  const avatarRef    = useRef();
  const coverRef     = useRef();

  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '' });
  const [avatar, setAvatar]         = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [cover, setCover]           = useState(null);
  const [coverPreview, setCoverPreview]   = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [step, setStep]             = useState(1); // 1 = info, 2 = images

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const pickAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const pickCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const nextStep = (e) => {
    e.preventDefault();
    const { fullName, email, username, password } = form;
    if (!fullName || !email || !username || !password) { setError('All fields are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!avatar) { setError('Avatar image is required'); return; }
    if (!cover)  { setError('Cover image is required'); return; }
    setError('');
    setLoading(true);

    const fd = new FormData();
    fd.append('fullName', form.fullName);
    fd.append('email', form.email);
    fd.append('username', form.username.toLowerCase());
    fd.append('password', form.password);
    fd.append('avatar', avatar);
    fd.append('coverImage', cover);

    try {
      await authAPI.register(fd);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 24,
      backgroundImage: 'radial-gradient(ellipse at 80% 50%, #f5a62308 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #6c63ff08 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--accent)', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 32px var(--accent-dim)',
          }}>
            <Tv2 size={28} color="#07070f" />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Join StreamHive and start streaming
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= s ? 'var(--accent)' : 'var(--bg-elevated)',
                border: `2px solid ${step >= s ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: step >= s ? '#07070f' : 'var(--text-muted)',
                transition: 'all 0.3s',
              }}>{s}</div>
              <span style={{ fontSize: 13, color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {s === 1 ? 'Account Info' : 'Profile Images'}
              </span>
              {s < 2 && <div style={{ width: 40, height: 1, background: step > s ? 'var(--accent)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '36px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}>
          {error && (
            <div style={{
              background: '#ef444420', border: '1px solid #ef444433',
              borderRadius: 'var(--radius-md)', padding: '12px 16px',
              color: 'var(--error)', fontSize: 14, marginBottom: 20,
            }}>{error}</div>
          )}

          {/* Step 1: Account Info */}
          {step === 1 && (
            <form onSubmit={nextStep}>
              <div className="form-group">
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handle}
                  placeholder="Your full name" required className="input-field" />
              </div>
              <div className="form-group">
                <label>Username</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 15 }}>@</span>
                  <input name="username" value={form.username} onChange={handle}
                    placeholder="yourhandle" required className="input-field"
                    style={{ paddingLeft: 30 }} />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handle}
                  placeholder="you@example.com" required className="input-field" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handle}
                    placeholder="Min. 6 characters" required className="input-field"
                    style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', color: 'var(--text-muted)', display: 'flex',
                  }}>
                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15 }}>
                Continue →
              </button>
            </form>
          )}

          {/* Step 2: Images */}
          {step === 2 && (
            <form onSubmit={submit}>
              {/* Cover image */}
              <div className="form-group">
                <label>Cover Image</label>
                <div style={{
                  position: 'relative', height: 140, borderRadius: 'var(--radius-md)',
                  overflow: 'hidden', border: '2px dashed var(--border)', cursor: 'pointer',
                  background: coverPreview ? 'transparent' : 'var(--bg-input)',
                  transition: 'border-color 0.2s',
                }}
                  onClick={() => coverRef.current.click()}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {coverPreview
                    ? <img src={coverPreview} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--text-muted)' }}>
                        <ImagePlus size={28} />
                        <span style={{ fontSize: 13 }}>Click to upload cover image</span>
                      </div>
                  }
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: coverPreview ? 0 : 0, transition: 'opacity 0.2s',
                  }} />
                </div>
                <input ref={coverRef} type="file" accept="image/*" onChange={pickCover} style={{ display: 'none' }} />
              </div>

              {/* Avatar */}
              <div className="form-group">
                <label>Profile Avatar</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                    border: '3px solid var(--border)', background: 'var(--bg-input)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, cursor: 'pointer', position: 'relative',
                    transition: 'border-color 0.2s',
                  }}
                    onClick={() => avatarRef.current.click()}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {avatarPreview
                      ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Camera size={24} style={{ color: 'var(--text-muted)' }} />
                    }
                  </div>
                  <div>
                    <button type="button" onClick={() => avatarRef.current.click()}
                      className="btn btn-secondary btn-sm" style={{ marginBottom: 6 }}>
                      <Camera size={14} /> {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                    </button>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" onChange={pickAvatar} style={{ display: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary"
                  style={{ flex: 1, padding: '13px' }}>
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary"
                  style={{ flex: 2, padding: '13px', fontSize: 15 }}>
                  {loading
                    ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating…</>
                    : <><UserPlus size={17} /> Create Account</>
                  }
                </button>
              </div>
            </form>
          )}

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
