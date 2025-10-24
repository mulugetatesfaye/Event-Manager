// app/api/events/[id]/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { generateQRData } from '@/lib/qr-code'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Define the registration request body type
interface RegistrationRequestBody {
  quantity?: number
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  organization?: string
  dietaryRequirements?: string
  specialRequirements?: string
  ticketType?: string
  marketingEmails?: boolean
  termsAccepted?: boolean
}

// POST /api/events/[id]/register - Register for event
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
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

    // Parse registration data with proper typing
    let registrationData: RegistrationRequestBody = { quantity: 1 }
    try {
      const body = await req.json()
      registrationData = { ...registrationData, ...body }
    } catch {
      // If no body, continue with defaults
    }

    const quantity = registrationData.quantity || 1

    // Check if event exists and get current registration count
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          select: {
            quantity: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if event is published
    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'This event is not available for registration' },
        { status: 400 }
      )
    }

    // Calculate total tickets sold (sum of all quantities)
    const totalTicketsSold = event.registrations.reduce(
      (sum, reg) => sum + (reg.quantity || 1), 
      0
    )

    // Check if enough capacity for requested quantity
    const remainingCapacity = event.capacity - totalTicketsSold
    if (remainingCapacity < quantity) {
      if (remainingCapacity <= 0) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: `Only ${remainingCapacity} ticket(s) remaining` },
          { status: 400 }
        )
      }
    }

    // Check if event has already passed
    if (new Date(event.endDate) < new Date()) {
      return NextResponse.json(
        { error: 'This event has already ended' },
        { status: 400 }
      )
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: id,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 400 }
      )
    }

    // Calculate total amount based on quantity
    const totalAmount = event.price * quantity

    // Store additional metadata
    const metadata = {
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      phone: registrationData.phone,
      organization: registrationData.organization,
      dietaryRequirements: registrationData.dietaryRequirements,
      specialRequirements: registrationData.specialRequirements,
      marketingEmails: registrationData.marketingEmails,
      termsAccepted: registrationData.termsAccepted,
      registeredAt: new Date().toISOString(),
    }

    // Create registration with quantity
    const registration = await prisma.registration.create({
      data: {
        userId: user.id,
        eventId: id,
        status: 'CONFIRMED',
        quantity: quantity,
        totalAmount: totalAmount,
        metadata: metadata,
        paymentStatus: event.price > 0 ? 'PENDING' : 'COMPLETED',
      },
    })

    // Generate QR code data
    const qrData = generateQRData({
      registrationId: registration.id,
      eventId: id,
      userId: user.id,
      ticketNumber: registration.ticketNumber || registration.id,
      quantity: quantity,
    })

    // Update registration with QR code
    const updatedRegistration = await prisma.registration.update({
      where: { id: registration.id },
      data: { qrCode: qrData },
      include: {
        event: {
          include: {
            category: true,
          },
        },
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

    // TODO: Send confirmation email here
    // await sendRegistrationConfirmationEmail(user.email, event, registrationData)

    return NextResponse.json(
      {
        registration: updatedRegistration,
        message: `Successfully registered ${quantity} ticket(s) for the event`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
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

    const registrations = await prisma.registration.findMany({
      where: {
        userId: user.id,
      },
      include: {
        event: {
          include: {
            category: true,
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                imageUrl: true,
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
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

// DELETE /api/events/[id]/register - Cancel registration
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

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Find the registration
    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: id,
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'You are not registered for this event' },
        { status: 404 }
      )
    }

    // Check if event has already started (optional - you can remove this if you want to allow cancellation anytime)
    const eventStartDate = new Date(event.startDate)
    const now = new Date()
    const hoursUntilEvent = (eventStartDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Allow cancellation if event is more than 24 hours away (you can adjust this)
    if (hoursUntilEvent < 24 && hoursUntilEvent > 0) {
      return NextResponse.json(
        { error: 'Cannot cancel registration within 24 hours of event start' },
        { status: 400 }
      )
    }

    // Delete the registration
    await prisma.registration.delete({
      where: {
        id: registration.id,
      },
    })

    // TODO: Send cancellation email here
    // await sendCancellationEmail(user.email, event)

    return NextResponse.json({
      message: 'Registration cancelled successfully',
    })
  } catch (error) {
    console.error('Cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel registration' },
      { status: 500 }
    )
  }
}