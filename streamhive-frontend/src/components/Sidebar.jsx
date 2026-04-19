import { NavLink } from 'react-router-dom';
import { Home, Clock, ThumbsUp, PlaySquare, ListVideo, LayoutDashboard, Upload, Settings, Tv2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const GUEST_LINKS = [
  { to: '/', icon: <Home size={18}/>, label: 'Home' },
];

const AUTH_LINKS = [
  { to: '/',         icon: <Home size={18}/>,          label: 'Home' },
  { to: '/history',  icon: <Clock size={18}/>,          label: 'Watch History' },
  { to: '/liked',    icon: <ThumbsUp size={18}/>,       label: 'Liked Videos' },
  { to: '/playlists',icon: <ListVideo size={18}/>,      label: 'Playlists' },
  { label: 'Creator', divider: true },
  { to: '/upload',   icon: <Upload size={18}/>,         label: 'Upload Video' },
  { to: '/dashboard',icon: <LayoutDashboard size={18}/>,label: 'Dashboard' },
  { label: 'Account', divider: true },
  { to: '/settings', icon: <Settings size={18}/>,       label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const links = user ? AUTH_LINKS : GUEST_LINKS;

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 90, display: 'none',
        }} className="show-mobile" />
      )}

      <aside style={{
        position: 'fixed', top: 'var(--navbar-h)', left: 0, bottom: 0,
        width: 'var(--sidebar-w)', background: 'var(--bg-base)',
        borderRight: '1px solid var(--border)', overflowY: 'auto',
        padding: '16px 12px', transition: 'transform 0.3s ease',
        zIndex: 95,
        transform: open ? 'translateX(0)' : undefined,
      }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map((item, i) => {
            if (item.divider) return (
              <div key={i} style={{ margin: '16px 0 8px', paddingLeft: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {item.label}
                </span>
              </div>
            );
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.style.background.includes('accent-dim')) {
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  const isActive = e.currentTarget.className?.includes('active');
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div style={{ position: 'absolute', bottom: 20, left: 12, right: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
            background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)',
            border: '1px solid #f5a62333',
          }}>
            <Tv2 size={16} style={{ color: 'var(--accent)' }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Syne' }}>StreamHive</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>v1.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

