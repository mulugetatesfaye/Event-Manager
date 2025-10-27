// app/api/registrations/my/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getOrCreateUser()

    if (!user) {
      return NextResponse.json({ error: 'Failed to get user information' }, { status: 500 })
    }

    const registrations = await prisma.registration.findMany({
      where: { userId: user.id },
      include: {
        event: {
          include: {
            category: true,
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
        ticketPurchases: {
          include: {
            ticketType: true,
            promoCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Error fetching user registrations:', error)
    return NextResponse.json({ error: 'Failed to fetch your registrations' }, { status: 500 })
  }
}
