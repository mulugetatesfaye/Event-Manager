// app/api/events/[id]/check-in/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { Prisma } from '@prisma/client'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Define metadata type
interface RegistrationMetadata {
  checkInNotes?: string
  undoReason?: string
  checkInHistory?: Array<{
    action: string
    timestamp: string
    userId: string
    userName?: string
    notes?: string
    reason?: string
  }>
  [key: string]: unknown
}

// GET /api/events/[id]/check-in - Get check-in statistics and history
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

    // Check if user is organizer or admin
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        organizerId: true,
        capacity: true,
        startDate: true,
        endDate: true,
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
        { error: 'You do not have permission to view check-in data' },
        { status: 403 }
      )
    }

    // Get all registrations with check-in data
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
        }
      },
      orderBy: {
        checkedInAt: 'desc'
      }
    })

    // Calculate statistics
    const totalRegistrations = registrations.length
    const totalTickets = registrations.reduce((sum, reg) => sum + (reg.quantity || 1), 0)
    const checkedInRegistrations = registrations.filter(r => r.checkedIn)
    const checkedInCount = checkedInRegistrations.length
    const checkedInTickets = checkedInRegistrations.reduce((sum, reg) => sum + (reg.quantity || 1), 0)
    
    // Group check-ins by hour for timeline
    const checkInTimeline = checkedInRegistrations.reduce((acc, reg) => {
      if (reg.checkedInAt) {
        const hour = new Date(reg.checkedInAt).toISOString().slice(0, 13) + ':00:00'
        acc[hour] = (acc[hour] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Get recent check-ins (last 10)
    const recentCheckIns = checkedInRegistrations
      .slice(0, 10)
      .map(reg => {
        const metadata = (reg.metadata || {}) as RegistrationMetadata
        return {
          id: reg.id,
          user: reg.user,
          checkedInAt: reg.checkedInAt,
          checkedInBy: reg.checkedInBy,
          quantity: reg.quantity,
          notes: metadata.checkInNotes || null
        }
      })

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        capacity: event.capacity,
        startDate: event.startDate,
        endDate: event.endDate,
      },
      statistics: {
        totalRegistrations,
        totalTickets,
        checkedInCount,
        checkedInTickets,
        notCheckedInCount: totalRegistrations - checkedInCount,
        notCheckedInTickets: totalTickets - checkedInTickets,
        checkInRate: totalRegistrations > 0 
          ? Math.round((checkedInCount / totalRegistrations) * 100) 
          : 0,
        ticketCheckInRate: totalTickets > 0
          ? Math.round((checkedInTickets / totalTickets) * 100)
          : 0,
      },
      timeline: Object.entries(checkInTimeline).map(([time, count]) => ({
        time,
        count
      })).sort((a, b) => a.time.localeCompare(b.time)),
      recentCheckIns,
      registrations: registrations.map(reg => {
        const metadata = (reg.metadata || {}) as RegistrationMetadata
        return {
          id: reg.id,
          user: reg.user,
          status: reg.status,
          quantity: reg.quantity,
          checkedIn: reg.checkedIn,
          checkedInAt: reg.checkedInAt,
          checkedInBy: reg.checkedInBy,
          checkInNotes: metadata.checkInNotes || null,
          ticketNumber: reg.ticketNumber,
          createdAt: reg.createdAt,
        }
      })
    })
  } catch (error) {
    console.error('Error fetching check-in data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch check-in data' },
      { status: 500 }
    )
  }
}

// POST /api/events/[id]/check-in - Perform check-in
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
    const { 
      registrationId, 
      qrData, 
      notes,
      forceCheckIn = false 
    } = body

    // Parse registration ID from QR data if provided
    let targetRegistrationId = registrationId
    
    if (!targetRegistrationId && qrData) {
      try {
        if (qrData.startsWith('http')) {
          const url = new URL(qrData)
          const pathParts = url.pathname.split('/')
          targetRegistrationId = pathParts[pathParts.length - 1]
        } else {
          const parsed = JSON.parse(qrData)
          targetRegistrationId = parsed.registrationId
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid QR code format' },
          { status: 400 }
        )
      }
    }

    if (!targetRegistrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    // Get registration with event details
    const registration = await prisma.registration.findUnique({
      where: { id: targetRegistrationId },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Verify this registration is for the correct event
    if (registration.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Registration is not for this event' },
        { status: 400 }
      )
    }

    // Check permissions (organizer or admin can check-in)
    if (registration.event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to check-in attendees' },
        { status: 403 }
      )
    }

    // Check if already checked in
    if (registration.checkedIn && !forceCheckIn) {
      const history = await getCheckInHistory(registration.id)
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        registration: {
          ...registration,
          checkInHistory: history
        },
        message: `Already checked in at ${registration.checkedInAt}`
      })
    }

    // Prepare metadata with check-in notes
    const existingMetadata = (registration.metadata || {}) as RegistrationMetadata
    const updatedMetadata: RegistrationMetadata = {
      ...existingMetadata,
      checkInNotes: notes || existingMetadata.checkInNotes,
      checkInHistory: [
        ...(existingMetadata.checkInHistory || []),
        {
          action: 'CHECK_IN',
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          notes
        }
      ]
    }

    // Perform check-in
    const updatedRegistration = await prisma.registration.update({
      where: { id: targetRegistrationId },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: user.id,
        metadata: updatedMetadata as Prisma.InputJsonValue,
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      registration: updatedRegistration,
      message: 'Check-in successful'
    })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id]/check-in - Undo check-in
export async function PUT(
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

    // Get registration with event details
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (registration.event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to undo check-ins' },
        { status: 403 }
      )
    }

    if (!registration.checkedIn) {
      return NextResponse.json(
        { error: 'Registration is not checked in' },
        { status: 400 }
      )
    }

    // Update metadata with undo information
    const existingMetadata = (registration.metadata || {}) as RegistrationMetadata
    const updatedMetadata: RegistrationMetadata = {
      ...existingMetadata,
      undoReason: reason,
      checkInHistory: [
        ...(existingMetadata.checkInHistory || []),
        {
          action: 'CHECK_IN_UNDO',
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          reason
        }
      ]
    }

    // Undo check-in
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
        metadata: updatedMetadata as Prisma.InputJsonValue,
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Check-in undone successfully'
    })

  } catch (error) {
    console.error('Undo check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to undo check-in' },
      { status: 500 }
    )
  }
}

// Helper function to get check-in history from metadata
async function getCheckInHistory(registrationId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: {
      metadata: true,
      checkedInAt: true,
      checkedInBy: true,
      checkedIn: true,
    }
  })
  
  if (!registration) return []
  
  const metadata = (registration.metadata || {}) as RegistrationMetadata
  const history = metadata.checkInHistory || []
  
  // Add current check-in to history if checked in
  if (registration.checkedIn && registration.checkedInAt) {
    return [
      {
        action: 'CURRENT_CHECK_IN',
        timestamp: registration.checkedInAt.toISOString(),
        userId: registration.checkedInBy || '',
      },
      ...history
    ]
  }
  
  return history
}