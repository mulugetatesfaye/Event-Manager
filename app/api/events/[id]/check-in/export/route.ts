// app/api/events/[id]/check-in/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Helper function to calculate total tickets for a registration
function calculateRegistrationTickets(registration: {
  ticketPurchases?: Array<{ quantity: number }>
}) {
  if (!registration.ticketPurchases || registration.ticketPurchases.length === 0) {
    return 1 // Default to 1 for simple registrations
  }
  return registration.ticketPurchases.reduce((sum, tp) => sum + tp.quantity, 0)
}

// GET /api/events/[id]/check-in - Get check-in data for event
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
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get event and check permissions
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        capacity: true,
        startDate: true,
        endDate: true,
        organizerId: true,
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to access check-in data' },
        { status: 403 }
      )
    }

    // Get all registrations with ticket purchases
    const registrations = await prisma.registration.findMany({
      where: {
        eventId,
        status: 'CONFIRMED',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        ticketPurchases: {
          select: {
            quantity: true,
            ticketType: {
              select: {
                name: true,
              }
            }
          }
        },
      },
      orderBy: [
        { checkedIn: 'desc' },
        { checkedInAt: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Calculate statistics
    const totalRegistrations = registrations.length
    const totalTickets = registrations.reduce((sum, reg) => {
      return sum + calculateRegistrationTickets(reg)
    }, 0)
    
    const checkedInRegistrations = registrations.filter(r => r.checkedIn)
    const checkedInCount = checkedInRegistrations.length
    const checkedInTickets = checkedInRegistrations.reduce((sum, reg) => {
      return sum + calculateRegistrationTickets(reg)
    }, 0)
    
    const notCheckedInCount = totalRegistrations - checkedInCount
    const notCheckedInTickets = totalTickets - checkedInTickets
    const checkInRate = totalRegistrations > 0 
      ? Math.round((checkedInCount / totalRegistrations) * 100) 
      : 0
    const ticketCheckInRate = totalTickets > 0 
      ? Math.round((checkedInTickets / totalTickets) * 100) 
      : 0

    // Generate timeline data (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const checkInsByHour = await prisma.registration.groupBy({
      by: ['checkedInAt'],
      where: {
        eventId,
        checkedIn: true,
        checkedInAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: true,
    })

    // Create timeline buckets
    const timeline = Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      count: 0,
    }))

    checkInsByHour.forEach((item) => {
      if (item.checkedInAt) {
        const hour = new Date(item.checkedInAt).getHours()
        timeline[hour].count += item._count
      }
    })

    // Get recent check-ins (last 10)
    const recentCheckIns = await prisma.registration.findMany({
      where: {
        eventId,
        checkedIn: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        ticketPurchases: {
          select: {
            quantity: true,
          }
        }
      },
      orderBy: {
        checkedInAt: 'desc',
      },
      take: 10,
    })

    return NextResponse.json({
      event,
      statistics: {
        totalRegistrations,
        totalTickets,
        checkedInCount,
        checkedInTickets,
        notCheckedInCount,
        notCheckedInTickets,
        checkInRate,
        ticketCheckInRate,
      },
      timeline,
      recentCheckIns: recentCheckIns.map(reg => {
        const metadata = reg.metadata as Record<string, unknown> | null
        return {
          id: reg.id,
          user: reg.user,
          checkedInAt: reg.checkedInAt,
          checkedInBy: reg.checkedInBy,
          quantity: calculateRegistrationTickets(reg),
          notes: metadata?.checkInNotes || null,
        }
      }),
      registrations: registrations.map(reg => {
        const metadata = reg.metadata as Record<string, unknown> | null
        return {
          id: reg.id,
          user: reg.user,
          status: reg.status,
          quantity: calculateRegistrationTickets(reg),
          ticketTypes: reg.ticketPurchases?.map(tp => tp.ticketType.name).join(', ') || null,
          checkedIn: reg.checkedIn,
          checkedInAt: reg.checkedInAt,
          checkedInBy: reg.checkedInBy,
          checkInNotes: metadata?.checkInNotes || null,
          ticketNumber: reg.ticketNumber,
          createdAt: reg.createdAt,
        }
      }),
    })
  } catch (error) {
    console.error('Check-in data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch check-in data' },
      { status: 500 }
    )
  }
}

