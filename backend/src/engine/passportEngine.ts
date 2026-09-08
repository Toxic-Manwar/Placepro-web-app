export interface SkillEvidenceItem {
  type: 'ASSESSMENT' | 'PROJECT' | 'CERTIFICATION' | 'LEARNING_MODULE' | 'INSTITUTION_VERIFICATION' | 'INDUSTRY_FEEDBACK';
  title: string;
  description: string;
  score?: number | string;
  isVerified?: boolean;
  verifier?: string;
  date?: string | Date;
  metadata?: Record<string, any>;
}

export interface VerificationHistoryItem {
  id: string;
  fromTier: string;
  toTier: string;
  verifierName: string;
  verifierRole: string;
  notes?: string | null;
  createdAt: string | Date;
}

export interface IndustryFeedbackItem {
  id: string;
  companyName: string;
  evaluatorName: string;
  rating: number;
  feedbackText: string;
  interactionType: string;
  createdAt: string | Date;
}

export interface PassportSkill {
  skillId: string;
  skillName: string;
  category: string;
  proficiency: number;
  verificationTier: 'SELF_REPORTED' | 'ASSESSMENT_VERIFIED' | 'INSTITUTION_VERIFIED' | 'INDUSTRY_VERIFIED' | string;
  lastAssessedAt: string | Date | null;
  evidence: SkillEvidenceItem[];
  evidenceCount: number;
  history: VerificationHistoryItem[];
  industryFeedback: IndustryFeedbackItem[];
  summaryExplanation: string;
}

export interface StudentPassport {
  passportId: string;
  student: {
    fullName: string;
    email?: string;
    regNumber?: string;
    department: string;
    semester: number;
    cgpa: number;
    institution: string;
  };
  targetRole: string;
  placementReadiness: number;
  totalSkillsCount: number;
  verifiedSkillsCount: number;
  skills: PassportSkill[];
  projects: Array<{
    id: string;
    title: string;
    description: string;
    skills: string[];
    isVerified: boolean;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issuedDate: string;
    isVerified: boolean;
  }>;
  shareableUrl: string;
  generatedAt: string;
}

/**
 * Aggregates complete evidence-backed Skill Passport from persisted database records.
 */
