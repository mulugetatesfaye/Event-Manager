// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { getOrCreateUser } from '@/lib/get-or-create-user'

const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  location: z.string().min(1),
  venue: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  capacity: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
})

// Add this new function at the end of the file
export async function PUT(req: NextRequest) {
  console.log('🧪 CHECK-IN VIA PUT REQUEST')
  
  try {
    const body = await req.json()
    const { qrData, action } = body

    // Only handle check-in requests
    if (action !== 'check-in') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    console.log('📝 Received QR data:', qrData)

    if (!qrData) {
      return NextResponse.json(
        { error: 'QR code data is required' },
        { status: 400 }
      )
    }

    // Parse registration ID from URL
    let registrationId: string | null = null
    
    try {
      if (qrData.startsWith('http')) {
        const url = new URL(qrData)
        const pathParts = url.pathname.split('/')
        registrationId = pathParts[pathParts.length - 1]
        console.log('✅ Parsed registration ID:', registrationId)
      } else {
        const parsed = JSON.parse(qrData)
        registrationId = parsed.registrationId
      }
    } catch (e) {
      console.log('❌ Parse error:', e)
      return NextResponse.json(
        { error: 'Invalid QR format' },
        { status: 400 }
      )
    }

    if (!registrationId) {
      return NextResponse.json(
        { error: 'No registration ID found' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking up:', registrationId)

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
            imageUrl: true,
          },
        },
      },
    })

    if (!registration) {
      console.log('❌ Not found')
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found registration')

    if (registration.checkedIn) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        registration,
        checkedInAt: registration.checkedInAt,
        message: 'Already checked in'
      })
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: registration.userId,
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
          },
        },
      },
    })

    console.log('✅ Check-in complete!')

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      registration: updatedRegistration,
      message: 'Check-in successful'
    })

  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// GET /api/events - List all events
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const skip = (page - 1) * limit

    const where: Prisma.EventWhereInput = {
      status: 'PUBLISHED',
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
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
          // Include registrations with quantity to calculate total tickets sold
          registrations: {
            select: {
              id: true,
              quantity: true,
            },
          },
          _count: {
            select: { registrations: true },
          },
        },
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      prisma.event.count({ where }),
    ])

    // Calculate total tickets sold for each event
    const eventsWithTicketsSold = events.map(event => {
      const totalTicketsSold = event.registrations.reduce(
        (sum, reg) => sum + (reg.quantity || 1),
        0
      )
      
      // Log for debugging
      console.log(`Event: ${event.title}`)
      console.log(`Registrations:`, event.registrations)
      console.log(`Total tickets sold: ${totalTicketsSold}`)
      console.log(`Capacity: ${event.capacity}`)
      console.log(`Available spots: ${event.capacity - totalTicketsSold}`)
      
      // Remove the full registrations array to keep response light
      const { registrations, ...eventData } = event
      
      return {
        ...eventData,
        totalTicketsSold,
        availableSpots: Math.max(0, event.capacity - totalTicketsSold),
      }
    })

    return NextResponse.json({
      events: eventsWithTicketsSold,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/events - Create new event
export async function POST(req: NextRequest) {
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

    // Check if user can create events (ORGANIZER or ADMIN)
    if (user.role === 'ATTENDEE') {
      return NextResponse.json(
        { error: 'You need to be an organizer to create events. Please upgrade your account.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    console.log('Received event data:', body)
    
    const validatedData = createEventSchema.parse(body)
    console.log('Validated data:', validatedData)

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        location: validatedData.location,
        venue: validatedData.venue || null,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        capacity: validatedData.capacity,
        price: validatedData.price,
        imageUrl: validatedData.imageUrl || null,
        status: validatedData.status || 'DRAFT',
        categoryId: validatedData.categoryId || null,
        organizerId: user.id,
        creatorId: user.id,
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
        registrations: {
          select: {
            id: true,
            quantity: true,
          },
        },
      },
    })

    // Calculate total tickets sold for the newly created event
    const totalTicketsSold = event.registrations.reduce(
      (sum, reg) => sum + (reg.quantity || 1),
      0
    )

    // Remove registrations array and add calculated fields
    const { registrations, ...eventData } = event

    const eventResponse = {
      ...eventData,
      totalTicketsSold,
      availableSpots: Math.max(0, event.capacity - totalTicketsSold),
      _count: {
        registrations: registrations.length,
      },
    }

    console.log('Event created:', eventResponse)
    return NextResponse.json(eventResponse, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error)
      return NextResponse.json(
        { error: 'Invalid data', details: error },
        { status: 400 }
      )
    }

    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}