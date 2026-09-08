import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpenCheck,
  Lightbulb,
  Users2,
  ChevronRight,
  Award,
  FolderGit2
} from 'lucide-react';
import api from '../services/apiClient';

export default function AcademicianPortal({ onRefreshData, onShowToast }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.institution.getStudents();
      if (Array.isArray(res)) {
        setStudents(res);
      }
    } catch (err) {
      console.error('Failed to load students for faculty review:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleVerify = async (studentId, skillId, skillName) => {
    try {
      setVerifyingId(`${studentId}-${skillId}`);
      await api.institution.verifySkill(
        studentId,
        skillId,
        'Faculty endorsement granted after evaluating student project artifacts and coursework.'
      );
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Skill Endorsed ✓',
          subtitle: `${skillName} — Institution Verified`,
          message: 'Official academic endorsement recorded in verification history.'
        });
      }
      loadStudents();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Verification Failed',
          message: err.message
        });
      }
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="view-section active">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Academician & Faculty Portal</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review student project evidence, endorse skills to Institution Verified, and oversee academic progression.
        </p>
      </div>

      {/* 3 Action Metric Cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-title">
            <BookOpenCheck size={18} color="var(--primary-light)" />
            FDP Programs
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0 16px', lineHeight: 1.5 }}>
            Apply for industry immersion programs with NVIDIA, Google Cloud, and Microsoft Research.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onShowToast && onShowToast({ type: 'info', title: 'FDP Immersion Hub', message: '12 active industry research programs available.' })}
          >
            Explore FDP Bids <ChevronRight size={14} />
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            <Lightbulb size={18} color="var(--accent-amber)" />
            Industrial Consultancy
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0 16px', lineHeight: 1.5 }}>
            Provide expert consultancy on industrial R&D projects with verified compensation.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onShowToast && onShowToast({ type: 'info', title: 'Consultancy Bids', message: '8 open corporate technical RFPs.' })}
          >
            View Open Projects <ChevronRight size={14} />
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            <Users2 size={18} color="var(--secondary)" />
            Student Mentorship
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0 16px', lineHeight: 1.5 }}>
            Guide and evaluate assigned student interns working across enterprise live projects.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onShowToast && onShowToast({ type: 'info', title: 'Mentorship Schedule', message: '24 students enrolled in current cohort.' })}
          >
            Manage Mentorships <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Faculty Skill Verification & Evidence Review Queue */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--secondary)" />
            Faculty Skill Verification & Evidence Review Queue
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Review project proof-of-work and elevate skills from Assessment Verified to Institution Verified
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              Loading faculty review queue...
            </div>
          ) : students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              No student records found in review queue.
            </div>
          ) : (
            students.map((student) => (
            <div
              key={student.id}
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>{student.fullName}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {student.regNumber} • {student.department} (Sem {student.semester}) • CGPA: {student.cgpa}/10
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="tag tag-match">Readiness: {student.placementReadiness}%</span>
                </div>
              </div>

              {/* Associated Student Projects */}
              {student.projects && student.projects.length > 0 && (
                <div style={{ marginBottom: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Project Evidence Artifacts
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {student.projects.map((p, pIdx) => (
                      <span key={pIdx} className="tag tag-tech" style={{ fontSize: '0.72rem' }}>
                        <FolderGit2 size={12} style={{ marginRight: '4px' }} /> {p.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Verification Action Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {student.skills.map((sk) => {
                  const isInstitutionVerified = sk.verificationTier === 'INSTITUTION_VERIFIED';
                  const isIndustryVerified = sk.verificationTier === 'INDUSTRY_VERIFIED';
                  const isBusy = verifyingId === `${student.id}-${sk.skillId || sk.id}`;

                  return (
                    <div
                      key={sk.id || sk.skillId}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.88rem' }}>{sk.name}</strong>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary)' }}>
                          {sk.proficiency}%
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span className={isIndustryVerified || isInstitutionVerified ? 'tag tag-match' : 'tag tag-tech'} style={{ fontSize: '0.68rem' }}>
                          {sk.verificationTier}
                        </span>

                        {!isInstitutionVerified && !isIndustryVerified ? (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                            onClick={() => handleVerify(student.id, sk.skillId || sk.id, sk.name)}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Verifying...' : 'Verify Skill ✓'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                            ✓ Endorsed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}
