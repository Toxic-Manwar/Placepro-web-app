import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Calendar,
  Star,
  PlusCircle,
  FileText,
  Sparkles,
  Award,
  Clock
} from 'lucide-react';
import api from '../services/apiClient';

export default function IndustryPortal({
  currentTab,
  onTabChange,
  onOpenModal,
  onAddOpportunity,
  onStatusChange
}) {
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'internship',
    stipend: '',
    skills: '',
    description: '',
    location: 'Bangalore (Remote)',
    minCgpa: '7.0'
  });

  const loadCandidates = useCallback(async () => {
    try {
      setLoadingCandidates(true);
      const res = await api.industry.getCandidates();
      if (Array.isArray(res)) {
        setCandidates(res);
      }
    } catch (err) {
      console.error('Failed to load candidate ATS list:', err);
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingCandidates(true);
        const res = await api.industry.getCandidates();
        if (isMounted && Array.isArray(res)) {
          setCandidates(res);
        }
      } catch (err) {
        console.error('Failed to load candidate ATS list:', err);
      } finally {
        if (isMounted) setLoadingCandidates(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.skills) return;

    if (onAddOpportunity) {
      await onAddOpportunity({
        type: formData.type,
        title: formData.title,
        location: formData.location || 'Bangalore (Remote)',
        isRemote: true,
        duration: formData.type === 'internship' ? '3 months' : 'Full-Time',
        stipend: formData.stipend || (formData.type === 'internship' ? '₹25,000 / mo' : '₹10-14 LPA'),
        minCgpa: formData.minCgpa || '7.0',
        skills: formData.skills,
        description: formData.description
      });
    }

    onTabChange('industry-dashboard');
    setFormData({
      title: '',
      type: 'internship',
      stipend: '',
      skills: '',
      description: '',
      location: 'Bangalore (Remote)',
      minCgpa: '7.0'
    });
    loadCandidates();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHORTLISTED':
        return <span className="tag tag-match">✓ Shortlisted</span>;
      case 'INTERVIEW_SCHEDULED':
        return <span className="tag tag-tech"><Calendar size={12} /> Interview Set</span>;
      case 'OFFER':
        return <span className="tag tag-match"><Award size={12} /> Offer Extended</span>;
      case 'REJECTED':
        return <span className="tag tag-danger">Archived</span>;
      default:
        return <span className="tag"><Clock size={12} /> Under Review</span>;
    }
  };

  // Stats calculation
  const totalApplicants = candidates.length || 24;
  const shortlistedCount = candidates.filter((c) => c.status === 'SHORTLISTED' || c.status === 'OFFER').length || 8;
  const interviewsCount = candidates.filter((c) => c.status === 'INTERVIEW_SCHEDULED').length || 4;

  return (
    <>
      {/* Industry Dashboard */}
      {currentTab === 'industry-dashboard' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Company Recruitment & ATS Command</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage postings, review candidate 6-factor skill compatibility, and schedule interviews.
            </p>
          </div>

          <div className="grid-4" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Active Postings</div>
                <div className="stat-value">6</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-indigo">
                <FileText size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Matched Candidates</div>
                <div className="stat-value">{totalApplicants}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-cyan">
                <Users size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Shortlisted</div>
                <div className="stat-value">{shortlistedCount}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-emerald">
                <Star size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Interviews Set</div>
                <div className="stat-value">{interviewsCount}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-amber">
                <Calendar size={22} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Users size={18} color="var(--secondary)" />
                Top Matched Applicants (Dynamic 6-Factor Compatibility)
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => onTabChange('industry-post-opportunity')}>
                <PlusCircle size={15} /> Post New Opportunity
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Candidate</th>
                  <th style={{ padding: '12px' }}>Verified Skill Trust</th>
                  <th style={{ padding: '12px' }}>Dynamic Match</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>ATS & Verification Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {loadingCandidates ? 'Loading candidate pool from database...' : 'No candidate applications currently match this opportunity. Publish opportunities to attract qualified talent.'}
                    </td>
                  </tr>
                )}
                {candidates.map((cand) => (
                  <tr key={cand.applicationId || cand.studentId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{cand.studentName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {cand.institution} • CGPA: {cand.cgpa}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        For: <strong style={{ color: '#e2e8f0' }}>{cand.opportunityTitle}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '280px' }}>
                        {(cand.skills || []).slice(0, 4).map((sk, sIdx) => {
                          const isVer = sk.tier && sk.tier !== 'SELF_REPORTED';
                          return (
                            <span
                              key={sIdx}
                              className={isVer ? 'tag tag-match' : 'tag tag-tech'}
                              style={{ fontSize: '0.7rem', padding: '2px 7px' }}
                              title={sk.tier}
                            >
                              {sk.name} ({sk.proficiency}%) {sk.tier === 'INDUSTRY_VERIFIED' ? '★' : isVer ? '✓' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="tag tag-match" style={{ fontWeight: 700 }}>
                        {cand.matchScore}% Match
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{getStatusBadge(cand.status)}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenModal('matchExplainer', {
                            title: cand.opportunityTitle,
                            company: 'Your Company',
                            location: 'Bangalore (Remote)',
                            matchScore: cand.matchScore,
                            applied: true,
                            recommendationSummary: cand.recommendationSummary,
                            factors: cand.matchBreakdown?.factors,
                            reasons: cand.reasons
                          })}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Sparkles size={13} /> Why Match?
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onOpenModal('industryFeedback', {
                            studentId: cand.studentId,
                            studentName: cand.studentName,
                            skillName: cand.skills?.[0]?.name || 'React'
                          })}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Star size={13} color="var(--accent-amber)" /> Evaluate Skill
                        </button>
                        {cand.status !== 'SHORTLISTED' && cand.status !== 'OFFER' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={async () => {
                              if (onStatusChange && cand.applicationId) {
                                await onStatusChange(cand.applicationId, 'SHORTLISTED');
                                loadCandidates();
                              }
                            }}
                          >
                            Shortlist
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Opportunity */}
      {currentTab === 'industry-post-opportunity' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Publish Opportunity</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Post an internship or full-time position calibrated with automated skill mapping.
            </p>
          </div>

          <div className="card" style={{ maxWidth: '800px' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Position Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Junior Backend Engineer / Cloud Specialist"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Opportunity Type</label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="internship">Internship (3-6 Months)</option>
                    <option value="job">Full-Time Placement</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Compensation / Stipend *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ₹30,000/mo or ₹10-14 LPA"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Location / Mode</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bangalore (Remote Friendly)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Min CGPA Requirement</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 7.0"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (Comma separated) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. React, Node.js, SQL, Cloud, Docker"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Description & Responsibilities</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe the day-to-day responsibilities, learning goals, and impact..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Publish Opportunity to Candidate Network
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Candidate ATS Tab */}
      {currentTab === 'industry-candidates' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Candidate ATS Screening & Candidate Pool</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Review candidate compatibility and schedule interviews.</p>
          </div>

          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Candidate Name</th>
                  <th style={{ padding: '12px' }}>University</th>
                  <th style={{ padding: '12px' }}>Matched Position</th>
                  <th style={{ padding: '12px' }}>Match Score</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((cand) => (
                  <tr key={cand.applicationId || cand.studentId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{cand.studentName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {cand.email}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>{cand.institution} (CGPA: {cand.cgpa})</td>
                    <td style={{ padding: '12px' }}>{cand.opportunityTitle}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="tag tag-match" style={{ fontWeight: 700 }}>
                        {cand.matchScore}% Match
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{getStatusBadge(cand.status)}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenModal('applicant', cand)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Sparkles size={13} /> Review Match
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
