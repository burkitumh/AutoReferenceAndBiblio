import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Create Users
  await prisma.user.create({
    data: {
      name: 'Sofia Davis',
      email: 'sofia.davis@example.com',
      password: 'password123', // In a real app, this should be hashed
      role: Role.RESEARCHER,
    },
  })

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@refauto.com',
      password: 'password123',
      role: Role.ADMIN,
    },
  })

  await prisma.user.create({
    data: {
      name: 'Olivia Brown',
      email: 'olivia.brown@example.com',
      password: 'password123',
      role: Role.RESEARCHER,
    },
  })

  await prisma.user.create({
    data: {
      name: 'Liam Garcia',
      email: 'liam.garcia@example.com',
      password: 'password123',
      role: Role.RESEARCHER,
    },
  })
  
  await prisma.user.create({
    data: {
      name: 'Noah Martinez',
      email: 'noah.martinez@example.com',
      password: 'password123',
      role: Role.RESEARCHER,
    },
  })

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
