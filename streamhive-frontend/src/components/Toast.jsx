import { useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

let addToast;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360,
      }}>
        {toasts.map(t => (
          <Toast key={t.id} {...t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </>
  );
}

function Toast({ message, type, onClose }) {
  const icon = type === 'success' ? <CheckCircle size={18} />
             : type === 'error'   ? <XCircle size={18} />
             : <AlertCircle size={18} />;

  const color = type === 'success' ? 'var(--success)'
              : type === 'error'   ? 'var(--error)'
              : 'var(--warning)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
      borderLeft: `3px solid ${color}`, borderRadius: 'var(--radius-md)',
      padding: '14px 16px', animation: 'fadeIn 0.25s ease',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <span style={{ color, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', color: 'var(--text-muted)',
        padding: 2, borderRadius: 4, flexShrink: 0,
        display: 'flex', transition: 'color 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export const toast = {
  success: (msg) => addToast(msg, 'success'),
  error:   (msg) => addToast(msg, 'error'),
  warning: (msg) => addToast(msg, 'warning'),
};
