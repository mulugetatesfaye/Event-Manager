// app/api/events/my-events/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Get or create user in database
    const user = await getOrCreateUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to get user information' },
        { status: 500 }
      )
    }

    // Fetch events organized by this user
    const events = await prisma.event.findMany({
      where: {
        organizerId: user.id,
      },
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
        ticketTypes: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            quantitySold: true,
            earlyBirdPrice: true,
            earlyBirdEndDate: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            ticketTypes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching user events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch your events' },
      { status: 500 }
    )
  }
}
