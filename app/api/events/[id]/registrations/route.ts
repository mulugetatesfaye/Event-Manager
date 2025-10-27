// app/api/events/[id]/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getOrCreateUser()

    // Check if user is organizer or admin
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.organizerId !== user?.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only organizers can view registrations' },
        { status: 403 }
      )
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          }
        },
        ticketPurchases: {
          include: {
            ticketType: {
              select: {
                name: true,
                price: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}