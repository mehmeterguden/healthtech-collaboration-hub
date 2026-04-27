import { PrismaClient } from "@prisma/client";
import { USERS, POSTS, INTERESTS, MEETINGS, LOGS, NOTIFICATIONS } from "../src/lib/mock-data";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Users
  for (const user of USERS) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        slug: user.slug,
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        institution: user.institution,
        city: user.city,
        country: user.country,
        expertise: JSON.stringify(user.expertise || []),
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        profileCompleteness: user.profileCompleteness,
        isActive: user.isActive,
        isEmailVerified: true,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        createdAt: new Date(user.createdAt),
      },
    });
  }

  // Seed Posts
  for (const post of POSTS) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        authorId: post.authorId,
        title: post.title,
        domain: post.domain,
        description: post.description,
        requiredExpertise: JSON.stringify(post.requiredExpertise || []),
        projectStage: post.projectStage,
        commitmentLevel: post.commitmentLevel,
        collaborationType: post.collaborationType,
        confidentialityLevel: post.confidentialityLevel,
        highLevelIdea: post.highLevelIdea || "",
        city: post.city,
        country: post.country,
        status: post.status,
        expiryDate: post.expiryDate ? new Date(post.expiryDate) : null,
        autoClose: post.autoClose,
        interestCount: post.interestCount,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      },
    });
  }

  // Seed Interests
  for (const interest of INTERESTS) {
    await prisma.interest.upsert({
      where: { id: interest.id },
      update: {},
      create: {
        id: interest.id,
        postId: interest.postId,
        userId: interest.userId,
        message: interest.message,
        createdAt: new Date(interest.createdAt),
      },
    });
  }

  // Seed Meetings
  for (const meeting of MEETINGS) {
    await prisma.meetingRequest.upsert({
      where: { id: meeting.id },
      update: {},
      create: {
        id: meeting.id,
        postId: meeting.postId,
        requesterId: meeting.requesterId,
        receiverId: meeting.receiverId,
        message: meeting.message,
        proposedSlots: JSON.stringify(meeting.proposedSlots || []),
        selectedSlot: meeting.selectedSlot ? JSON.stringify(meeting.selectedSlot) : null,
        status: meeting.status,
        ndaAccepted: meeting.ndaAccepted,
        meetingLink: meeting.meetingLink || null,
        createdAt: new Date(meeting.createdAt),
        updatedAt: new Date(meeting.updatedAt),
      },
    });
  }

  // Seed Notifications
  for (const notif of NOTIFICATIONS) {
    await prisma.notification.upsert({
      where: { id: notif.id },
      update: {},
      create: {
        id: notif.id,
        userId: "u1", // Mapping to first user for simplicity in mock
        type: notif.type,
        message: notif.message,
        read: notif.read,
        linkTo: notif.linkTo,
        createdAt: new Date(notif.createdAt),
      },
    });
  }

  // Seed Audit Logs
  for (const log of LOGS) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {},
      create: {
        id: log.id,
        userId: log.userId === "unknown" ? null : log.userId,
        userName: log.userName,
        userRole: log.userRole,
        actionType: log.actionType,
        targetEntity: log.targetEntity,
        targetId: log.targetId,
        resultStatus: log.resultStatus,
        ipAddress: log.ipAddress,
        timestamp: new Date(log.timestamp),
      },
    });
  }

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
