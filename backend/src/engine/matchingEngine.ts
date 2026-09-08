/**
 * Configurable Weighted Opportunity Matching Engine & Explainable Match Generator
 */

export interface MatchingWeights {
  skill: number;          // 50%
  project: number;        // 15%
  education: number;      // 10%
  careerInterest: number; // 10%
  softSkills: number;     // 10%
  location: number;       // 5%
}

export const DEFAULT_MATCH_WEIGHTS: MatchingWeights = {
  skill: 0.50,
  project: 0.15,
  education: 0.10,
  careerInterest: 0.10,
  softSkills: 0.10,
  location: 0.05
};

export interface MatchCandidateInput {
  cgpa: number;
  department: string;
  targetRole: string;
  skills: Array<{ name: string; proficiency: number; category?: string }>;
  projects: Array<{ title: string; skills: string[] }>;
  location?: string;
  isRemotePreferred?: boolean;
}

export interface MatchOpportunityInput {
  title: string;
  minCgpa: number;
  location: string;
  isRemote: boolean;
  requiredSkills: Array<{ name: string; minLevel: number; weight?: number }>;
}

export interface ExplainableMatchBreakdown {
  overallScore: number;
  components: {
    skillCompatibility: number;
    projectRelevance: number;
    educationEligibility: number;
    careerInterest: number;
    softSkillsScore: number;
    locationAlignment: number;
  };
  weightedBreakdown: {
    skillCompatibility: number;
    projectRelevance: number;
    educationEligibility: number;
    careerInterest: number;
    softSkillsScore: number;
    locationAlignment: number;
  };
  maxPoints: {
    skillCompatibility: number;
    projectRelevance: number;
    educationEligibility: number;
    careerInterest: number;
    softSkillsScore: number;
    locationAlignment: number;
  };
  weights: MatchingWeights;
  strongSkills: string[];
  remainingGaps: Array<{ name: string; gap: number }>;
  reasons: string[];
  recommendationSummary: string;
}

