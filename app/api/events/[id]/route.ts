// app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/get-or-create-user'

const updateEventSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  location: z.string().min(1).optional(),
  venue: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  capacity: z.coerce.number().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/events/[id] - Get single event
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        registrations: {
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
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Calculate total tickets sold from all registrations
    const totalTicketsSold = event.registrations.reduce(
      (sum, reg) => sum + (reg.quantity || 1),
      0
    )

    // Add calculated fields to the response
    const eventWithCalculatedFields = {
      ...event,
      totalTicketsSold,
      availableSpots: Math.max(0, event.capacity - totalTicketsSold),
    }

    return NextResponse.json(eventWithCalculatedFields)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user owns the event or is admin
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to edit this event' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = updateEventSchema.parse(body)

    // Build update data object with only the fields that are being updated
    const updateData: {
      title?: string
      description?: string | null
      location?: string
      venue?: string | null
      startDate?: Date
      endDate?: Date
      capacity?: number
      price?: number
      imageUrl?: string | null
      status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
      categoryId?: string | null
    } = {}
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null
    if (validatedData.location !== undefined) updateData.location = validatedData.location
    if (validatedData.venue !== undefined) updateData.venue = validatedData.venue || null
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
    if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate)
    if (validatedData.capacity !== undefined) updateData.capacity = validatedData.capacity
    if (validatedData.price !== undefined) updateData.price = validatedData.price
    if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl || null
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId || null

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
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
        _count: {
          select: { registrations: true },
        },
      },
    })

    // Calculate total tickets sold
    const totalTicketsSold = updatedEvent.registrations.reduce(
      (sum, reg) => sum + (reg.quantity || 1),
      0
    )

    // Remove registrations array and add calculated fields
    const { registrations, ...eventData } = updatedEvent

    const eventResponse = {
      ...eventData,
      totalTicketsSold,
      availableSpots: Math.max(0, updatedEvent.capacity - totalTicketsSold),
    }

    return NextResponse.json(eventResponse)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error },
        { status: 400 }
      )
    }

    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this event' },
        { status: 403 }
      )
    }

    // Optional: Prevent deletion if there are registrations
    if (event._count.registrations > 0) {
      return NextResponse.json(
        { error: 'Cannot delete event with existing registrations. Cancel the event instead.' },
        { status: 400 }
      )
    }

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}