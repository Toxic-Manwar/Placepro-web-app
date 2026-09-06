import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Star,
  PlusCircle,
  FileText
} from 'lucide-react';

export default function IndustryPortal({ currentTab, onTabChange, onOpenModal, onAddOpportunity }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'internship',
    stipend: '',
    skills: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.skills) return;

    onAddOpportunity({
      id: `OPP${Date.now()}`,
      type: formData.type,
      title: formData.title,
      company: 'Tech Innovations India',
      logoText: 'TI',
      location: 'Bangalore (Remote)',
      isRemote: true,
      duration: formData.type === 'internship' ? '3 months' : 'Full-Time',
      stipend: formData.stipend,
      deadline: '2026-12-31',
      skills: formData.skills.split(',').map((s) => s.trim()),
      matchScore: 90,
      applied: false,
      status: null,
      description: formData.description
    });

    alert('Opportunity successfully published to the candidate network!');
    onTabChange('industry-dashboard');
    setFormData({ title: '', type: 'internship', stipend: '', skills: '', description: '' });
  };

  return (
    <>
      {/* Industry Dashboard */}
      {currentTab === 'industry-dashboard' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Company Recruitment & ATS Command</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage postings, review candidate skill compatibility, and schedule interviews.
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
                <div className="stat-label">Applications</div>
                <div className="stat-value">245</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-cyan">
                <Users size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Shortlisted</div>
                <div className="stat-value">28</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-emerald">
                <Star size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Interviews Set</div>
                <div className="stat-value">8</div>
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
                Top Matched Applicants
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => onTabChange('industry-post-opportunity')}>
                <PlusCircle size={15} /> Post New Opportunity
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Candidate</th>
                  <th style={{ padding: '12px' }}>Role Applied</th>
                  <th style={{ padding: '12px' }}>Match Score</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>John Developer (Takshashila Univ)</td>
                  <td style={{ padding: '12px' }}>Full-Stack Developer Intern</td>
                  <td style={{ padding: '12px' }}><span className="tag tag-match">92% Match</span></td>
                  <td style={{ padding: '12px' }}><span className="tag">Under Review</span></td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenModal('applicant')}>
                      Review Profile
                    </button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>Priya Sharma (IIT Madras)</td>
                  <td style={{ padding: '12px' }}>Associate Cloud Engineer</td>
                  <td style={{ padding: '12px' }}><span className="tag tag-match">95% Match</span></td>
                  <td style={{ padding: '12px' }}><span className="tag tag-match">Shortlisted</span></td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenModal('applicant')}>
                      Schedule Interview
                    </button>
                  </td>
                </tr>
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
              Post an internship, full-time job opening, or industry-sponsored learning program.
            </p>
          </div>

          <div className="card" style={{ maxWidth: '800px' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Position Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Junior Backend Engineer"
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

              <div className="form-group">
                <label className="form-label">Required Skills (Comma separated) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Python, SQL, Docker, React"
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
                  placeholder="Describe the day-to-day responsibilities and learning objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Publish Opportunity
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Candidate ATS Tab */}
      {currentTab === 'industry-candidates' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Candidate ATS Screening</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Review candidate compatibility and schedule interviews.</p>
          </div>

          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Candidate Name</th>
                  <th style={{ padding: '12px' }}>University</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Match Score</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>John Developer</td>
                  <td style={{ padding: '12px' }}>Takshashila University</td>
                  <td style={{ padding: '12px' }}>Full-Stack Developer Intern</td>
                  <td style={{ padding: '12px' }}><span className="tag tag-match">92% Match</span></td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenModal('applicant')}>
                      Review Profile
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
