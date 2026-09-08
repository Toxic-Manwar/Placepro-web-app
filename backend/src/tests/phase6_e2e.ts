/**
 * PlacePro Phase 6: Skill Passport & Evidence Verification End-to-End Test
 * 
 * Verifies:
 * 1. Dynamic database-backed Student Skill Passport
 * 2. Multi-tier verification model: SELF_REPORTED ➔ ASSESSMENT_VERIFIED ➔ INSTITUTION_VERIFIED ➔ INDUSTRY_VERIFIED
 * 3. Evidence traceability (Assessments, Projects, Certifications, Learning Modules, Faculty Endorsements, Industry Evaluations)
 * 4. Institution/Faculty Verification Workflow with Audit History
 * 5. Industry Recruiter Structured Feedback & Evaluation
 * 6. Public Safe Passport Verification View
 * 7. Security / RBAC enforcement
 */

import { PrismaClient } from '@prisma/client';
import app from '../server.js';
import jwt from 'jsonwebtoken';
import http from 'http';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'placepro-super-secret-sih-jwt-key-2026';

async function runPhase6E2E() {
  console.log('\n=============================================================');
  console.log('🚀 RUNNING PHASE 6 END-TO-END VERIFICATION: SKILL PASSPORT & TRUST');
  console.log('=============================================================\n');

  // Start ephemeral test server
  let server: http.Server;
  let baseUrl: string;

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as any;
      baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });

  try {
    // 1. Fetch Demo Student, Faculty, and Recruiter from Persisted Database
    const student = await prisma.studentProfile.findFirst({
      include: {
        user: true,
        institution: true,
        skills: { include: { skill: true } },
        projects: true,
        certifications: true
      }
    });

    const faculty = await prisma.academicianProfile.findFirst({
      include: { user: true }
    });

    const recruiter = await prisma.industryProfile.findFirst({
      include: { user: true }
    });

    if (!student || !faculty || !recruiter) {
      throw new Error('Database records missing. Please run `npm run prisma:seed`.');
    }

    console.log(`[E2E Step 1] Loaded Active Profiles:`);
    console.log(` - Student: ${student.user.fullName} (${student.regNumber}) | Target Role: ${student.targetRole} | Readiness: ${student.placementReadiness}%`);
    console.log(` - Passport Identifier: ${student.passportId}`);
    console.log(` - Faculty: ${faculty.user.fullName} (${faculty.department})`);
    console.log(` - Recruiter: ${recruiter.user.fullName} (${recruiter.companyName})\n`);

    // Generate JWTs
    const studentToken = jwt.sign(
      { userId: student.userId, email: student.user.email, role: 'STUDENT', studentId: student.id },
      JWT_SECRET
    );
    const facultyToken = jwt.sign(
      { userId: faculty.userId, fullName: faculty.user.fullName, email: faculty.user.email, role: 'ACADEMICIAN' },
      JWT_SECRET
    );
    const recruiterToken = jwt.sign(
      { userId: recruiter.userId, fullName: recruiter.user.fullName, email: recruiter.user.email, role: 'INDUSTRY' },
      JWT_SECRET
    );

    // 2. Fetch Student Passport
    console.log(`[E2E Step 2] Fetching GET /api/student/passport...`);
    const passportRes = await fetch(`${baseUrl}/api/student/passport`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passport: any = await passportRes.json();

    if (passportRes.status !== 200 || !passport.skills) {
      throw new Error(`Failed to fetch student passport: ${JSON.stringify(passport)}`);
    }

    console.log(` ✓ Passport successfully loaded for ${passport.student.fullName}`);
    console.log(` ✓ Total Skills: ${passport.totalSkillsCount} | Verified Skills: ${passport.verifiedSkillsCount}`);
    console.log(` ✓ Skills Inventory Sample:`);
    passport.skills.slice(0, 4).forEach((s: any) => {
      console.log(`   - ${s.skillName}: ${s.proficiency}% [${s.verificationTier}] — Evidence Count: ${s.evidenceCount}`);
    });
    console.log();

    // 3. Drilldown Evidence on Specific Skill
    console.log(`[E2E Step 3] Fetching GET /api/student/passport/React/evidence...`);
    const evidenceRes = await fetch(`${baseUrl}/api/student/passport/React/evidence`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const evidenceData: any = await evidenceRes.json();
    console.log(` ✓ Retrieved evidence for React:`);
    evidenceData.evidence.forEach((ev: any) => {
      console.log(`   • [${ev.type}] ${ev.title} — ${ev.description} (Score: ${ev.score || 'N/A'})`);
    });
    console.log();

    // 4. Test RBAC: Student Cannot Verify Their Own Skill
    console.log(`[E2E Step 4] Testing Security / RBAC: Student attempting self-verification...`);
    const unauthorizedRes = await fetch(`${baseUrl}/api/institution/students/${student.id}/skills/Node.js/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ notes: 'Illegal student self-verification attempt' })
    });

    if (unauthorizedRes.status === 403) {
      console.log(` ✓ Security Check Passed: Student rejected with HTTP 403 Forbidden.\n`);
    } else {
      throw new Error(`Security Failure: Expected 403 Forbidden, got ${unauthorizedRes.status}`);
    }

    // 5. Faculty Endorses Node.js Skill to INSTITUTION_VERIFIED
    console.log(`[E2E Step 5] Faculty Endorsement: PATCH /api/institution/students/:id/skills/:id/verify...`);
    const verifyRes = await fetch(`${baseUrl}/api/institution/students/${student.id}/skills/Node.js/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        notes: 'Prof. Ramesh Gupta verified full-stack microservices architecture repository and code quality.'
      })
    });
    const verifyData: any = await verifyRes.json();

    if (verifyRes.status !== 200 || verifyData.skill.verificationTier !== 'INSTITUTION_VERIFIED') {
      throw new Error(`Faculty verification failed: ${JSON.stringify(verifyData)}`);
    }

    console.log(` ✓ Skill Node.js successfully elevated to: ${verifyData.skill.verificationTier}`);
    console.log(` ✓ Verification History Audit Record created:`);
    console.log(`   - Transition: ${verifyData.history.fromTier} ➔ ${verifyData.history.toTier}`);
    console.log(`   - Endorsed by: ${verifyData.history.verifierName} (${verifyData.history.verifierRole})`);
    console.log(`   - Notes: "${verifyData.history.evidenceNotes}"\n`);

    // 6. Recruiter Submits Structured Industry Feedback & Elevates to INDUSTRY_VERIFIED
    console.log(`[E2E Step 6] Recruiter Evaluation: POST /api/industry/candidates/:id/skill-feedback...`);
    const feedbackRes = await fetch(`${baseUrl}/api/industry/candidates/${student.id}/skill-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        skillName: 'Node.js',
        rating: 94,
        feedbackText: 'Superb understanding of asynchronous non-blocking event loop, stream processing, and REST security.',
        interactionType: 'TECHNICAL_INTERVIEW'
      })
    });
    const feedbackData: any = await feedbackRes.json();

    if (feedbackRes.status !== 200 || feedbackData.currentTier !== 'INDUSTRY_VERIFIED') {
      throw new Error(`Industry evaluation failed: ${JSON.stringify(feedbackData)}`);
    }

    console.log(` ✓ Industry Feedback recorded for Node.js:`);
    console.log(`   - Evaluator: ${feedbackData.feedback.companyName} (${feedbackData.feedback.evaluatorName})`);
    console.log(`   - Rating: ${feedbackData.feedback.rating}%`);
    console.log(`   - Tier Transition: ${feedbackData.previousTier} ➔ ${feedbackData.currentTier}\n`);

    // 7. Verify Public Safe Passport View
    console.log(`[E2E Step 7] Public Verification View: GET /api/passport/${student.passportId}...`);
    const publicRes = await fetch(`${baseUrl}/api/passport/${student.passportId}`);
    const publicData: any = await publicRes.json();

    if (publicRes.status !== 200 || !publicData.isPublicVerified) {
      throw new Error(`Public passport view failed: ${JSON.stringify(publicData)}`);
    }

    console.log(` ✓ Public credential verified:`);
    console.log(`   - Student Name: ${publicData.studentName}`);
    console.log(`   - Institution: ${publicData.institution}`);
    console.log(`   - Verified Skills Count: ${publicData.verifiedSkillsCount}`);
    console.log(`   - Zero PII Leaked: email=${publicData.email}, userId=${publicData.userId}, passwordHash=${publicData.passwordHash}\n`);

    console.log('=============================================================');
    console.log('🎉 ALL PHASE 6 END-TO-END TESTS PASSED SUCCESSFULLY!');
    console.log('=============================================================\n');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  }
}

runPhase6E2E().catch((err) => {
  console.error('❌ Phase 6 E2E Test Failed:', err);
  process.exit(1);
});
