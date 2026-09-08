import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../server.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import http from 'http';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'placepro-super-secret-sih-jwt-key-2026';

describe('Phase 7: Security Hardening, Strict RBAC & Input Validation Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  let studentToken: string;
  let facultyToken: string;
  let recruiterToken: string;
  let testStudentId: string;
  let testPassportId: string;
  let testOpportunityId: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });

    const student = await prisma.studentProfile.findFirst({
      include: { user: true }
    });
    const faculty = await prisma.academicianProfile.findFirst({
      include: { user: true }
    });
    const industry = await prisma.industryProfile.findFirst({
      include: { user: true }
    });
    const opp = await prisma.opportunity.findFirst();

    if (student) {
      testStudentId = student.id;
      testPassportId = student.passportId;
      studentToken = jwt.sign(
        { userId: student.userId, email: student.user.email, role: 'STUDENT', studentId: student.id },
        JWT_SECRET
      );
    }

    if (faculty) {
      facultyToken = jwt.sign(
        { userId: faculty.userId, fullName: faculty.user.fullName, email: faculty.user.email, role: 'ACADEMICIAN' },
        JWT_SECRET
      );
    }

    if (industry) {
      recruiterToken = jwt.sign(
        { userId: industry.userId, fullName: industry.user.fullName, email: industry.user.email, role: 'INDUSTRY', industryId: industry.id },
        JWT_SECRET
      );
    }

    if (opp) {
      testOpportunityId = opp.id;
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await prisma.$disconnect();
  });

  // 1. Health Check
  it('1. GET /api/health should return production-safe ok response', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const body: any = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('service');
  });

  // 2. Authentication Tests
  it('2. GET /api/student/profile without token should return 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/student/profile`);
    const body: any = await res.json();
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('3. GET /api/student/profile with invalid token should return 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/student/profile`, {
      headers: { Authorization: 'Bearer invalid-token-12345' }
    });
    const body: any = await res.json();
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  // 3. Strict RBAC Tests
  it('4. POST /api/opportunities as STUDENT should return 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Unauthorized Student Opportunity',
        skills: 'React, Node.js'
      })
    });
    const body: any = await res.json();
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('5. POST /api/opportunities/:id/apply as INDUSTRY should return 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/opportunities/${testOpportunityId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      }
    });
    const body: any = await res.json();
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('6. PATCH /api/institution/students/:id/skills/:id/verify as STUDENT should return 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/institution/students/${testStudentId}/skills/React/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ notes: 'Student illegal self-verification' })
    });
    const body: any = await res.json();
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  // 4. Input Validation Tests
  it('7. POST /api/opportunities with missing title should return 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        title: '   ',
        skills: 'Cloud, Docker'
      })
    });
    const body: any = await res.json();
    expect(res.status).toBe(400);
    expect(body.code).toBe('MISSING_TITLE');
  });

  it('8. POST /api/industry/candidates/:id/skill-feedback with invalid rating range should return 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/industry/candidates/${testStudentId}/skill-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        skillName: 'React',
        rating: 150, // Out of 0-100 range
        feedbackText: 'Great performance'
      })
    });
    const body: any = await res.json();
    expect(res.status).toBe(400);
    expect(body.code).toBe('INVALID_RATING_RANGE');
  });

  it('9. PATCH /api/industry/applications/:id/status with invalid status should return 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/industry/applications/app-test-id/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        status: 'NON_EXISTENT_STATUS_VALUE'
      })
    });
    const body: any = await res.json();
    expect(res.status).toBe(400);
    expect(body.code).toBe('INVALID_STATUS');
  });

  // 5. Privacy & Passport Test
  it('10. GET /api/passport/:passportId should return verified passport without leaking PII', async () => {
    const res = await fetch(`${baseUrl}/api/passport/${testPassportId}`);
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body.passportId).toBe(testPassportId);
    expect(body.isPublicVerified).toBe(true);
    expect(body.passwordHash).toBeUndefined();
    expect(body.userId).toBeUndefined();
    expect(body.email).toBeUndefined();
  });

  // 6. Phase 6: Institution Analytics & Curriculum Action Tests
  it('11. GET /api/institution/analytics should return live demand/supply metrics and alerts', async () => {
    const res = await fetch(`${baseUrl}/api/institution/analytics`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(body.institutionName).toBeDefined();
    expect(body.totalStudentsEnrolled).toBeGreaterThanOrEqual(1);
    expect(body.overallPlacementRate).toBeDefined();
    expect(Array.isArray(body.marketMetrics)).toBe(true);
  });

  it('12. POST /api/institution/curriculum-proposals by faculty should create proposal', async () => {
    const res = await fetch(`${baseUrl}/api/institution/curriculum-proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        skillName: 'Cloud',
        actionType: 'CURRICULUM_REVISION',
        title: 'AWS Cloud Native Systems Lab',
        description: 'Introducing hands-on cloud native computing laboratory exercises.',
        targetSemester: 'Fall 2026'
      })
    });
    const body: any = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.proposal.skillName).toBe('Cloud');
    expect(body.proposal.actionType).toBe('CURRICULUM_REVISION');
    expect(body.proposal.status).toBe('PROPOSED');
  });

  it('13. POST /api/institution/curriculum-proposals with invalid actionType should return 400', async () => {
    const res = await fetch(`${baseUrl}/api/institution/curriculum-proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        skillName: 'Cloud',
        actionType: 'INVALID_ACTION_TYPE',
        title: 'Invalid Test'
      })
    });
    const body: any = await res.json();

    expect(res.status).toBe(400);
    expect(body.code).toBe('INVALID_ACTION_TYPE');
  });

  it('14. POST /api/institution/curriculum-proposals by STUDENT should be forbidden (403)', async () => {
    const res = await fetch(`${baseUrl}/api/institution/curriculum-proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        skillName: 'Cloud',
        actionType: 'CURRICULUM_REVISION',
        title: 'Student Attempt'
      })
    });
    const body: any = await res.json();

    expect(res.status).toBe(403);
    expect(body.code).toBe('FORBIDDEN_ROLE_REQUIRED');
  });

  it('15. GET /api/institution/curriculum-proposals should return proposal list', async () => {
    const res = await fetch(`${baseUrl}/api/institution/curriculum-proposals`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const body: any = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });
});
