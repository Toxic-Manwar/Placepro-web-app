import React from 'react';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building2,
  Briefcase,
  Award,
  Microscope,
  Landmark
} from 'lucide-react';

export default function PublicLanding({ onRoleChange, onOpenModal }) {
  return (
    <section className="view-section active">
      <div className="landing-hero">
        <div className="hero-badge">
          <Sparkles size={15} />
          <span>Next-Generation Talent & Collaboration Ecosystem</span>
        </div>
        <h1 className="hero-title">
          Bridging <span className="gradient-text">Academia & Industry</span> for Future Leaders
        </h1>
        <p className="hero-desc">
          Empowering students with verified skill profiling, real-time mock assessments, high-impact internships, and corporate placements—while enabling industry and faculty to collaborate on cutting-edge research.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => onOpenModal('register')}>
            Get Started Free <ArrowRight size={18} />
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => onRoleChange('student')}>
            Explore Student Portal
          </button>
        </div>

        {/* 4 Key Statistics Cards with Professional Lucide Icons */}
        <div className="grid-4" style={{ marginTop: '40px' }}>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Active Students</div>
              <div className="stat-value">10,000+</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-indigo">
              <GraduationCap size={22} />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Partner Companies</div>
              <div className="stat-value">500+</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-cyan">
              <Building2 size={22} />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Opportunities Live</div>
              <div className="stat-value">5,000+</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-emerald">
              <Briefcase size={22} />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Placement Success</div>
              <div className="stat-value">95%</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-amber">
              <Award size={22} />
            </div>
          </div>
        </div>

        {/* 4 Dedicated Portal Switcher Cards */}
        <div className="portal-cards-row">
          <div className="portal-select-card" onClick={() => onRoleChange('student')}>
            <div className="portal-icon-wrapper">
              <GraduationCap size={24} />
            </div>
            <h3>Student Portal</h3>
            <p>Skill assessment, AI job matching, timed mock tests, and verified digital portfolio.</p>
            <div style={{ marginTop: '16px', fontWeight: '700', color: 'var(--secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Enter Portal <ArrowRight size={14} />
            </div>
          </div>

          <div className="portal-select-card" onClick={() => onRoleChange('industry')}>
            <div className="portal-icon-wrapper">
              <Building2 size={24} />
            </div>
            <h3>Industry Portal</h3>
            <p>Post internships & jobs, screen candidates via skill match scores, and manage hiring ATS.</p>
            <div style={{ marginTop: '16px', fontWeight: '700', color: 'var(--secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Enter Portal <ArrowRight size={14} />
            </div>
          </div>

          <div className="portal-select-card" onClick={() => onRoleChange('academician')}>
            <div className="portal-icon-wrapper">
              <Microscope size={24} />
            </div>
            <h3>Faculty Portal</h3>
            <p>Apply for FDP programs, participate in industry consultancy, and mentor students.</p>
            <div style={{ marginTop: '16px', fontWeight: '700', color: 'var(--secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Enter Portal <ArrowRight size={14} />
            </div>
          </div>

          <div className="portal-select-card" onClick={() => onRoleChange('institution')}>
            <div className="portal-icon-wrapper">
              <Landmark size={24} />
            </div>
            <h3>University Portal</h3>
            <p>Institutional placement analytics, batch skill gap diagnostics, and corporate MOUs.</p>
            <div style={{ marginTop: '16px', fontWeight: '700', color: 'var(--secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Enter Portal <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
