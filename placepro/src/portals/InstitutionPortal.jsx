import React from 'react';
import {
  GraduationCap,
  TrendingUp,
  DollarSign,
  Building2,
  BarChart3
} from 'lucide-react';
import PlacementBarChart from '../components/PlacementBarChart';

export default function InstitutionPortal() {
  return (
    <div className="view-section active">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>University Placement & Analytics Center</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Takshashila University • 2,000+ Registered Students • 95% Overall Placement Rate
        </p>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Students</div>
            <div className="stat-value">2,000</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-indigo">
            <GraduationCap size={22} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Placement Rate</div>
            <div className="stat-value">95%</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-cyan">
            <TrendingUp size={22} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Average CTC</div>
            <div className="stat-value">₹8.5 LPA</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <DollarSign size={22} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Top Hiring Partner</div>
            <div className="stat-value">TCS (45)</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <Building2 size={22} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={18} color="var(--primary-light)" />
            Placement Rate by Department (%)
          </div>
        </div>
        <PlacementBarChart />
      </div>
    </div>
  );
}
