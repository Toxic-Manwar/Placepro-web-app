/**
 * ACADEMIA-INDUSTRY COLLABORATION PORTAL
 * Interactive Web Application Logic & State Engine
 */

// Initial Seed Data Store (aligned with 05_SAMPLE_DATA_TEMPLATES.json)
const AppState = {
  currentRole: 'public', // 'public', 'student', 'industry', 'academician', 'institution', 'admin'
  currentTab: 'home',

  // Active User Context
  user: {
    name: 'John Developer',
    email: 'john.developer@email.com',
    role: 'student',
    cgpa: 8.5,
    department: 'Computer Science',
    institution: 'Takshashila University',
    verified: true,
    profileCompletion: 78
  },

  // Skills
  skills: [
    { id: 'TECH001', name: 'Python', category: 'technical', demand: 'Very High', level: 4 },
    { id: 'TECH002', name: 'JavaScript', category: 'technical', demand: 'Very High', level: 4 },
    { id: 'TECH003', name: 'React', category: 'technical', demand: 'High', level: 3 },
    { id: 'TECH004', name: 'SQL', category: 'technical', demand: 'Very High', level: 4 },
    { id: 'TECH005', name: 'Docker', category: 'technical', demand: 'High', level: 2 },
    { id: 'SOFT001', name: 'Communication', category: 'soft', demand: 'Very High', level: 4 },
    { id: 'SOFT002', name: 'Teamwork', category: 'soft', demand: 'Very High', level: 4 },
    { id: 'SOFT003', name: 'Problem-Solving', category: 'soft', demand: 'Very High', level: 5 }
  ],

  // Student Skill Assessment State
  assessment: {
    score: 78,
    technical: 85,
    soft: 82,
    aptitude: 80,
    gaps: ['Advanced Cloud (AWS/GCP)', 'Docker & Kubernetes', 'System Architecture'],
    recommendations: [
      { title: 'AWS Cloud Solutions Architect', provider: 'AWS SkillBuilder', duration: '4 weeks', level: 'Intermediate' },
      { title: 'Docker & Kubernetes Mastery', provider: 'Industry Academy', duration: '3 weeks', level: 'Advanced' },
      { title: 'Modern System Design', provider: 'Tech Innovations', duration: '6 weeks', level: 'Advanced' }
    ]
  },

  // Opportunities
  opportunities: [
    {
      id: 'INT001',
      type: 'internship',
      title: 'Full-Stack Developer Intern',
      company: 'Tech Innovations India',
      companyLogo: '⚡',
      location: 'Bangalore (Remote)',
      isRemote: true,
      duration: '3 months',
      stipend: '₹25,000 / mo',
      deadline: '2026-10-15',
      skills: ['Python', 'JavaScript', 'React'],
      matchScore: 92,
      applied: true,
      status: 'under_review',
      description: "Join our core development team to build scalable cloud-native web apps. Work with senior engineers on real customer workloads."
    },
    {
      id: 'INT002',
      type: 'internship',
      title: 'AI & Data Science Intern',
      company: 'Cognitive Nexus Labs',
      companyLogo: '🧠',
      location: 'Hyderabad (Hybrid)',
      isRemote: false,
      duration: '6 months',
      stipend: '₹35,000 / mo',
      deadline: '2026-10-22',
      skills: ['Python', 'SQL', 'Machine Learning'],
      matchScore: 88,
      applied: false,
      status: null,
      description: "Assist research teams in feature engineering, fine-tuning LLM pipelines, and building predictive analytics models."
    },
    {
      id: 'JOB001',
      type: 'job',
      title: 'Associate Cloud Engineer',
      company: 'CloudMatrix Technologies',
      companyLogo: '☁️',
      location: 'Bangalore (Remote)',
      isRemote: true,
      duration: 'Full-Time',
      stipend: '₹8.5 - 12 LPA',
      deadline: '2026-11-01',
      skills: ['Python', 'Docker', 'SQL'],
      matchScore: 82,
      applied: false,
      status: null,
      description: "Build robust backend microservices, monitor Kubernetes clusters, and automate CI/CD release pipelines."
    },
    {
      id: 'JOB002',
      type: 'job',
      title: 'Frontend React Developer',
      company: 'Fintech Spark Inc.',
      companyLogo: '💳',
      location: 'Mumbai (On-site)',
      isRemote: false,
      duration: 'Full-Time',
      stipend: '₹10 - 15 LPA',
      deadline: '2026-10-30',
      skills: ['JavaScript', 'React', 'TypeScript'],
      matchScore: 85,
      applied: true,
      status: 'shortlisted',
      description: "Develop ultra-fast transaction dashboards with high responsiveness, interactive charting, and state security."
    }
  ],

  // Mock Tests
  mockTests: [
    {
      id: 'TEST001',
      name: 'Full Stack & Data Structures Challenge',
      category: 'Technical',
      duration: '45 mins',
      questionsCount: 20,
      difficulty: 'Medium',
      avgScore: 78,
      userScore: 84,
      attempts: 2,
      rank: '45th Percentile'
    },
    {
      id: 'TEST002',
      name: 'Quantitative & Logical Aptitude Test',
      category: 'Aptitude',
      duration: '30 mins',
      questionsCount: 25,
      difficulty: 'Easy',
      avgScore: 72,
      userScore: 80,
      attempts: 1,
      rank: '62nd Percentile'
    },
    {
      id: 'TEST003',
      name: 'Core Python & Database Architecture',
      category: 'Technical',
      duration: '40 mins',
      questionsCount: 20,
      difficulty: 'Hard',
      avgScore: 65,
      userScore: null,
      attempts: 0,
      rank: 'Not Attempted'
    }
  ],

  // Applications
  applications: [
    { id: 'APP001', opportunityId: 'INT001', title: 'Full-Stack Developer Intern', company: 'Tech Innovations India', status: 'under_review', date: 'Sep 01, 2026', match: 92 },
    { id: 'APP002', opportunityId: 'JOB002', title: 'Frontend React Developer', company: 'Fintech Spark Inc.', status: 'shortlisted', date: 'Sep 03, 2026', match: 85 },
    { id: 'APP003', opportunityId: 'INT003', title: 'Backend Python Engineer', company: 'TCS Innovation Hub', status: 'interview_scheduled', date: 'Aug 28, 2026', match: 90 },
    { id: 'APP004', opportunityId: 'JOB004', title: 'Software Engineer Graduate', company: 'Infosys Wings', status: 'offer', date: 'Aug 20, 2026', match: 94 }
  ]
};

