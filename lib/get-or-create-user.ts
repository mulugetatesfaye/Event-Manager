import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { UserRole } from '@prisma/client'

export async function getOrCreateUser() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    return null
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })

  // If user doesn't exist, create them
  if (!user) {
    const email = clerkUser.emailAddresses[0]?.emailAddress

    if (!email) {
      throw new Error('No email found for user')
    }

    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        imageUrl: clerkUser.imageUrl || null,
        role: UserRole.ATTENDEE,
      },
    })
  }

  return user
}