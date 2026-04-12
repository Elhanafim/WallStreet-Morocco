import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany()
    console.log('Successfully connected to DB and fetched users:', users.length)
  } catch (e) {
    console.error('Failed to connect to DB:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
