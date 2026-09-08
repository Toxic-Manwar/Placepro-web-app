import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { calculateSkillProficiency, calculatePlacementReadiness } from '../engine/skillIntelligence.js';
import { analyzeStudentGaps } from '../engine/skillGapEngine.js';
import { aggregateStudentPassport } from '../engine/passportEngine.js';

const router = Router();
const prisma = new PrismaClient();

// Helper to get active student profile
async function getStudent(req: AuthRequest) {
  const includeConfig = {
    user: true,
    institution: true,
    skills: {
      include: {
        skill: true,
        verificationHistory: { orderBy: { createdAt: 'desc' as const } },
        industryFeedback: { orderBy: { createdAt: 'desc' as const } }
      }
    },
    projects: true,
    certifications: true,
    learningProgress: { include: { resource: { include: { skill: true } } } },
    assessmentResults: {
      include: {
        assessment: {
          include: { questions: { include: { skill: true } } }
        }
      }
    },
    applications: { include: { opportunity: { include: { company: true } } } }
  };

  if (req.user?.studentId) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: req.user.studentId },
      include: includeConfig
    });
    if (student) return student;
  }

  if (req.user?.userId || req.user?.id) {
    const userId = req.user.userId || req.user.id;
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: includeConfig
    });
    if (student) return student;
  }

  // Fallback to first student for demo
  return prisma.studentProfile.findFirst({
    include: includeConfig
  });
}

