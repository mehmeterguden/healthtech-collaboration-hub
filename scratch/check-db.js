const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const postCount = await prisma.post.count();
  const activePosts = await prisma.post.count({ where: { status: 'active' } });
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  
  console.log('Total Posts:', postCount);
  console.log('Active Posts:', activePosts);
  console.log('Users:', users);
}

main();
