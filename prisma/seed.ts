import { PrismaClient, Role } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create users
  const user1 = await prisma.user.upsert({
    where: { email: 'sofia.davis@example.com' },
    update: {},
    create: {
      name: 'Sofia Davis',
      email: 'sofia.davis@example.com',
      password: 'password123', // In a real app, use hashed passwords
      role: Role.RESEARCHER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@refauto.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@refauto.com',
      password: 'password123',
      role: Role.ADMIN,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'olivia.brown@example.com' },
    update: {},
    create: {
      name: 'Olivia Brown',
      email: 'olivia.brown@example.com',
      password: 'password123',
      role: Role.RESEARCHER,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'liam.garcia@example.com' },
    update: {},
    create: {
      name: 'Liam Garcia',
      email: 'liam.garcia@example.com',
      password: 'password123',
      role: Role.RESEARCHER,
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'noah.martinez@example.com' },
    update: {},
    create: {
      name: 'Noah Martinez',
      email: 'noah.martinez@example.com',
      password: 'password123',
      role: Role.RESEARCHER,
    },
  });

  console.log({ user1, user2, user3, user4, user5 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
