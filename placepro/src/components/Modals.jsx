import React, { useState } from 'react';
import {
  X,
  Calendar,
  Send,
  Share2,
  Copy,
  CheckCircle2,
  Sparkles,
  Award,
  Bell,
  HelpCircle,
  ShieldCheck,
  LogOut,
  QrCode,
  Printer,
  Star
} from 'lucide-react';
import api from '../services/apiClient';

export default function Modals({
  activeModal,
  modalData,
  onCloseModal,
  onRoleChange,
  currentUser,
  onApply,
  onStatusChange,
  onRefreshData,
  onShowToast
}) {
  // Verification form states
  const [facultyNotes, setFacultyNotes] = useState('');
  const [verifyingFaculty, setVerifyingFaculty] = useState(false);

  // Industry feedback form states
  const [feedbackRating, setFeedbackRating] = useState(85);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackInteraction, setFeedbackInteraction] = useState('TECHNICAL_INTERVIEW');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  if (!activeModal) return null;

  const notify = (title, message, type = 'success', subtitle = '') => {
    if (onShowToast) {
      onShowToast({ type, title, message, subtitle });
    }
  };

  return (
    <>
      {/* 1. Explainable Opportunity Match Modal */}
      {activeModal === 'matchExplainer' && modalData && (
        <div className="modal-overlay" onClick={onCloseModal}>
          <div
            className="modal-container"
            style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--secondary)" />
                Explainable Opportunity Match
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>

            {/* Opportunity Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '18px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
                  {modalData.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {modalData.company} • {modalData.location || 'Remote'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  className="tag tag-match"
                  style={{ fontSize: '1rem', padding: '6px 14px', fontWeight: 800 }}
                >
                  {modalData.matchScore}% Match
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Weighted Multi-Factor Engine
                </div>
              </div>
            </div>

            {/* Recommendation Summary */}
            {modalData.recommendationSummary && (
              <div
                style={{
                  padding: '12px 14px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '4px solid var(--secondary)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  marginBottom: '18px',
                  color: '#e2e8f0'
                }}
              >
                <strong>Match Verdict: </strong>
                {modalData.recommendationSummary}
              </div>
            )}

            {/* Factor Breakdown */}
            {modalData.factors && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Multi-Factor Compatibility Analysis
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {Object.entries(modalData.factors).map(([key, val]) => {
                    const factorNames = {
                      skillScore: 'Skill Alignment',
                      roleScore: 'Role Track Relevance',
                      cgpaScore: 'Academic CGPA Baseline',
                      projectScore: 'Project Proof of Work',
                      workPrefScore: 'Location & Work Preference'
                    };
                    const factorWeights = {
                      skillScore: '40% Weight',
                      roleScore: '20% Weight',
                      cgpaScore: '15% Weight',
                      projectScore: '15% Weight',
                      workPrefScore: '10% Weight'
                    };
                    return (
                      <div
                        key={key}
                        style={{
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{factorNames[key] || key}</span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>{val}%</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{factorWeights[key]}</div>
                        <div className="progress-container" style={{ height: '4px', marginTop: '6px' }}>
                          <div className="progress-bar" style={{ width: `${val}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6-Factor Rationale Points */}
            {modalData.reasons && modalData.reasons.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Explainable Match Factors
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {modalData.reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.83rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={onCloseModal}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (onApply && modalData.id) {
                    onApply(modalData.id);
                  }
                  onCloseModal();
                }}
                disabled={modalData.applied}
              >
                {modalData.applied ? 'Applied' : '1-Click Apply with Verified Skills'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Skill Evidence Drill-down Modal */}
      {activeModal === 'skillEvidence' && modalData && (
        <div className="modal-overlay" onClick={onCloseModal}>
          <div
            className="modal-container"
            style={{ maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--secondary)" />
                {modalData.skillName || modalData.name} Evidence Verification
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Proficiency Index</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  {modalData.proficiency}%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verification Tier</div>
                <span className="tag tag-match" style={{ marginTop: '4px' }}>
                  {modalData.verificationTier || modalData.tier || 'ASSESSMENT_VERIFIED'}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {modalData.summaryExplanation || 'Concrete artifacts persisted in database establishing verifiable skill competence.'}
            </p>

            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Persistent Evidence Trail ({modalData.evidence?.length || 0} Artifacts)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {modalData.evidence && modalData.evidence.length > 0 ? (
                modalData.evidence.map((ev, idx) => (
                  <div key={idx} className="card" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="tag tag-tech" style={{ fontSize: '0.72rem' }}>{ev.type}</span>
                      {ev.score && <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.82rem' }}>Score: {ev.score}</span>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '4px' }}>{ev.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{ev.description}</div>
                    {ev.verifier && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Verified by: <strong style={{ color: '#a5b4fc' }}>{ev.verifier}</strong>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No standardized assessment or project evidence submitted yet.
                </div>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onCloseModal}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* 3. Recruiter Industry Feedback Modal */}
      {activeModal === 'industryFeedback' && modalData && (
        <div className="modal-overlay" onClick={onCloseModal}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} color="var(--accent-amber)" />
                Corporate Skill Evaluation & Feedback
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Evaluate candidate <strong style={{ color: '#f8fafc' }}>{modalData.studentName}</strong> on <strong style={{ color: 'var(--secondary)' }}>{modalData.skillName || 'Skill'}</strong>. High ratings (≥70%) officially elevate the skill to <span style={{ color: '#10b981', fontWeight: 700 }}>INDUSTRY_VERIFIED</span>.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setSubmittingFeedback(true);
                  await api.industry.submitSkillFeedback(modalData.studentId, {
                    skillName: modalData.skillName || modalData.skill?.name,
                    rating: Number(feedbackRating),
                    feedbackText,
                    interactionType: feedbackInteraction
                  });
                  notify('Feedback Recorded', `Successfully submitted industry evaluation for ${modalData.skillName || 'skill'}.`);
                  if (onRefreshData) onRefreshData();
                  onCloseModal();
                } catch (err) {
                  notify('Submission Failed', err.message, 'error');
                } finally {
                  setSubmittingFeedback(false);
                }
              }}
            >
              <div className="form-group">
                <label className="form-label">Interaction Context</label>
                <select
                  className="form-control"
                  value={feedbackInteraction}
                  onChange={(e) => setFeedbackInteraction(e.target.value)}
                >
                  <option value="TECHNICAL_INTERVIEW">Technical Coding Interview</option>
                  <option value="INTERNSHIP_EVALUATION">Internship Performance Review</option>
                  <option value="HACKATHON_ASSESSMENT">Hackathon / Project Evaluation</option>
                  <option value="PORTFOLIO_REVIEW">Portfolio & Architecture Review</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Demonstrated Skill Proficiency</label>
                  <strong style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>{feedbackRating}%</strong>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--secondary)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Structured Evaluator Feedback *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Strong API architecture, clean async error handling, and robust database querying..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={onCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingFeedback || !feedbackText}>
                  {submittingFeedback ? 'Persisting...' : 'Submit Industry Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Faculty Institution Verification Modal */}
      {activeModal === 'facultyVerify' && modalData && (
        <div className="modal-overlay" onClick={onCloseModal}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="var(--primary-light)" />
                Faculty Skill Endorsement
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Endorse student <strong style={{ color: '#f8fafc' }}>{modalData.studentName}</strong> for <strong style={{ color: 'var(--secondary)' }}>{modalData.skillName || 'Skill'}</strong> based on evaluated coursework and project artifacts.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setVerifyingFaculty(true);
                  await api.institution.verifySkill(modalData.studentId, modalData.skillId || modalData.skillName, facultyNotes);
                  notify('Skill Endorsed', `Officially verified ${modalData.skillName} as INSTITUTION_VERIFIED.`);
                  if (onRefreshData) onRefreshData();
                  onCloseModal();
                } catch (err) {
                  notify('Verification Failed', err.message, 'error');
                } finally {
                  setVerifyingFaculty(false);
                }
              }}
            >
              <div className="form-group">
                <label className="form-label">Faculty Endorsement Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Verified upon evaluation of full-stack capstone project and lab assignments..."
                  value={facultyNotes}
                  onChange={(e) => setFacultyNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={onCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={verifyingFaculty}>
                  {verifyingFaculty ? 'Verifying...' : 'Confirm Institution Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Share Verified Skill Passport Modal */}
      {activeModal === 'sharePortfolio' && (
        <div className="modal-overlay" onClick={onCloseModal}>
          <div className="modal-container" style={{ maxWidth: '480px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={20} color="var(--secondary)" />
                Share Verified Skill Passport
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
              <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-lg)', display: 'inline-flex' }}>
                <QrCode size={110} color="#090d16" />
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.85rem' }}>
              Recruiters and institutions can verify your persistent assessment scores, projects, and endorsements via this public link.
            </p>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--secondary)', marginBottom: '20px', wordBreak: 'break-all' }}>
              {window.location.origin}/passport/{currentUser?.passportId || 'passport-john-2026'}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => {
                  window.print();
                  onCloseModal();
                }}
              >
                <Printer size={16} /> Print Passport
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/passport/${currentUser?.passportId || 'passport-john-2026'}`);
                  notify('Link Copied', 'Public Skill Passport URL copied to clipboard.');
                }}
              >
                <Copy size={16} /> Copy URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Candidate Details Modal for Industry Recruiter */}
      {activeModal === 'candidateDetails' && modalData && (
        <div className="modal-overlay" onClick={onCloseModal}>
          <div className="modal-container" style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">Candidate Profile & Skill Verification</div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
              <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                {modalData.studentName ? modalData.studentName.split(' ').map((n) => n[0]).join('') : 'CD'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{modalData.studentName}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {modalData.department} • CGPA: {modalData.cgpa}/10 • {modalData.institution}
                </div>
              </div>
            </div>

            {/* Match Banner */}
            <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.25)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Opportunity Compatibility</span>
                <span className="tag tag-match" style={{ fontSize: '0.9rem', fontWeight: 800 }}>{modalData.matchScore}% Match</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {modalData.recommendationSummary || 'Candidate demonstrates solid alignment with required technical proficiencies.'}
              </p>
            </div>

            {/* Skills & Verification Tiers */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Verified Skill Inventory
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {modalData.skills?.map((s, idx) => {
                  const isVerified = s.tier && s.tier !== 'SELF_REPORTED';
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{s.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Proficiency: {s.proficiency}%
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={isVerified ? 'tag tag-match' : 'tag tag-tech'} style={{ fontSize: '0.72rem' }}>
                          {s.tier === 'INDUSTRY_VERIFIED' ? '★ Industry Verified' : s.tier === 'INSTITUTION_VERIFIED' ? '✓ Faculty Verified' : s.tier === 'ASSESSMENT_VERIFIED' ? '✓ Assessment Verified' : '• Self-Reported'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  if (onStatusChange && modalData.applicationId) {
                    onStatusChange(modalData.applicationId, 'SHORTLISTED');
                  }
                  onCloseModal();
                }}
              >
                <Award size={15} /> Shortlist
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  if (onStatusChange && modalData.applicationId) {
                    onStatusChange(modalData.applicationId, 'INTERVIEW_SCHEDULED');
                  }
                  onCloseModal();
                }}
              >
                <Calendar size={15} /> Schedule Interview
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  if (onStatusChange && modalData.applicationId) {
                    onStatusChange(modalData.applicationId, 'OFFER');
                  }
                  onCloseModal();
                }}
              >
                <Send size={15} /> Extend Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Notifications Modal */}
      {activeModal === 'notifications' && (
        <div className="modal-overlay" onClick={onCloseModal}>
          <div className="modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">
                <Bell size={20} color="var(--primary-light)" />
                Notifications
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card" style={{ padding: '14px', background: 'rgba(99,102,241,0.06)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" /> Application Status Updated
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Tech Innovations India updated your application status to Under Review.
                </div>
              </div>
              <div className="card" style={{ padding: '14px', background: 'rgba(14,165,233,0.06)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--secondary)" /> Skill Verification Endorsement
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Prof. Ramesh Gupta endorsed your Cloud & React skills with verified project proof.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Help Desk Modal */}
      {activeModal === 'help' && (
        <div className="modal-overlay" onClick={onCloseModal}>
          <div className="modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">
                <HelpCircle size={20} color="var(--primary-light)" />
                Platform Support Desk
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.85rem' }}>
              Have a question regarding skill assessments, evidence verification, or recruitment?
            </p>
            <div className="form-group">
              <label className="form-label">Describe your query</label>
              <textarea className="form-control" rows={3} placeholder="How can we assist you?"></textarea>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                notify('Ticket Submitted', 'Support team will respond within 2 hours.');
                onCloseModal();
              }}
            >
              Submit Ticket
            </button>
          </div>
        </div>
      )}

      {/* 9. Profile Modal */}
      {activeModal === 'profile' && (
        <div className="modal-overlay" onClick={onCloseModal}>
          <div className="modal-container" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title">
                <ShieldCheck size={20} color="var(--secondary)" />
                Active Profile
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>
            <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '22px', margin: '0 auto 12px' }}>
              {currentUser?.fullName ? currentUser.fullName.split(' ').map((n) => n[0]).join('') : 'JD'}
            </div>
            <h3 style={{ marginBottom: '4px', fontSize: '1.2rem' }}>{currentUser?.fullName || 'John Developer'}</h3>
            <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Student Member • {currentUser?.institution || 'Takshashila Institute of Technology'}
            </div>
            <div className="tag tag-match" style={{ marginBottom: '22px' }}>
              <CheckCircle2 size={13} /> Verified & KYC Approved
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => {
                onCloseModal();
                onRoleChange('public');
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
