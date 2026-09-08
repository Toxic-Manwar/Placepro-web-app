/**
 * PlacePro Unified Frontend API Client
 * Connects the React UI to the PlacePro Backend & Database
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('placepro_token') || null;
    this.currentRole = localStorage.getItem('placepro_role') || 'STUDENT';
  }

  setToken(token, role) {
    this.token = token;
    if (token) {
      localStorage.setItem('placepro_token', token);
    } else {
      localStorage.removeItem('placepro_token');
    }
    if (role) {
      this.currentRole = role;
      localStorage.setItem('placepro_role', role);
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    headers['x-demo-role'] = this.currentRole || 'STUDENT';
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error.message);
      throw error;
    }
  }

  // --- 1. AUTHENTICATION ---
  auth = {
    register: (userData) =>
      this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),

    login: (credentials) =>
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),

    getDemoToken: (role) =>
      this.request(`/auth/demo-token/${role}`).then((res) => {
        if (res.token) {
          this.setToken(res.token, res.user?.role || role);
        }
        return res;
      })
  };

  // --- 2. STUDENT INTELLIGENCE ---
  student = {
    getProfile: () => this.request('/student/profile'),

    getGaps: () => this.request('/student/gaps'),

    getDiagnostic: () => this.request('/student/assessment/diagnostic'),

    submitAssessment: (assessmentId, answers) =>
      this.request('/student/assessment/submit', {
        method: 'POST',
        body: JSON.stringify({ assessmentId, answers })
      }),

    getLearningPath: () => this.request('/student/learning'),

    updateLearningProgress: (resourceId, progressPct) =>
      this.request('/student/learning/progress', {
        method: 'POST',
        body: JSON.stringify({ resourceId, progressPct })
      }),

    getReassessmentQuestions: (skillId) =>
      this.request(`/student/reassessment/${skillId}`),

    submitReassessment: (skillId, answers, assessmentScoreOverride) =>
      this.request(`/student/reassessment/${skillId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, assessmentScoreOverride })
      }),

    reassess: (skillId, postScore) =>
      this.request(`/student/reassessment/${skillId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ assessmentScoreOverride: postScore })
      }),

    getPassport: () => this.request('/student/passport'),

    getSkillEvidence: (skillId) => this.request(`/student/passport/${skillId}/evidence`)
  };

  // --- 3. OPPORTUNITIES & MATCHING ---
  opportunities = {
    getAll: () => this.request('/opportunities'),

    create: (oppData) =>
      this.request('/opportunities', {
        method: 'POST',
        body: JSON.stringify(oppData)
      }),

    apply: (oppId) =>
      this.request(`/opportunities/${oppId}/apply`, {
        method: 'POST'
      })
  };

  // --- 4. INDUSTRY & RECRUITER ATS ---
  industry = {
    getCandidates: () => this.request('/industry/candidates'),

    getCandidatePassport: (studentId) => this.request(`/industry/candidates/${studentId}/passport`),

    submitSkillFeedback: (studentId, feedbackData) =>
      this.request(`/industry/candidates/${studentId}/skill-feedback`, {
        method: 'POST',
        body: JSON.stringify(feedbackData)
      }),

    updateStatus: (appId, status) =>
      this.request(`/industry/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  };

  // --- 5. INSTITUTION DEMAND & CURRICULUM ANALYTICS ---
  institution = {
    getAnalytics: () => this.request('/institution/analytics'),

    getStudents: () => this.request('/institution/students'),

    getStudentSkills: (studentId) => this.request(`/institution/students/${studentId}/skills`),

    verifySkill: (studentId, skillId, notes) =>
      this.request(`/institution/students/${studentId}/skills/${skillId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ notes })
      }),

    getCurriculumProposals: () => this.request('/institution/curriculum-proposals'),

    createCurriculumProposal: (proposalData) =>
      this.request('/institution/curriculum-proposals', {
        method: 'POST',
        body: JSON.stringify(proposalData)
      })
  };

  // --- 6. PUBLIC SKILL PASSPORT ---
  passport = {
    getPublic: (passportId) => this.request(`/passport/${passportId}`)
  };
}

export const api = new ApiClient();
export default api;