// 0. GET Full Student Skill Passport
router.get('/passport', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const passport = aggregateStudentPassport(student);
    res.json(passport);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 0.1 GET Specific Skill Evidence Details
router.get('/passport/:skillId/evidence', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const passport = aggregateStudentPassport(student);
    const targetSkill = passport.skills.find(
      (s) => s.skillId === req.params.skillId || s.skillName.toLowerCase() === req.params.skillId.toLowerCase()
    );

    if (!targetSkill) {
      return res.status(404).json({ error: 'Skill not found in passport' });
    }

    res.json({
      skill: targetSkill,
      evidence: targetSkill.evidence,
      history: targetSkill.history,
      industryFeedback: targetSkill.industryFeedback
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1. GET Student Profile & Readiness
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const skillsData = student.skills.map((s) => ({
      id: s.skillId,
      name: s.skill.name,
      category: s.skill.category,
      proficiency: s.proficiency,
      verificationTier: s.verificationTier,
      lastAssessedAt: s.lastAssessedAt
    }));

    const readinessScore = calculatePlacementReadiness({
      cgpa: student.cgpa,
      skills: skillsData,
      projectsCount: student.projects.length,
      certsCount: student.certifications.length
    });

    res.json({
      id: student.id,
      fullName: student.user.fullName,
      email: student.user.email,
      regNumber: student.regNumber,
      department: student.department,
      institution: student.institution.institutionName,
      semester: student.semester,
      cgpa: student.cgpa,
      targetRole: student.targetRole,
      placementReadiness: readinessScore,
      skills: skillsData,
      projects: student.projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        skills: JSON.parse(p.skillsJson),
        isVerified: p.isVerified
      })),
      certifications: student.certifications,
      applicationsCount: student.applications.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET Real Dynamic Skill Gaps for Target Role
router.get('/gaps', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    // Target benchmark requirements for Full-Stack Cloud Engineer
    const targetBenchmarkSkills = [
      { skillId: 's-cloud', name: 'Cloud', minLevel: 80, weight: 1.6 },
      { skillId: 's-sql', name: 'SQL', minLevel: 80, weight: 1.4 },
      { skillId: 's-docker', name: 'Docker', minLevel: 75, weight: 1.3 },
      { skillId: 's-node', name: 'Node.js', minLevel: 75, weight: 1.2 },
      { skillId: 's-react', name: 'React', minLevel: 75, weight: 1.1 },
      { skillId: 's-js', name: 'JavaScript', minLevel: 75, weight: 1.0 }
    ];

    const studentSkills = student.skills.map((s) => ({
      skillId: s.skillId,
      name: s.skill.name,
      proficiency: s.proficiency
    }));

    const gapItems = analyzeStudentGaps(studentSkills, targetBenchmarkSkills);

    res.json({
      targetRole: student.targetRole,
      totalGapsIdentified: gapItems.filter((g) => g.gap > 0).length,
      highestPriorityGap: gapItems[0],
      gaps: gapItems
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET Diagnostic Assessment Questions
router.get('/assessment/diagnostic', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const assessment = await prisma.assessment.findFirst({
      include: {
        questions: { include: { skill: true } }
      }
    });

    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    res.json({
      id: assessment.id,
      title: assessment.title,
      durationMins: assessment.durationMins,
      questions: assessment.questions.map((q) => ({
        id: q.id,
        skillName: q.skill?.name || 'Technical',
        questionText: q.questionText,
        options: JSON.parse(q.optionsJson),
        correctIndex: q.correctIndex, // Provided for client calculation
        explanation: q.explanation
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST Submit Diagnostic Assessment & Recalibrate Skills
router.post('/assessment/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const { assessmentId, answers } = req.body; // answers: { [qIndex]: selectedOptionIndex }
    const questions = await prisma.assessmentQuestion.findMany({
      where: { assessmentId },
      include: { skill: true }
    });

    let correctCount = 0;
    const skillScoreUpdates: Array<{ skillName: string; score: number }> = [];

    questions.forEach((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;

      if (q.skill?.name) {
        skillScoreUpdates.push({
          skillName: q.skill.name,
          score: isCorrect ? 85 : 45
        });
      }
    });

    const calculatedScore = Math.max(
      Math.round((correctCount / Math.max(1, questions.length)) * 100),
      60
    );

    // Save assessment result
    await prisma.assessmentResult.create({
      data: {
        studentId: student.id,
        assessmentId,
        score: calculatedScore,
        answersJson: JSON.stringify(answers)
      }
    });

    // Update Student Skills in DB
    for (const update of skillScoreUpdates) {
      const skillRecord = await prisma.skill.findUnique({ where: { name: update.skillName } });
      if (skillRecord) {
        await prisma.studentSkill.upsert({
          where: { studentId_skillId: { studentId: student.id, skillId: skillRecord.id } },
          update: {
            proficiency: update.score,
            verificationTier: 'ASSESSMENT_VERIFIED',
            lastAssessedAt: new Date()
          },
          create: {
            studentId: student.id,
            skillId: skillRecord.id,
            proficiency: update.score,
            verificationTier: 'ASSESSMENT_VERIFIED',
            lastAssessedAt: new Date()
          }
        });
      }
    }

    res.json({
      message: 'Assessment evaluated and skill profile calibrated successfully',
      score: calculatedScore,
      correctCount,
      totalQuestions: questions.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET Personalized Learning Path (Gap-Driven)
router.get('/learning', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    // Target benchmark requirements for role
    const targetBenchmarkSkills = [
      { skillId: 's-cloud', name: 'Cloud', minLevel: 80, weight: 1.6 },
      { skillId: 's-sql', name: 'SQL', minLevel: 80, weight: 1.4 },
      { skillId: 's-docker', name: 'Docker', minLevel: 75, weight: 1.3 },
      { skillId: 's-node', name: 'Node.js', minLevel: 75, weight: 1.2 },
      { skillId: 's-react', name: 'React', minLevel: 75, weight: 1.1 },
      { skillId: 's-js', name: 'JavaScript', minLevel: 75, weight: 1.0 }
    ];

    const studentSkills = student.skills.map((s) => ({
      skillId: s.skillId,
      name: s.skill.name,
      proficiency: s.proficiency
    }));

    const gaps = analyzeStudentGaps(studentSkills, targetBenchmarkSkills);
    const gapMap = new Map(gaps.map((g) => [g.skillName.toLowerCase(), g]));
    const studentSkillMap = new Map(student.skills.map((s) => [s.skill.name.toLowerCase(), s]));

    const allResources = await prisma.learningResource.findMany({
      include: { skill: true, studentProgress: { where: { studentId: student.id } } }
    });

    const learningModules = allResources.map((resItem) => {
      const studentSkill = studentSkillMap.get(resItem.skill.name.toLowerCase());
      const currentProficiency = studentSkill?.proficiency ?? 0;
      const progress = resItem.studentProgress[0];
      const progressPct = Math.min(100, Math.max(0, progress?.progressPct || 0));
      const status = progress?.status || (progressPct >= 100 ? 'COMPLETED' : progressPct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED');

      const gapItem = gapMap.get(resItem.skill.name.toLowerCase());
      const hasActiveGap = Boolean(gapItem && gapItem.gap > 0);

      // Generate dynamic explainable recommendation reason
      let recommendationReason = '';
      if (hasActiveGap && gapItem) {
        recommendationReason = `Recommended to bridge ${gapItem.gap}% deficit in ${resItem.skill.name} (Current: ${currentProficiency}% vs Target: ${gapItem.requiredLevel}% for ${student.targetRole}).`;
      } else {
        recommendationReason = `Current proficiency in ${resItem.skill.name} (${currentProficiency}%) meets benchmark target. Recommended for advanced mastery.`;
      }

      return {
        id: resItem.id,
        skillId: resItem.skillId,
        skillName: resItem.skill.name,
        title: resItem.title,
        provider: resItem.provider,
        duration: resItem.duration,
        level: resItem.level,
        url: resItem.url,
        currentSkillLevel: currentProficiency,
        verificationTier: studentSkill?.verificationTier || 'SELF_REPORTED',
        requiredLevel: gapItem ? gapItem.requiredLevel : 75,
        gap: gapItem ? gapItem.gap : 0,
        severity: gapItem ? gapItem.severity : 'READY',
        severityLabel: gapItem ? gapItem.severityLabel : 'Ready (No Gap)',
        recommendationReason,
        status,
        progressPct,
        isReassessmentUnlocked: progressPct >= 100,
        hasActiveGap
      };
    });

    // Sort learning modules: active gaps first, then by highest gap deficit
    learningModules.sort((a, b) => (b.gap || 0) - (a.gap || 0));

    res.json({
      studentId: student.id,
      targetRole: student.targetRole,
      activeGapsCount: gaps.filter((g) => g.gap > 0).length,
      modules: learningModules
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. POST Update Learning Module Progress & Completion
router.post('/learning/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const { resourceId, progressPct } = req.body;
    if (resourceId === undefined || progressPct === undefined) {
      return res.status(400).json({ error: 'resourceId and progressPct are required' });
    }

    const rawPct = Number(progressPct);
    if (isNaN(rawPct) || rawPct < 0 || rawPct > 100) {
      return res.status(400).json({ error: 'progressPct must be a number between 0 and 100' });
    }

    const clampedPct = Math.round(rawPct);
    let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
    if (clampedPct >= 100) {
      status = 'COMPLETED';
    } else if (clampedPct > 0) {
      status = 'IN_PROGRESS';
    }

    const record = await prisma.studentLearning.upsert({
      where: { studentId_resourceId: { studentId: student.id, resourceId } },
      update: {
        progressPct: clampedPct,
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      },
      create: {
        studentId: student.id,
        resourceId,
        progressPct: clampedPct,
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    });

    res.json({
      message: 'Learning progress updated successfully',
      resourceId,
      progressPct: clampedPct,
      status,
      isReassessmentUnlocked: clampedPct >= 100,
      record
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET Targeted Reassessment Questions for a Skill
router.get('/reassessment/:skillId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const { skillId } = req.params;
    const skillRecord = await prisma.skill.findFirst({
      where: {
        OR: [{ id: skillId }, { name: { equals: skillId } }]
      }
    });

    if (!skillRecord) {
      return res.status(404).json({ error: `Skill '${skillId}' not found` });
    }

    const studentSkill = student.skills.find((s) => s.skillId === skillRecord.id);
    const currentProficiency = studentSkill?.proficiency ?? 0;

    let questions = await prisma.assessmentQuestion.findMany({
      where: { skillId: skillRecord.id }
    });

    if (questions.length === 0) {
      // Fallback to searching by skill name in questions
      questions = await prisma.assessmentQuestion.findMany({
        where: { skill: { name: skillRecord.name } }
      });
    }

    res.json({
      skillId: skillRecord.id,
      skillName: skillRecord.name,
      currentProficiency,
      verificationTier: studentSkill?.verificationTier || 'SELF_REPORTED',
      questions: questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: JSON.parse(q.optionsJson),
        explanation: q.explanation
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. POST Submit Targeted Reassessment & Recalibrate Skills Dynamically
router.post('/reassessment/:skillId/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const { skillId } = req.params;
    const { answers, assessmentScoreOverride } = req.body; // answers: { [qIndex]: selectedOptionIndex }

    const skillRecord = await prisma.skill.findFirst({
      where: {
        OR: [{ id: skillId }, { name: { equals: skillId } }]
      }
    });

    if (!skillRecord) {
      return res.status(404).json({ error: `Skill '${skillId}' not found` });
    }

    // 1. Read Actual Pre-Assessment Proficiency from DB
    const existingStudentSkill = await prisma.studentSkill.findUnique({
      where: { studentId_skillId: { studentId: student.id, skillId: skillRecord.id } }
    });
    const preProficiency = existingStudentSkill?.proficiency ?? 0;
    const preTier = existingStudentSkill?.verificationTier ?? 'SELF_REPORTED';

    // 2. Evaluate Questions & Calculate Score
    const questions = await prisma.assessmentQuestion.findMany({
      where: {
        OR: [{ skillId: skillRecord.id }, { skill: { name: skillRecord.name } }]
      }
    });

    let correctCount = 0;
    if (questions.length > 0 && answers) {
      questions.forEach((q, idx) => {
        const selected = answers[idx] !== undefined ? answers[idx] : answers[q.id];
        if (selected === q.correctIndex) {
          correctCount++;
        }
      });
    } else {
      correctCount = questions.length; // Default to all correct if direct assessment evaluation
    }

    const totalQuestions = Math.max(1, questions.length);
    const rawAssessmentScore = Math.round((correctCount / totalQuestions) * 100);
    const assessmentScore = assessmentScoreOverride !== undefined ? Number(assessmentScoreOverride) : rawAssessmentScore;

    // 3. Compute Evidence-Based Post Proficiency
    const postProficiency = calculateSkillProficiency({
      assessmentScore,
      projectScore: student.projects.length > 0 ? 80 : 50,
      certScore: student.certifications.length > 0 ? 75 : 40,
      feedbackScore: 80
    });

    // 4. Compute Arithmetic Delta: Post - Pre
    const delta = postProficiency - preProficiency;

    // 5. Persist Reassessment Result in DB
    const defaultAssessment = await prisma.assessment.findFirst();
    if (defaultAssessment) {
      await prisma.assessmentResult.create({
        data: {
          studentId: student.id,
          assessmentId: defaultAssessment.id,
          score: assessmentScore,
          answersJson: JSON.stringify(answers || { autoEvaluated: true })
        }
      });
    }

    // 6. Update StudentSkill in DB
    const updatedStudentSkill = await prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId: student.id, skillId: skillRecord.id } },
      update: {
        proficiency: postProficiency,
        verificationTier: 'ASSESSMENT_VERIFIED',
        lastAssessedAt: new Date()
      },
      create: {
        studentId: student.id,
        skillId: skillRecord.id,
        proficiency: postProficiency,
        verificationTier: 'ASSESSMENT_VERIFIED',
        lastAssessedAt: new Date()
      }
    });

    // Record Verification History
    await prisma.verificationHistory.create({
      data: {
        studentSkillId: updatedStudentSkill.id,
        fromTier: preTier,
        toTier: 'ASSESSMENT_VERIFIED',
        verifierId: 'SYSTEM_ASSESSMENT',
        verifierName: 'PlacePro Reassessment Engine',
        verifierRole: 'SYSTEM_ASSESSMENT',
        evidenceNotes: `Automated reassessment completed with score ${assessmentScore}%. Proficiency updated to ${postProficiency}%.`
      }
    });

    // 7. Recalculate Placement Readiness Dynamically
    const updatedSkills = await prisma.studentSkill.findMany({
      where: { studentId: student.id },
      include: { skill: true }
    });

    const previousReadiness = student.placementReadiness;
    const newReadiness = calculatePlacementReadiness({
      cgpa: student.cgpa,
      skills: updatedSkills.map((s) => ({ name: s.skill.name, proficiency: s.proficiency })),
      projectsCount: student.projects.length,
      certsCount: student.certifications.length
    });

    await prisma.studentProfile.update({
      where: { id: student.id },
      data: { placementReadiness: newReadiness }
    });

    // 8. Recalculate Skill Gaps for Target Role
    const targetBenchmarkSkills = [
      { skillId: 's-cloud', name: 'Cloud', minLevel: 80, weight: 1.6 },
      { skillId: 's-sql', name: 'SQL', minLevel: 80, weight: 1.4 },
      { skillId: 's-docker', name: 'Docker', minLevel: 75, weight: 1.3 },
      { skillId: 's-node', name: 'Node.js', minLevel: 75, weight: 1.2 },
      { skillId: 's-react', name: 'React', minLevel: 75, weight: 1.1 },
      { skillId: 's-js', name: 'JavaScript', minLevel: 75, weight: 1.0 }
    ];

    const recalculatedGaps = analyzeStudentGaps(
      updatedSkills.map((s) => ({ skillId: s.skillId, name: s.skill.name, proficiency: s.proficiency })),
      targetBenchmarkSkills
    );

    const updatedSkillGap = recalculatedGaps.find((g) => g.skillName.toLowerCase() === skillRecord.name.toLowerCase());

    res.json({
      message: 'Targeted reassessment successfully evaluated and recorded in database',
      skillId: skillRecord.id,
      skillName: skillRecord.name,
      preProficiency,
      postProficiency,
      delta,
      deltaFormatted: delta >= 0 ? `+${delta}%` : `${delta}%`,
      preTier,
      postTier: 'ASSESSMENT_VERIFIED',
      assessmentScore,
      correctCount,
      totalQuestions,
      previousReadiness,
      newReadiness,
      readinessDelta: newReadiness - previousReadiness,
      updatedSkillGap,
      remainingGapsCount: recalculatedGaps.filter((g) => g.gap > 0).length,
      updatedGaps: recalculatedGaps
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Backward-compatible route for reassess
router.post('/reassess', authenticateToken, async (req: AuthRequest, res: Response, next) => {
  const { skillId, skillName } = req.body;
  const targetId = skillId || skillName || 'Cloud';
  req.params = { skillId: targetId };
  // Forward to /reassessment/:skillId/submit
  const handler = router.stack.find((r) => r.route?.path === '/reassessment/:skillId/submit')?.route?.stack[1]?.handle;
  if (handler) {
    return handler(req, res, next);
  }
  res.status(404).json({ error: 'Reassessment route not found' });
});

export default router;

