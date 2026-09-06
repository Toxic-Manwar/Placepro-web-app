import React from 'react';
import {
  UserPlus,
  X,
  FileText,
  Calendar,
  Send,
  Share2,
  Copy,
  CheckCircle2,
  Bell,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  LogOut,
  QrCode
} from 'lucide-react';

export default function Modals({ activeModal, onCloseModal, onRoleChange }) {
  if (!activeModal) return null;

  return (
    <>
      {/* Registration Modal */}
      {activeModal === 'register' && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="card-title">
                <UserPlus size={20} color="var(--primary-light)" />
                Create Your Portal Account
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Account created! Verification email dispatched.'); onCloseModal(); }}>
              <div className="form-group">
                <label className="form-label">Select Role</label>
                <select className="form-control">
                  <option>Student (Looking for Internships / Placements)</option>
                  <option>Company / Recruiter (Hiring Talent)</option>
                  <option>Academician / Faculty (Research & Mentorship)</option>
                  <option>Educational Institution / University</option>
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" placeholder="john@example.com" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="Min 8 characters, uppercase & symbol" required />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '10px' }}>
                Complete Registration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Profile Review Modal */}
      {activeModal === 'applicant' && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="card-title">
                <FileText size={20} color="var(--secondary)" />
                Candidate Profile Review
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <div className="user-avatar" style={{ width: '52px', height: '52px', fontSize: '20px' }}>JD</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1.15rem' }}>John Developer</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Takshashila University • B.Tech CSE (CGPA: 8.5)</div>
                <span className="tag tag-match" style={{ marginTop: '6px' }}>92% Skill Compatibility</span>
              </div>
            </div>

            <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '0.9rem' }}>Verified Technical Proficiencies</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="tag tag-tech">Python (Level 4/5)</span>
                <span className="tag tag-tech">JavaScript (Level 4/5)</span>
                <span className="tag tag-tech">React (Level 3/5)</span>
                <span className="tag tag-tech">SQL (Level 4/5)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => { alert('Video interview invitation sent to candidate!'); onCloseModal(); }}
              >
                <Calendar size={16} /> Schedule Video Interview
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => { alert('Offer letter dispatched to candidate portal!'); onCloseModal(); }}
              >
                <Send size={16} /> Send Offer Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Portfolio Modal */}
      {activeModal === 'sharePortfolio' && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div className="modal-header">
              <div className="card-title">
                <Share2 size={20} color="var(--secondary)" />
                Share Verified Portfolio
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
              <div style={{ padding: '20px', background: '#ffffff', borderRadius: 'var(--radius-lg)', display: 'inline-flex' }}>
                <QrCode size={100} color="#090d16" />
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.85rem' }}>
              Recruiters can scan this QR code or use the link below to view your verified skills and test scores.
            </p>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--secondary)', marginBottom: '20px', wordBreak: 'break-all' }}>
              https://placepro.edu/portfolio/john-developer-cse
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                navigator.clipboard.writeText('https://placepro.edu/portfolio/john-developer-cse');
                alert('Copied portfolio link to clipboard!');
              }}
            >
              <Copy size={16} /> Copy Public Link
            </button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {activeModal === 'notifications' && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
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
                  <CheckCircle2 size={16} color="var(--accent-emerald)" /> Application Shortlisted
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Fintech Spark Inc. shortlisted your profile for Frontend React Developer.
                </div>
              </div>
              <div className="card" style={{ padding: '14px', background: 'rgba(14,165,233,0.06)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} color="var(--secondary)" /> Interview Scheduled
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  TCS Innovation Hub scheduled technical interview for Oct 10, 2:00 PM.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Modal */}
      {activeModal === 'messages' && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div className="card-title">
                <MessageSquare size={20} color="var(--secondary)" />
                Direct Messages
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Priya Sharma (Tech Innovations HR)</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>10m ago</span>
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  "Hi John, we reviewed your assessment score and GitHub projects. Are you available for a brief discussion tomorrow?"
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {activeModal === 'help' && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
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
              Have a question regarding skill assessments, verification, or corporate recruitment?
            </p>
            <div className="form-group">
              <label className="form-label">Describe your query</label>
              <textarea className="form-control" rows={3} placeholder="How can we assist you?"></textarea>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => { alert('Ticket submitted! Support team will respond within 2 hours.'); onCloseModal(); }}
            >
              Submit Ticket
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div className="modal-header">
              <div className="card-title">
                <ShieldCheck size={20} color="var(--secondary)" />
                Active Profile
              </div>
              <button className="close-modal-btn" onClick={onCloseModal}>
                <X size={20} />
              </button>
            </div>
            <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '22px', margin: '0 auto 12px' }}>JD</div>
            <h3 style={{ marginBottom: '4px', fontSize: '1.2rem' }}>John Developer</h3>
            <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Student Member • Takshashila University
            </div>
            <div className="tag tag-match" style={{ marginBottom: '22px' }}>
              <CheckCircle2 size={13} /> Verified & KYC Approved
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => { onCloseModal(); onRoleChange('public'); }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
