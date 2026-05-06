import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DOMAINS = [
  "Cardiology Imaging",
  "Neurology",
  "Surgical Robotics",
  "Biomedical Engineering",
  "Oncology",
  "Medical Imaging",
  "IoT Healthcare",
  "Telemedicine",
  "Genomics",
  "Orthopedics",
];

const STAGES = ["idea", "concept_validation", "prototype", "pilot_testing", "pre_deployment"];
const COMMITMENTS = ["low", "medium", "high", "full_time"];
const COLLAB_TYPES = ["advisor", "co_founder", "research_partner"];
const CITIES = ["Istanbul", "Ankara", "Izmir", "London", "Berlin", "Paris", "New York"];

async function main() {
  console.log("Seeding database with generated demo data...");

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.meetingRequest.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // ─── Demo + extra users ────────────────────────────────────────────────────
  const baseUsers = [
    {
      id: "demo-engineer",
      slug: "demo-engineer-01",
      email: "engineer@healthai.edu",
      firstName: "Alex",
      lastName: "Chen",
      role: "engineer",
      institution: "MIT Medical Engineering",
      city: "Istanbul",
      expertise: ["Machine Learning", "Python", "Data Science", "IoT"],
    },
    {
      id: "demo-healthcare",
      slug: "demo-healthcare-01",
      email: "doctor@healthai.edu",
      firstName: "Dr. Sarah",
      lastName: "Williams",
      role: "healthcare",
      institution: "Istanbul Medical School",
      city: "Istanbul",
      expertise: ["Cardiology", "Clinical Trials", "ICU Management"],
    },
    {
      id: "admin",
      slug: "admin-01",
      email: "admin@healthai.edu",
      firstName: "System",
      lastName: "Admin",
      role: "admin",
      institution: "Health AI Platform",
      city: "London",
      expertise: [],
    },
    // Extra engineers
    {
      id: "user-eng-1",
      slug: "user-eng-1-slug",
      email: "user1@healthai.edu",
      firstName: "Marcus",
      lastName: "Hoffmann",
      role: "engineer",
      institution: "TU Berlin",
      city: "Berlin",
      expertise: ["AI", "Computer Vision", "Robotics"],
    },
    {
      id: "user-eng-2",
      slug: "user-eng-2-slug",
      email: "user2@healthai.edu",
      firstName: "Yuki",
      lastName: "Tanaka",
      role: "engineer",
      institution: "Bogazici University",
      city: "Istanbul",
      expertise: ["Embedded Systems", "Signal Processing"],
    },
    {
      id: "user-eng-3",
      slug: "user-eng-3-slug",
      email: "user3@healthai.edu",
      firstName: "Liam",
      lastName: "O'Brien",
      role: "engineer",
      institution: "Imperial College London",
      city: "London",
      expertise: ["Deep Learning", "NLP", "Cloud"],
    },
    // Extra doctors
    {
      id: "user-doc-1",
      slug: "user-doc-1-slug",
      email: "user4@healthai.edu",
      firstName: "Dr. Elena",
      lastName: "Vasquez",
      role: "healthcare",
      institution: "Ankara University Hospital",
      city: "Ankara",
      expertise: ["Oncology", "Radiology"],
    },
    {
      id: "user-doc-2",
      slug: "user-doc-2-slug",
      email: "user5@healthai.edu",
      firstName: "Dr. Mehmet",
      lastName: "Kaya",
      role: "healthcare",
      institution: "Paris Medical Center",
      city: "Paris",
      expertise: ["Neurology", "Brain Imaging"],
    },
    {
      id: "user-doc-3",
      slug: "user-doc-3-slug",
      email: "user6@healthai.edu",
      firstName: "Dr. Aisha",
      lastName: "Rahman",
      role: "healthcare",
      institution: "NYU Langone Health",
      city: "New York",
      expertise: ["Genomics", "Precision Medicine"],
    },
    {
      id: "user-doc-4",
      slug: "user-doc-4-slug",
      email: "user7@healthai.edu",
      firstName: "Dr. Lucas",
      lastName: "Ferreira",
      role: "healthcare",
      institution: "Izmir Katip Celebi University",
      city: "Izmir",
      expertise: ["Orthopedics", "Rehabilitation"],
    },
  ];

  const createdUsers: any[] = [];
  for (const user of baseUsers) {
    const u = await prisma.user.create({
      data: {
        id: user.id,
        slug: user.slug,
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        institution: user.institution,
        city: user.city,
        country: "Global",
        expertise: JSON.stringify(user.expertise),
        bio: `Hello, I am a ${user.role} interested in healthcare innovation at ${user.institution}.`,
        profileCompleteness: 100,
        isActive: true,
        isEmailVerified: true,
      },
    });
    createdUsers.push(u);
  }
  console.log(`Created ${createdUsers.length} users.`);

  // ─── Posts ─────────────────────────────────────────────────────────────────
  // Demo-engineer's posts
  const engPost1 = await prisma.post.create({
    data: {
      authorId: "demo-engineer",
      title: "AI-Powered ECG Anomaly Detection System",
      domain: "Cardiology Imaging",
      description: "Building a real-time ECG analysis system that uses deep learning to detect atrial fibrillation and other cardiac anomalies with >95% accuracy. Looking for a cardiologist to validate clinical workflows.",
      requiredExpertise: JSON.stringify(["Cardiology", "Clinical Validation", "ECG Interpretation"]),
      projectStage: "prototype",
      commitmentLevel: "medium",
      collaborationType: "research_partner",
      confidentialityLevel: "public",
      highLevelIdea: "We want to deploy this as a screening tool in outpatient clinics across Turkey.",
      city: "Istanbul",
      country: "Global",
      status: "meeting_scheduled",
      interestCount: 3,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoClose: true,
    },
  });

  const engPost2 = await prisma.post.create({
    data: {
      authorId: "demo-engineer",
      title: "IoT Remote Patient Monitoring Platform",
      domain: "IoT Healthcare",
      description: "Developing wearable sensor network for continuous vital sign monitoring in hospital wards. Need clinical expertise to define alert thresholds and care protocols.",
      requiredExpertise: JSON.stringify(["ICU Management", "Clinical Protocols", "Patient Safety"]),
      projectStage: "concept_validation",
      commitmentLevel: "high",
      collaborationType: "co_founder",
      confidentialityLevel: "public",
      highLevelIdea: "Smart ward monitoring reducing nurse response time by 40%.",
      city: "Istanbul",
      country: "Global",
      status: "active",
      interestCount: 5,
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      autoClose: false,
    },
  });

  const engPost3 = await prisma.post.create({
    data: {
      authorId: "demo-engineer",
      title: "Surgical Robot Navigation via Computer Vision",
      domain: "Surgical Robotics",
      description: "Creating computer vision system for real-time surgical instrument tracking during minimally invasive procedures. Need surgical expertise for use-case definition.",
      requiredExpertise: JSON.stringify(["Surgery", "Minimally Invasive Procedures"]),
      projectStage: "idea",
      commitmentLevel: "low",
      collaborationType: "advisor",
      confidentialityLevel: "meeting_only",
      highLevelIdea: "Vision-guided robotic arm assistance for laparoscopic surgery.",
      city: "Istanbul",
      country: "Global",
      status: "active",
      interestCount: 2,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      autoClose: false,
    },
  });

  // Demo-healthcare's posts
  const hcPost1 = await prisma.post.create({
    data: {
      authorId: "demo-healthcare",
      title: "Clinical Decision Support for Cardiac ICU",
      domain: "Cardiology Imaging",
      description: "We need an AI model that helps intensivists prioritize patients in cardiac ICUs based on deterioration risk scores. Currently relying on subjective assessments.",
      requiredExpertise: JSON.stringify(["Machine Learning", "Predictive Analytics", "Healthcare AI"]),
      projectStage: "concept_validation",
      commitmentLevel: "medium",
      collaborationType: "research_partner",
      confidentialityLevel: "public",
      highLevelIdea: "Risk scoring dashboard integrated with existing hospital EHR.",
      city: "Istanbul",
      country: "Global",
      status: "active",
      interestCount: 4,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoClose: true,
    },
  });

  const hcPost2 = await prisma.post.create({
    data: {
      authorId: "demo-healthcare",
      title: "Drug Interaction Alert System for Emergency Dept",
      domain: "Telemedicine",
      description: "Emergency physicians frequently deal with multi-drug patients. Need a real-time NLP-based drug interaction checker integrated with our hospital system.",
      requiredExpertise: JSON.stringify(["NLP", "Python", "Healthcare APIs"]),
      projectStage: "prototype",
      commitmentLevel: "high",
      collaborationType: "co_founder",
      confidentialityLevel: "public",
      highLevelIdea: "Real-time drug interaction alerts reducing medication errors by 60%.",
      city: "Istanbul",
      country: "Global",
      status: "partner_found",
      interestCount: 7,
      expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      autoClose: true,
    },
  });

  // Extra posts from other users
  const extraPosts = [];
  const extraPostData = [
    { authorId: "user-eng-1", title: "Brain MRI Segmentation with ViT", domain: "Neurology", stage: "prototype", status: "active" },
    { authorId: "user-eng-2", title: "Wearable Biosensor for Seizure Detection", domain: "Neurology", stage: "pilot_testing", status: "active" },
    { authorId: "user-eng-3", title: "NLP Clinical Notes Summarizer", domain: "Telemedicine", stage: "concept_validation", status: "active" },
    { authorId: "user-doc-1", title: "Radiomics Pipeline for Tumor Staging", domain: "Oncology", stage: "idea", status: "active" },
    { authorId: "user-doc-2", title: "AR-assisted Neurological Examination", domain: "Neurology", stage: "concept_validation", status: "active" },
    { authorId: "user-doc-3", title: "Genomic Data Privacy-Preserving ML", domain: "Genomics", stage: "prototype", status: "active" },
    { authorId: "user-doc-4", title: "Exoskeleton Control via EMG Signals", domain: "Orthopedics", stage: "pilot_testing", status: "active" },
    { authorId: "user-eng-1", title: "Federated Learning for Hospital Networks", domain: "Medical Imaging", stage: "idea", status: "draft" },
    { authorId: "user-doc-1", title: "Digital Pathology Slide Analysis", domain: "Oncology", stage: "prototype", status: "active" },
    { authorId: "user-eng-3", title: "Voice-Based Patient Triage System", domain: "Telemedicine", stage: "concept_validation", status: "active" },
  ];

  for (const p of extraPostData) {
    const post = await prisma.post.create({
      data: {
        authorId: p.authorId,
        title: p.title,
        domain: p.domain,
        description: `Collaborative project in ${p.domain}. Looking for cross-disciplinary partner to advance this innovation.`,
        requiredExpertise: JSON.stringify(["Clinical Validation", "Machine Learning"]),
        projectStage: p.stage as any,
        commitmentLevel: "medium",
        collaborationType: "research_partner",
        confidentialityLevel: "public",
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
        country: "Global",
        status: p.status,
        interestCount: Math.floor(Math.random() * 8),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoClose: false,
      },
    });
    extraPosts.push(post);
  }

  console.log(`Created posts.`);

  // ─── Meeting Requests ──────────────────────────────────────────────────────
  // 1) INCOMING for demo-engineer: from user-doc-1 (pending)
  await prisma.meetingRequest.create({
    data: {
      postId: engPost2.id,
      requesterId: "user-doc-1",
      receiverId: "demo-engineer",
      message: "I have extensive ICU monitoring experience and would love to help define clinical alert thresholds for your wearable platform. I believe this can significantly reduce alarm fatigue.",
      proposedSlots: JSON.stringify([
        { id: "s-in1-a", date: "2026-05-15", startTime: "10:00", endTime: "11:00" },
        { id: "s-in1-b", date: "2026-05-16", startTime: "14:00", endTime: "15:00" },
        { id: "s-in1-c", date: "2026-05-17", startTime: "09:00", endTime: "10:00" },
      ]),
      status: "pending",
      ndaAccepted: true,
    },
  });

  // 2) INCOMING for demo-engineer: from user-doc-2 (pending)
  await prisma.meetingRequest.create({
    data: {
      postId: engPost3.id,
      requesterId: "user-doc-2",
      receiverId: "demo-engineer",
      message: "As a neurosurgeon I perform 50+ laparoscopic procedures yearly. I can provide exact use-case requirements and help with surgical workflow validation for your robot navigation system.",
      proposedSlots: JSON.stringify([
        { id: "s-in2-a", date: "2026-05-18", startTime: "11:00", endTime: "12:00" },
        { id: "s-in2-b", date: "2026-05-20", startTime: "15:00", endTime: "16:00" },
      ]),
      status: "pending",
      ndaAccepted: true,
    },
  });

  // 3) OUTGOING from demo-engineer (pending, sent to demo-healthcare)
  await prisma.meetingRequest.create({
    data: {
      postId: hcPost1.id,
      requesterId: "demo-engineer",
      receiverId: "demo-healthcare",
      message: "Your cardiac ICU decision support idea is exactly aligned with our ML expertise. We've built similar risk-scoring models and can deploy this within 3 months with your clinical guidance.",
      proposedSlots: JSON.stringify([
        { id: "s-out1-a", date: "2026-05-14", startTime: "10:00", endTime: "11:00" },
        { id: "s-out1-b", date: "2026-05-15", startTime: "14:00", endTime: "15:00" },
        { id: "s-out1-c", date: "2026-05-19", startTime: "16:00", endTime: "17:00" },
      ]),
      status: "pending",
      ndaAccepted: true,
    },
  });

  // 4) SCHEDULED for demo-engineer: confirmed meeting with demo-healthcare on engPost1
  await prisma.meetingRequest.create({
    data: {
      postId: engPost1.id,
      requesterId: "demo-healthcare",
      receiverId: "demo-engineer",
      message: "I have 12 years of cardiology experience and access to 50k+ anonymized ECG records. This collaboration could be transformative for early AF detection in Turkey.",
      proposedSlots: JSON.stringify([
        { id: "s-sched1-a", date: "2026-05-12", startTime: "09:00", endTime: "10:00" },
        { id: "s-sched1-b", date: "2026-05-13", startTime: "11:00", endTime: "12:00" },
      ]),
      selectedSlot: JSON.stringify({ id: "s-sched1-b", date: "2026-05-13", startTime: "11:00", endTime: "12:00" }),
      status: "scheduled",
      ndaAccepted: true,
      meetingLink: "https://meet.healthai.edu/ecg-ai-collab",
    },
  });

  // 5) COMPLETED past meeting for demo-engineer
  await prisma.meetingRequest.create({
    data: {
      postId: engPost2.id,
      requesterId: "user-doc-3",
      receiverId: "demo-engineer",
      message: "Interested in remote monitoring for genomics-linked cardiac conditions.",
      proposedSlots: JSON.stringify([
        { id: "s-comp1-a", date: "2026-04-28", startTime: "10:00", endTime: "11:00" },
      ]),
      selectedSlot: JSON.stringify({ id: "s-comp1-a", date: "2026-04-28", startTime: "10:00", endTime: "11:00" }),
      status: "completed",
      ndaAccepted: true,
      meetingLink: "https://meet.healthai.edu/iot-genomics",
    },
  });

  // 6) DECLINED past meeting for demo-engineer
  await prisma.meetingRequest.create({
    data: {
      postId: engPost3.id,
      requesterId: "user-doc-4",
      receiverId: "demo-engineer",
      message: "I do orthopedic surgeries and am curious about robotic assistance.",
      proposedSlots: JSON.stringify([
        { id: "s-decl1-a", date: "2026-04-20", startTime: "09:00", endTime: "10:00" },
      ]),
      status: "declined",
      ndaAccepted: true,
    },
  });

  // ── Meeting requests for demo-healthcare ───────────────────────────────────
  // 7) INCOMING for demo-healthcare: from user-eng-1 (pending)
  await prisma.meetingRequest.create({
    data: {
      postId: hcPost1.id,
      requesterId: "user-eng-1",
      receiverId: "demo-healthcare",
      message: "We've developed a Transformer-based patient deterioration model for ICUs with 92% sensitivity. Would love to validate it on your cardiac ICU dataset.",
      proposedSlots: JSON.stringify([
        { id: "s-hc-in1-a", date: "2026-05-16", startTime: "13:00", endTime: "14:00" },
        { id: "s-hc-in1-b", date: "2026-05-17", startTime: "10:00", endTime: "11:00" },
        { id: "s-hc-in1-c", date: "2026-05-21", startTime: "15:00", endTime: "16:00" },
      ]),
      status: "pending",
      ndaAccepted: true,
    },
  });

  // 8) INCOMING for demo-healthcare: from user-eng-3 (pending)
  await prisma.meetingRequest.create({
    data: {
      postId: hcPost1.id,
      requesterId: "user-eng-3",
      receiverId: "demo-healthcare",
      message: "Our NLP team has experience with clinical text mining. We can contribute the decision-support interface layer for your EHR integration.",
      proposedSlots: JSON.stringify([
        { id: "s-hc-in2-a", date: "2026-05-19", startTime: "09:00", endTime: "10:00" },
        { id: "s-hc-in2-b", date: "2026-05-22", startTime: "11:00", endTime: "12:00" },
      ]),
      status: "pending",
      ndaAccepted: true,
    },
  });

  // 9) OUTGOING from demo-healthcare (pending, sent to user-eng-2)
  await prisma.meetingRequest.create({
    data: {
      postId: extraPosts[1].id, // user-eng-2's seizure detection post
      requesterId: "demo-healthcare",
      receiverId: "user-eng-2",
      message: "I manage a neurology ward and we see ~30 seizure cases monthly. I can provide clinical expertise and patient monitoring protocols for your biosensor validation.",
      proposedSlots: JSON.stringify([
        { id: "s-hc-out1-a", date: "2026-05-15", startTime: "16:00", endTime: "17:00" },
        { id: "s-hc-out1-b", date: "2026-05-18", startTime: "10:00", endTime: "11:00" },
      ]),
      status: "pending",
      ndaAccepted: true,
    },
  });

  // 10) SCHEDULED for demo-healthcare (confirmed meeting on engPost1)
  // already created as #4 above (demo-healthcare requested engineer's ECG post)

  // 11) COMPLETED past for demo-healthcare
  await prisma.meetingRequest.create({
    data: {
      postId: hcPost2.id,
      requesterId: "user-eng-3",
      receiverId: "demo-healthcare",
      message: "We built drug interaction checkers for 2 hospitals — happy to adapt it for emergency dept.",
      proposedSlots: JSON.stringify([
        { id: "s-hc-comp1-a", date: "2026-04-25", startTime: "14:00", endTime: "15:00" },
      ]),
      selectedSlot: JSON.stringify({ id: "s-hc-comp1-a", date: "2026-04-25", startTime: "14:00", endTime: "15:00" }),
      status: "completed",
      ndaAccepted: true,
      meetingLink: "https://meet.healthai.edu/drug-alert-collab",
    },
  });

  // 12) CANCELLED past for demo-healthcare
  await prisma.meetingRequest.create({
    data: {
      postId: hcPost1.id,
      requesterId: "user-eng-2",
      receiverId: "demo-healthcare",
      message: "Interested in the ICU decision support project from a signal processing angle.",
      proposedSlots: JSON.stringify([
        { id: "s-hc-canc1-a", date: "2026-04-22", startTime: "09:00", endTime: "10:00" },
      ]),
      status: "cancelled",
      ndaAccepted: true,
    },
  });

  // ─── Notifications ────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: "demo-engineer",
        type: "meeting_request",
        message: "Dr. Elena Vasquez sent you a meeting request for your IoT Remote Monitoring post",
        linkTo: "/dashboard/meetings",
        read: false,
      },
      {
        userId: "demo-engineer",
        type: "meeting_request",
        message: "Dr. Mehmet Kaya requested a meeting for your Surgical Robot post",
        linkTo: "/dashboard/meetings",
        read: false,
      },
      {
        userId: "demo-engineer",
        type: "meeting_accepted",
        message: "Dr. Sarah Williams confirmed your ECG AI meeting for May 13 at 11:00",
        linkTo: "/dashboard/meetings",
        read: true,
      },
      {
        userId: "demo-healthcare",
        type: "meeting_request",
        message: "Marcus Hoffmann sent a meeting request for your Cardiac ICU post",
        linkTo: "/dashboard/meetings",
        read: false,
      },
      {
        userId: "demo-healthcare",
        type: "meeting_request",
        message: "Liam O'Brien requested a meeting for your Cardiac ICU post",
        linkTo: "/dashboard/meetings",
        read: false,
      },
    ],
  });

  console.log("Created meeting requests and notifications.");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
