import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { calculateOpportunityMatch } from '../engine/matchingEngine.js';

const router = Router();
const prisma = new PrismaClient();

// Helper to get active student context
async function getStudent(req: AuthRequest) {
  if (req.user?.studentId) {
    return prisma.studentProfile.findUnique({
      where: { id: req.user.studentId },
      include: {
        skills: { include: { skill: true } },
        projects: true,
        applications: true
      }
    });
  }
  return prisma.studentProfile.findFirst({
    include: {
      skills: { include: { skill: true } },
      projects: true,
      applications: true
    }
  });
}

// 1. GET Opportunities with Real Calculated Match Scores & Explainability
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);

    const opportunities = await prisma.opportunity.findMany({
      include: {
        company: true,
        requiredSkills: { include: { skill: true } },
        applications: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const studentCandidateInput = student
      ? {
          cgpa: student.cgpa,
          department: student.department,
          targetRole: student.targetRole,
          skills: student.skills.map((s) => ({
            name: s.skill.name,
            proficiency: s.proficiency,
            category: s.skill.category
          })),
          projects: student.projects.map((p) => ({
            title: p.title,
            skills: JSON.parse(p.skillsJson)
          })),
          isRemotePreferred: true
        }
      : null;

    const results = opportunities.map((opp) => {
      const oppInput = {
        title: opp.title,
        minCgpa: opp.minCgpa,
        location: opp.location,
        isRemote: opp.isRemote,
        requiredSkills: opp.requiredSkills.map((rs) => ({
          name: rs.skill.name,
          minLevel: rs.minLevel,
          weight: rs.weight
        }))
      };

      const matchBreakdown = studentCandidateInput
        ? calculateOpportunityMatch(studentCandidateInput, oppInput)
        : null;

      const userApplication = student
        ? opp.applications.find((a) => a.studentId === student.id)
        : null;

      return {
        id: opp.id,
        type: opp.type.toLowerCase(),
        title: opp.title,
        company: opp.company.companyName,
        logoText: opp.company.logoText,
        location: opp.location,
        isRemote: opp.isRemote,
        duration: opp.duration,
        stipend: opp.stipend,
        minCgpa: opp.minCgpa,
        deadline: opp.deadline.toISOString().split('T')[0],
        description: opp.description,
        skills: opp.requiredSkills.map((s) => s.skill.name),
        matchScore: matchBreakdown?.overallScore ?? 75,
        matchBreakdown,
        strongSkills: matchBreakdown?.strongSkills || [],
        remainingGaps: matchBreakdown?.remainingGaps || [],
        reasons: matchBreakdown?.reasons || [],
        recommendationSummary: matchBreakdown?.recommendationSummary || '',
        applied: !!userApplication,
        applicationStatus: userApplication?.status || null
      };
    });

    // Sort by calculated match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST Publish New Opportunity (Industry Recruiter & Admin)
router.post('/', authenticateToken, requireRole('INDUSTRY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, stipend, skills, description, duration, location, isRemote, minCgpa } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Opportunity title is required and cannot be empty',
        code: 'MISSING_TITLE'
      });
    }

    if (!skills) {
      return res.status(400).json({
        success: false,
        message: 'Required skills list is required',
        code: 'MISSING_SKILLS'
      });
    }

    let parsedCgpa = 7.0;
    if (minCgpa !== undefined && minCgpa !== null) {
      parsedCgpa = parseFloat(minCgpa);
      if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10.0) {
        return res.status(400).json({
          success: false,
          message: 'minCgpa must be a valid academic score between 0.0 and 10.0',
          code: 'INVALID_CGPA'
        });
      }
    }

    // Find recruiter company profile
    let company = await prisma.industryProfile.findFirst({
      where: req.user?.industryId ? { id: req.user.industryId } : (req.user?.userId ? { userId: req.user.userId } : {})
    });

    if (!company) {
      const defaultUser = await prisma.user.findFirst({ where: { role: 'INDUSTRY' } });
      company = await prisma.industryProfile.findFirst({ where: { userId: defaultUser?.id } });
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Industry recruiter profile not found',
        code: 'INDUSTRY_PROFILE_NOT_FOUND'
      });
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        companyId: company.id,
        type: (type || 'INTERNSHIP').toUpperCase(),
        title: title.trim(),
        description: description || 'Exciting engineering role working on real-world systems.',
        location: location || 'Bangalore (Remote)',
        isRemote: isRemote ?? true,
        duration: duration || (type === 'job' ? 'Full-Time' : '3 months'),
        stipend: stipend || '₹25,000 / mo',
        minCgpa: parsedCgpa,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    });

    // Parse and link required skills
    const rawSkills = Array.isArray(skills)
      ? skills
      : skills.split(',').map((s: string) => s.trim()).filter(Boolean);

    for (const skillName of rawSkills) {
      let skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (!skill) {
        skill = await prisma.skill.create({
          data: { name: skillName, category: 'TECHNICAL', industryDemandWeight: 1.2 }
        });
      }
      await prisma.opportunitySkill.create({
        data: {
          opportunityId: opportunity.id,
          skillId: skill.id,
          minLevel: 70,
          weight: 1.2
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Opportunity successfully published and indexed in database',
      opportunity
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, code: 'OPPORTUNITY_CREATION_FAILED' });
  }
});

// 3. POST 1-Click Apply to Opportunity (Student & Admin)
router.post('/:id/apply', authenticateToken, requireRole('STUDENT', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const student = await getStudent(req);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    const opportunityId = req.params.id;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        company: true,
        requiredSkills: { include: { skill: true } }
      }
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
        code: 'OPPORTUNITY_NOT_FOUND'
      });
    }

    // Calculate match score
    const studentInput = {
      cgpa: student.cgpa,
      department: student.department,
      targetRole: student.targetRole,
      skills: student.skills.map((s) => ({
        name: s.skill.name,
        proficiency: s.proficiency,
        category: s.skill.category
      })),
      projects: student.projects.map((p) => ({
        title: p.title,
        skills: JSON.parse(p.skillsJson)
      })),
      isRemotePreferred: true
    };

    const oppInput = {
      title: opportunity.title,
      minCgpa: opportunity.minCgpa,
      location: opportunity.location,
      isRemote: opportunity.isRemote,
      requiredSkills: opportunity.requiredSkills.map((rs) => ({
        name: rs.skill.name,
        minLevel: rs.minLevel,
        weight: rs.weight
      }))
    };

    const matchBreakdown = calculateOpportunityMatch(studentInput, oppInput);

    const application = await prisma.application.upsert({
      where: {
        opportunityId_studentId: {
          opportunityId,
          studentId: student.id
        }
      },
      update: {
        status: 'APPLIED',
        matchScore: matchBreakdown.overallScore,
        matchBreakdown: JSON.stringify(matchBreakdown)
      },
      create: {
        opportunityId,
        studentId: student.id,
        status: 'APPLIED',
        matchScore: matchBreakdown.overallScore,
        matchBreakdown: JSON.stringify(matchBreakdown)
      }
    });

    res.status(201).json({
      success: true,
      message: `Successfully applied for ${opportunity.title} at ${opportunity.company.companyName}!`,
      application: {
        id: application.id,
        opportunityId: opportunity.id,
        title: opportunity.title,
        company: opportunity.company.companyName,
        status: application.status,
        matchScore: application.matchScore,
        date: 'Just Now',
        matchBreakdown
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message, code: 'APPLICATION_FAILED' });
  }
});

export default router;
