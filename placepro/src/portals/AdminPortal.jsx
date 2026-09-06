import React from 'react';
import {
  ShieldCheck,
  Tag,
  Activity,
  ChevronRight
} from 'lucide-react';

export default function AdminPortal() {
  return (
    <div className="view-section active">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>System Administration & KYC Hub</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Platform-wide security oversight, user verification, and skills taxonomy manager.
        </p>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">
            <ShieldCheck size={18} color="var(--secondary)" />
            Pending KYC Verifications
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--secondary)', margin: '8px 0' }}>
            14 Companies
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Verify corporate registration documents, tax IDs, and authorized HR credentials.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => alert('Opening KYC approval queue.')}>
            Review KYC Queue <ChevronRight size={14} />
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            <Tag size={18} color="var(--primary-light)" />
            Skills Taxonomy Engine
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#a5b4fc', margin: '8px 0' }}>
            150+ Skills
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Manage technical, soft skill hierarchies, proficiency benchmarks, and role maps.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => alert('Opening Skills taxonomy manager.')}>
            Manage Taxonomy <ChevronRight size={14} />
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            <Activity size={18} color="var(--accent-emerald)" />
            System Health & Audit
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#34d399', margin: '8px 0' }}>
            99.98% Uptime
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Zero security anomalies detected across API endpoints in the past 30 days.
          </p>
          <button className="btn btn-outline btn-sm" onClick={() => alert('Downloading system audit logs.')}>
            View Audit Logs <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