// POST /api/events/[id]/check-in - Check in a user
export async function POST(
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
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { registrationId, notes } = body

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    // Get event and check permissions
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to check in attendees' },
        { status: 403 }
      )
    }

    // Get registration
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        ticketPurchases: {
          select: {
            quantity: true,
          }
        }
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    if (registration.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Registration does not belong to this event' },
        { status: 400 }
      )
    }

    if (registration.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Only confirmed registrations can be checked in' },
        { status: 400 }
      )
    }

    // Check if already checked in
    if (registration.checkedIn) {
      return NextResponse.json(
        {
          success: true,
          alreadyCheckedIn: true,
          registration,
          message: 'Attendee was already checked in',
          checkedInAt: registration.checkedInAt,
        },
        { status: 200 }
      )
    }

    // Update check-in metadata
    const currentMetadata = (registration.metadata as Record<string, unknown>) || {}
    const checkInHistory = Array.isArray(currentMetadata.checkInHistory) 
      ? currentMetadata.checkInHistory 
      : []

    const updatedMetadata = {
      ...currentMetadata,
      checkInNotes: notes || currentMetadata.checkInNotes || null,
      checkInHistory: [
        ...checkInHistory,
        {
          action: 'CHECK_IN',
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          notes: notes || null,
        },
      ],
    }

    // Perform check-in
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: user.id,
        metadata: updatedMetadata,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        ticketPurchases: {
          select: {
            quantity: true,
          }
        }
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CHECK_IN',
        userId: user.id,
        eventId: event.id,
        metadata: {
          registrationId: registration.id,
          attendeeName: `${registration.user.firstName} ${registration.user.lastName}`,
          attendeeEmail: registration.user.email,
          quantity: calculateRegistrationTickets(registration),
          notes: notes || null,
        },
      },
    })

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Check-in successful',
      checkedInAt: updatedRegistration.checkedInAt,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to check in attendee' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id]/check-in - Undo check-in
export async function DELETE(
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
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { registrationId, reason } = body

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    // Get event and check permissions
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to undo check-ins' },
        { status: 403 }
      )
    }

    // Get registration
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        ticketPurchases: {
          select: {
            quantity: true,
          }
        }
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    if (!registration.checkedIn) {
      return NextResponse.json(
        { error: 'Registration is not checked in' },
        { status: 400 }
      )
    }

    // Update metadata with undo history
    const currentMetadata = (registration.metadata as Record<string, unknown>) || {}
    const checkInHistory = Array.isArray(currentMetadata.checkInHistory) 
      ? currentMetadata.checkInHistory 
      : []

    const updatedMetadata = {
      ...currentMetadata,
      undoReason: reason || null,
      checkInHistory: [
        ...checkInHistory,
        {
          action: 'CHECK_IN_UNDO',
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          reason: reason || null,
        },
      ],
    }

    // Undo check-in
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
        metadata: updatedMetadata,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        ticketPurchases: {
          select: {
            quantity: true,
          }
        }
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CHECK_IN_UNDO',
        userId: user.id,
        eventId: event.id,
        metadata: {
          registrationId: registration.id,
          attendeeName: `${registration.user.firstName} ${registration.user.lastName}`,
          attendeeEmail: registration.user.email,
          quantity: calculateRegistrationTickets(registration),
          reason: reason || null,
        },
      },
    })

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Check-in undone successfully',
    })
  } catch (error) {
    console.error('Undo check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to undo check-in' },
      { status: 500 }
    )
  }
}