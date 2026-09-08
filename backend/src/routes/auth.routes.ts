import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'placepro-super-secret-sih-jwt-key-2026';

// Multi-role Registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role, department, regNumber, companyName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = (role || 'STUDENT').toUpperCase();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: assignedRole
      }
    });

    // Create associated profile based on role
    if (assignedRole === 'STUDENT') {
      const defaultInst = await prisma.institutionProfile.findFirst();
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          institutionId: defaultInst?.id || 'inst-1',
          regNumber: regNumber || `REG${Date.now().toString().slice(-6)}`,
          department: department || 'Computer Science & Engineering',
          semester: 6,
          cgpa: 8.5
        }
      });
    } else if (assignedRole === 'INDUSTRY') {
      await prisma.industryProfile.create({
        data: {
          userId: user.id,
          companyName: companyName || 'Enterprise Partner',
          location: 'Bangalore (Hybrid)',
          isVerified: true
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        industry: true,
        institution: true,
        academician: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        studentId: user.student?.id,
        industryId: user.industry?.id,
        institutionId: user.institution?.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profileId: user.student?.id || user.industry?.id || user.institution?.id || user.academician?.id
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Demo Fast Switch Token Endpoint (For seamless SIH evaluation)
router.all('/demo-token/:role?', async (req: Request, res: Response) => {
  try {
    const roleParam = req.params.role || req.body?.role || 'STUDENT';
    const role = roleParam.toUpperCase();
    const user = await prisma.user.findFirst({
      where: { role },
      include: {
        student: true,
        industry: true,
        institution: true,
        academician: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: `Demo user for role ${role} not found` });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        studentId: user.student?.id,
        industryId: user.industry?.id,
        institutionId: user.institution?.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profileId: user.student?.id || user.industry?.id || user.institution?.id || user.academician?.id
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
