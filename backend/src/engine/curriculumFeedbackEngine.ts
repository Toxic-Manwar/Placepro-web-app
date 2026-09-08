/**
 * Industry-to-Academia Feedback Engine
 * Computes normalized Demand Index, Supply Index, and Skill Shortage Index
 */

export interface SkillMarketMetrics {
  skillId: string;
  skillName: string;
  demandIndex: number;    // 0 - 100
  supplyIndex: number;    // 0 - 100
  shortageIndex: number;  // 0 - 100
  postingsCount: number;
  avgStudentProficiency: number;
  isAlertTriggered: boolean; // shortageIndex >= 30
  recommendedAction: string;
}

export function computeDemandIndex(
  postingsRequiringSkill: number,
  totalPostings: number,
  avgRequiredLevel: number
): number {
  if (totalPostings === 0) return 0;
  const frequencyRatio = postingsRequiringSkill / totalPostings;
  const levelRatio = avgRequiredLevel / 100;
  // Weighted: 60% frequency of demand across postings + 40% depth/level of required proficiency
  const demand = (frequencyRatio * 0.60 + levelRatio * 0.40) * 100;
  return Math.min(100, Math.max(0, Math.round(demand)));
}

export function computeSupplyIndex(studentProficiencies: number[]): number {
  if (studentProficiencies.length === 0) return 50;
  const avg = studentProficiencies.reduce((sum, p) => sum + p, 0) / studentProficiencies.length;
  return Math.min(100, Math.max(0, Math.round(avg)));
}

export function computeSkillShortageIndex(demandIndex: number, supplyIndex: number): number {
  return Math.max(0, demandIndex - supplyIndex);
}

export function generateCurriculumRecommendation(skillName: string, shortageIndex: number): string {
  if (shortageIndex >= 40) {
    return `Critical shortage: Integrate ${skillName} into semester elective & sponsor immediate Faculty Development Program (FDP).`;
  }
  if (shortageIndex >= 25) {
    return `Moderate shortage: Organize a 2-day hands-on corporate workshop and introduce practical capstone lab modules in ${skillName}.`;
  }
  return `Balanced supply: Maintain current academic coursework for ${skillName}.`;
}

export interface OpportunityData {
  id: string;
  skills: Array<{ name: string; minLevel: number }>;
}

export interface StudentSkillData {
  name: string;
  proficiency: number;
}

export function aggregateInstitutionalFeedback(
  allOpportunities: OpportunityData[],
  allStudentSkills: StudentSkillData[][]
): SkillMarketMetrics[] {
  const totalPostings = Math.max(1, allOpportunities.length);
  const skillDemandMap = new Map<string, { count: number; totalLevel: number }>();
  const skillSupplyMap = new Map<string, number[]>();

  // Aggregate Demand
  allOpportunities.forEach((opp) => {
    opp.skills.forEach((s) => {
      const key = s.name.trim();
      const current = skillDemandMap.get(key) ?? { count: 0, totalLevel: 0 };
      skillDemandMap.set(key, {
        count: current.count + 1,
        totalLevel: current.totalLevel + (s.minLevel || 60)
      });
    });
  });

  // Aggregate Supply
  allStudentSkills.forEach((studentSkillsList) => {
    studentSkillsList.forEach((s) => {
      const key = s.name.trim();
      const currentList = skillSupplyMap.get(key) ?? [];
      currentList.push(s.proficiency);
      skillSupplyMap.set(key, currentList);
    });
  });

  // Combine
  const allSkillNames = new Set([...skillDemandMap.keys(), ...skillSupplyMap.keys()]);
  const metricsList: SkillMarketMetrics[] = [];

  allSkillNames.forEach((name) => {
    const demandData = skillDemandMap.get(name) ?? { count: 0, totalLevel: 0 };
    const supplyList = skillSupplyMap.get(name) ?? [50];

    const avgReqLevel = demandData.count > 0 ? demandData.totalLevel / demandData.count : 50;
    const demandIndex = computeDemandIndex(demandData.count, totalPostings, avgReqLevel);
    const supplyIndex = computeSupplyIndex(supplyList);
    const shortageIndex = computeSkillShortageIndex(demandIndex, supplyIndex);

    metricsList.push({
      skillId: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      skillName: name,
      demandIndex,
      supplyIndex,
      shortageIndex,
      postingsCount: demandData.count,
      avgStudentProficiency: supplyIndex,
      isAlertTriggered: shortageIndex >= 30,
      recommendedAction: generateCurriculumRecommendation(name, shortageIndex)
    });
  });

  return metricsList.sort((a, b) => b.shortageIndex - a.shortageIndex);
}
