import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Tv2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../components/Toast.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ emailOrUsername: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isEmail = form.emailOrUsername.includes('@');
      await login({
        [isEmail ? 'email' : 'username']: form.emailOrUsername,
        password: form.password,
      });
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 24,
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, #f5a62308 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #6c63ff08 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
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
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Sign in to your StreamHive account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '36px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}>
          <form onSubmit={submit}>
            {error && (
              <div style={{
                background: '#ef444420', border: '1px solid #ef444433',
                borderRadius: 'var(--radius-md)', padding: '12px 16px',
                color: 'var(--error)', fontSize: 14, marginBottom: 20,
              }}>{error}</div>
            )}

            <div className="form-group">
              <label>Email or Username</label>
              <input
                name="emailOrUsername"
                value={form.emailOrUsername}
                onChange={handle}
                placeholder="you@example.com or @username"
                required
                autoComplete="username"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handle}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="input-field"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', color: 'var(--text-muted)', display: 'flex',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 8 }}>
              {loading
                ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in…</>
                : <><LogIn size={17}/> Sign In</>
              }
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--accent)', fontWeight: 600, textDecoration: 'none',
            }}>Create one free</Link>
          </p>
        </div>

        {/* Decorative blobs */}
        <div style={{
          position: 'fixed', top: '15%', left: '5%', width: 200, height: 200,
          background: 'radial-gradient(circle, var(--accent-dim), transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'fixed', bottom: '15%', right: '5%', width: 240, height: 240,
          background: 'radial-gradient(circle, var(--accent2-dim), transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        }} />
      </div>
    </div>
  );
}
