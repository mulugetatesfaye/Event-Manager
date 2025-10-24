// app/api/events/[id]/check-in/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'

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

// GET /api/events/[id]/check-in/export - Export check-in data
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

    const searchParams = req.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'

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
        { error: 'You do not have permission to export data' },
        { status: 403 }
      )
    }

    // Get all registrations
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: [
        { checkedIn: 'desc' },
        { checkedInAt: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Registration ID',
        'Ticket Number',
        'First Name',
        'Last Name',
        'Email',
        'Quantity',
        'Status',
        'Checked In',
        'Check-in Time',
        'Registration Date',
        'Notes'
      ]

      const rows = registrations.map(reg => {
        const metadata = (reg.metadata || {}) as RegistrationMetadata
        return [
          reg.id,
          reg.ticketNumber || '',
          reg.user.firstName || '',
          reg.user.lastName || '',
          reg.user.email,
          reg.quantity || 1,
          reg.status,
          reg.checkedIn ? 'Yes' : 'No',
          reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString() : '',
          new Date(reg.createdAt).toLocaleString(),
          metadata.checkInNotes || ''
        ]
      })

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="event-${eventId}-checkins-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      // Return JSON format
      return NextResponse.json({
        event: {
          id: event.id,
          title: event.title,
          date: event.startDate,
        },
        exportDate: new Date().toISOString(),
        registrations: registrations.map(reg => {
          const metadata = (reg.metadata || {}) as RegistrationMetadata
          return {
            id: reg.id,
            ticketNumber: reg.ticketNumber,
            attendee: {
              firstName: reg.user.firstName,
              lastName: reg.user.lastName,
              email: reg.user.email,
            },
            quantity: reg.quantity,
            status: reg.status,
            checkedIn: reg.checkedIn,
            checkedInAt: reg.checkedInAt,
            checkInNotes: metadata.checkInNotes || null,
            registeredAt: reg.createdAt,
          }
        })
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use csv or json' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}