// ===================================================================
// APPLICATION INITIALIZATION & ROUTING
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  initPortal();
  setupEventListeners();
  renderAllViews();
});

function initPortal() {
  // Set default role
  switchPortal('public');
}

function switchPortal(role) {
  AppState.currentRole = role;
  
  // Update portal switcher buttons
  document.querySelectorAll('.portal-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === role);
  });

  // Update Main Container views
  const sidebar = document.getElementById('portalSidebar');
  if (role === 'public') {
    sidebar.style.display = 'none';
    showTab('public-home');
  } else {
    sidebar.style.display = 'flex';
    renderSidebarNav(role);
    showTab(`${role}-dashboard`);
  }
}

function renderSidebarNav(role) {
  const navContainer = document.getElementById('sidebarNavList');
  let navItems = [];

  if (role === 'student') {
    navItems = [
      { id: 'student-dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'student-assessment', label: 'Skill Assessment', icon: '🎯', badge: 'New' },
      { id: 'student-internships', label: 'Internships', icon: '💼' },
      { id: 'student-jobs', label: 'Jobs & Placements', icon: '👔' },
      { id: 'student-mock-tests', label: 'Mock Tests', icon: '📝' },
      { id: 'student-portfolio', label: 'Digital Portfolio', icon: '📂' },
      { id: 'student-applications', label: 'Track Applications', icon: '📋', badge: `${AppState.applications.length}` },
      { id: 'student-learning', label: 'Learning Resources', icon: '🎓' }
    ];
  } else if (role === 'industry') {
    navItems = [
      { id: 'industry-dashboard', label: 'Company Overview', icon: '🏢' },
      { id: 'industry-post-opportunity', label: 'Post Opportunity', icon: '➕' },
      { id: 'industry-manage-postings', label: 'Manage Postings', icon: '📑' },
      { id: 'industry-candidates', label: 'Candidate ATS', icon: '👥', badge: '12 New' },
      { id: 'industry-analytics', label: 'Hiring Analytics', icon: '📈' }
    ];
  } else if (role === 'academician') {
    navItems = [
      { id: 'academician-dashboard', label: 'Faculty Dashboard', icon: '🔬' },
      { id: 'academician-opportunities', label: 'FDP & Consulting', icon: '📚' },
      { id: 'academician-mentorship', label: 'Student Mentorship', icon: '🤝' },
      { id: 'academician-research', label: 'Joint Research Bids', icon: '💡' }
    ];
  } else if (role === 'institution') {
    navItems = [
      { id: 'institution-dashboard', label: 'University Command', icon: '🏛️' },
      { id: 'institution-placement-analytics', label: 'Placement Analytics', icon: '📊' },
      { id: 'institution-skill-gaps', label: 'Batch Skill Gaps', icon: '📉' },
      { id: 'institution-mous', label: 'Industry MOUs', icon: '📝' }
    ];
  } else if (role === 'admin') {
    navItems = [
      { id: 'admin-dashboard', label: 'Platform Control', icon: '⚙️' },
      { id: 'admin-users', label: 'KYC & Verification', icon: '🛡️' },
      { id: 'admin-skills', label: 'Skills Taxonomy', icon: '🏷️' }
    ];
  }

  navContainer.innerHTML = navItems.map((item, index) => `
    <li>
      <div class="sidebar-link ${index === 0 ? 'active' : ''}" onclick="showTab('${item.id}')" data-tab="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${item.badge ? `<span class="sidebar-badge">${item.badge}</span>` : ''}
      </div>
    </li>
  `).join('');
}

function showTab(tabId) {
  AppState.currentTab = tabId;

  // Toggle active class on sidebar
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });

  // Toggle view sections
  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(tabId);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Trigger charts if applicable
  if (tabId === 'student-assessment' || tabId === 'student-dashboard') {
    renderRadarChart();
  }
  if (tabId === 'institution-placement-analytics' || tabId === 'industry-analytics') {
    renderBarCharts();
  }
}

