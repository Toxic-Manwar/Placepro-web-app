import React, { useState, useEffect, useCallback } from 'react';
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
  Star,
  Target,
  Search,
  BookOpen
} from 'lucide-react';
import RadarChart from '../components/RadarChart';
import { QUIZ_QUESTIONS } from '../data/mockData';

export default function StudentPortal({
  currentTab,
  onTabChange,
  assessment,
  setAssessment,
  opportunities,
  onApply,
  mockTests,
  applications,
  onOpenModal
}) {
  // Assessment Quiz State
  const [quizState, setQuizState] = useState('intro'); // 'intro', 'quiz', 'results'
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes

  const finishQuiz = useCallback(() => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correct++;
    });
    const calculatedScore = Math.max(Math.round((correct / QUIZ_QUESTIONS.length) * 100), 75);
    setAssessment((prev) => ({
      ...prev,
      score: calculatedScore,
      technical: Math.min(calculatedScore + 5, 95)
    }));
    setQuizState('results');
  }, [selectedAnswers, setAssessment]);

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

  return (
    <>
      {/* =============================================================
           1. STUDENT DASHBOARD TAB
           ============================================================= */}
      {currentTab === 'student-dashboard' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome back, John. Here is your current career readiness and opportunity tracker.
            </p>
          </div>

          {/* Profile Progress Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>Profile Completion Status: 78%</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Completed: Personal info, Skills assessment. Pending: Docker credential verification.
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => onTabChange('student-portfolio')}>
                Edit Portfolio
              </button>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: '78%' }}></div>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid-4" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Applications</div>
                <div className="stat-value">{applications.length}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-indigo">
                <Briefcase size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Shortlisted</div>
                <div className="stat-value">2</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-cyan">
                <Star size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Interviews</div>
                <div className="stat-value">1</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-emerald">
                <Calendar size={22} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Skill Score</div>
                <div className="stat-value">{assessment.score}/100</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-amber">
                <Target size={22} />
              </div>
            </div>
          </div>

          {/* Radar Chart & High-Match Roles */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Target size={18} color="var(--primary-light)" />
                    Skill Profiling Radar
                  </div>
                  <div className="card-subtitle">Verified multi-dimensional competency analysis</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => onTabChange('student-assessment')}>
                  Retake Test
                </button>
              </div>
              <RadarChart assessmentData={assessment} />
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <TrendingUp size={18} color="var(--secondary)" />
                    High-Match Opportunities
                  </div>
                  <div className="card-subtitle">Roles calibrated against your skill profile</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => onTabChange('student-internships')}>
                  View All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {opportunities.slice(0, 2).map((opp) => (
                  <div key={opp.id} className="card" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '700' }}>{opp.title}</div>
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                          {opp.company} • {opp.location}
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                          <span className="tag tag-match">{opp.matchScore}% Match</span>
                          {opp.skills.map((s, idx) => (
                            <span key={idx} className="tag tag-tech">{s}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        className={`btn ${opp.applied ? 'btn-outline' : 'btn-primary'} btn-sm`}
                        onClick={() => onApply(opp.id)}
                        disabled={opp.applied}
                      >
                        {opp.applied ? 'Applied' : 'Apply Now'}
                      </button>
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
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Comprehensive Skill Assessment</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Evaluate Technical, Soft Skills, and Aptitude competencies for automated profiling.
            </p>
          </div>

          {quizState === 'intro' && (
            <div className="assessment-box">
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <div className="stat-icon-wrapper stat-icon-indigo" style={{ width: '60px', height: '60px' }}>
                    <Target size={30} />
                  </div>
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>Standardized Skill Readiness Diagnostic</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  This interactive diagnostic evaluates core algorithmic thinking, database concepts, and system scalability. Your score dynamically updates your radar chart and opportunity compatibility metrics.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
                  <div className="tag"><Clock size={13} /> 10 Minutes</div>
                  <div className="tag"><FileCheck2 size={13} /> 4 Questions</div>
                  <div className="tag"><TrendingUp size={13} /> Real-Time Profiling</div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={startQuiz}>
                  Start Assessment Now <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {quizState === 'quiz' && (
            <div className="assessment-box">
              <div className="quiz-header">
                <div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                    Question {currentQIndex + 1} of {QUIZ_QUESTIONS.length}
                  </div>
                  <div className="progress-container" style={{ width: '250px' }}>
                    <div className="progress-bar" style={{ width: `${((currentQIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}></div>
                  </div>
                </div>
                <div className="timer-chip">
                  <Clock size={15} />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>
              </div>

              <div className="question-text">{QUIZ_QUESTIONS[currentQIndex].q}</div>

              <div className="options-grid">
                {QUIZ_QUESTIONS[currentQIndex].options.map((opt, i) => (
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
                    if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
                      setCurrentQIndex((prev) => prev + 1);
                    } else {
                      finishQuiz();
                    }
                  }}
                >
                  {currentQIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Submit Assessment'}
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
                <h3 style={{ fontSize: '1.5rem' }}>Assessment Completed</h3>
                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--secondary)', margin: '6px 0' }}>
                  {assessment.score}/100
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Your skill profile and radar visualization have been calibrated.
                </p>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-title">
                    <Search size={18} color="var(--accent-amber)" />
                    Identified Skill Gaps
                  </div>
                  <ul style={{ margin: '14px 0 0 20px', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.88rem' }}>
                    {assessment.gaps.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <div className="card-title">
                    <BookOpen size={18} color="var(--secondary)" />
                    Recommended Learning Roadmap
                  </div>
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {assessment.recommendations.map((rec, idx) => (
                      <div key={idx} className="tag tag-tech" style={{ padding: '8px 12px' }}>
                        {rec.title} ({rec.duration}) • {rec.provider}
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
              Explore curated internships with top enterprise tech firms.
            </p>
          </div>

          <div className="grid-3">
            {opportunities
              .filter((o) => o.type === 'internship')
              .map((opp) => (
                <div key={opp.id} className="card opportunity-card">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="stat-icon-wrapper stat-icon-cyan" style={{ fontSize: '16px', fontWeight: 700 }}>
                      {opp.logoText}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{opp.title}</div>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{opp.company}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                    {opp.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    <span className="tag tag-match">{opp.matchScore}% Match</span>
                    <span className="tag"><Clock size={12} /> {opp.duration}</span>
                    <span className="tag"><DollarSign size={12} /> {opp.stipend}</span>
                    <span className="tag"><MapPin size={12} /> {opp.location}</span>
                  </div>
                  <button
                    className={`btn ${opp.applied ? 'btn-outline' : 'btn-primary'}`}
                    style={{ width: '100%' }}
                    onClick={() => onApply(opp.id)}
                    disabled={opp.applied}
                  >
                    {opp.applied ? 'Applied' : '1-Click Apply'}
                  </button>
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
                    <span className="tag tag-match">{opp.matchScore}% Match</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
                    <span className="tag"><Briefcase size={12} /> {opp.duration}</span>
                    <span className="tag"><DollarSign size={12} /> {opp.stipend}</span>
                    <span className="tag"><Calendar size={12} /> Ends {opp.deadline}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
                    {opp.description}
                  </p>
                  <button
                    className={`btn ${opp.applied ? 'btn-outline' : 'btn-primary'}`}
                    style={{ width: '100%' }}
                    onClick={() => onApply(opp.id)}
                    disabled={opp.applied}
                  >
                    {opp.applied ? 'Applied' : 'Apply for Position'}
                  </button>
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
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Placement Mock Test Platform</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Practice with timed assessments simulating technical and aptitude hiring rounds.
            </p>
          </div>

          <div className="grid-3">
            {mockTests.map((t) => (
              <div key={t.id} className="card">
                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>{t.name}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  {t.category} • {t.duration} • {t.questionsCount} Questions
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '16px' }}>
                  <span>Best Score: <strong style={{ color: t.userScore ? 'var(--secondary)' : 'var(--text-muted)' }}>{t.userScore ? `${t.userScore}%` : 'Unattempted'}</strong></span>
                  <span>Attempts: <strong>{t.attempts}</strong></span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onTabChange('student-assessment')}>
                  Start Mock Test
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =============================================================
           6. DIGITAL PORTFOLIO TAB
           ============================================================= */}
      {currentTab === 'student-portfolio' && (
        <div className="view-section active">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Digital Portfolio & Showcase</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Verified profile showcasing your skills, projects, and certifications to recruiters.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => window.print()}>
                <Printer size={15} /> Export PDF
              </button>
              <button className="btn btn-secondary" onClick={() => onOpenModal('sharePortfolio')}>
                <Share2 size={15} /> Share Public URL
              </button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '24px' }}>JD</div>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>John Developer</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  B.Tech Computer Science (Sem 6) • CGPA: 8.5/10
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <span className="tag tag-match"><CheckCircle2 size={12} /> Verified Student</span>
                  <span className="tag tag-tech">Takshashila University</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-title">
                <Briefcase size={18} color="var(--primary-light)" />
                Featured Projects
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="card" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontWeight: '700' }}>E-Commerce Full-Stack Microservices</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                    Built with Python, Django, React, PostgreSQL, and Stripe payment gateway.
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="tag tag-tech">Python</span>
                    <span className="tag tag-tech">React</span>
                    <span className="tag tag-tech">PostgreSQL</span>
                  </div>
                </div>

                <div className="card" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontWeight: '700' }}>Real-Time Collaborative Code Editor</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                    WebSocket synchronized multiplayer editor with syntax highlighting.
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="tag tag-tech">JavaScript</span>
                    <span className="tag tag-tech">WebSockets</span>
                    <span className="tag tag-tech">Node.js</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <Award size={18} color="var(--accent-amber)" />
                Verified Certifications
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="card" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>AWS Certified Solutions Architect</div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>Issued by Amazon Web Services • May 2024</div>
                  </div>
                  <span className="tag tag-match"><CheckCircle2 size={12} /> Verified</span>
                </div>

                <div className="card" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>React & Redux State Mastery</div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>Issued by Meta • Nov 2024</div>
                  </div>
                  <span className="tag tag-match"><CheckCircle2 size={12} /> Verified</span>
                </div>
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
              Real-time status tracking across all submitted applications.
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
              const colApps = applications.filter((a) => a.status === colKey);

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
                        Match: {app.match}% • {app.date}
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
           8. LEARNING RESOURCES TAB
           ============================================================= */}
      {currentTab === 'student-learning' && (
        <div className="view-section active">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Personalized Learning & Skill Bridging</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Targeted programs recommended to close identified skill gaps.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div className="tag tag-tech" style={{ marginBottom: '12px' }}>Cloud Architecture</div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>AWS Solutions Architect Immersion</div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                Master VPCs, IAM, EC2, ECS, and Serverless event architecture.
              </p>
              <button className="btn btn-secondary" style={{ width: '100%' }}>Enroll Free Course</button>
            </div>

            <div className="card">
              <div className="tag tag-tech" style={{ marginBottom: '12px' }}>DevOps</div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>Docker & Kubernetes in Production</div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                Containerize microservices, write Helm charts, and configure CI/CD.
              </p>
              <button className="btn btn-secondary" style={{ width: '100%' }}>Enroll Free Course</button>
            </div>

            <div className="card">
              <div className="tag tag-tech" style={{ marginBottom: '12px' }}>System Design</div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>High-Throughput Distributed Systems</div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                Caching strategies, rate limiters, Kafka queues, and CAP theorem trade-offs.
              </p>
              <button className="btn btn-secondary" style={{ width: '100%' }}>Enroll Free Course</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
