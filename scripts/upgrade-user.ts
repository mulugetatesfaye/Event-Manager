import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Please provide an email address')
    console.log('Usage: npx tsx scripts/upgrade-user.ts your@email.com')
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ORGANIZER' },
  })

  console.log('User upgraded to ORGANIZER:', user)
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