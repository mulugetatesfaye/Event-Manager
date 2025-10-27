// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { RegistrationMetadata } from '@/types'



// Alternative: Use nullish() which allows both null and undefined
const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().nullish(), // nullish = optional + nullable
  location: z.string().min(1),
  venue: z.string().nullish(),
  startDate: z.string(),
  endDate: z.string(),
  capacity: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  categoryId: z.string().nullish(),
  imageUrl: z.string().nullish(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  requiresSeating: z.boolean().optional(),
  allowGroupBooking: z.boolean().optional(),
  groupDiscountPercentage: z.number().min(0).max(100).nullish(), // nullish = optional + nullable
  groupMinQuantity: z.number().min(2).nullish(),
})

// Helper function to calculate total tickets sold for an event
async function calculateEventTicketsSold(eventId: string): Promise<number> {
  // Count tickets from ticket purchases (new system)
  const ticketPurchasesCount = await prisma.ticketPurchase.aggregate({
    where: {
      registration: {
        eventId: eventId,
        status: 'CONFIRMED' // Only count confirmed registrations
      }
    },
    _sum: { quantity: true }
  })

  // Count legacy registrations (old system without ticket purchases)
  const legacyRegistrations = await prisma.registration.findMany({
    where: {
      eventId: eventId,
      status: 'CONFIRMED',
      ticketPurchases: {
        none: {} // Registrations without ticket purchases
      }
    },
    select: {
      metadata: true
    }
  })

  // Sum up legacy quantities
  let legacyCount = 0
  for (const reg of legacyRegistrations) {
    const metadata = reg.metadata as RegistrationMetadata | null
    legacyCount += metadata?.quantity || 1
  }

  const newSystemCount = ticketPurchasesCount._sum.quantity || 0
  return newSystemCount + legacyCount
}

// PUT /api/events - Handle check-in via QR code
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
        ticketPurchases: {
          include: {
            ticketType: true
          }
        }
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
        ticketPurchases: {
          include: {
            ticketType: true
          }
        }
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
            }
          },
          _count: {
            select: { 
              registrations: true,
              ticketTypes: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      prisma.event.count({ where }),
    ])

    // Calculate total tickets sold for each event
    const eventsWithTicketsSold = await Promise.all(
      events.map(async (event) => {
        const totalTicketsSold = await calculateEventTicketsSold(event.id)
        
        return {
          ...event,
          totalTicketsSold,
          availableSpots: Math.max(0, event.capacity - totalTicketsSold),
        }
      })
    )

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
    
    // Validate the data
    const validatedData = createEventSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Create the event
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description ?? null,
        location: validatedData.location,
        venue: validatedData.venue ?? null,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        capacity: validatedData.capacity,
        price: validatedData.price,
        imageUrl: validatedData.imageUrl ?? null,
        status: validatedData.status || 'DRAFT',
        categoryId: validatedData.categoryId ?? null,
        organizerId: user.id,
        creatorId: user.id,
        requiresSeating: validatedData.requiresSeating ?? false,
        allowGroupBooking: validatedData.allowGroupBooking ?? true,
        groupDiscountPercentage: validatedData.groupDiscountPercentage ?? null,
        groupMinQuantity: validatedData.groupMinQuantity ?? 5,
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
        ticketTypes: true,
        _count: {
          select: {
            registrations: true,
            ticketTypes: true,
          }
        }
      },
    })

    // Calculate total tickets sold for the newly created event (should be 0)
    const totalTicketsSold = await calculateEventTicketsSold(event.id)

    const eventResponse = {
      ...event,
      totalTicketsSold,
      availableSpots: Math.max(0, event.capacity - totalTicketsSold),
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