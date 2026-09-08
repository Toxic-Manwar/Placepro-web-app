import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { calculateOpportunityMatch } from '../engine/matchingEngine.js';
import { aggregateStudentPassport } from '../engine/passportEngine.js';

const router = Router();
const prisma = new PrismaClient();

// 1. GET Live Candidate ATS Applicants for Recruiter
router.get('/candidates', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        opportunity: {
          include: {
            requiredSkills: { include: { skill: true } }
          }
        },
        student: {
          include: {
            user: true,
            institution: true,
            skills: {
              include: {
                skill: true,
                verificationHistory: { orderBy: { createdAt: 'desc' } },
                industryFeedback: { orderBy: { createdAt: 'desc' } }
              }
            },
            projects: true,
            certifications: true
          }
        }
      },
      orderBy: { matchScore: 'desc' }
    });

    const candidates = applications.map((app) => {
      let breakdown = null;
      try {
        breakdown = JSON.parse(app.matchBreakdown);
      } catch (e) {}

      if (!breakdown) {
        // Compute dynamically if not cached in application
        const studentInput = {
          cgpa: app.student.cgpa,
          department: app.student.department,
          targetRole: app.student.targetRole,
          skills: app.student.skills.map((s) => ({
            name: s.skill.name,
            proficiency: s.proficiency,
            category: s.skill.category
          })),
          projects: app.student.projects.map((p) => ({
            title: p.title,
            skills: JSON.parse(p.skillsJson)
          })),
          isRemotePreferred: true
        };

        const oppInput = {
          title: app.opportunity.title,
          minCgpa: app.opportunity.minCgpa,
          location: app.opportunity.location,
          isRemote: app.opportunity.isRemote,
          requiredSkills: app.opportunity.requiredSkills.map((rs) => ({
            name: rs.skill.name,
            minLevel: rs.minLevel,
            weight: rs.weight
          }))
        };

        breakdown = calculateOpportunityMatch(studentInput, oppInput);
      }

      return {
        applicationId: app.id,
        opportunityId: app.opportunityId,
        opportunityTitle: app.opportunity.title,
        studentId: app.studentId,
        studentName: app.student.user.fullName,
        email: app.student.user.email,
        institution: app.student.institution.institutionName,
        department: app.student.department,
        cgpa: app.student.cgpa,
        matchScore: breakdown?.overallScore ?? app.matchScore,
        status: app.status,
        appliedAt: app.appliedAt,
        passportId: app.student.passportId,
        skills: app.student.skills.map((s) => ({
          id: s.id,
          skillId: s.skillId,
          name: s.skill.name,
          proficiency: s.proficiency,
          tier: s.verificationTier,
          lastAssessedAt: s.lastAssessedAt,
          feedbackCount: s.industryFeedback?.length || 0,
          historyCount: s.verificationHistory?.length || 0
        })),
        projects: app.student.projects,
        certifications: app.student.certifications,
        matchBreakdown: breakdown,
        strongSkills: breakdown?.strongSkills || [],
        remainingGaps: breakdown?.remainingGaps || [],
        reasons: breakdown?.reasons || [],
        recommendationSummary: breakdown?.recommendationSummary || ''
      };
    });

    // If no live applications yet, calculate live candidate matches for the primary active opportunity
    if (candidates.length === 0) {
      const allStudents = await prisma.studentProfile.findMany({
        include: {
          user: true,
          institution: true,
          skills: {
            include: {
              skill: true,
              verificationHistory: { orderBy: { createdAt: 'desc' } },
              industryFeedback: { orderBy: { createdAt: 'desc' } }
            }
          },
          projects: true,
          certifications: true
        }
      });

      const firstOpp = await prisma.opportunity.findFirst({
        include: {
          requiredSkills: { include: { skill: true } }
        }
      });

      const candidatePool = allStudents.map((st) => {
        let matchBreakdown = null;
        if (firstOpp) {
          const studentInput = {
            cgpa: st.cgpa,
            department: st.department,
            targetRole: st.targetRole,
            skills: st.skills.map((s) => ({
              name: s.skill.name,
              proficiency: s.proficiency,
              category: s.skill.category
            })),
            projects: st.projects.map((p) => ({
              title: p.title,
              skills: JSON.parse(p.skillsJson)
            })),
            isRemotePreferred: true
          };

          const oppInput = {
            title: firstOpp.title,
            minCgpa: firstOpp.minCgpa,
            location: firstOpp.location,
            isRemote: firstOpp.isRemote,
            requiredSkills: firstOpp.requiredSkills.map((rs) => ({
              name: rs.skill.name,
              minLevel: rs.minLevel,
              weight: rs.weight
            }))
          };

          matchBreakdown = calculateOpportunityMatch(studentInput, oppInput);
        }

        return {
          applicationId: `POOL-${st.id.slice(0, 6)}`,
          opportunityId: firstOpp?.id || 'opp-1',
          opportunityTitle: firstOpp?.title || 'Full-Stack Developer Intern',
          studentId: st.id,
          studentName: st.user.fullName,
          email: st.user.email,
          institution: st.institution.institutionName,
          department: st.department,
          cgpa: st.cgpa,
          matchScore: matchBreakdown?.overallScore ?? 85,
          status: 'UNDER_REVIEW',
          appliedAt: new Date(),
          passportId: st.passportId,
          skills: st.skills.map((s) => ({
            id: s.id,
            skillId: s.skillId,
            name: s.skill.name,
            proficiency: s.proficiency,
            tier: s.verificationTier,
            lastAssessedAt: s.lastAssessedAt,
            feedbackCount: s.industryFeedback?.length || 0,
            historyCount: s.verificationHistory?.length || 0
          })),
          projects: st.projects,
          certifications: st.certifications,
          matchBreakdown,
          strongSkills: matchBreakdown?.strongSkills || [],
          remainingGaps: matchBreakdown?.remainingGaps || [],
          reasons: matchBreakdown?.reasons || [],
          recommendationSummary: matchBreakdown?.recommendationSummary || ''
        };
      });

      candidatePool.sort((a, b) => b.matchScore - a.matchScore);
      return res.json(candidatePool);
    }

    candidates.sort((a, b) => b.matchScore - a.matchScore);
    res.json(candidates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET Candidate Full Skill Passport & Evidence Breakdown for Recruiter
router.get('/candidates/:studentId/passport', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.studentProfile.findFirst({
      where: {
        OR: [{ id: studentId }, { passportId: studentId }]
      },
      include: {
        user: true,
        institution: true,
        skills: {
          include: {
            skill: true,
            verificationHistory: { orderBy: { createdAt: 'desc' } },
            industryFeedback: { orderBy: { createdAt: 'desc' } }
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
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    const passport = aggregateStudentPassport(student);
    res.json(passport);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST Structured Industry Skill Feedback & Evaluation (RBAC: INDUSTRY, ADMIN)
router.post('/candidates/:studentId/skill-feedback', authenticateToken, requireRole('INDUSTRY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { skillId, skillName, rating, feedbackText, interactionType } = req.body;

    if (rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        message: 'Rating (0-100) is required',
        code: 'MISSING_RATING'
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 0 || numericRating > 100) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a valid number between 0 and 100',
        code: 'INVALID_RATING_RANGE'
      });
    }

    if (!feedbackText || typeof feedbackText !== 'string' || feedbackText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Structured feedbackText is required and cannot be empty',
        code: 'MISSING_FEEDBACK_TEXT'
      });
    }

    // Find student skill
    const studentSkill = await prisma.studentSkill.findFirst({
      where: {
        studentId,
        OR: [
          ...(skillId ? [{ skillId }, { id: skillId }] : []),
          ...(skillName ? [{ skill: { name: { equals: skillName } } }] : [])
        ]
      },
      include: {
        skill: true,
        student: { include: { user: true } }
      }
    });

    if (!studentSkill) {
      return res.status(404).json({
        success: false,
        message: 'Candidate skill record not found',
        code: 'SKILL_RECORD_NOT_FOUND'
      });
    }

    // Identify evaluator company
    const evaluatorUserId = req.user?.userId || req.user?.id;
    const industryProfile = await prisma.industryProfile.findFirst({
      where: evaluatorUserId ? { userId: evaluatorUserId } : {}
    });

    const companyName = industryProfile?.companyName || 'Tech Innovations India';
    const evaluatorName = req.user?.fullName || 'Recruiting Team Lead';
    const evaluatorId = evaluatorUserId || 'RECRUITER_USER';

    // 1. Create Industry Feedback record
    const feedbackRecord = await prisma.industrySkillFeedback.create({
      data: {
        studentSkillId: studentSkill.id,
        companyId: industryProfile?.id,
        companyName,
        evaluatorId,
        evaluatorName,
        rating: Math.round(numericRating),
        feedbackText: feedbackText.trim(),
        interactionType: interactionType || 'INTERVIEW'
      }
    });

    // 2. If rating >= 70, elevate tier to INDUSTRY_VERIFIED
    const prevTier = studentSkill.verificationTier;
    let newTier = prevTier;

    if (numericRating >= 70) {
      newTier = 'INDUSTRY_VERIFIED';
      await prisma.studentSkill.update({
        where: { id: studentSkill.id },
        data: {
          verificationTier: newTier,
          proficiency: Math.max(studentSkill.proficiency, Math.round(numericRating))
        }
      });

      // Create Verification History
      await prisma.verificationHistory.create({
        data: {
          studentSkillId: studentSkill.id,
          fromTier: prevTier,
          toTier: newTier,
          verifierId: evaluatorId,
          verifierName: `${evaluatorName} (${companyName})`,
          verifierRole: 'INDUSTRY',
          evidenceNotes: `Industry evaluation completed during ${interactionType || 'Interview'}. Rated ${numericRating}%: "${feedbackText.trim()}"`
        }
      });
    }

    // 3. Create Notification for Student
    await prisma.notification.create({
      data: {
        userId: studentSkill.student.userId,
        title: `Industry Evaluation: ${studentSkill.skill.name}`,
        message: `${companyName} provided a ${numericRating}% rating and feedback on your ${studentSkill.skill.name} skill.`,
        type: 'FEEDBACK'
      }
    });

    res.json({
      success: true,
      message: `Industry feedback successfully recorded for ${studentSkill.skill.name}`,
      feedback: feedbackRecord,
      previousTier: prevTier,
      currentTier: newTier,
      isElevated: newTier !== prevTier
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, code: 'FEEDBACK_SUBMISSION_FAILED' });
  }
});

// 4. PATCH Update Candidate Status (Shortlist, Interview, Offer, Reject)
router.patch('/applications/:id/status', authenticateToken, requireRole('INDUSTRY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    const allowedStatuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFER', 'REJECTED'];
    if (!status || typeof status !== 'string' || !allowedStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid application status: '${status}'. Allowed values: ${allowedStatuses.join(', ')}`,
        code: 'INVALID_STATUS'
      });
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status: status.toUpperCase() },
      include: { student: { include: { user: true } }, opportunity: true }
    });

    // Create Notification for Student
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: `Application Status Updated: ${status.toUpperCase()}`,
        message: `Your application for ${application.opportunity.title} has been moved to ${status.toUpperCase()}.`,
        type: 'STATUS_UPDATE'
      }
    });

    res.json({
      success: true,
      message: `Candidate application status updated to ${status.toUpperCase()}`,
      application
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, code: 'STATUS_UPDATE_FAILED' });
  }
});

export default router;
