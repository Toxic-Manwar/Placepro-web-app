/**
 * Skill Intelligence Engine
 * Computes evidence-based multi-tier normalized skill proficiency (0-100)
 */

export interface SkillEvidence {
  assessmentScore?: number; // 0 - 100
  projectScore?: number;    // 0 - 100 (based on verified repo/projects)
  certScore?: number;       // 0 - 100 (based on verified certifications)
  feedbackScore?: number;   // 0 - 100 (based on mentor/internship ratings)
}

export const SKILL_WEIGHTS = {
  assessment: 0.50,
  project: 0.25,
  certification: 0.15,
  feedback: 0.10
};

export function calculateSkillProficiency(evidence: SkillEvidence): number {
  const a = evidence.assessmentScore ?? 50;
  const p = evidence.projectScore ?? 50;
  const c = evidence.certScore ?? 40;
  const f = evidence.feedbackScore ?? 60;

  const score = (
    a * SKILL_WEIGHTS.assessment +
    p * SKILL_WEIGHTS.project +
    c * SKILL_WEIGHTS.certification +
    f * SKILL_WEIGHTS.feedback
  );

  return Math.min(100, Math.max(0, Math.round(score)));
}

export interface StudentProfileData {
  cgpa: number;
  skills: Array<{ name: string; proficiency: number }>;
  projectsCount: number;
  certsCount: number;
}

export function calculatePlacementReadiness(profile: StudentProfileData): number {
  const avgSkillProficiency = profile.skills.length > 0
    ? profile.skills.reduce((sum, s) => sum + s.proficiency, 0) / profile.skills.length
    : 50;

  const cgpaNormalized = Math.min(100, Math.max(0, (profile.cgpa / 10) * 100));
  const projectBonus = Math.min(100, profile.projectsCount * 25);
  const certBonus = Math.min(100, profile.certsCount * 30);

  const readiness = (
    avgSkillProficiency * 0.50 +
    cgpaNormalized * 0.25 +
    projectBonus * 0.15 +
    certBonus * 0.10
  );

  return Math.min(100, Math.max(0, Math.round(readiness)));
}
