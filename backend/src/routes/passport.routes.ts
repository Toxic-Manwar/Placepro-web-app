import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aggregateStudentPassport, aggregatePublicPassport } from '../engine/passportEngine.js';

const router = Router();
const prisma = new PrismaClient();

// Public Read-Only Verification Route
router.get('/:passportId', async (req: Request, res: Response) => {
  try {
    const { passportId } = req.params;

    const student = await prisma.studentProfile.findUnique({
      where: { passportId },
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
      return res.status(404).json({ error: 'Skill Passport credential not found or expired.' });
    }

    const fullPassport = aggregateStudentPassport(student);
    const publicPassport = aggregatePublicPassport(fullPassport);

    res.json(publicPassport);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
