import { PrismaClient, UserRole, EventStatus } from '@prisma/client'
import { addDays, addHours } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech conferences, workshops, and meetups',
        color: '#3b82f6',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
        description: 'Business networking and professional events',
        color: '#10b981',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'arts-culture' },
      update: {},
      create: {
        name: 'Arts & Culture',
        slug: 'arts-culture',
        description: 'Art exhibitions, cultural events, and performances',
        color: '#8b5cf6',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports-fitness' },
      update: {},
      create: {
        name: 'Sports & Fitness',
        slug: 'sports-fitness',
        description: 'Sports events, fitness classes, and outdoor activities',
        color: '#f59e0b',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'education' },
      update: {},
      create: {
        name: 'Education',
        slug: 'education',
        description: 'Workshops, courses, and educational seminars',
        color: '#06b6d4',
      },
    }),
  ])

  console.log('Categories created:', categories.length)

  // Create demo users (you'll need to add real Clerk IDs for this to work properly)
  // For now, this is just a template
  console.log('Seeding completed!')
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