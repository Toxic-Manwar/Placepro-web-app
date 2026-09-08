/**
 * Real Skill Gap Engine
 * Computes deterministic deltas between target opportunity requirements and student profile
 */

export type GapSeverity = 'READY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  severity: GapSeverity;
  severityLabel: string;
  priorityRank: number;
  rationale: string;
}

export function computeSkillGap(studentLevel: number, requiredLevel: number): number {
  return Math.max(0, requiredLevel - studentLevel);
}

export function classifyGapSeverity(gap: number): { severity: GapSeverity; label: string } {
  if (gap <= 5) return { severity: 'READY', label: 'Ready (No Gap)' };
  if (gap <= 20) return { severity: 'LOW', label: 'Low Gap' };
  if (gap <= 40) return { severity: 'MEDIUM', label: 'Medium Gap' };
  if (gap <= 60) return { severity: 'HIGH', label: 'High Gap' };
  return { severity: 'CRITICAL', label: 'Critical Gap' };
}

export function generateGapRationale(skillName: string, gap: number, requiredLevel: number): string {
  if (gap <= 5) {
    return `Your proficiency in ${skillName} meets or exceeds target requirements (${requiredLevel}%).`;
  }
  if (gap > 40) {
    return `${skillName} represents a priority gap (${gap}% deficit) demanded heavily by target industry roles. Immediate upskilling recommended.`;
  }
  return `${skillName} has a moderate gap (${gap}% deficit). Targeted practice will elevate profile compatibility to benchmark level.`;
}

export function analyzeStudentGaps(
  studentSkills: Array<{ skillId: string; name: string; proficiency: number }>,
  requiredSkills: Array<{ skillId: string; name: string; minLevel: number; weight?: number }>
): SkillGapItem[] {
  const studentMap = new Map(studentSkills.map((s) => [s.name.toLowerCase(), s.proficiency]));

  const gapItems: SkillGapItem[] = requiredSkills.map((req) => {
    const studentProf = studentMap.get(req.name.toLowerCase()) ?? 0;
    const gap = computeSkillGap(studentProf, req.minLevel);
    const { severity, label } = classifyGapSeverity(gap);
    const weight = req.weight ?? 1.0;
    const priorityScore = gap * weight;

    return {
      skillId: req.skillId,
      skillName: req.name,
      currentLevel: studentProf,
      requiredLevel: req.minLevel,
      gap,
      severity,
      severityLabel: label,
      priorityRank: Math.round(priorityScore),
      rationale: generateGapRationale(req.name, gap, req.minLevel)
    };
  });

  // Sort by priority rank descending (highest gap & highest weight first)
  return gapItems.sort((a, b) => b.priorityRank - a.priorityRank);
}