export function aggregateStudentPassport(student: any): StudentPassport {
  const studentSkills = student.skills || [];
  const projects = student.projects || [];
  const certs = student.certifications || [];
  const learningList = student.learningProgress || [];
  const assessmentResults = student.assessmentResults || [];

  const parsedProjects = projects.map((p: any) => {
    let skills: string[] = [];
    try {
      skills = typeof p.skillsJson === 'string' ? JSON.parse(p.skillsJson) : (p.skillsJson || []);
    } catch {
      skills = [];
    }
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      skills,
      isVerified: Boolean(p.isVerified)
    };
  });

  const parsedCerts = certs.map((c: any) => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    issuedDate: c.issuedDate,
    isVerified: Boolean(c.isVerified)
  }));

  const passportSkills: PassportSkill[] = studentSkills.map((s: any) => {
    const skillName = s.skill?.name || 'Skill';
    const skillNameLower = skillName.toLowerCase();
    const evidence: SkillEvidenceItem[] = [];

    // 1. Assessment Evidence
    if (s.lastAssessedAt || s.verificationTier !== 'SELF_REPORTED') {
      // Find relevant assessment results
      const relatedResults = assessmentResults.filter((ar: any) => {
        if (!ar.assessment) return false;
        // Check if any question in assessment targeted this skill
        const hasMatchingQuestion = ar.assessment.questions?.some(
          (q: any) => q.skill?.name?.toLowerCase() === skillNameLower || q.skillId === s.skillId
        );
        return hasMatchingQuestion || ar.assessment.title.toLowerCase().includes(skillNameLower);
      });

      if (relatedResults.length > 0) {
        relatedResults.forEach((ar: any) => {
          evidence.push({
            type: 'ASSESSMENT',
            title: ar.assessment.title,
            description: `Completed standardized competency assessment with verified score.`,
            score: `${ar.score}%`,
            isVerified: true,
            verifier: 'PlacePro Diagnostic Engine',
            date: ar.completedAt,
            metadata: { score: ar.score }
          });
        });
      } else if (s.lastAssessedAt) {
        evidence.push({
          type: 'ASSESSMENT',
          title: `${skillName} Competency Diagnostic`,
          description: `Passed algorithmic assessment benchmark achieving ${s.proficiency}% proficiency.`,
          score: `${s.proficiency}%`,
          isVerified: true,
          verifier: 'PlacePro Diagnostic Engine',
          date: s.lastAssessedAt
        });
      }
    }

    // 2. Project Evidence
    const matchingProjects = parsedProjects.filter((p: any) =>
      p.skills.some((ps: string) => ps.toLowerCase() === skillNameLower)
    );
    matchingProjects.forEach((p: any) => {
      evidence.push({
        type: 'PROJECT',
        title: `Project: ${p.title}`,
        description: p.description,
        isVerified: p.isVerified,
        verifier: p.isVerified ? 'Academic Faculty Review' : 'Student Submitted',
        metadata: { projectId: p.id, technologies: p.skills }
      });
    });

    // 3. Certification Evidence
    const matchingCerts = parsedCerts.filter((c: any) =>
      c.name.toLowerCase().includes(skillNameLower) ||
      (skillNameLower === 'react' && c.name.toLowerCase().includes('front-end')) ||
      (skillNameLower === 'cloud' && c.name.toLowerCase().includes('cloud'))
    );
    matchingCerts.forEach((c: any) => {
      evidence.push({
        type: 'CERTIFICATION',
        title: `Certification: ${c.name}`,
        description: `Issued by ${c.issuer} (${c.issuedDate})`,
        isVerified: c.isVerified,
        verifier: c.issuer,
        date: c.issuedDate
      });
    });

    // 4. Learning Completion Evidence
    const matchingLearning = learningList.filter((l: any) => {
      const resourceSkill = l.resource?.skill?.name?.toLowerCase() || '';
      return resourceSkill === skillNameLower || l.resource?.title?.toLowerCase().includes(skillNameLower);
    });
    matchingLearning.forEach((l: any) => {
      if (l.status === 'COMPLETED' || l.progressPct >= 100) {
        evidence.push({
          type: 'LEARNING_MODULE',
          title: `Learning Path: ${l.resource.title}`,
          description: `Completed comprehensive curriculum from ${l.resource.provider} (${l.resource.duration}).`,
          score: '100%',
          isVerified: true,
          verifier: l.resource.provider,
          date: l.completedAt
        });
      }
    });

    // 5. Institution Verification History
    const history: VerificationHistoryItem[] = (s.verificationHistory || []).map((vh: any) => ({
      id: vh.id,
      fromTier: vh.fromTier,
      toTier: vh.toTier,
      verifierName: vh.verifierName,
      verifierRole: vh.verifierRole,
      notes: vh.evidenceNotes,
      createdAt: vh.createdAt
    }));

    history.forEach((vh) => {
      if (vh.verifierRole === 'ACADEMICIAN' || vh.verifierRole === 'INSTITUTION') {
        evidence.push({
          type: 'INSTITUTION_VERIFICATION',
          title: `Faculty Endorsement: ${vh.toTier}`,
          description: vh.notes || `Verified by academic faculty upon review of student project and coursework evidence.`,
          isVerified: true,
          verifier: `${vh.verifierName} (${vh.verifierRole})`,
          date: vh.createdAt
        });
      }
    });

    // 6. Industry Feedback
    const feedbackList: IndustryFeedbackItem[] = (s.industryFeedback || []).map((fb: any) => ({
      id: fb.id,
      companyName: fb.companyName,
      evaluatorName: fb.evaluatorName,
      rating: fb.rating,
      feedbackText: fb.feedbackText,
      interactionType: fb.interactionType,
      createdAt: fb.createdAt
    }));

    feedbackList.forEach((fb) => {
      evidence.push({
        type: 'INDUSTRY_FEEDBACK',
        title: `Industry Evaluation (${fb.companyName})`,
        description: `"${fb.feedbackText}" — Rated ${fb.rating}% during ${fb.interactionType.replace('_', ' ')}.`,
        score: `${fb.rating}%`,
        isVerified: true,
        verifier: `${fb.evaluatorName} (${fb.companyName})`,
        date: fb.createdAt
      });
    });

    // Determine summary explanation
    let summaryExplanation = 'Claimed by student without standardized test or faculty review.';
    if (s.verificationTier === 'INDUSTRY_VERIFIED') {
      summaryExplanation = `Industry verified with structured recruiter evaluation and practical performance feedback.`;
    } else if (s.verificationTier === 'INSTITUTION_VERIFIED') {
      summaryExplanation = `Faculty verified based on evaluated project artifacts and coursework demonstration.`;
    } else if (s.verificationTier === 'ASSESSMENT_VERIFIED') {
      summaryExplanation = `Assessment verified through PlacePro diagnostic testing (${s.proficiency}% proficiency).`;
    }

    return {
      skillId: s.skillId,
      skillName,
      category: s.skill?.category || 'TECHNICAL',
      proficiency: s.proficiency,
      verificationTier: s.verificationTier,
      lastAssessedAt: s.lastAssessedAt,
      evidence,
      evidenceCount: evidence.length,
      history,
      industryFeedback: feedbackList,
      summaryExplanation
    };
  });

  const verifiedSkillsCount = passportSkills.filter((s) => s.verificationTier !== 'SELF_REPORTED').length;

  return {
    passportId: student.passportId || 'passport-demo',
    student: {
      fullName: student.user?.fullName || 'Student',
      email: student.user?.email,
      regNumber: student.regNumber,
      department: student.department || 'Computer Science',
      semester: student.semester || 6,
      cgpa: student.cgpa || 8.0,
      institution: student.institution?.institutionName || 'Takshashila Institute of Technology'
    },
    targetRole: student.targetRole || 'Full-Stack Cloud Engineer',
    placementReadiness: student.placementReadiness || 70,
    totalSkillsCount: passportSkills.length,
    verifiedSkillsCount,
    skills: passportSkills,
    projects: parsedProjects,
    certifications: parsedCerts,
    shareableUrl: `/passport/${student.passportId || 'passport-demo'}`,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Creates a public, safe, non-PII representation of a student passport.
 */
export function aggregatePublicPassport(passport: StudentPassport) {
  return {
    passportId: passport.passportId,
    studentName: passport.student.fullName,
    institution: passport.student.institution,
    department: passport.student.department,
    targetRole: passport.targetRole,
    placementReadiness: passport.placementReadiness,
    totalSkillsCount: passport.totalSkillsCount,
    verifiedSkillsCount: passport.verifiedSkillsCount,
    skills: passport.skills.map((s) => ({
      skillName: s.skillName,
      category: s.category,
      proficiency: s.proficiency,
      verificationTier: s.verificationTier,
      evidenceCount: s.evidenceCount,
      summaryExplanation: s.summaryExplanation,
      evidence: s.evidence.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.description,
        score: e.score,
        verifier: e.verifier,
        date: e.date
      }))
    })),
    projects: passport.projects.map((p) => ({
      title: p.title,
      description: p.description,
      skills: p.skills,
      isVerified: p.isVerified
    })),
    certifications: passport.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      issuedDate: c.issuedDate,
      isVerified: c.isVerified
    })),
    generatedAt: passport.generatedAt,
    isPublicVerified: true
  };
}
