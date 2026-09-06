/**
 * Mock Data Repository for Academia-Industry Collaboration Portal
 * Grounded in 05_SAMPLE_DATA_TEMPLATES.json
 */

export const INITIAL_USER = {
  name: 'John Developer',
  email: 'john.developer@email.com',
  role: 'student',
  cgpa: 8.5,
  department: 'Computer Science & Engineering',
  institution: 'Takshashila University',
  verified: true,
  profileCompletion: 78
};

export const INITIAL_SKILLS = [
  { id: 'TECH001', name: 'Python', category: 'technical', subCategory: 'programming', demand: 'Very High', level: 4 },
  { id: 'TECH002', name: 'JavaScript', category: 'technical', subCategory: 'programming', demand: 'Very High', level: 4 },
  { id: 'TECH003', name: 'React', category: 'technical', subCategory: 'web_frameworks', demand: 'High', level: 3 },
  { id: 'TECH004', name: 'SQL', category: 'technical', subCategory: 'databases', demand: 'Very High', level: 4 },
  { id: 'TECH005', name: 'Docker', category: 'technical', subCategory: 'devops', demand: 'High', level: 2 },
  { id: 'SOFT001', name: 'Communication', category: 'soft', demand: 'Very High', level: 4 },
  { id: 'SOFT002', name: 'Teamwork', category: 'soft', demand: 'Very High', level: 4 },
  { id: 'SOFT003', name: 'Problem-Solving', category: 'soft', demand: 'Very High', level: 5 }
];

export const INITIAL_ASSESSMENT = {
  score: 78,
  technical: 85,
  soft: 82,
  aptitude: 80,
  gaps: ['Cloud Infrastructure (AWS/Azure)', 'Docker & Kubernetes', 'System Architecture & Microservices'],
  recommendations: [
    { title: 'AWS Cloud Solutions Architect', provider: 'AWS SkillBuilder', duration: '4 weeks', level: 'Intermediate' },
    { title: 'Docker & Kubernetes in Production', provider: 'DevOps Academy', duration: '3 weeks', level: 'Advanced' },
    { title: 'High-Throughput System Design', provider: 'Tech Innovations', duration: '6 weeks', level: 'Advanced' }
  ]
};

export const INITIAL_OPPORTUNITIES = [
  {
    id: 'INT001',
    type: 'internship',
    title: 'Full-Stack Developer Intern',
    company: 'Tech Innovations India',
    logoText: 'TI',
    location: 'Bangalore (Remote)',
    isRemote: true,
    duration: '3 months',
    stipend: '₹25,000 / mo',
    deadline: '2026-10-15',
    skills: ['Python', 'JavaScript', 'React'],
    matchScore: 92,
    applied: true,
    status: 'under_review',
    description: 'Join our development team to build scalable web applications. You will work on real customer-facing products with senior mentor guidance.'
  },
  {
    id: 'INT002',
    type: 'internship',
    title: 'AI & Data Science Intern',
    company: 'Cognitive Nexus Labs',
    logoText: 'CN',
    location: 'Hyderabad (Hybrid)',
    isRemote: false,
    duration: '6 months',
    stipend: '₹35,000 / mo',
    deadline: '2026-10-22',
    skills: ['Python', 'SQL', 'Machine Learning'],
    matchScore: 88,
    applied: false,
    status: null,
    description: 'Assist in training ML models, feature engineering in SQL, and implementing production LLM retrieval-augmented generation pipelines.'
  },
  {
    id: 'INT003',
    type: 'internship',
    title: 'Cloud DevOps Intern',
    company: 'SecureShield Technologies',
    logoText: 'SS',
    location: 'Bangalore (On-site)',
    isRemote: false,
    duration: '4 months',
    stipend: '₹28,000 / mo',
    deadline: '2026-10-08',
    skills: ['Docker', 'Python', 'Linux'],
    matchScore: 81,
    applied: false,
    status: null,
    description: 'Automate build pipelines, write Dockerfiles, configure Prometheus alerts, and manage test deployments.'
  },
  {
    id: 'JOB001',
    type: 'job',
    title: 'Associate Cloud Engineer',
    company: 'CloudMatrix Technologies',
    logoText: 'CM',
    location: 'Bangalore (Remote)',
    isRemote: true,
    duration: 'Full-Time',
    stipend: '₹8.5 - 12 LPA',
    deadline: '2026-12-31',
    skills: ['Python', 'Docker', 'SQL'],
    matchScore: 82,
    applied: false,
    status: null,
    description: 'Build robust backend microservices, monitor container clusters, and automate cloud infrastructure provisioning.'
  },
  {
    id: 'JOB002',
    type: 'job',
    title: 'Frontend React Developer',
    company: 'Fintech Spark Inc.',
    logoText: 'FS',
    location: 'Mumbai (Hybrid)',
    isRemote: false,
    duration: 'Full-Time',
    stipend: '₹10 - 15 LPA',
    deadline: '2026-10-30',
    skills: ['JavaScript', 'React', 'TypeScript'],
    matchScore: 85,
    applied: true,
    status: 'shortlisted',
    description: 'Create fast, responsive financial transaction interfaces with modern React, chart visualizers, and state security.'
  }
];

export const INITIAL_MOCK_TESTS = [
  {
    id: 'TEST001',
    name: 'Programming Fundamentals & DSA',
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
    name: 'Quantitative & Logical Aptitude',
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
    name: 'Python & Database Architecture',
    category: 'Technical',
    duration: '40 mins',
    questionsCount: 20,
    difficulty: 'Hard',
    avgScore: 65,
    userScore: null,
    attempts: 0,
    rank: 'Unattempted'
  }
];

export const INITIAL_APPLICATIONS = [
  { id: 'APP001', opportunityId: 'INT001', title: 'Full-Stack Developer Intern', company: 'Tech Innovations India', status: 'under_review', date: 'Sep 01, 2026', match: 92 },
  { id: 'APP002', opportunityId: 'JOB002', title: 'Frontend React Developer', company: 'Fintech Spark Inc.', status: 'shortlisted', date: 'Sep 03, 2026', match: 85 },
  { id: 'APP003', opportunityId: 'INT003', title: 'Backend Python Engineer', company: 'TCS Innovation Hub', status: 'interview_scheduled', date: 'Aug 28, 2026', match: 90 },
  { id: 'APP004', opportunityId: 'JOB004', title: 'Software Engineer Graduate', company: 'Infosys Wings', status: 'offer', date: 'Aug 20, 2026', match: 94 }
];

export const QUIZ_QUESTIONS = [
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
