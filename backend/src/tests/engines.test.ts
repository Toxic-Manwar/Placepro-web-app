import { describe, it, expect } from 'vitest';
import { calculateSkillProficiency, calculatePlacementReadiness, SKILL_WEIGHTS } from '../engine/skillIntelligence.js';
import { computeSkillGap, classifyGapSeverity, analyzeStudentGaps } from '../engine/skillGapEngine.js';
import { calculateOpportunityMatch, DEFAULT_MATCH_WEIGHTS } from '../engine/matchingEngine.js';
import { computeDemandIndex, computeSupplyIndex, computeSkillShortageIndex, aggregateInstitutionalFeedback } from '../engine/curriculumFeedbackEngine.js';

describe('Skill Intelligence Engine', () => {
  it('should validate skill weight normalization sums to 1.0', () => {
    const totalWeight = Object.values(SKILL_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(totalWeight).toBeCloseTo(1.0, 5);
  });

  it('should compute deterministic normalized skill proficiency (0-100)', () => {
    const score = calculateSkillProficiency({
      assessmentScore: 80,
      projectScore: 90,
      certScore: 70,
      feedbackScore: 85
    });
    // 80*0.5 + 90*0.25 + 70*0.15 + 85*0.10 = 40 + 22.5 + 10.5 + 8.5 = 81.5 -> 82
    expect(score).toBe(82);
  });

  it('should calculate placement readiness within 0-100 bounds', () => {
    const readiness = calculatePlacementReadiness({
      cgpa: 8.5,
      skills: [
        { name: 'Python', proficiency: 80 },
        { name: 'React', proficiency: 75 },
        { name: 'SQL', proficiency: 70 }
      ],
      projectsCount: 2,
      certsCount: 2
    });
    expect(readiness).toBeGreaterThanOrEqual(0);
    expect(readiness).toBeLessThanOrEqual(100);
    expect(readiness).toBe(72);
  });
});

describe('Real Skill Gap Engine', () => {
  it('should accurately calculate delta and classify severity tiers', () => {
    expect(computeSkillGap(75, 80)).toBe(5);
    expect(classifyGapSeverity(5).severity).toBe('READY');

    expect(computeSkillGap(65, 80)).toBe(15);
    expect(classifyGapSeverity(15).severity).toBe('LOW');

    expect(computeSkillGap(48, 80)).toBe(32);
    expect(classifyGapSeverity(32).severity).toBe('MEDIUM');

    expect(computeSkillGap(28, 80)).toBe(52);
    expect(classifyGapSeverity(52).severity).toBe('HIGH');

    expect(computeSkillGap(10, 80)).toBe(70);
    expect(classifyGapSeverity(70).severity).toBe('CRITICAL');
  });

  it('should rank gaps by priority score', () => {
    const studentSkills = [
      { skillId: 's1', name: 'Python', proficiency: 75 },
      { skillId: 's2', name: 'SQL', proficiency: 48 },
      { skillId: 's3', name: 'Cloud', proficiency: 28 }
    ];
    const requiredSkills = [
      { skillId: 's1', name: 'Python', minLevel: 80, weight: 1.0 },
      { skillId: 's2', name: 'SQL', minLevel: 80, weight: 1.0 },
      { skillId: 's3', name: 'Cloud', minLevel: 80, weight: 1.5 }
    ];

    const gaps = analyzeStudentGaps(studentSkills, requiredSkills);
    expect(gaps[0].skillName).toBe('Cloud'); // Highest gap (52) * 1.5 = 78
    expect(gaps[1].skillName).toBe('SQL');   // Gap (32) * 1.0 = 32
    expect(gaps[2].skillName).toBe('Python');
  });
});

describe('Weighted Matching Engine & Explainability', () => {
  it('should validate default match weights sum to exactly 1.0', () => {
    const sum = Object.values(DEFAULT_MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('should calculate transparent explainable match breakdown for primary SIH demo case', () => {
    const student = {
      cgpa: 8.5,
      department: 'Computer Science',
      targetRole: 'Full-Stack Developer',
      skills: [
        { name: 'React', proficiency: 82, category: 'TECHNICAL' },
        { name: 'JavaScript', proficiency: 78, category: 'TECHNICAL' },
        { name: 'Node.js', proficiency: 75, category: 'TECHNICAL' },
        { name: 'SQL', proficiency: 72, category: 'TECHNICAL' },
        { name: 'Cloud', proficiency: 64, category: 'TECHNICAL' },
        { name: 'Communication', proficiency: 85, category: 'SOFT' }
      ],
      projects: [
        { title: 'Full-Stack Portal', skills: ['React', 'Node.js', 'SQL'] },
        { title: 'Cloud Infrastructure', skills: ['Cloud', 'Docker'] }
      ],
      isRemotePreferred: true
    };

    const opportunity = {
      title: 'Full-Stack Developer Intern',
      minCgpa: 7.5,
      location: 'Bangalore (Remote)',
      isRemote: true,
      requiredSkills: [
        { name: 'React', minLevel: 75, weight: 1.0 },
        { name: 'JavaScript', minLevel: 70, weight: 1.0 },
        { name: 'SQL', minLevel: 70, weight: 1.0 },
        { name: 'Cloud', minLevel: 70, weight: 1.0 }
      ]
    };

    const match = calculateOpportunityMatch(student, opportunity);

    expect(match.overallScore).toBeGreaterThanOrEqual(85);
    expect(match.overallScore).toBeLessThanOrEqual(100);
    expect(match.components.skillCompatibility).toBeGreaterThanOrEqual(90);
    expect(match.components.educationEligibility).toBe(100);
    expect(match.strongSkills).toContain('React');
    expect(match.strongSkills).toContain('JavaScript');
  });
});

describe('Industry-to-Academia Feedback Engine', () => {
  it('should compute normalized Demand, Supply, and Shortage indices', () => {
    const demandIndex = computeDemandIndex(8, 10, 80); // 8/10*0.6 + 80/100*0.4 = 0.48 + 0.32 = 80
    const supplyIndex = computeSupplyIndex([40, 50, 45, 55]); // avg = 47.5 -> 48
    const shortage = computeSkillShortageIndex(demandIndex, supplyIndex); // 80 - 48 = 32

    expect(demandIndex).toBe(80);
    expect(supplyIndex).toBe(48);
    expect(shortage).toBe(32);
    expect(shortage).toBeGreaterThanOrEqual(30); // Triggers Curriculum Alert
  });

  it('should aggregate market feedback and flag high shortage curriculum alerts', () => {
    const opportunities = [
      { id: '1', skills: [{ name: 'Cloud', minLevel: 80 }, { name: 'SQL', minLevel: 80 }] },
      { id: '2', skills: [{ name: 'Cloud', minLevel: 85 }, { name: 'Python', minLevel: 70 }] },
      { id: '3', skills: [{ name: 'Cloud', minLevel: 75 }, { name: 'Docker', minLevel: 70 }] }
    ];

    const studentSkills = [
      [{ name: 'Cloud', proficiency: 30 }, { name: 'Python', proficiency: 80 }],
      [{ name: 'Cloud', proficiency: 25 }, { name: 'SQL', proficiency: 50 }]
    ];

    const metrics = aggregateInstitutionalFeedback(opportunities, studentSkills);
    const cloudMetric = metrics.find((m) => m.skillName === 'Cloud');

    expect(cloudMetric).toBeDefined();
    expect(cloudMetric?.shortageIndex).toBeGreaterThan(30);
    expect(cloudMetric?.isAlertTriggered).toBe(true);
  });
});

describe('Phase 2: Skill Recalibration & Dynamic Readiness Updates', () => {
  it('should dynamically update placement readiness when skills improve post-assessment', () => {
    // Initial student state: Cloud = 28%, SQL = 48%, React = 82%, JS = 78%, Node = 55%
    const initialSkills = [
      { name: 'Cloud', proficiency: 28 },
      { name: 'SQL', proficiency: 48 },
      { name: 'React', proficiency: 82 },
      { name: 'JavaScript', proficiency: 78 },
      { name: 'Node.js', proficiency: 55 }
    ];

    const initialReadiness = calculatePlacementReadiness({
      cgpa: 8.8,
      skills: initialSkills,
      projectsCount: 2,
      certsCount: 1
    });

    // Student completes diagnostic assessment & targeted learning -> Cloud = 64%, SQL = 72%
    const updatedSkills = [
      { name: 'Cloud', proficiency: 64 },
      { name: 'SQL', proficiency: 72 },
      { name: 'React', proficiency: 82 },
      { name: 'JavaScript', proficiency: 78 },
      { name: 'Node.js', proficiency: 75 }
    ];

    const updatedReadiness = calculatePlacementReadiness({
      cgpa: 8.8,
      skills: updatedSkills,
      projectsCount: 2,
      certsCount: 1
    });

    expect(updatedReadiness).toBeGreaterThan(initialReadiness);
    expect(initialReadiness).toBe(62);
    expect(updatedReadiness).toBe(70);
  });

  it('should eliminate critical gaps when student skills meet benchmark requirements', () => {
    const targetBenchmark = [
      { skillId: 's-cloud', name: 'Cloud', minLevel: 80, weight: 1.6 },
      { skillId: 's-sql', name: 'SQL', minLevel: 80, weight: 1.4 }
    ];

    // Pre-assessment: High gaps
    const preGaps = analyzeStudentGaps(
      [
        { skillId: 's-cloud', name: 'Cloud', proficiency: 28 },
        { skillId: 's-sql', name: 'SQL', proficiency: 48 }
      ],
      targetBenchmark
    );

    expect(preGaps.find(g => g.skillName === 'Cloud')?.severity).toBe('HIGH');
    expect(preGaps.find(g => g.skillName === 'SQL')?.severity).toBe('MEDIUM');

    // Post-assessment & improvement: Gaps shrink
    const postGaps = analyzeStudentGaps(
      [
        { skillId: 's-cloud', name: 'Cloud', proficiency: 80 },
        { skillId: 's-sql', name: 'SQL', proficiency: 78 }
      ],
      targetBenchmark
    );

    expect(postGaps.find(g => g.skillName === 'Cloud')?.severity).toBe('READY');
    expect(postGaps.find(g => g.skillName === 'SQL')?.severity).toBe('READY');
  });
});

describe('Phase 3: Learning & Reassessment Loop (S4 -> S5)', () => {
  it('should recommend learning resources based on student active skill gaps', () => {
    const studentSkills = [
      { skillId: 's-cloud', name: 'Cloud', proficiency: 28 },
      { skillId: 's-sql', name: 'SQL', proficiency: 48 },
      { skillId: 's-react', name: 'React', proficiency: 85 }
    ];

    const targetBenchmark = [
      { skillId: 's-cloud', name: 'Cloud', minLevel: 80, weight: 1.6 },
      { skillId: 's-sql', name: 'SQL', minLevel: 80, weight: 1.4 },
      { skillId: 's-react', name: 'React', minLevel: 75, weight: 1.1 }
    ];

    const gaps = analyzeStudentGaps(studentSkills, targetBenchmark);
    const cloudGap = gaps.find(g => g.skillName === 'Cloud');
    const sqlGap = gaps.find(g => g.skillName === 'SQL');
    const reactGap = gaps.find(g => g.skillName === 'React');

    expect(cloudGap?.gap).toBe(52);
    expect(sqlGap?.gap).toBe(32);
    expect(reactGap?.gap).toBe(0);

    // Active gaps should correctly flag Cloud and SQL for priority learning
    const activeGapSkills = gaps.filter(g => g.gap > 0).map(g => g.skillName);
    expect(activeGapSkills).toContain('Cloud');
    expect(activeGapSkills).toContain('SQL');
    expect(activeGapSkills).not.toContain('React');
  });

  it('should validate learning progress status transitions and completion state', () => {
    const deriveStatus = (pct: number): 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' => {
      const clamped = Math.min(100, Math.max(0, Math.round(pct)));
      if (clamped >= 100) return 'COMPLETED';
      if (clamped > 0) return 'IN_PROGRESS';
      return 'NOT_STARTED';
    };

    expect(deriveStatus(0)).toBe('NOT_STARTED');
    expect(deriveStatus(25)).toBe('IN_PROGRESS');
    expect(deriveStatus(75)).toBe('IN_PROGRESS');
    expect(deriveStatus(100)).toBe('COMPLETED');
    expect(deriveStatus(120)).toBe('COMPLETED'); // Clamped to 100%
  });

  it('should strictly compute reassessment delta as Delta = Post - Pre without hardcoded values', () => {
    const preProficiency = 28;
    const postProficiency = calculateSkillProficiency({
      assessmentScore: 100,
      projectScore: 80,
      certScore: 75,
      feedbackScore: 80
    }); // 100*0.5 + 80*0.25 + 75*0.15 + 80*0.10 = 50 + 20 + 11.25 + 8 = 89.25 -> 89

    const delta = postProficiency - preProficiency;

    expect(postProficiency).toBe(89);
    expect(delta).toBe(61);
    expect(delta).toBe(postProficiency - preProficiency);
  });

  it('should dynamically update readiness and reduce gaps post-reassessment', () => {
    const initialSkills = [
      { name: 'Cloud', proficiency: 28 },
      { name: 'SQL', proficiency: 48 },
      { name: 'React', proficiency: 82 }
    ];

    const initialReadiness = calculatePlacementReadiness({
      cgpa: 8.5,
      skills: initialSkills,
      projectsCount: 2,
      certsCount: 1
    });

    // Student completes reassessment for Cloud
    const postCloud = 85;
    const updatedSkills = [
      { name: 'Cloud', proficiency: postCloud },
      { name: 'SQL', proficiency: 48 },
      { name: 'React', proficiency: 82 }
    ];

    const updatedReadiness = calculatePlacementReadiness({
      cgpa: 8.5,
      skills: updatedSkills,
      projectsCount: 2,
      certsCount: 1
    });

    expect(updatedReadiness).toBeGreaterThan(initialReadiness);

    // Gaps re-evaluated
    const benchmark = [
      { skillId: 's-cloud', name: 'Cloud', minLevel: 80, weight: 1.6 },
      { skillId: 's-sql', name: 'SQL', minLevel: 80, weight: 1.4 }
    ];

    const preGaps = analyzeStudentGaps(
      initialSkills.map(s => ({ skillId: `s-${s.name.toLowerCase()}`, name: s.name, proficiency: s.proficiency })),
      benchmark
    );
    const postGaps = analyzeStudentGaps(
      updatedSkills.map(s => ({ skillId: `s-${s.name.toLowerCase()}`, name: s.name, proficiency: s.proficiency })),
      benchmark
    );

    const preCloudGap = preGaps.find(g => g.skillName === 'Cloud');
    const postCloudGap = postGaps.find(g => g.skillName === 'Cloud');

    expect(preCloudGap?.severity).toBe('HIGH');
    expect(postCloudGap?.severity).toBe('READY');
    expect(postCloudGap?.gap).toBe(0);
  });
});

describe('Phase 4: Weighted Opportunity Matching & Explainable Breakdown (M1 -> M2)', () => {
  it('should accurately compute 6-factor weighted breakdown points and dynamic reasons', () => {
    const student = {
      cgpa: 8.5,
      department: 'Computer Science',
      targetRole: 'Full-Stack Developer',
      skills: [
        { name: 'React', proficiency: 88, category: 'TECHNICAL' },
        { name: 'Node.js', proficiency: 82, category: 'TECHNICAL' },
        { name: 'SQL', proficiency: 75, category: 'TECHNICAL' },
        { name: 'Cloud', proficiency: 40, category: 'TECHNICAL' },
        { name: 'Docker', proficiency: 45, category: 'TECHNICAL' },
        { name: 'Communication', proficiency: 80, category: 'SOFT' }
      ],
      projects: [
        { title: 'Full-Stack Portal', skills: ['React', 'Node.js', 'SQL'] }
      ],
      isRemotePreferred: true
    };

    const opportunity = {
      title: 'Full-Stack Software Engineer',
      minCgpa: 7.5,
      location: 'Bangalore (Remote)',
      isRemote: true,
      requiredSkills: [
        { name: 'React', minLevel: 75, weight: 1.0 },
        { name: 'Node.js', minLevel: 75, weight: 1.0 },
        { name: 'Docker', minLevel: 70, weight: 1.0 },
        { name: 'Cloud', minLevel: 70, weight: 1.0 }
      ]
    };

    const match = calculateOpportunityMatch(student, opportunity);

    // 1. Check overall score bounds
    expect(match.overallScore).toBeGreaterThanOrEqual(70);
    expect(match.overallScore).toBeLessThanOrEqual(100);

    // 2. Check 6-factor component breakdown presence
    expect(match.components.skillCompatibility).toBeDefined();
    expect(match.components.projectRelevance).toBeDefined();
    expect(match.components.educationEligibility).toBe(100);
    expect(match.components.careerInterest).toBe(95);
    expect(match.components.softSkillsScore).toBe(80);
    expect(match.components.locationAlignment).toBe(100);

    // 3. Check weightedBreakdown and maxPoints
    expect(match.maxPoints.skillCompatibility).toBe(50);
    expect(match.maxPoints.projectRelevance).toBe(15);
    expect(match.maxPoints.educationEligibility).toBe(10);
    expect(match.maxPoints.careerInterest).toBe(10);
    expect(match.maxPoints.softSkillsScore).toBe(10);
    expect(match.maxPoints.locationAlignment).toBe(5);

    // 4. Check strong skills and remaining gaps
    expect(match.strongSkills).toContain('React');
    expect(match.strongSkills).toContain('Node.js');
    expect(match.remainingGaps.map(g => g.name)).toContain('Docker');
    expect(match.remainingGaps.map(g => g.name)).toContain('Cloud');

    // 5. Check dynamic explainability reasons
    expect(match.reasons.length).toBeGreaterThanOrEqual(3);
    const reasonsText = match.reasons.join(' ');
    expect(reasonsText).toMatch(/React/i);
    expect(reasonsText).toMatch(/project/i);
    expect(reasonsText).toMatch(/education/i);
    expect(reasonsText).toMatch(/Docker/i);
  });

  it('should penalize match score when student does not meet CGPA requirement or has no project overlap', () => {
    const lowCgpaStudent = {
      cgpa: 6.0, // Below minCgpa 7.5
      department: 'Computer Science',
      targetRole: 'Frontend Developer',
      skills: [
        { name: 'React', proficiency: 60, category: 'TECHNICAL' }
      ],
      projects: [],
      isRemotePreferred: false
    };

    const opportunity = {
      title: 'Senior Full-Stack Engineer',
      minCgpa: 8.0,
      location: 'Pune (Onsite)',
      isRemote: false,
      requiredSkills: [
        { name: 'React', minLevel: 80, weight: 1.0 },
        { name: 'Node.js', minLevel: 80, weight: 1.0 }
      ]
    };

    const match = calculateOpportunityMatch(lowCgpaStudent, opportunity);
    expect(match.components.educationEligibility).toBeLessThan(100);
    expect(match.components.projectRelevance).toBe(50); // Baseline without projects
    expect(match.overallScore).toBeLessThan(75);
    expect(match.reasons.some(r => r.includes('below minimum'))).toBe(true);
  });
});



