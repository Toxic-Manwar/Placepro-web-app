import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PlacePro SIH Database...');

  // 1. Clean existing records
  await prisma.verificationHistory.deleteMany();
  await prisma.industrySkillFeedback.deleteMany();
  await prisma.application.deleteMany();
  await prisma.opportunitySkill.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.studentLearning.deleteMany();
  await prisma.learningResource.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.placementRecord.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.industryProfile.deleteMany();
  await prisma.academicianProfile.deleteMany();
  await prisma.institutionProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('PlacePro@2026', 10);

  // 2. Create Users
  const studentUser = await prisma.user.create({
    data: {
      email: 'john.developer@takshashila.edu',
      passwordHash,
      fullName: 'John Developer',
      role: 'STUDENT'
    }
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'priya.sharma@takshashila.edu',
      passwordHash,
      fullName: 'Priya Sharma',
      role: 'STUDENT'
    }
  });

  const recruiterUser = await prisma.user.create({
    data: {
      email: 'hr@techinnovations.in',
      passwordHash,
      fullName: 'Rajesh Malhotra',
      role: 'INDUSTRY'
    }
  });

  const institutionUser = await prisma.user.create({
    data: {
      email: 'tpo@takshashila.edu',
      passwordHash,
      fullName: 'Dr. A. K. Sharma (Dean TPO)',
      role: 'INSTITUTION'
    }
  });

  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty.cse@takshashila.edu',
      passwordHash,
      fullName: 'Prof. Ramesh Gupta',
      role: 'ACADEMICIAN'
    }
  });

  // 3. Create Profiles
  const institution = await prisma.institutionProfile.create({
    data: {
      userId: institutionUser.id,
      institutionName: 'Takshashila Institute of Technology',
      code: 'TIT-2026',
      city: 'Bangalore',
      state: 'Karnataka',
      placementRate: 95.0,
      avgPackageLpa: 8.5
    }
  });

  const industry = await prisma.industryProfile.create({
    data: {
      userId: recruiterUser.id,
      companyName: 'Tech Innovations India',
      logoText: 'TI',
      industryType: 'Enterprise Cloud & Web Systems',
      location: 'Bangalore (Remote)',
      isVerified: true
    }
  });

  await prisma.academicianProfile.create({
    data: {
      userId: facultyUser.id,
      institutionId: institution.id,
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor & Research Lead',
      specialization: 'Distributed Systems & Cloud Architecture'
    }
  });

  const student = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      institutionId: institution.id,
      regNumber: '2023CSE089',
      department: 'Computer Science & Engineering',
      semester: 6,
      cgpa: 8.5,
      targetRole: 'Full-Stack Cloud Engineer',
      placementReadiness: 63.0,
      passportId: 'passport-john-2026'
    }
  });

  const student2 = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      institutionId: institution.id,
      regNumber: '2023CSE102',
      department: 'Computer Science & Engineering',
      semester: 6,
      cgpa: 9.1,
      targetRole: 'Associate Cloud Engineer',
      placementReadiness: 88.0,
      passportId: 'passport-priya-2026'
    }
  });

  // 4. Create Skills
  const skillsData = [
    { name: 'React', category: 'TECHNICAL', industryDemandWeight: 1.3 },
    { name: 'JavaScript', category: 'TECHNICAL', industryDemandWeight: 1.4 },
    { name: 'Node.js', category: 'TECHNICAL', industryDemandWeight: 1.2 },
    { name: 'SQL', category: 'TECHNICAL', industryDemandWeight: 1.5 },
    { name: 'Cloud', category: 'TECHNICAL', industryDemandWeight: 1.6 },
    { name: 'Docker', category: 'TECHNICAL', industryDemandWeight: 1.4 },
    { name: 'Python', category: 'TECHNICAL', industryDemandWeight: 1.5 },
    { name: 'Communication', category: 'SOFT', industryDemandWeight: 1.1 },
    { name: 'Problem-Solving', category: 'SOFT', industryDemandWeight: 1.3 }
  ];

  const skillMap = new Map<string, string>();
  for (const s of skillsData) {
    const created = await prisma.skill.create({ data: s });
    skillMap.set(s.name, created.id);
  }

  // 5. Assign Student Skills (The Starting Demo Scenario Profile)
  const initialStudentSkills = [
    { name: 'React', proficiency: 82, tier: 'ASSESSMENT_VERIFIED', lastAssessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { name: 'JavaScript', proficiency: 78, tier: 'ASSESSMENT_VERIFIED', lastAssessedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { name: 'Node.js', proficiency: 55, tier: 'SELF_REPORTED', lastAssessedAt: null },
    { name: 'SQL', proficiency: 48, tier: 'SELF_REPORTED', lastAssessedAt: null },
    { name: 'Cloud', proficiency: 28, tier: 'SELF_REPORTED', lastAssessedAt: null },
    { name: 'Docker', proficiency: 25, tier: 'SELF_REPORTED', lastAssessedAt: null },
    { name: 'Python', proficiency: 75, tier: 'ASSESSMENT_VERIFIED', lastAssessedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { name: 'Communication', proficiency: 85, tier: 'ASSESSMENT_VERIFIED', lastAssessedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { name: 'Problem-Solving', proficiency: 80, tier: 'ASSESSMENT_VERIFIED', lastAssessedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
  ];

  for (const s of initialStudentSkills) {
    const createdStudentSkill = await prisma.studentSkill.create({
      data: {
        studentId: student.id,
        skillId: skillMap.get(s.name)!,
        proficiency: s.proficiency,
        verificationTier: s.tier,
        lastAssessedAt: s.lastAssessedAt
      }
    });

    // Create initial verification history
    if (s.tier === 'ASSESSMENT_VERIFIED') {
      await prisma.verificationHistory.create({
        data: {
          studentSkillId: createdStudentSkill.id,
          fromTier: 'SELF_REPORTED',
          toTier: 'ASSESSMENT_VERIFIED',
          verifierId: 'SYSTEM_ASSESSMENT',
          verifierName: 'PlacePro Diagnostic Engine',
          verifierRole: 'SYSTEM_ASSESSMENT',
          evidenceNotes: `Automated assessment benchmark achieved with proficiency of ${s.proficiency}%`,
          createdAt: s.lastAssessedAt || new Date()
        }
      });
    }
  }

  // Student 2 Skills
  for (const s of [
    { name: 'Python', proficiency: 90 },
    { name: 'SQL', proficiency: 85 },
    { name: 'Cloud', proficiency: 80 },
    { name: 'Docker', proficiency: 75 },
    { name: 'React', proficiency: 65 }
  ]) {
    await prisma.studentSkill.create({
      data: {
        studentId: student2.id,
        skillId: skillMap.get(s.name)!,
        proficiency: s.proficiency,
        verificationTier: 'ASSESSMENT_VERIFIED'
      }
    });
  }

  // 6. Create Projects & Certifications
  await prisma.project.create({
    data: {
      studentId: student.id,
      title: 'Full-Stack E-Commerce Platform',
      description: 'Microservices architecture with React frontend, Node.js backend, and PostgreSQL database.',
      skillsJson: JSON.stringify(['React', 'Node.js', 'SQL', 'JavaScript']),
      isVerified: true
    }
  });

  await prisma.project.create({
    data: {
      studentId: student.id,
      title: 'Multiplayer Collaborative Code Editor',
      description: 'WebSocket synchronized code room with real-time syntax checking.',
      skillsJson: JSON.stringify(['JavaScript', 'Node.js', 'React']),
      isVerified: true
    }
  });

  await prisma.certification.create({
    data: {
      studentId: student.id,
      name: 'Meta Front-End Developer Professional Certificate',
      issuer: 'Meta / Coursera',
      issuedDate: 'Nov 2024',
      isVerified: true
    }
  });

  // 7. Create Diagnostic & Targeted Assessments & Questions
  const assessment = await prisma.assessment.create({
    data: {
      title: 'Full-Stack & Cloud Core Competency Diagnostic',
      category: 'TECHNICAL',
      durationMins: 10
    }
  });

  const questions = [
    {
      skillName: 'Cloud',
      questionText: 'Which AWS service is designed specifically for container orchestration with Kubernetes support?',
      options: ['Amazon EC2', 'Amazon EKS', 'Amazon S3', 'AWS Lambda'],
      correctIndex: 1,
      explanation: 'Amazon EKS (Elastic Kubernetes Service) runs managed Kubernetes clusters on AWS.'
    },
    {
      skillName: 'Cloud',
      questionText: 'Which cloud computing model provides virtualized compute, storage, and networking hardware on-demand?',
      options: ['SaaS (Software as a Service)', 'IaaS (Infrastructure as a Service)', 'PaaS (Platform as a Service)', 'FaaS (Function as a Service)'],
      correctIndex: 1,
      explanation: 'IaaS provides fundamental compute, network, and storage infrastructure on demand.'
    },
    {
      skillName: 'SQL',
      questionText: 'What type of index in relational databases physically sorts the table rows on disk?',
      options: ['Non-Clustered Index', 'Clustered Index', 'Bitmap Index', 'Hash Index'],
      correctIndex: 1,
      explanation: 'A Clustered Index determines the physical order of data rows in the table.'
    },
    {
      skillName: 'SQL',
      questionText: 'Which SQL clause is executed after aggregating rows to filter groups based on aggregate function values?',
      options: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'],
      correctIndex: 2,
      explanation: 'HAVING is used to filter aggregated groups after GROUP BY evaluation.'
    },
    {
      skillName: 'Docker',
      questionText: 'Which instruction in a Dockerfile defines the default executable that cannot be easily overridden when the container starts?',
      options: ['CMD', 'ENTRYPOINT', 'RUN', 'EXPOSE'],
      correctIndex: 1,
      explanation: 'ENTRYPOINT sets the default command and parameters that are always executed.'
    },
    {
      skillName: 'Docker',
      questionText: 'In containerization, what is the primary benefit of multi-stage Docker builds?',
      options: ['Faster internet downloads', 'Minimizing final production image size by separating build tools from runtime', 'Enabling multi-threaded compilation', 'Automatic Kubernetes scaling'],
      correctIndex: 1,
      explanation: 'Multi-stage builds leave compiler SDKs in build stages and copy only binaries to lean runtime images.'
    },
    {
      skillName: 'React',
      questionText: 'In modern React, which hook is primarily used for managing synchronous DOM layout measurements?',
      options: ['useEffect', 'useMemo', 'useLayoutEffect', 'useCallback'],
      correctIndex: 2,
      explanation: 'useLayoutEffect fires synchronously after all DOM mutations before painting.'
    },
    {
      skillName: 'React',
      questionText: 'What is the purpose of React.memo when wrapping a functional component?',
      options: ['To cache asynchronous fetch responses', 'To prevent re-rendering when props have not shallowly changed', 'To manage global context state', 'To bind class methods'],
      correctIndex: 1,
      explanation: 'React.memo is a higher-order component that memoizes the rendered output to skip re-renders if props are shallowly equal.'
    },
    {
      skillName: 'Node.js',
      questionText: 'Which core architecture enables Node.js to handle high concurrency on a single thread?',
      options: ['Multi-threading', 'Event Loop & Libuv Non-Blocking I/O', 'Thread Pooling', 'Synchronous Blocking I/O'],
      correctIndex: 1,
      explanation: 'The Event Loop backed by libuv provides asynchronous, non-blocking I/O execution.'
    },
    {
      skillName: 'Node.js',
      questionText: 'Which phase of the Node.js event loop executes callbacks scheduled by setImmediate()?',
      options: ['Timers Phase', 'I/O Callbacks Phase', 'Check Phase', 'Close Callbacks Phase'],
      correctIndex: 2,
      explanation: 'The check phase runs callbacks registered via setImmediate().'
    }
  ];

  for (const q of questions) {
    await prisma.assessmentQuestion.create({
      data: {
        assessmentId: assessment.id,
        skillId: skillMap.get(q.skillName),
        questionText: q.questionText,
        optionsJson: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        explanation: q.explanation
      }
    });
  }

  // 8. Create Learning Resources
  await prisma.learningResource.create({
    data: {
      skillId: skillMap.get('Cloud')!,
      title: 'AWS Cloud Practitioner & Architecture Immersion',
      provider: 'AWS SkillBuilder',
      duration: '4 weeks',
      level: 'Intermediate',
      url: 'https://aws.amazon.com/training/'
    }
  });

  await prisma.learningResource.create({
    data: {
      skillId: skillMap.get('SQL')!,
      title: 'Advanced Relational Database Design & Query Optimization',
      provider: 'Database Masterclass',
      duration: '3 weeks',
      level: 'Intermediate',
      url: 'https://postgresql.org/docs/'
    }
  });

  await prisma.learningResource.create({
    data: {
      skillId: skillMap.get('Docker')!,
      title: 'Docker & Kubernetes in Production',
      provider: 'DevOps Academy',
      duration: '3 weeks',
      level: 'Advanced',
      url: 'https://docker.com'
    }
  });

  // 9. Create Opportunities
  const opp1 = await prisma.opportunity.create({
    data: {
      companyId: industry.id,
      type: 'INTERNSHIP',
      title: 'Full-Stack Developer Intern',
      description: 'Join our core engineering team to build scalable cloud-native web applications. Work directly with senior architects on real customer workloads.',
      location: 'Bangalore (Remote)',
      isRemote: true,
      duration: '3 months',
      stipend: '₹25,000 / mo',
      minCgpa: 7.5,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.opportunitySkill.createMany({
    data: [
      { opportunityId: opp1.id, skillId: skillMap.get('React')!, minLevel: 75, weight: 1.2 },
      { opportunityId: opp1.id, skillId: skillMap.get('JavaScript')!, minLevel: 70, weight: 1.0 },
      { opportunityId: opp1.id, skillId: skillMap.get('Node.js')!, minLevel: 65, weight: 1.0 },
      { opportunityId: opp1.id, skillId: skillMap.get('SQL')!, minLevel: 70, weight: 1.2 },
      { opportunityId: opp1.id, skillId: skillMap.get('Cloud')!, minLevel: 60, weight: 1.4 }
    ]
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      companyId: industry.id,
      type: 'JOB',
      title: 'Associate Cloud Engineer',
      description: 'Build backend microservices, monitor container clusters, and automate cloud infrastructure deployment pipelines.',
      location: 'Bangalore (Remote)',
      isRemote: true,
      duration: 'Full-Time',
      stipend: '₹8.5 - 12 LPA',
      minCgpa: 8.0,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.opportunitySkill.createMany({
    data: [
      { opportunityId: opp2.id, skillId: skillMap.get('Cloud')!, minLevel: 80, weight: 1.5 },
      { opportunityId: opp2.id, skillId: skillMap.get('Docker')!, minLevel: 75, weight: 1.3 },
      { opportunityId: opp2.id, skillId: skillMap.get('Python')!, minLevel: 75, weight: 1.1 },
      { opportunityId: opp2.id, skillId: skillMap.get('SQL')!, minLevel: 70, weight: 1.0 }
    ]
  });

  // 10. Placement Records for Institution Dashboard
  await prisma.placementRecord.createMany({
    data: [
      { institutionId: institution.id, department: 'CSE', placedCount: 192, totalCount: 200, placementRate: 96.0 },
      { institutionId: institution.id, department: 'IT', placedCount: 138, totalCount: 150, placementRate: 92.0 },
      { institutionId: institution.id, department: 'ECE', placedCount: 105, totalCount: 120, placementRate: 88.0 },
      { institutionId: institution.id, department: 'Mech', placedCount: 78, totalCount: 100, placementRate: 78.0 },
      { institutionId: institution.id, department: 'Civil', placedCount: 59, totalCount: 80, placementRate: 74.0 }
    ]
  });

  console.log('✅ PlacePro SIH Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
