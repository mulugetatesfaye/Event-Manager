// app/api/check-in/stats/[eventId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'

interface RouteParams {
  params: Promise<{
    eventId: string
  }>
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth()
    const { eventId } = await params
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getOrCreateUser()

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (event.organizerId !== user?.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const [totalRegistrations, checkedInCount] = await Promise.all([
      prisma.registration.count({
        where: { eventId },
      }),
      prisma.registration.count({
        where: {
          eventId,
          checkedIn: true,
        },
      }),
    ])

    return NextResponse.json({
      totalRegistrations,
      checkedInCount,
      notCheckedInCount: totalRegistrations - checkedInCount,
      checkInRate: totalRegistrations > 0 
        ? Math.round((checkedInCount / totalRegistrations) * 100) 
        : 0,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}