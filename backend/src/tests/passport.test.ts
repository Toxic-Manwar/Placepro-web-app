import { describe, it, expect } from 'vitest';
import { aggregateStudentPassport, aggregatePublicPassport } from '../engine/passportEngine.js';

describe('Phase 6: Skill Passport & Evidence Verification Engine', () => {
  const mockStudent = {
    id: 'st-test-01',
    userId: 'u-test-01',
    regNumber: '2023CSE089',
    department: 'Computer Science & Engineering',
    semester: 6,
    cgpa: 8.5,
    targetRole: 'Full-Stack Cloud Engineer',
    placementReadiness: 78.5,
    passportId: 'passport-john-2026',
    user: {
      id: 'u-test-01',
      fullName: 'John Developer',
      email: 'john.developer@takshashila.edu'
    },
    institution: {
      institutionName: 'Takshashila Institute of Technology'
    },
    skills: [
      {
        id: 'ss-1',
        skillId: 's-react',
        proficiency: 82,
        verificationTier: 'ASSESSMENT_VERIFIED',
        lastAssessedAt: new Date('2026-03-01T10:00:00Z'),
        skill: { id: 's-react', name: 'React', category: 'TECHNICAL' },
        verificationHistory: [
          {
            id: 'vh-1',
            fromTier: 'SELF_REPORTED',
            toTier: 'ASSESSMENT_VERIFIED',
            verifierName: 'PlacePro Diagnostic Engine',
            verifierRole: 'SYSTEM_ASSESSMENT',
            evidenceNotes: 'Automated assessment passed with score 85%.',
            createdAt: new Date('2026-03-01T10:00:00Z')
          }
        ],
        industryFeedback: [
          {
            id: 'if-1',
            companyName: 'Tech Innovations India',
            evaluatorName: 'Rajesh Malhotra',
            rating: 85,
            feedbackText: 'Excellent component design and hook optimization.',
            interactionType: 'TECHNICAL_INTERVIEW',
            createdAt: new Date('2026-03-02T14:00:00Z')
          }
        ]
      },
      {
        id: 'ss-2',
        skillId: 's-cloud',
        proficiency: 89,
        verificationTier: 'INSTITUTION_VERIFIED',
        lastAssessedAt: new Date('2026-03-03T11:00:00Z'),
        skill: { id: 's-cloud', name: 'Cloud', category: 'TECHNICAL' },
        verificationHistory: [
          {
            id: 'vh-2',
            fromTier: 'SELF_REPORTED',
            toTier: 'ASSESSMENT_VERIFIED',
            verifierName: 'PlacePro Reassessment Engine',
            verifierRole: 'SYSTEM_ASSESSMENT',
            evidenceNotes: 'Targeted reassessment passed.',
            createdAt: new Date('2026-03-03T11:00:00Z')
          },
          {
            id: 'vh-3',
            fromTier: 'ASSESSMENT_VERIFIED',
            toTier: 'INSTITUTION_VERIFIED',
            verifierName: 'Prof. Ramesh Gupta',
            verifierRole: 'ACADEMICIAN',
            evidenceNotes: 'Reviewed AWS cloud architecture capstone project.',
            createdAt: new Date('2026-03-04T09:00:00Z')
          }
        ],
        industryFeedback: []
      },
      {
        id: 'ss-3',
        skillId: 's-docker',
        proficiency: 50,
        verificationTier: 'SELF_REPORTED',
        lastAssessedAt: null,
        skill: { id: 's-docker', name: 'Docker', category: 'TECHNICAL' },
        verificationHistory: [],
        industryFeedback: []
      }
    ],
    projects: [
      {
        id: 'p-1',
        title: 'Full-Stack E-Commerce Platform',
        description: 'Microservices architecture with React frontend and PostgreSQL.',
        skillsJson: JSON.stringify(['React', 'Node.js', 'SQL']),
        isVerified: true
      }
    ],
    certifications: [
      {
        id: 'c-1',
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta / Coursera',
        issuedDate: 'Nov 2024',
        isVerified: true
      }
    ],
    learningProgress: [
      {
        id: 'lp-1',
        status: 'COMPLETED',
        progressPct: 100,
        completedAt: new Date('2026-02-20T12:00:00Z'),
        resource: {
          title: 'AWS Cloud Practitioner Immersion',
          provider: 'AWS SkillBuilder',
          duration: '4 weeks',
          skill: { name: 'Cloud' }
        }
      }
    ],
    assessmentResults: [
      {
        id: 'ar-1',
        score: 85,
        completedAt: new Date('2026-03-01T10:00:00Z'),
        assessment: {
          title: 'Full-Stack & Cloud Core Competency Diagnostic',
          questions: [
            { skillId: 's-react', skill: { name: 'React' } },
            { skillId: 's-cloud', skill: { name: 'Cloud' } }
          ]
        }
      }
    ]
  };

  it('1. should aggregate complete evidence-based student passport without hardcoded scores', () => {
    const passport = aggregateStudentPassport(mockStudent);

    expect(passport.passportId).toBe('passport-john-2026');
    expect(passport.student.fullName).toBe('John Developer');
    expect(passport.student.institution).toBe('Takshashila Institute of Technology');
    expect(passport.placementReadiness).toBe(78.5);
    expect(passport.totalSkillsCount).toBe(3);
    expect(passport.verifiedSkillsCount).toBe(2); // React & Cloud (Docker is SELF_REPORTED)

    // Check React skill
    const reactSkill = passport.skills.find((s) => s.skillName === 'React');
    expect(reactSkill).toBeDefined();
    expect(reactSkill?.proficiency).toBe(82);
    expect(reactSkill?.verificationTier).toBe('ASSESSMENT_VERIFIED');
    expect(reactSkill?.evidenceCount).toBeGreaterThanOrEqual(3); // Assessment + Project + Cert + Industry Feedback

    // Verify evidence item types
    const evidenceTypes = reactSkill?.evidence.map((e) => e.type);
    expect(evidenceTypes).toContain('ASSESSMENT');
    expect(evidenceTypes).toContain('PROJECT');
    expect(evidenceTypes).toContain('CERTIFICATION');
    expect(evidenceTypes).toContain('INDUSTRY_FEEDBACK');

    // Check Cloud skill with Institution Verification & Learning module
    const cloudSkill = passport.skills.find((s) => s.skillName === 'Cloud');
    expect(cloudSkill).toBeDefined();
    expect(cloudSkill?.verificationTier).toBe('INSTITUTION_VERIFIED');
    const cloudEvidenceTypes = cloudSkill?.evidence.map((e) => e.type);
    expect(cloudEvidenceTypes).toContain('INSTITUTION_VERIFICATION');
    expect(cloudEvidenceTypes).toContain('LEARNING_MODULE');
  });

  it('2. should correctly trace verification history audit trail across tier transitions', () => {
    const passport = aggregateStudentPassport(mockStudent);
    const cloudSkill = passport.skills.find((s) => s.skillName === 'Cloud');

    expect(cloudSkill?.history.length).toBe(2);
    expect(cloudSkill?.history[0].fromTier).toBe('SELF_REPORTED');
    expect(cloudSkill?.history[0].toTier).toBe('ASSESSMENT_VERIFIED');
    expect(cloudSkill?.history[1].fromTier).toBe('ASSESSMENT_VERIFIED');
    expect(cloudSkill?.history[1].toTier).toBe('INSTITUTION_VERIFIED');
    expect(cloudSkill?.history[1].verifierName).toBe('Prof. Ramesh Gupta');
  });

  it('3. should generate a secure public passport view with zero PII leakage', () => {
    const fullPassport = aggregateStudentPassport(mockStudent);
    const publicView: any = aggregatePublicPassport(fullPassport);

    expect(publicView.passportId).toBe('passport-john-2026');
    expect(publicView.studentName).toBe('John Developer');
    expect(publicView.institution).toBe('Takshashila Institute of Technology');
    expect(publicView.isPublicVerified).toBe(true);

    // Ensure private fields are NEVER exposed
    expect(publicView.email).toBeUndefined();
    expect(publicView.userId).toBeUndefined();
    expect(publicView.regNumber).toBeUndefined();
    expect(publicView.passwordHash).toBeUndefined();
    expect(publicView.studentId).toBeUndefined();

    // Ensure skill evidence summary is preserved
    expect(publicView.skills.length).toBe(3);
    expect(publicView.skills[0].skillName).toBe('React');
    expect(publicView.skills[0].evidence.length).toBeGreaterThan(0);
  });

  it('4. should distinguish unverified Self-Reported skills from Verified skills', () => {
    const passport = aggregateStudentPassport(mockStudent);
    const dockerSkill = passport.skills.find((s) => s.skillName === 'Docker');

    expect(dockerSkill?.verificationTier).toBe('SELF_REPORTED');
    expect(dockerSkill?.history.length).toBe(0);
    expect(dockerSkill?.summaryExplanation).toContain('without standardized test');
  });
});
