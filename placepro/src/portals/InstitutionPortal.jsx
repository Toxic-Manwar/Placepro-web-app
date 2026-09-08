import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  BookOpenCheck,
  PlusCircle,
  BarChart3,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import PlacementBarChart from '../components/PlacementBarChart';
import api from '../services/apiClient';

export default function InstitutionPortal({ analyticsData, onRefreshData, onShowToast }) {
  const [data, setData] = useState(analyticsData || null);
  const [proposals, setProposals] = useState([]);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const [proposalForm, setProposalForm] = useState({
    skillName: '',
    actionType: 'CURRICULUM_REVISION',
    title: '',
    description: '',
    targetSemester: 'Fall 2026'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [res, propRes] = await Promise.allSettled([
        api.institution.getAnalytics(),
        api.institution.getCurriculumProposals()
      ]);
      if (res.status === 'fulfilled') {
        setData(res.value);
      }
      if (propRes.status === 'fulfilled' && Array.isArray(propRes.value)) {
        setProposals(propRes.value);
      }
    } catch (err) {
      console.error('Failed to load institution analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analyticsData) {
      setData(analyticsData);
      if (analyticsData.proposals && Array.isArray(analyticsData.proposals)) {
        setProposals(analyticsData.proposals);
      }
    } else {
      loadData();
    }
  }, [analyticsData]);

  const handleOpenProposal = (skillName = '') => {
    setProposalForm({
      skillName: skillName || (data?.curriculumAlerts?.[0]?.skillName || 'Cloud'),
      actionType: 'CURRICULUM_REVISION',
      title: skillName ? `Industry-Aligned Curriculum Overhaul: ${skillName}` : 'New Curriculum Action Plan',
      description: skillName
        ? `Integrate practical laboratory modules and sponsor faculty development to address measured industry shortage in ${skillName}.`
        : '',
      targetSemester: 'Fall 2026'
    });
    setIsProposalModalOpen(true);
  };

  const handleCloseProposal = () => {
    setIsProposalModalOpen(false);
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!proposalForm.skillName || !proposalForm.title) return;

    try {
      setSubmittingProposal(true);
      await api.institution.createCurriculumProposal(proposalForm);
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Curriculum Proposal Created',
          subtitle: proposalForm.title,
          message: `Official institutional action plan submitted for ${proposalForm.skillName}.`
        });
      }
      setIsProposalModalOpen(false);
      loadData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Proposal Failed',
          message: err.message
        });
      }
    } finally {
      setSubmittingProposal(false);
    }
  };

  const marketMetrics = data?.marketMetrics || [];
  const alerts = data?.curriculumAlerts || [];
  const departmentData = data?.departmentPlacement || [];

  return (
    <div className="view-section active">
      {/* 1. Header Banner */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>University Placement & Curriculum Command</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {data?.institutionName || 'Takshashila Institute of Technology'} • Live Macro Demand/Supply Analytics & Curriculum Actions
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenProposal('')}>
          <PlusCircle size={16} /> Create Curriculum Action
        </button>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Students Enrolled</div>
            <div className="stat-value">{data?.totalStudentsEnrolled || 2} Active</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-indigo">
            <GraduationCap size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Avg Placement Readiness</div>
            <div className="stat-value" style={{ color: 'var(--secondary)' }}>
              {data?.avgPlacementReadiness || 73}%
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-cyan">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Overall Placement Rate</div>
            <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
              {data?.overallPlacementRate || 95}%
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Live Corporate Postings</div>
            <div className="stat-value">{data?.totalOpportunities || 6} Positions</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <Briefcase size={22} />
          </div>
        </div>
      </div>

      {/* 3. Automated Curriculum Alerts (Shortage >= 30%) */}
      {alerts.length > 0 && (
        <div className="card" style={{ marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(245,158,11,0.04) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div className="card-title" style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#ef4444" />
              Critical Skill Shortages & Automated Curriculum Alerts ({alerts.length})
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Triggered automatically when market Demand Index exceeds student Skill Supply by $\ge 30\%$
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>{alert.skillName}</strong>
                    <span className="tag tag-danger" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                      +{alert.shortageIndex}% Shortage
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    <span>Industry Demand: <strong style={{ color: '#f87171' }}>{alert.demandIndex}%</strong></span>
                    <span>Student Supply: <strong style={{ color: '#38bdf8' }}>{alert.supplyIndex}%</strong></span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                    <strong>Action Required:</strong> {alert.action}
                  </p>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'flex-start', fontSize: '0.78rem', marginTop: '6px' }}
                  onClick={() => handleOpenProposal(alert.skillName)}
                >
                  Initiate Action Plan <ArrowUpRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Macro Demand vs Supply Matrix */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--secondary)" />
            Industry Demand vs Student Skill Supply Matrix
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time algorithmic aggregation of enterprise job requirements vs active student skill profiles
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>SKILL</th>
                <th style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>INDUSTRY DEMAND</th>
                <th style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>STUDENT SUPPLY</th>
                <th style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>SHORTAGE INDEX</th>
                <th style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {marketMetrics.map((metric) => {
                const isShortage = metric.isAlertTriggered || metric.shortageIndex >= 30;
                return (
                  <tr key={metric.skillId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#f8fafc' }}>
                      {metric.skillName}
                    </td>

                    {/* Industry Demand Bar */}
                    <td style={{ padding: '12px', minWidth: '150px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                        <span>Demand:</span>
                        <strong style={{ color: '#f87171' }}>{metric.demandIndex}%</strong>
                      </div>
                      <div className="progress-container" style={{ height: '5px' }}>
                        <div
                          className="progress-bar"
                          style={{ width: `${metric.demandIndex}%`, background: 'linear-gradient(90deg, #f87171, #ef4444)' }}
                        ></div>
                      </div>
                    </td>

                    {/* Student Supply Bar */}
                    <td style={{ padding: '12px', minWidth: '150px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                        <span>Supply:</span>
                        <strong style={{ color: '#38bdf8' }}>{metric.supplyIndex}%</strong>
                      </div>
                      <div className="progress-container" style={{ height: '5px' }}>
                        <div
                          className="progress-bar"
                          style={{ width: `${metric.supplyIndex}%`, background: 'linear-gradient(90deg, #38bdf8, #06b6d4)' }}
                        ></div>
                      </div>
                    </td>

                    {/* Shortage Index */}
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: isShortage ? '#ef4444' : '#10b981', fontSize: '0.9rem' }}>
                        {metric.shortageIndex > 0 ? `+${metric.shortageIndex}%` : `${metric.shortageIndex}%`}
                      </strong>
                    </td>

                    {/* Status Tag */}
                    <td style={{ padding: '12px' }}>
                      <span className={isShortage ? 'tag tag-danger' : 'tag tag-match'} style={{ fontSize: '0.72rem' }}>
                        {isShortage ? 'Critical Deficit' : 'Balanced Supply'}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                        onClick={() => handleOpenProposal(metric.skillName)}
                      >
                        Propose Action <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Active Curriculum Action Proposals */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpenCheck size={18} color="var(--accent-emerald)" />
            Active Institutional Curriculum Action Plans ({proposals.length})
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => handleOpenProposal('')}>
            <PlusCircle size={14} /> New Proposal
          </button>
        </div>

        {proposals.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No curriculum action proposals created yet. Click "Create Curriculum Action" or respond to an automated alert.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {proposals.map((prop) => {
              const typeLabels = {
                CURRICULUM_REVISION: 'Curriculum Revision',
                INDUSTRY_WORKSHOP: 'Industry Workshop',
                FACULTY_TRAINING: 'Faculty Training',
                INDUSTRY_FDP: 'Industry FDP'
              };
              return (
                <div
                  key={prop.id}
                  style={{
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="tag tag-tech" style={{ fontSize: '0.72rem' }}>
                        {typeLabels[prop.actionType] || prop.actionType}
                      </span>
                      <span className="tag tag-match" style={{ fontSize: '0.72rem' }}>
                        {prop.status}
                      </span>
                    </div>
                    <strong style={{ fontSize: '0.95rem', color: '#f8fafc', marginTop: '4px', display: 'block' }}>
                      {prop.title}
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '2px' }}>
                      Target Skill: {prop.skillName} • {prop.targetSemester}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
                      {prop.description}
                    </p>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}>
                    Created by: <strong style={{ color: '#a5b4fc' }}>{prop.createdBy}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Department Placement Breakdown */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={18} color="var(--primary-light)" />
            Placement Rate by Department (%)
          </div>
        </div>
        <PlacementBarChart departmentData={departmentData} />
      </div>

      {/* 7. Curriculum Action Modal */}
      {isProposalModalOpen && (
        <div className="modal-overlay" onClick={handleCloseProposal}>
          <div className="modal-container" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpenCheck size={20} color="var(--secondary)" />
                Create Institutional Curriculum Action Plan
              </div>
              <button className="close-modal-btn" onClick={handleCloseProposal}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Submit a formal academic action plan to bridge measured industry skill shortages and upgrade coursework.
            </p>

            <form onSubmit={handleSubmitProposal}>
              <div className="form-group">
                <label className="form-label">Target Competency / Skill *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Cloud, SQL, Docker..."
                  value={proposalForm.skillName}
                  onChange={(e) => setProposalForm({ ...proposalForm, skillName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Action Strategy Type *</label>
                <select
                  className="form-control"
                  value={proposalForm.actionType}
                  onChange={(e) => setProposalForm({ ...proposalForm, actionType: e.target.value })}
                >
                  <option value="CURRICULUM_REVISION">Curriculum Revision & Lab Upgrade</option>
                  <option value="INDUSTRY_WORKSHOP">Hands-on Industry Workshop</option>
                  <option value="FACULTY_TRAINING">Faculty Development Program (FDP)</option>
                  <option value="INDUSTRY_FDP">Corporate-Sponsored Immersion FDP</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Proposal Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AWS Cloud Architecture Elective & Hands-on Lab"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Implementation Semester</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Fall 2026, Semester 7"
                  value={proposalForm.targetSemester}
                  onChange={(e) => setProposalForm({ ...proposalForm, targetSemester: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Action Description & Roadmap *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Detail the modules, industry partner collaboration, lab equipment, or learning outcomes..."
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseProposal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingProposal}>
                  {submittingProposal ? 'Recording Proposal...' : 'Submit Action Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

