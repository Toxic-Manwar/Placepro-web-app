import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../server.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import http from 'http';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'placepro-super-secret-sih-jwt-key-2026';

describe('Phase 6: Skill Passport & RBAC API Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  let studentToken: string;
  let facultyToken: string;
  let recruiterToken: string;
  let testStudentId: string;
  let testPassportId: string;
  let reactSkillId: string;
  let nodeSkillId: string;

  beforeAll(async () => {
    // Start temporary test server on random port
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });

    const student = await prisma.studentProfile.findFirst({
      include: { user: true, skills: { include: { skill: true } } }
    });
    const faculty = await prisma.academicianProfile.findFirst({
      include: { user: true }
    });
    const industry = await prisma.industryProfile.findFirst({
      include: { user: true }
    });

    if (student) {
      testStudentId = student.id;
      testPassportId = student.passportId;
      studentToken = jwt.sign(
        { userId: student.userId, email: student.user.email, role: 'STUDENT', studentId: student.id },
        JWT_SECRET
      );

      const rSkill = student.skills.find((s) => s.skill.name === 'React');
      if (rSkill) reactSkillId = rSkill.skillId;

      const nSkill = student.skills.find((s) => s.skill.name === 'Node.js');
      if (nSkill) nodeSkillId = nSkill.skillId;
    }

    if (faculty) {
      facultyToken = jwt.sign(
        { userId: faculty.userId, fullName: faculty.user.fullName, email: faculty.user.email, role: 'ACADEMICIAN' },
        JWT_SECRET
      );
    }

    if (industry) {
      recruiterToken = jwt.sign(
        { userId: industry.userId, fullName: industry.user.fullName, email: industry.user.email, role: 'INDUSTRY' },
        JWT_SECRET
      );
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('1. GET /api/student/passport should return authenticated student passport', async () => {
    const res = await fetch(`${baseUrl}/api/student/passport`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('passportId');
    expect(body).toHaveProperty('skills');
    expect(Array.isArray(body.skills)).toBe(true);
    expect(body.skills.length).toBeGreaterThan(0);
    expect(body.student.fullName).toBeDefined();
  });

  it('2. GET /api/student/passport/:skillId/evidence should return specific skill evidence', async () => {
    const res = await fetch(`${baseUrl}/api/student/passport/${reactSkillId || 'React'}/evidence`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('evidence');
    expect(Array.isArray(body.evidence)).toBe(true);
  });

  it('3. PATCH /api/institution/students/:id/skills/:id/verify should reject unauthorized student role with 403', async () => {
    const res = await fetch(`${baseUrl}/api/institution/students/${testStudentId}/skills/${nodeSkillId || 'Node.js'}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ notes: 'Attempting student self-verification' })
    });
    const body: any = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toContain('Forbidden');
  });

  it('4. PATCH /api/institution/students/:id/skills/:id/verify should allow authorized ACADEMICIAN to verify skill', async () => {
    const res = await fetch(`${baseUrl}/api/institution/students/${testStudentId}/skills/${nodeSkillId || 'Node.js'}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`
      },
      body: JSON.stringify({ notes: 'Faculty verified after evaluating e-commerce microservices repository.' })
    });
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body.skill.verificationTier).toBe('INSTITUTION_VERIFIED');
    expect(body.history.verifierRole).toBe('ACADEMICIAN');
  });

  it('5. POST /api/industry/candidates/:id/skill-feedback should record structured feedback and elevate tier to INDUSTRY_VERIFIED', async () => {
    const res = await fetch(`${baseUrl}/api/industry/candidates/${testStudentId}/skill-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        skillName: 'React',
        rating: 92,
        feedbackText: 'Superb architecture understanding and responsive UI proficiency during live coding interview.',
        interactionType: 'TECHNICAL_INTERVIEW'
      })
    });
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body.currentTier).toBe('INDUSTRY_VERIFIED');
    expect(body.feedback.rating).toBe(92);
  });

  it('6. GET /api/passport/:passportId should return safe public passport without auth header', async () => {
    const res = await fetch(`${baseUrl}/api/passport/${testPassportId}`);
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body.passportId).toBe(testPassportId);
    expect(body.isPublicVerified).toBe(true);

    // Verify privacy: no sensitive fields leaked
    expect(body.email).toBeUndefined();
    expect(body.userId).toBeUndefined();
    expect(body.passwordHash).toBeUndefined();
  });

  it('7. GET /api/passport/invalid-id should return 404', async () => {
    const res = await fetch(`${baseUrl}/api/passport/non-existent-passport-999`);
    expect(res.status).toBe(404);
  });
});