export function calculateOpportunityMatch(
  student: MatchCandidateInput,
  opportunity: MatchOpportunityInput,
  weights: MatchingWeights = DEFAULT_MATCH_WEIGHTS
): ExplainableMatchBreakdown {
  // 1. Skill Compatibility (0 - 100)
  const studentSkillMap = new Map(student.skills.map((s) => [s.name.toLowerCase(), s.proficiency]));
  let totalReqWeighted = 0;
  let totalStudentAchieved = 0;
  const strongSkills: string[] = [];
  const remainingGaps: Array<{ name: string; gap: number }> = [];

  opportunity.requiredSkills.forEach((req) => {
    const w = req.weight ?? 1.0;
    const reqLevel = req.minLevel || 60;
    const studentProf = studentSkillMap.get(req.name.toLowerCase()) ?? 0;

    totalReqWeighted += reqLevel * w;
    totalStudentAchieved += Math.min(studentProf, reqLevel) * w;

    if (studentProf >= reqLevel) {
      strongSkills.push(req.name);
    } else {
      remainingGaps.push({ name: req.name, gap: Math.max(0, reqLevel - studentProf) });
    }
  });

  const skillCompatibility = totalReqWeighted > 0
    ? Math.round((totalStudentAchieved / totalReqWeighted) * 100)
    : 70;

  // 2. Project Relevance (0 - 100)
  const reqSkillSet = new Set(opportunity.requiredSkills.map((s) => s.name.toLowerCase()));
  let projectMatchCount = 0;
  student.projects.forEach((p) => {
    const hasOverlap = p.skills.some((s) => reqSkillSet.has(s.toLowerCase()));
    if (hasOverlap) projectMatchCount++;
  });
  const projectRelevance = student.projects.length > 0
    ? Math.min(100, Math.round((projectMatchCount / Math.max(1, student.projects.length)) * 100) + (projectMatchCount >= 2 ? 20 : 0))
    : 50;

  // 3. Education Eligibility (0 - 100)
  const meetsCgpa = student.cgpa >= opportunity.minCgpa;
  const educationEligibility = meetsCgpa ? 100 : Math.max(0, Math.round((student.cgpa / Math.max(0.1, opportunity.minCgpa)) * 100));

  // 4. Career Interest Alignment (0 - 100)
  const oppTitleLower = opportunity.title.toLowerCase();
  const targetRoleLower = (student.targetRole || '').toLowerCase();
  let careerInterest = 70;

  const targetTokens = targetRoleLower.split(/[\s\-_,]+/).filter((t) => t.length > 2);
  const oppTokens = oppTitleLower.split(/[\s\-_,]+/).filter((t) => t.length > 2);
  const hasTokenOverlap = targetTokens.some((t) => oppTitleLower.includes(t)) || oppTokens.some((t) => targetRoleLower.includes(t));

  if (
    (targetRoleLower && oppTitleLower.includes(targetRoleLower)) ||
    (targetRoleLower && targetRoleLower.includes(oppTitleLower)) ||
    hasTokenOverlap
  ) {
    careerInterest = 95;
  }

  // 5. Soft Skills (0 - 100)
  const softSkillProficiencies = student.skills
    .filter((s) => s.category?.toUpperCase() === 'SOFT' || ['communication', 'teamwork', 'problem-solving', 'leadership'].includes(s.name.toLowerCase()))
    .map((s) => s.proficiency);
  const softSkillsScore = softSkillProficiencies.length > 0
    ? Math.round(softSkillProficiencies.reduce((a, b) => a + b, 0) / softSkillProficiencies.length)
    : 80;

  // 6. Location Alignment (0 - 100)
  let locationAlignment = 80;
  if (opportunity.isRemote || student.isRemotePreferred) {
    locationAlignment = 100;
  } else if (student.location && opportunity.location.toLowerCase().includes(student.location.toLowerCase())) {
    locationAlignment = 100;
  }

  // Final Weighted Match Score
  const overallScore = Math.min(100, Math.max(0, Math.round(
    skillCompatibility * weights.skill +
    projectRelevance * weights.project +
    educationEligibility * weights.education +
    careerInterest * weights.careerInterest +
    softSkillsScore * weights.softSkills +
    locationAlignment * weights.location
  )));

  // Compute points contribution out of factor max (e.g. 44/50, 13/15, 10/10, 8/10, 7/10, 5/5)
  const weightedBreakdown = {
    skillCompatibility: Math.round(skillCompatibility * weights.skill),
    projectRelevance: Math.round(projectRelevance * weights.project),
    educationEligibility: Math.round(educationEligibility * weights.education),
    careerInterest: Math.round(careerInterest * weights.careerInterest),
    softSkillsScore: Math.round(softSkillsScore * weights.softSkills),
    locationAlignment: Math.round(locationAlignment * weights.location)
  };

  const maxPoints = {
    skillCompatibility: Math.round(100 * weights.skill),
    projectRelevance: Math.round(100 * weights.project),
    educationEligibility: Math.round(100 * weights.education),
    careerInterest: Math.round(100 * weights.careerInterest),
    softSkillsScore: Math.round(100 * weights.softSkills),
    locationAlignment: Math.round(100 * weights.location)
  };

  // Generate dynamic explainable reasons
  const reasons: string[] = [];

  if (strongSkills.length > 0) {
    reasons.push(`Strong ${strongSkills.join(' and ')} proficiency`);
  }
  if (projectMatchCount > 0) {
    reasons.push(`Relevant project evidence (${projectMatchCount} verified tech project${projectMatchCount > 1 ? 's' : ''})`);
  }
  if (meetsCgpa) {
    reasons.push(`Meets education eligibility (CGPA ${student.cgpa} >= ${opportunity.minCgpa})`);
  } else {
    reasons.push(`CGPA ${student.cgpa} is below minimum requirement (${opportunity.minCgpa})`);
  }
  if (remainingGaps.length > 0) {
    reasons.push(`Missing/weak: ${remainingGaps.map((g) => g.name).join(' and ')}`);
  }
  if (locationAlignment >= 90) {
    reasons.push(opportunity.isRemote ? 'Fully remote friendly' : `Matches preferred location (${opportunity.location})`);
  }

  let recommendationSummary = '';
  if (overallScore >= 80) {
    recommendationSummary = `High compatibility match (${overallScore}%) driven by verified core competencies and academic eligibility.`;
  } else if (overallScore >= 60) {
    recommendationSummary = `Moderate compatibility match (${overallScore}%). Bridging minor skill deficits can significantly boost selection probability.`;
  } else {
    recommendationSummary = `Growth opportunity (${overallScore}%). Targeted upskilling recommended before applying.`;
  }

  return {
    overallScore,
    components: {
      skillCompatibility,
      projectRelevance,
      educationEligibility,
      careerInterest,
      softSkillsScore,
      locationAlignment
    },
    weightedBreakdown,
    maxPoints,
    weights,
    strongSkills,
    remainingGaps,
    reasons,
    recommendationSummary
  };
}
