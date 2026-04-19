import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Upload, Bell, Menu, X, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 'var(--navbar-h)', background: 'var(--bg-base)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 20px',
      gap: 16, zIndex: 100, backdropFilter: 'blur(12px)',
    }}>
      {/* Left: Logo + hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn-ghost" onClick={onToggleSidebar}
          style={{ padding: 8, borderRadius: 8, display: 'flex' }}>
          <Menu size={22} />
        </button>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: '#07070f',
          }}>S</div>
          <span style={{
            fontFamily: 'Syne', fontWeight: 700, fontSize: 18,
            color: 'var(--text-primary)', letterSpacing: '-0.02em',
          }} className="hide-mobile">StreamHive</span>
        </Link>
      </div>

      {/* Center: Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 560, margin: '0 auto' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{
            position: 'absolute', left: 14, color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search videos, channels…"
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 999, padding: '9px 16px 9px 40px', color: 'var(--text-primary)',
              fontSize: 14, fontFamily: 'DM Sans', transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </form>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {user ? (
          <>
            <Link to="/upload" className="btn btn-primary btn-sm hide-mobile">
              <Upload size={15} /> Upload
            </Link>

            {/* User menu */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(v => !v)} style={{
                width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
                border: '2px solid var(--border-light)', background: 'var(--bg-elevated)',
                cursor: 'pointer', transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
              >
                {user.avatar
                  ? <img src={user.avatar} alt={user.fullname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{
                      width: '100%', height: '100%', background: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14, color: '#07070f',
                    }}>{user.fullname?.[0]?.toUpperCase()}</div>
                }
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, minWidth: 200,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)', padding: 8, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <div style={{ padding: '10px 14px 14px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{user.fullname}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{user.username}</p>
                  </div>
                  {[
                    { to: `/channel/${user.username}`, icon: <User size={15}/>, label: 'My Channel' },
                    { to: '/dashboard',                icon: <LayoutDashboard size={15}/>, label: 'Dashboard' },
                    { to: '/settings',                 icon: <Settings size={15}/>, label: 'Settings' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      color: 'var(--text-secondary)', fontSize: 14, borderRadius: 8,
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                    <button onClick={handleLogout} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', color: 'var(--error)', fontSize: 14,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      borderRadius: 8, fontFamily: 'DM Sans', transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#ef444420'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm hide-mobile">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
