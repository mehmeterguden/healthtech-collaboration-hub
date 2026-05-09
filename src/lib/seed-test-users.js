const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const testEmails = ["testengineer@healthai.edu", "testdoctor@healthai.edu"];

  // 1. Delete existing test users (cascading deletes will handle related data)
  console.log("Cleaning up existing test accounts...");
  await prisma.user.deleteMany({
    where: {
      email: { in: testEmails }
    }
  });

  const users = [
    {
      slug: "test-engineer",
      email: "testengineer@healthai.edu",
      password: password,
      firstName: "Test",
      lastName: "Engineer",
      role: "engineer",
      institution: "Tech Institute",
      city: "Berlin",
      country: "Germany",
      isEmailVerified: true,
      profileViews: 0,
    },
    {
      slug: "test-doctor",
      email: "testdoctor@healthai.edu",
      password: password,
      firstName: "Test",
      lastName: "Doctor",
      role: "healthcare",
      institution: "City Hospital",
      city: "Paris",
      country: "France",
      isEmailVerified: true,
      profileViews: 0,
    },
  ];

  // 2. Recreate accounts
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    console.log(`User ${user.email} recreated fresh.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
