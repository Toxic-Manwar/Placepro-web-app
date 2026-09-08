import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  Briefcase,
  Award,
  Calendar,
  MapPin,
  DollarSign,
  Printer,
  Share2,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Target,
  Search,
  BookOpen,
  AlertTriangle,
  Sparkles,
  FolderGit2
} from 'lucide-react';
import RadarChart from '../components/RadarChart';
import api from '../services/apiClient';

export default function StudentPortal({
  currentTab,
  onTabChange,
  studentProfile,
  skillGaps = [],
  opportunities = [],
  onApply,
  learningModules = [],
  onRefreshData,
  onOpenModal
}) {
  // Assessment Quiz State
  const [quizState, setQuizState] = useState('intro'); // 'intro', 'quiz', 'results'
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Skill Passport Live State & Evidence Expansion
  const [passportData, setPassportData] = useState(null);
  const [expandedSkillId, setExpandedSkillId] = useState(null);

  // Load diagnostic questions and live Skill Passport on mount & updates
  useEffect(() => {
    async function loadData() {
      try {
        const [diagRes, passRes] = await Promise.allSettled([
          api.student.getDiagnostic(),
          api.student.getPassport()
        ]);
        if (diagRes.status === 'fulfilled') setDiagnosticData(diagRes.value);
        if (passRes.status === 'fulfilled') setPassportData(passRes.value);
      } catch (err) {
        console.error('Failed to load student data:', err);
      }
    }
    loadData();
  }, [onRefreshData, currentTab]);

  const questions = diagnosticData?.questions || [
    {
      skillName: 'Cloud',
      questionText: 'Which AWS service is designed specifically for container orchestration with Kubernetes support?',
      options: ['Amazon EC2', 'Amazon EKS', 'Amazon S3', 'AWS Lambda'],
      correctIndex: 1
    },
    {
      skillName: 'SQL',
      questionText: 'What type of index in relational databases physically sorts the table rows on disk?',
      options: ['Non-Clustered Index', 'Clustered Index', 'Bitmap Index', 'Hash Index'],
      correctIndex: 1
    },
    {
      skillName: 'React',
      questionText: 'In modern React, which hook is primarily used for managing synchronous DOM layout measurements?',
      options: ['useEffect', 'useMemo', 'useLayoutEffect', 'useCallback'],
      correctIndex: 2
    },
    {
      skillName: 'Node.js',
      questionText: 'Which core architecture enables Node.js to handle high concurrency on a single thread?',
      options: ['Multi-threading', 'Event Loop & Libuv Non-Blocking I/O', 'Thread Pooling', 'Synchronous Blocking I/O'],
      correctIndex: 1
    }
  ];

  const finishQuiz = useCallback(async () => {
    try {
      setSubmittingQuiz(true);
      const res = await api.student.submitAssessment(diagnosticData?.id || 'diag-1', selectedAnswers);
      setAssessmentResult(res);
      setQuizState('results');
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setQuizState('results');
    } finally {
      setSubmittingQuiz(false);
    }
  }, [diagnosticData, selectedAnswers, onRefreshData]);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (quizState === 'quiz') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizState, finishQuiz]);

  const startQuiz = () => {
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setTimerSeconds(600);
    setQuizState('quiz');
  };

  const handleSelectOption = (optIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQIndex]: optIndex }));
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper for Severity Tag
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'tag tag-danger';
      case 'HIGH':
        return 'tag tag-warning';
      case 'MEDIUM':
        return 'tag tag-match';
      case 'LOW':
        return 'tag tag-tech';
      default:
        return 'tag tag-match';
    }
  };

  // Targeted Reassessment State
  const [activeReassessment, setActiveReassessment] = useState(null); // { skillId, skillName, questions: [...] }
  const [reassessmentState, setReassessmentState] = useState('none'); // 'none', 'quiz', 'results'
  const [reassessmentQIndex, setReassessmentQIndex] = useState(0);
  const [reassessmentAnswers, setReassessmentAnswers] = useState({});
  const [reassessmentResult, setReassessmentResult] = useState(null);
  const [reassessmentTimer, setReassessmentTimer] = useState(300); // 5 mins
  const [submittingReassessment, setSubmittingReassessment] = useState(false);
  const [progressionHistory, setProgressionHistory] = useState(null);
  const [updatingResourceProgress, setUpdatingResourceProgress] = useState(null);

  // Submit Reassessment
  const finishReassessment = useCallback(async () => {
    if (!activeReassessment) return;
    try {
      setSubmittingReassessment(true);
      const res = await api.student.submitReassessment(
        activeReassessment.skillId,
        reassessmentAnswers
      );
      setReassessmentResult(res);
      setProgressionHistory(res);
      setReassessmentState('results');
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Reassessment Completed ✓',
          subtitle: `${res.skillName}: ${res.preProficiency}% ➔ ${res.postProficiency}%`,
          message: `Measured Delta: ${res.deltaFormatted}. Skill verified to ASSESSMENT_VERIFIED.`,
          actionLabel: 'View Skill Passport',
          onAction: () => onTabChange('student-portfolio')
        });
      }
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Submission Failed',
          message: err.message
        });
      }
    } finally {
      setSubmittingReassessment(false);
    }
  }, [activeReassessment, reassessmentAnswers, onTabChange, onRefreshData]);

  const finishReassessmentRef = useRef(finishReassessment);
  useEffect(() => {
    finishReassessmentRef.current = finishReassessment;
  }, [finishReassessment]);

  // Reassessment Timer Effect
  useEffect(() => {
    let interval = null;
    if (reassessmentState === 'quiz') {
      interval = setInterval(() => {
        setReassessmentTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            finishReassessmentRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reassessmentState]);

  // Launch Targeted Reassessment for a specific skill
  const startReassessmentForSkill = async (skillId, skillName) => {
    try {
      const data = await api.student.getReassessmentQuestions(skillId || skillName);
      setActiveReassessment(data);
      setReassessmentQIndex(0);
      setReassessmentAnswers({});
      setReassessmentTimer(300);
      setReassessmentState('quiz');
    } catch (err) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Reassessment Failed to Load',
          subtitle: skillName,
          message: err.message
        });
      }
    }
  };

  // Update Learning Module Progress (Persisted to Database)
  const handleUpdateProgress = async (resourceId, newPct) => {
    try {
      setUpdatingResourceProgress(resourceId);
      await api.student.updateLearningProgress(resourceId, newPct);
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Learning Progress Updated',
          message: `Module progress saved at ${newPct}%.${newPct >= 100 ? ' Targeted skill reassessment is now unlocked!' : ''}`
        });
      }
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Failed to update progress',
          message: err.message
        });
      }
    } finally {
      setUpdatingResourceProgress(null);
    }
  };

  const readinessScore = studentProfile?.placementReadiness || 72;
  const studentSkills = studentProfile?.skills || [];

  return (
    <>
      {/* =============================================================
           BEFORE -> LEARNING -> AFTER PROGRESSION BANNER
           ============================================================= */}
      {progressionHistory && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.06) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Verified Skill Progression (Measured & Persisted)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                {progressionHistory.skillName} Mastery: <span style={{ color: 'var(--text-muted)' }}>{progressionHistory.preProficiency}% ({progressionHistory.preTier})</span> ➔ <span style={{ color: 'var(--secondary)' }}>{progressionHistory.postProficiency}% ({progressionHistory.postTier})</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Measured Delta: <strong style={{ color: 'var(--accent-emerald)' }}>{progressionHistory.deltaFormatted}</strong> • Readiness Impact: <strong style={{ color: 'var(--secondary)' }}>{progressionHistory.previousReadiness}% ➔ {progressionHistory.newReadiness}% ({progressionHistory.readinessDelta >= 0 ? `+${progressionHistory.readinessDelta}%` : `${progressionHistory.readinessDelta}%`})</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="tag tag-match">✓ {progressionHistory.updatedSkillGap?.severityLabel || 'Gap Closed'}</span>
              <button className="btn btn-outline btn-sm" onClick={() => setProgressionHistory(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
           1. STUDENT DASHBOARD TAB
           ============================================================= */}
      {currentTab === 'student-dashboard' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{studentProfile?.fullName || 'John Developer'}</strong> ({studentProfile?.regNumber || '2023CSE089'}). Target: <strong style={{ color: 'var(--secondary)' }}>{studentProfile?.targetRole || 'Full-Stack Cloud Engineer'}</strong>.
            </p>
          </div>

          {/* Placement Readiness Score Banner */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--secondary)" />
                  Placement Readiness Index: <span style={{ color: 'var(--secondary)', fontSize: '1.2rem' }}>{readinessScore}%</span>
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Calculated dynamically from verified skill assessments (50%), academic CGPA (25%), projects (15%), and certifications (10%).
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onTabChange('student-portfolio')}>
                View Skill Passport
              </button>
            </div>
            <div className="progress-container" style={{ marginTop: '12px' }}>
              <div className="progress-bar" style={{ width: `${readinessScore}%` }}></div>
            </div>
          </div>

          {/* 4 Core Stat Cards */}
          <div className="grid-4" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Verified Skills</div>
                <div className="stat-value">{studentSkills.length}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-indigo">
                <Target size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Active Gaps</div>
                <div className="stat-value">{skillGaps.filter((g) => g.gap > 0).length}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-amber">
                <AlertTriangle size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Readiness Index</div>
                <div className="stat-value">{readinessScore}%</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-cyan">
                <TrendingUp size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Matched Opps</div>
                <div className="stat-value">{opportunities.length}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-emerald">
                <Briefcase size={22} />
              </div>
            </div>
          </div>

          {/* Radar Chart & Real Skill Gaps */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Target size={18} color="var(--primary-light)" />
                    Verified Skill Radar
                  </div>
                  <div className="card-subtitle">Live multi-dimensional competency analysis from database</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => onTabChange('student-assessment')}>
                  Take Diagnostic
                </button>
              </div>
              <RadarChart skills={studentSkills} />
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <AlertTriangle size={18} color="var(--accent-amber)" />
                    Priority Skill Gaps
                  </div>
                  <div className="card-subtitle">Dynamic delta vs. target role requirements</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => onTabChange('student-learning')}>
                  Close Gaps
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {skillGaps.slice(0, 3).map((gapItem) => (
                  <div key={gapItem.skillId || gapItem.skillName} className="card" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{gapItem.skillName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Current: <strong>{gapItem.currentLevel}%</strong> • Required: <strong>{gapItem.requiredLevel}%</strong> (Deficit: <strong style={{ color: '#f87171' }}>-{gapItem.gap}%</strong>)
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {gapItem.rationale}
                        </div>
                      </div>
                      <span className={getSeverityBadgeClass(gapItem.severity)}>
                        {gapItem.severityLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
           2. SKILL ASSESSMENT TAB
           ============================================================= */}
      {currentTab === 'student-assessment' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Standardized Skill Assessment & Gap Diagnostic</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Proctored diagnostic evaluating algorithmic, database, and cloud system competencies. Results update your database skill profile and radar visualization.
            </p>
          </div>

          {/* Active Targeted Reassessment Quiz View */}
          {reassessmentState === 'quiz' && activeReassessment && (
            <div className="assessment-box" style={{ marginBottom: '24px', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
              <div className="quiz-header">
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 700 }}>
                    Targeted Reassessment • Skill: {activeReassessment.skillName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Question {reassessmentQIndex + 1} of {activeReassessment.questions.length}
                  </div>
                  <div className="progress-container" style={{ width: '250px', marginTop: '6px' }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${((reassessmentQIndex + 1) / Math.max(1, activeReassessment.questions.length)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="timer-chip">
                  <Clock size={15} />
                  <span>{formatTimer(reassessmentTimer)}</span>
                </div>
              </div>

              <div className="question-text" style={{ marginTop: '16px' }}>
                {activeReassessment.questions[reassessmentQIndex]?.questionText}
              </div>

              <div className="options-grid">
                {activeReassessment.questions[reassessmentQIndex]?.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`quiz-option ${reassessmentAnswers[reassessmentQIndex] === i ? 'selected' : ''}`}
                    onClick={() => setReassessmentAnswers((prev) => ({ ...prev, [reassessmentQIndex]: i }))}
                  >
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px'
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setReassessmentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={reassessmentQIndex === 0}
                >
                  Previous
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={() => setReassessmentState('none')}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (reassessmentQIndex < activeReassessment.questions.length - 1) {
                        setReassessmentQIndex((prev) => prev + 1);
                      } else {
                        finishReassessment();
                      }
                    }}
                    disabled={submittingReassessment}
                  >
                    {reassessmentQIndex < activeReassessment.questions.length - 1
                      ? 'Next Question'
                      : submittingReassessment
                      ? 'Submitting...'
                      : 'Submit Reassessment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reassessment Results Box */}
          {reassessmentState === 'results' && reassessmentResult && (
            <div className="assessment-box" style={{ marginBottom: '24px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <CheckCircle2 size={44} color="var(--accent-emerald)" />
                </div>
                <h3 style={{ fontSize: '1.4rem' }}>{reassessmentResult.skillName} Reassessment Verified</h3>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--secondary)', margin: '6px 0' }}>
                  {reassessmentResult.postProficiency}% ({reassessmentResult.deltaFormatted})
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Pre-Score: <strong>{reassessmentResult.preProficiency}% ({reassessmentResult.preTier})</strong> ➔ Post-Score: <strong>{reassessmentResult.postProficiency}% ({reassessmentResult.postTier})</strong>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
                  Readiness updated: {reassessmentResult.previousReadiness}% ➔ <strong>{reassessmentResult.newReadiness}%</strong>
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => setReassessmentState('none')}>
                  Continue to Learning Path
                </button>
                <button className="btn btn-outline" onClick={() => onTabChange('student-dashboard')}>
                  View Radar & Dashboard
                </button>
              </div>
            </div>
          )}

          {quizState === 'intro' && (
            <div className="assessment-box">
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <div className="stat-icon-wrapper stat-icon-indigo" style={{ width: '60px', height: '60px' }}>
                    <Target size={30} />
                  </div>
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Full-Stack Core Competency Diagnostic</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  This diagnostic validates your technical skills (Cloud, SQL, React, Node.js) against live industry benchmarks. Submitted answers are permanently recorded in the database to verify your multi-tier Skill Passport.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
                  <div className="tag"><Clock size={13} /> 10 Minutes</div>
                  <div className="tag"><FileCheck2 size={13} /> {questions.length} Questions</div>
                  <div className="tag"><TrendingUp size={13} /> Dynamic Skill Scoring</div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={startQuiz}>
                  Start Diagnostic Now <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {quizState === 'quiz' && (
            <div className="assessment-box">
              <div className="quiz-header">
                <div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                    Question {currentQIndex + 1} of {questions.length} • Skill: <strong style={{ color: 'var(--secondary)' }}>{questions[currentQIndex]?.skillName}</strong>
                  </div>
                  <div className="progress-container" style={{ width: '250px' }}>
                    <div className="progress-bar" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
                  </div>
                </div>
                <div className="timer-chip">
                  <Clock size={15} />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>
              </div>

              <div className="question-text">{questions[currentQIndex]?.questionText}</div>

              <div className="options-grid">
                {questions[currentQIndex]?.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`quiz-option ${selectedAnswers[currentQIndex] === i ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(i)}
                  >
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                >
                  Previous
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (currentQIndex < questions.length - 1) {
                      setCurrentQIndex((prev) => prev + 1);
                    } else {
                      finishQuiz();
                    }
                  }}
                  disabled={submittingQuiz}
                >
                  {currentQIndex < questions.length - 1 ? 'Next Question' : submittingQuiz ? 'Submitting...' : 'Submit Assessment'}
                </button>
              </div>
            </div>
          )}

          {quizState === 'results' && (
            <div className="assessment-box">
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <CheckCircle2 size={46} color="var(--accent-emerald)" />
                </div>
                <h3 style={{ fontSize: '1.5rem' }}>Assessment Completed & Verified</h3>
                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--secondary)', margin: '6px 0' }}>
                  {assessmentResult?.score || 85}/100
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Your scores have been stored in the database. Skills marked as <strong>Assessment Verified</strong>.
                </p>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-title">
                    <Search size={18} color="var(--accent-amber)" />
                    Calculated Skill Gaps (Target: {studentProfile?.targetRole})
                  </div>
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {skillGaps.map((g) => (
                      <div key={g.skillId || g.skillName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span>{g.skillName} (Current: {g.currentLevel}%, Target: {g.requiredLevel}%)</span>
                        <span className={getSeverityBadgeClass(g.severity)}>{g.severityLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">
                    <BookOpen size={18} color="var(--secondary)" />
                    Targeted Upskilling Roadmap
                  </div>
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {skillGaps.filter((g) => g.gap > 0).slice(0, 3).map((g) => (
                      <div key={g.skillName} className="tag tag-tech" style={{ padding: '8px 12px', justifyContent: 'space-between', display: 'flex' }}>
                        <span>Close {g.skillName} Gap (-{g.gap}%)</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => onTabChange('student-learning')}>
                          Enroll
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =============================================================
           3. INTERNSHIPS TAB
           ============================================================= */}
      {currentTab === 'student-internships' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Internship Opportunities</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Explore curated internships calibrated with live weighted match scores.
            </p>
          </div>

          <div className="grid-3">
            {opportunities
              .filter((o) => o.type === 'internship')
              .map((opp) => (
                <div key={opp.id} className="card opportunity-card">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="stat-icon-wrapper stat-icon-cyan" style={{ fontSize: '16px', fontWeight: 700 }}>
                      {opp.logoText || 'TI'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{opp.title}</div>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{opp.company}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                    {opp.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span className="tag tag-match" style={{ fontWeight: 700 }}>{opp.matchScore}% Match</span>
                    <span className="tag"><Clock size={12} /> {opp.duration}</span>
                    <span className="tag"><DollarSign size={12} /> {opp.stipend}</span>
                    <span className="tag"><MapPin size={12} /> {opp.location}</span>
                  </div>

                  {/* Matched vs Missing Skills Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                    {opp.strongSkills?.slice(0, 2).map((s) => (
                      <span key={s} className="tag tag-tech" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        ✓ {s}
                      </span>
                    ))}
                    {opp.remainingGaps?.slice(0, 1).map((g) => (
                      <span key={g.name || g} className="tag tag-danger" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        ⚠ {g.name || g}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => onOpenModal('matchExplainer', opp)}
                    >
                      <Sparkles size={13} /> Why {opp.matchScore}%?
                    </button>
                    <button
                      className={`btn ${opp.applied ? 'btn-outline' : 'btn-primary'} btn-sm`}
                      style={{ flex: 1 }}
                      onClick={() => onApply(opp.id)}
                      disabled={opp.applied}
                    >
                      {opp.applied ? 'Applied' : '1-Click Apply'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =============================================================
           4. JOBS TAB
           ============================================================= */}
      {currentTab === 'student-jobs' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Full-Time Placements & Jobs</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Direct campus and industry openings for final-year students and graduates.
            </p>
          </div>

          <div className="grid-2">
            {opportunities
              .filter((o) => o.type === 'job')
              .map((opp) => (
                <div key={opp.id} className="card opportunity-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.15rem' }}>{opp.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {opp.company} • {opp.location}
                      </div>
                    </div>
                    <span className="tag tag-match" style={{ fontWeight: 700 }}>{opp.matchScore}% Match</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', margin: '10px 0' }}>
                    <span className="tag"><Briefcase size={12} /> {opp.duration}</span>
                    <span className="tag"><DollarSign size={12} /> {opp.stipend}</span>
                    <span className="tag"><Calendar size={12} /> Ends {opp.deadline}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                    {opp.description}
                  </p>

                  {/* Matched vs Missing Skills Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                    {opp.strongSkills?.slice(0, 3).map((s) => (
                      <span key={s} className="tag tag-tech" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        ✓ {s}
                      </span>
                    ))}
                    {opp.remainingGaps?.slice(0, 2).map((g) => (
                      <span key={g.name || g} className="tag tag-danger" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        ⚠ {g.name || g}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => onOpenModal('matchExplainer', opp)}
                    >
                      <Sparkles size={15} /> Why {opp.matchScore}% Match?
                    </button>
                    <button
                      className={`btn ${opp.applied ? 'btn-outline' : 'btn-primary'}`}
                      style={{ flex: 1 }}
                      onClick={() => onApply(opp.id)}
                      disabled={opp.applied}
                    >
                      {opp.applied ? 'Applied' : 'Apply for Position'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =============================================================
           5. MOCK TESTS TAB
           ============================================================= */}
      {currentTab === 'student-mock-tests' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Placement Diagnostic Test Catalog</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Standardized diagnostics evaluating technical competencies and aptitude readiness.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>Full-Stack & Cloud Core Competency</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Technical • 10 mins • 4 Questions
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '16px' }}>
                <span>Status: <strong style={{ color: 'var(--secondary)' }}>Active Diagnostic</strong></span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onTabChange('student-assessment')}>
                Start Diagnostic Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
           6. DIGITAL PORTFOLIO & SKILL PASSPORT TAB
           ============================================================= */}
      {currentTab === 'student-portfolio' && (
        <div className="view-section active">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="tag tag-match" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 800 }}>
                  ✓ Official PlacePro Credential
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ID: <strong style={{ color: '#a5b4fc' }}>{passportData?.passportId || studentProfile?.passportId || 'passport-john-2026'}</strong>
                </span>
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '4px' }}>Evidence-Based Skill Passport</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Persistent multi-tier verification backed by concrete test data, code repositories, and faculty reviews.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => window.print()}>
                <Printer size={15} /> Print Credential
              </button>
              <button className="btn btn-primary" onClick={() => onOpenModal('sharePortfolio', passportData || studentProfile)}>
                <Share2 size={15} /> Share Verified URL
              </button>
            </div>
          </div>

          {/* Student Credential Hero Card */}
          <div
            className="card"
            style={{
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div
                  className="user-avatar"
                  style={{
                    width: '72px',
                    height: '72px',
                    fontSize: '26px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  {studentProfile?.fullName ? studentProfile.fullName.split(' ').map((n) => n[0]).join('') : 'JD'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '1.45rem', fontWeight: '800' }}>{studentProfile?.fullName || 'John Developer'}</div>
                    <span className="tag tag-match" style={{ fontSize: '0.75rem' }}><CheckCircle2 size={12} /> Verified Identity</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                    {studentProfile?.regNumber} • {studentProfile?.department} (Semester {studentProfile?.semester})
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span className="tag tag-tech">{studentProfile?.institution || 'Takshashila Institute of Technology'}</span>
                    <span className="tag" style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc' }}>
                      Target Role: <strong style={{ color: 'var(--secondary)' }}>{studentProfile?.targetRole}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Readiness Index Stat Pill */}
              <div
                style={{
                  padding: '16px 22px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'center',
                  minWidth: '160px'
                }}
              >
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Placement Readiness
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', lineHeight: 1.2, marginTop: '2px' }}>
                  {studentProfile?.placementReadiness || 78}%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                  Top Verified Tier
                </div>
              </div>
            </div>
          </div>

          {/* Verification Tiers Multi-Step Explainer Legend */}
          <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              PlacePro Evidence-Based Verification Pipeline
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid #64748b' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8' }}>1. Self-Reported</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Claimed by student without standardized test data.</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(6,182,212,0.05)', borderRadius: '8px', borderLeft: '3px solid #06b6d4' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#06b6d4' }}>2. Assessment Verified</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Passed standardized diagnostic & timed tests.</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(99,102,241,0.05)', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818cf8' }}>3. Institution Verified</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Endorsed by faculty on projects & coursework.</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>4. Industry Verified</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Evaluated by corporate recruiters & interviewers.</div>
              </div>
            </div>
          </div>

          {/* Detailed Skill Cards with Concrete Evidence Tracing */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="var(--primary-light)" />
                Evidence-Backed Skill Records ({passportData?.skills?.length || studentSkills.length} Skills)
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Click any skill to inspect verification history and concrete database evidence
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(passportData?.skills || studentSkills).map((s) => {
                const isExpanded = expandedSkillId === (s.skillId || s.id || s.name);
                const tier = s.verificationTier || s.tier || 'SELF_REPORTED';

                let tierBadge = <span className="tag" style={{ background: '#334155', color: '#94a3b8' }}>• Self-Reported</span>;
                if (tier === 'INDUSTRY_VERIFIED') {
                  tierBadge = <span className="tag" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', fontWeight: 700 }}>★ Industry Verified</span>;
                } else if (tier === 'INSTITUTION_VERIFIED') {
                  tierBadge = <span className="tag" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)', fontWeight: 700 }}>✓ Faculty Verified</span>;
                } else if (tier === 'ASSESSMENT_VERIFIED') {
                  tierBadge = <span className="tag" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.4)', fontWeight: 700 }}>✓ Assessment Verified</span>;
                }

                return (
                  <div
                    key={s.skillId || s.id || s.name}
                    className="card"
                    style={{
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: isExpanded ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-subtle)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Top Row: Skill Name, Proficiency, Tier, Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {s.skillName || s.name}
                            <span className="tag tag-tech" style={{ fontSize: '0.7rem' }}>{s.category || 'TECHNICAL'}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {s.summaryExplanation || 'Verified through concrete PlacePro competency evidence.'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                            {s.proficiency}%
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Proficiency</div>
                        </div>
                        {tierBadge}
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setExpandedSkillId(isExpanded ? null : (s.skillId || s.id || s.name))}
                        >
                          {isExpanded ? 'Hide Evidence' : `Show Evidence (${s.evidenceCount || s.evidence?.length || 1})`}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-container" style={{ height: '5px', marginTop: '12px' }}>
                      <div className="progress-bar" style={{ width: `${s.proficiency}%` }}></div>
                    </div>

                    {/* Expandable Evidence Drawer */}
                    {isExpanded && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          Verified Database Evidence Trail
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                          {s.evidence && s.evidence.length > 0 ? (
                            s.evidence.map((ev, eIdx) => (
                              <div
                                key={eIdx}
                                style={{
                                  padding: '12px',
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(255, 255, 255, 0.06)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span className="tag tag-tech" style={{ fontSize: '0.68rem' }}>{ev.type}</span>
                                  {ev.score && <strong style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>{ev.score}</strong>}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ev.title}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {ev.description}
                                </div>
                                {ev.verifier && (
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                    Verified by: <span style={{ color: '#a5b4fc' }}>{ev.verifier}</span>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              Self-reported skill. Take a standardized diagnostic test or complete a project to upgrade verification.
                            </div>
                          )}
                        </div>

                        {/* Audit History */}
                        {s.history && s.history.length > 0 && (
                          <div style={{ marginTop: '14px' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                              Verification Transition History
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {s.history.map((h, hIdx) => (
                                <div key={hIdx} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <CheckCircle2 size={13} color="var(--accent-emerald)" />
                                  <span>
                                    <strong style={{ color: '#f8fafc' }}>{h.fromTier} ➔ {h.toTier}</strong> by {h.verifierName} ({h.verifierRole}) • {new Date(h.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ marginTop: '12px', textAlign: 'right' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => onOpenModal('skillEvidence', s)}
                          >
                            Drill Down Evidence Chain ➔
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified Projects & Certifications Grid */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            {/* Projects */}
            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <FolderGit2 size={18} color="var(--secondary)" />
                Verified Project Proof of Work
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(passportData?.projects || studentProfile?.projects || []).map((p) => (
                  <div key={p.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '0.92rem' }}>{p.title}</strong>
                      <span className="tag tag-match" style={{ fontSize: '0.7rem' }}>✓ Faculty Verified</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 8px 0' }}>
                      {p.description}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(p.skills || []).map((sk, idx) => (
                        <span key={idx} className="tag tag-tech" style={{ fontSize: '0.68rem' }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Award size={18} color="var(--primary-light)" />
                Verified Industry Certifications
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(passportData?.certifications || studentProfile?.certifications || []).map((c) => (
                  <div key={c.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '0.92rem' }}>{c.name}</strong>
                      <span className="tag tag-match" style={{ fontSize: '0.7rem' }}>✓ Verified Credential</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Issuer: <strong style={{ color: '#e2e8f0' }}>{c.issuer}</strong> • {c.issuedDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
           7. APPLICATION TRACKING KANBAN TAB
           ============================================================= */}
      {currentTab === 'student-applications' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Application Lifecycle Tracker</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Real-time synchronization with recruiter ATS across all active applications.
            </p>
          </div>

          <div className="kanban-board">
            {['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'offer'].map((colKey) => {
              const colLabels = {
                applied: 'Applied',
                under_review: 'Under Review',
                shortlisted: 'Shortlisted',
                interview_scheduled: 'Interview',
                offer: 'Offers'
              };

              const colApps = opportunities.filter((o) => {
                if (!o.applied) return false;
                const status = (o.applicationStatus || 'applied').toLowerCase();
                return status === colKey;
              });

              return (
                <div key={colKey} className="kanban-column">
                  <div className="kanban-col-header">
                    <span>{colLabels[colKey]}</span>
                    <span className="tag">{colApps.length}</span>
                  </div>
                  {colApps.map((app) => (
                    <div key={app.id} className="kanban-card">
                      <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{app.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{app.company}</div>
                      <div style={{ marginTop: '8px', fontSize: '0.73rem', color: '#a5b4fc' }}>
                        Match: {app.matchScore}%
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =============================================================
           8. LEARNING RESOURCES TAB (GAP-DRIVEN & REASSESSMENT)
           ============================================================= */}
      {currentTab === 'student-learning' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Personalized Learning & Skill Gap Bridging</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Curated modules dynamically prioritized to close your detected skill gaps. Complete modules to unlock targeted reassessment.
            </p>
          </div>

          <div className="grid-3">
            {learningModules.map((mod) => {
              const isCompleted = mod.progressPct >= 100 || mod.status === 'COMPLETED';
              return (
                <div
                  key={mod.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: mod.hasActiveGap ? '1px solid rgba(245, 158, 11, 0.3)' : undefined
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="tag tag-tech">{mod.skillName}</span>
                      <span className={getSeverityBadgeClass(mod.severity)}>{mod.severityLabel}</span>
                    </div>

                    <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '6px' }}>{mod.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      {mod.provider} • {mod.duration} • Level: {mod.level}
                    </div>

                    {/* Explainable Recommendation Rationale */}
                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginBottom: '16px',
                        borderLeft: mod.hasActiveGap ? '3px solid var(--accent-amber)' : '3px solid var(--secondary)'
                      }}
                    >
                      {mod.recommendationReason}
                    </div>
                  </div>

                  <div>
                    {/* Progress Indicator */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Module Progress</span>
                        <strong style={{ color: isCompleted ? 'var(--accent-emerald)' : 'var(--secondary)' }}>
                          {mod.progressPct}% {isCompleted ? '✓ Completed' : ''}
                        </strong>
                      </div>
                      <div className="progress-container" style={{ height: '6px' }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${mod.progressPct}%`,
                            background: isCompleted ? 'var(--accent-emerald)' : undefined
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {!isCompleted ? (
                        <>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => handleUpdateProgress(mod.id, Math.min(100, (mod.progressPct || 0) + 25))}
                            disabled={updatingResourceProgress === mod.id}
                          >
                            {mod.progressPct === 0 ? 'Start Course (+25%)' : 'Advance (+25%)'}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUpdateProgress(mod.id, 100)}
                            disabled={updatingResourceProgress === mod.id}
                          >
                            Mark 100%
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
                          onClick={() => {
                            onTabChange('student-assessment');
                            startReassessmentForSkill(mod.skillId, mod.skillName);
                          }}
                        >
                          <Award size={15} style={{ marginRight: '6px' }} />
                          Take Targeted Reassessment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