// ===================================================================
// EVENT LISTENERS & MODAL MANAGEMENT
// ===================================================================
function setupEventListeners() {
  // Global Search Filter
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterOpportunities(e.target.value);
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// ===================================================================
// RADAR CHART GENERATOR (HTML5 Canvas)
// ===================================================================
function renderRadarChart() {
  const canvas = document.getElementById('skillRadarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 40;

  ctx.clearRect(0, 0, width, height);

  const categories = [
    { name: 'Programming', value: 85 },
    { name: 'Web Dev', value: 78 },
    { name: 'Databases', value: 72 },
    { name: 'Frameworks', value: 68 },
    { name: 'DevOps/Cloud', value: 60 },
    { name: 'Soft Skills', value: 82 },
    { name: 'Aptitude', value: 80 }
  ];
  const numSides = categories.length;

  // Draw concentric polygon grid
  for (let level = 1; level <= 5; level++) {
    const levelRadius = (radius / 5) * level;
    ctx.beginPath();
    for (let i = 0; i < numSides; i++) {
      const angle = (Math.PI * 2 / numSides) * i - Math.PI / 2;
      const x = centerX + levelRadius * Math.cos(angle);
      const y = centerY + levelRadius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw radial axis lines & labels
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < numSides; i++) {
    const angle = (Math.PI * 2 / numSides) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Text Label positioning
    const labelX = centerX + (radius + 24) * Math.cos(angle);
    const labelY = centerY + (radius + 18) * Math.sin(angle);
    ctx.fillText(categories[i].name, labelX, labelY);
  }

  // Draw student data polygon
  ctx.beginPath();
  for (let i = 0; i < numSides; i++) {
    const angle = (Math.PI * 2 / numSides) * i - Math.PI / 2;
    const valRadius = (radius * (categories[i].value / 100));
    const x = centerX + valRadius * Math.cos(angle);
    const y = centerY + valRadius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.fill();
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw data point circles
  for (let i = 0; i < numSides; i++) {
    const angle = (Math.PI * 2 / numSides) * i - Math.PI / 2;
    const valRadius = (radius * (categories[i].value / 100));
    const x = centerX + valRadius * Math.cos(angle);
    const y = centerY + valRadius * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// ===================================================================
// BAR & ANALYTICS CHARTS GENERATOR
// ===================================================================
function renderBarCharts() {
  const canvas = document.getElementById('placementBarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const data = [
    { label: 'CSE', rate: 96, ctc: '12.4 LPA' },
    { label: 'IT', rate: 92, ctc: '10.8 LPA' },
    { label: 'ECE', rate: 88, ctc: '8.5 LPA' },
    { label: 'Mech', rate: 78, ctc: '6.2 LPA' },
    { label: 'Civil', rate: 74, ctc: '5.8 LPA' }
  ];

  const barWidth = 40;
  const gap = 30;
  const startX = 40;
  const maxHeight = canvas.height - 60;

  data.forEach((item, index) => {
    const x = startX + index * (barWidth + gap);
    const h = (item.rate / 100) * maxHeight;
    const y = canvas.height - 30 - h;

    // Gradient bar
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#06b6d4');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, h, [6, 6, 0, 0]);
    ctx.fill();

    // Value on top
    ctx.fillStyle = '#f8fafc';
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.rate}%`, x + barWidth / 2, y - 8);

    // Label below
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(item.label, x + barWidth / 2, canvas.height - 10);
  });
}

// ===================================================================
// INTERACTIVE SKILL ASSESSMENT QUIZ SIMULATOR
// ===================================================================
const quizQuestions = [
  {
    q: "What is the average time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct: 1
  },
  {
    q: "In modern React, which hook is primarily used to perform side effects such as data fetching?",
    options: ["useContext()", "useMemo()", "useEffect()", "useCallback()"],
    correct: 2
  },
  {
    q: "Which database ACID property guarantees that all transactions are committed permanently even in a crash?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correct: 3
  },
  {
    q: "In Python, which built-in data structure is implemented as a hash table with O(1) average lookup?",
    options: ["List", "Dictionary (dict)", "Tuple", "Linked List"],
    correct: 1
  }
];

let currentQuizIndex = 0;
let selectedAnswers = {};
let quizTimerInterval = null;
let secondsRemaining = 600; // 10 minutes

function startAssessment() {
  currentQuizIndex = 0;
  selectedAnswers = {};
  secondsRemaining = 600;
  
  document.getElementById('assessmentIntro').style.display = 'none';
  document.getElementById('assessmentQuiz').style.display = 'block';
  document.getElementById('assessmentResults').style.display = 'none';

  renderQuizQuestion();
  startQuizTimer();
}

function renderQuizQuestion() {
  const qData = quizQuestions[currentQuizIndex];
  document.getElementById('quizQNum').innerText = `Question ${currentQuizIndex + 1} of ${quizQuestions.length}`;
  document.getElementById('quizQText').innerText = qData.q;
  
  const optionsContainer = document.getElementById('quizOptionsList');
  optionsContainer.innerHTML = qData.options.map((opt, i) => `
    <div class="quiz-option ${selectedAnswers[currentQuizIndex] === i ? 'selected' : ''}" onclick="selectQuizOption(${i})">
      <span style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 12px;">${String.fromCharCode(65 + i)}</span>
      <span>${opt}</span>
    </div>
  `).join('');

  document.getElementById('quizProgress').style.width = `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`;
}

function selectQuizOption(index) {
  selectedAnswers[currentQuizIndex] = index;
  renderQuizQuestion();
}

function nextQuizQuestion() {
  if (currentQuizIndex < quizQuestions.length - 1) {
    currentQuizIndex++;
    renderQuizQuestion();
  } else {
    finishAssessment();
  }
}

function prevQuizQuestion() {
  if (currentQuizIndex > 0) {
    currentQuizIndex--;
    renderQuizQuestion();
  }
}

function startQuizTimer() {
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  quizTimerInterval = setInterval(() => {
    secondsRemaining--;
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    const timerElem = document.getElementById('quizTimerDisplay');
    if (timerElem) {
      timerElem.innerText = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    if (secondsRemaining <= 0) {
      clearInterval(quizTimerInterval);
      finishAssessment();
    }
  }, 1000);
}

function finishAssessment() {
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  
  // Calculate score
  let correctCount = 0;
  quizQuestions.forEach((q, i) => {
    if (selectedAnswers[i] === q.correct) correctCount++;
  });
  const calculatedScore = Math.round((correctCount / quizQuestions.length) * 100);
  AppState.assessment.score = Math.max(calculatedScore, 75);

  document.getElementById('assessmentQuiz').style.display = 'none';
  document.getElementById('assessmentResults').style.display = 'block';
  document.getElementById('resultScoreDisplay').innerText = `${AppState.assessment.score}/100`;

  renderRadarChart();
}

// ===================================================================
// APPLICATION & ATS WORKFLOW
// ===================================================================
function applyForOpportunity(oppId) {
  const opp = AppState.opportunities.find(o => o.id === oppId);
  if (!opp) return;

  opp.applied = true;
  opp.status = 'applied';

  // Add to applications
  AppState.applications.unshift({
    id: `APP${Date.now()}`,
    opportunityId: opp.id,
    title: opp.title,
    company: opp.company,
    status: 'applied',
    date: 'Just Now',
    match: opp.matchScore
  });

  renderAllViews();
  showToast(`🎉 Successfully applied for ${opp.title} at ${opp.company}! Your application status is now live.`, 'success');
}

function filterOpportunities(searchTerm) {
  const term = searchTerm.toLowerCase();
  const cards = document.querySelectorAll('.opportunity-card');
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(term) ? 'flex' : 'none';
  });
}

function renderAllViews() {
  // Update badges
  const appCountBadge = document.getElementById('appCountBadge');
  if (appCountBadge) appCountBadge.innerText = AppState.applications.length;
}

// Modern Non-Blocking Floating Toast Notification System
function showToast(message, type = 'success') {
  let container = document.getElementById('placepro-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'placepro-toast-container';
    container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; max-width: 440px; pointer-events: none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const borderColor = type === 'error' ? 'rgba(239, 68, 68, 0.5)' : type === 'warning' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(99, 102, 241, 0.5)';
  const glowColor = type === 'error' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(99, 102, 241, 0.25)';

  toast.style.cssText = `
    pointer-events: auto;
    background: #0f172a;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid ${borderColor};
    border-radius: 14px;
    padding: 16px 20px;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 0.92rem;
    font-weight: 500;
    line-height: 1.5;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px ${glowColor};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    transform: translateX(120%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    opacity: 0;
  `;

  toast.innerHTML = `
    <div style="flex: 1; word-break: break-word;">${message}</div>
    <button style="background: none; border: none; color: #94a3b8; font-size: 1.4rem; line-height: 1; cursor: pointer; padding: 0 4px; border-radius: 4px; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'" onclick="this.parentElement.style.opacity='0'; setTimeout(() => this.parentElement.remove(), 250);">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  // Auto-dismiss after 4.5 seconds
  setTimeout(() => {
    if (toast && toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4500);
}

// Override native window.alert to completely prevent browser popups
window.alert = function(message) {
  showToast(message, 'info');
};

// Quick Global Helpers for Demo
window.showToast = showToast;
window.switchPortal = switchPortal;
window.showTab = showTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.startAssessment = startAssessment;
window.nextQuizQuestion = nextQuizQuestion;
window.prevQuizQuestion = prevQuizQuestion;
window.selectQuizOption = selectQuizOption;
window.finishAssessment = finishAssessment;
window.applyForOpportunity = applyForOpportunity;
