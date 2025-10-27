// app/api/events/[id]/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const createTicketTypeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  quantity: z.number().min(1),
  earlyBirdPrice: z.number().min(0).optional(),
  earlyBirdEndDate: z.string().optional(),
  minQuantity: z.number().min(1).default(1),
  maxQuantity: z.number().min(1).default(10),
  features: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'SOLD_OUT', 'INACTIVE']).default('ACTIVE'),
  sortOrder: z.number().default(0),
})

// GET /api/events/[id]/tickets - Get all ticket types for an event
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId: id },
      include: {
        _count: {
          select: { ticketPurchases: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // Calculate availability for each ticket type
    const ticketTypesWithAvailability = await Promise.all(
      ticketTypes.map(async (ticketType) => {
        const soldCount = await prisma.ticketPurchase.aggregate({
          where: { ticketTypeId: ticketType.id },
          _sum: { quantity: true }
        })

        const totalSold = soldCount._sum.quantity || 0
        const available = ticketType.quantity - totalSold
        const isEarlyBird = ticketType.earlyBirdEndDate 
          ? new Date(ticketType.earlyBirdEndDate) > new Date()
          : false

        return {
          ...ticketType,
          quantitySold: totalSold,
          available,
          isSoldOut: available <= 0,
          isEarlyBird,
          currentPrice: isEarlyBird && ticketType.earlyBirdPrice 
            ? ticketType.earlyBirdPrice 
            : ticketType.price
        }
      })
    )

    return NextResponse.json(ticketTypesWithAvailability)
  } catch (error) {
    console.error('Error fetching ticket types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket types' },
      { status: 500 }
    )
  }
}

// POST /api/events/[id]/tickets - Create ticket type (organizers only)
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getOrCreateUser()

    // Check if event exists and user is organizer
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.organizerId !== user?.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only the event organizer can create ticket types' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createTicketTypeSchema.parse(body)

    const ticketType = await prisma.ticketType.create({
      data: {
        eventId: id,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        quantity: validatedData.quantity,
        earlyBirdPrice: validatedData.earlyBirdPrice,
        earlyBirdEndDate: validatedData.earlyBirdEndDate 
          ? new Date(validatedData.earlyBirdEndDate) 
          : null,
        minQuantity: validatedData.minQuantity,
        maxQuantity: validatedData.maxQuantity,
        features: validatedData.features || [],
        status: validatedData.status,
        sortOrder: validatedData.sortOrder,
      }
    })

    return NextResponse.json(ticketType, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error },
        { status: 400 }
      )
    }

    console.error('Error creating ticket type:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket type' },
      { status: 500 }
    )
  }
}