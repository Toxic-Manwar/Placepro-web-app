import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, X, ArrowRight } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" style={{
      position: 'fixed',
      top: '1.5rem',
      right: '1.5rem',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '420px',
      width: 'calc(100vw - 3rem)',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 4500;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';
  const isVerified = toast.type === 'verified';

  let borderColor = 'rgba(16, 185, 129, 0.4)'; // emerald
  let glowColor = 'rgba(16, 185, 129, 0.15)';
  let iconColor = '#10b981';
  let IconComponent = CheckCircle2;

  if (isError) {
    borderColor = 'rgba(239, 68, 68, 0.4)'; // red
    glowColor = 'rgba(239, 68, 68, 0.15)';
    iconColor = '#ef4444';
    IconComponent = AlertTriangle;
  } else if (isVerified) {
    borderColor = 'rgba(99, 102, 241, 0.5)'; // indigo
    glowColor = 'rgba(99, 102, 241, 0.2)';
    iconColor = '#6366f1';
    IconComponent = ShieldCheck;
  }

  return (
    <div
      className="placepro-toast animate-in"
      style={{
        pointerEvents: 'auto',
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor}`,
        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 20px ${glowColor}`,
        borderRadius: '12px',
        padding: '1rem 1.15rem',
        color: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        <div
          style={{
            background: `${iconColor}20`,
            borderRadius: '8px',
            padding: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0
          }}
        >
          <IconComponent size={20} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {toast.title || (isSuccess ? 'Application Submitted' : 'Notification')}
              {isSuccess && <span style={{ color: '#10b981', fontSize: '0.85rem' }}>✓</span>}
            </h4>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>

          {(toast.subtitle || toast.company) && (
            <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', fontWeight: 500, color: '#e2e8f0' }}>
              {toast.subtitle}
              {toast.company && (
                <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '0.35rem' }}>
                  • {toast.company}
                </span>
              )}
            </div>
          )}

          {toast.message && (
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
              {toast.message}
            </p>
          )}

          {toast.actionLabel && (
            <button
              onClick={() => {
                if (toast.onAction) toast.onAction();
                onDismiss(toast.id);
              }}
              style={{
                marginTop: '0.6rem',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                color: '#818cf8',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'background 0.2s ease'
              }}
            >
              {toast.actionLabel}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Auto-dismiss duration bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2.5px',
          width: `${progress}%`,
          background: iconColor,
          opacity: 0.8,
          transition: 'width 50ms linear'
        }}
      />
    </div>
  );
}
