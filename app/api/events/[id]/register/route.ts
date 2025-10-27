// app/api/events/[id]/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { generateQRData } from '@/lib/qr-code'
import { RegistrationMetadata } from '@/types'
import { PromoCode } from '@prisma/client'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

interface TicketSelection {
  ticketTypeId: string
  quantity: number
}

interface RegistrationRequestBody {
  // Ticket selections (new ticketing system)
  ticketSelections?: TicketSelection[]
  
  // Legacy support (old system)
  quantity?: number
  
  // Promo code
  promoCode?: string
  
  // User info
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  organization?: string
  dietaryRequirements?: string
  specialRequirements?: string
  marketingEmails?: boolean
  termsAccepted?: boolean
}

// Helper function to validate and apply promo code
async function validateAndApplyPromoCode(
  promoCodeStr: string,
  eventId: string,
  userId: string,
  subtotal: number,
  ticketSelections: TicketSelection[]
): Promise<{ promoCode: PromoCode | null; discount: number; error?: string }> {
  const promoCode = await prisma.promoCode.findUnique({
    where: { code: promoCodeStr.toUpperCase() }
  })

  if (!promoCode) {
    return { promoCode: null, discount: 0, error: 'Invalid promo code' }
  }

  // Check if active
  if (!promoCode.isActive) {
    return { promoCode: null, discount: 0, error: 'Promo code is inactive' }
  }

  // Check event restriction
  if (promoCode.eventId && promoCode.eventId !== eventId) {
    return { promoCode: null, discount: 0, error: 'Promo code not valid for this event' }
  }

  // Check validity dates
  const now = new Date()
  if (promoCode.validFrom && new Date(promoCode.validFrom) > now) {
    return { promoCode: null, discount: 0, error: 'Promo code not yet valid' }
  }
  if (promoCode.validUntil && new Date(promoCode.validUntil) < now) {
    return { promoCode: null, discount: 0, error: 'Promo code has expired' }
  }

  // Check max uses
  if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
    return { promoCode: null, discount: 0, error: 'Promo code has reached maximum uses' }
  }

  // Check uses per user
  const userUsageCount = await prisma.ticketPurchase.count({
    where: {
      promoCodeId: promoCode.id,
      registration: {
        userId: userId
      }
    }
  })

  if (userUsageCount >= promoCode.maxUsesPerUser) {
    return { promoCode: null, discount: 0, error: 'You have already used this promo code' }
  }

  // Check minimum purchase amount
  if (promoCode.minPurchaseAmount && subtotal < promoCode.minPurchaseAmount) {
    return { 
      promoCode: null, 
      discount: 0, 
      error: `Minimum purchase of $${promoCode.minPurchaseAmount} required` 
    }
  }

  // Check applicable ticket types
  if (promoCode.applicableTicketTypes.length > 0) {
    const selectedTicketTypeIds = ticketSelections.map(ts => ts.ticketTypeId)
    const hasApplicableTicket = selectedTicketTypeIds.some(id => 
      promoCode.applicableTicketTypes.includes(id)
    )
    
    if (!hasApplicableTicket) {
      return { 
        promoCode: null, 
        discount: 0, 
        error: 'Promo code not applicable to selected tickets' 
      }
    }
  }

  // Calculate discount
  let discount = 0
  if (promoCode.type === 'PERCENTAGE') {
    discount = (subtotal * promoCode.discountValue) / 100
  } else if (promoCode.type === 'FIXED_AMOUNT') {
    discount = Math.min(promoCode.discountValue, subtotal)
  }

  return { promoCode, discount }
}

// POST /api/events/[id]/register - Register for event
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId } = await params
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

  const body: RegistrationRequestBody = await req.json()
  // Debug: log incoming body payload when ticketSelections missing to diagnose client issues
  // (Remove or lower verbosity in production)
  console.debug('Registration request body:', JSON.stringify(body))

    // Get event with ticket types
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: {
          where: { status: 'ACTIVE' }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'This event is not available for registration' },
        { status: 400 }
      )
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
          eventId: eventId,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 400 }
      )
    }

    // Determine if using new ticketing system or legacy
    const useTicketingSystem = event.ticketTypes.length > 0

    let ticketPurchases: TicketSelection[] = []
    let subtotal = 0

    if (useTicketingSystem) {
      // NEW TICKETING SYSTEM
      // Normalize and filter incoming selections to remove invalid entries
      const incomingSelections = Array.isArray(body.ticketSelections) ? body.ticketSelections : []
      const filteredSelections = incomingSelections.filter(s => s && s.ticketTypeId && s.quantity && s.quantity > 0)

      if (filteredSelections.length === 0) {
        return NextResponse.json(
          { error: 'Please select at least one ticket type' },
          { status: 400 }
        )
      }

      ticketPurchases = filteredSelections

      // Validate ticket selections
      for (const selection of ticketPurchases) {
        const ticketType = event.ticketTypes.find(tt => tt.id === selection.ticketTypeId)
        
        if (!ticketType) {
          return NextResponse.json(
            { error: `Invalid ticket type: ${selection.ticketTypeId}` },
            { status: 400 }
          )
        }

        if (selection.quantity < ticketType.minQuantity) {
          return NextResponse.json(
            { error: `Minimum ${ticketType.minQuantity} tickets required for ${ticketType.name}` },
            { status: 400 }
          )
        }

        if (selection.quantity > ticketType.maxQuantity) {
          return NextResponse.json(
            { error: `Maximum ${ticketType.maxQuantity} tickets allowed for ${ticketType.name}` },
            { status: 400 }
          )
        }

        // Check availability
        const soldCount = await prisma.ticketPurchase.aggregate({
          where: { ticketTypeId: ticketType.id },
          _sum: { quantity: true }
        })
        const totalSold = soldCount._sum.quantity || 0
        const available = ticketType.quantity - totalSold

        if (selection.quantity > available) {
          return NextResponse.json(
            { error: `Only ${available} tickets available for ${ticketType.name}` },
            { status: 400 }
          )
        }

        // Calculate price (early bird or regular)
        const isEarlyBird = ticketType.earlyBirdEndDate 
          ? new Date(ticketType.earlyBirdEndDate) > new Date()
          : false
        
        const unitPrice = isEarlyBird && ticketType.earlyBirdPrice 
          ? ticketType.earlyBirdPrice 
          : ticketType.price

        subtotal += unitPrice * selection.quantity
      }
    } else {
      // LEGACY SYSTEM (backward compatibility)
      const quantity = body.quantity || 1
      
      // For backward compatibility with old registrations without ticket purchases
      const legacyRegistrations = await prisma.registration.findMany({
        where: { 
          eventId,
          ticketPurchases: {
            none: {}
          }
        },
        select: {
          id: true,
          metadata: true
        }
      })

      // Count legacy registrations (assuming 1 ticket each if no quantity in metadata)
      let legacyCount = 0
      for (const reg of legacyRegistrations) {
        const metadata = reg.metadata as RegistrationMetadata | null
        legacyCount += metadata?.quantity || 1
      }

      const ticketPurchasesCount = await prisma.ticketPurchase.aggregate({
        where: {
          registration: {
            eventId: eventId
          }
        },
        _sum: { quantity: true }
      })

      const totalTicketsSold = legacyCount + (ticketPurchasesCount._sum.quantity || 0)
      const remainingCapacity = event.capacity - totalTicketsSold

      if (quantity > remainingCapacity) {
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

      subtotal = event.price * quantity
    }

    // Apply promo code if provided
    let promoCodeDiscount = 0
    let promoCodeId: string | undefined
    let promoCodeUsed: string | undefined

    if (body.promoCode) {
      const promoResult = await validateAndApplyPromoCode(
        body.promoCode,
        eventId,
        user.id,
        subtotal,
        ticketPurchases
      )

      if (promoResult.error) {
        return NextResponse.json(
          { error: promoResult.error },
          { status: 400 }
        )
      }

      if (promoResult.promoCode) {
        promoCodeDiscount = promoResult.discount
        promoCodeId = promoResult.promoCode.id
        promoCodeUsed = promoResult.promoCode.code
      }
    }

    const finalAmount = Math.max(0, subtotal - promoCodeDiscount)

    // Store metadata
    const metadata = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      organization: body.organization,
      dietaryRequirements: body.dietaryRequirements,
      specialRequirements: body.specialRequirements,
      marketingEmails: body.marketingEmails,
      termsAccepted: body.termsAccepted,
      registeredAt: new Date().toISOString(),
      quantity: useTicketingSystem ? undefined : (body.quantity || 1)
    } as const

    // Create registration with ticket purchases in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create registration
      const registration = await tx.registration.create({
        data: {
          userId: user.id,
          eventId: eventId,
          status: 'CONFIRMED',
          totalAmount: subtotal,
          finalAmount: finalAmount,
          metadata: metadata,
          paymentStatus: finalAmount > 0 ? 'PENDING' : 'COMPLETED',
          promoCodeUsed: promoCodeUsed,
        },
      })

      if (useTicketingSystem) {
        // Create ticket purchases for new system
        for (const selection of ticketPurchases) {
          const ticketType = event.ticketTypes.find(tt => tt.id === selection.ticketTypeId)!
          
          const isEarlyBird = ticketType.earlyBirdEndDate 
            ? new Date(ticketType.earlyBirdEndDate) > new Date()
            : false
          
          const unitPrice = isEarlyBird && ticketType.earlyBirdPrice 
            ? ticketType.earlyBirdPrice 
            : ticketType.price

          // Generate individual ticket numbers
          const ticketNumbers: string[] = []
          for (let i = 0; i < selection.quantity; i++) {
            ticketNumbers.push(`${registration.ticketNumber}-${ticketType.name.substring(0, 3).toUpperCase()}-${i + 1}`)
          }

          const purchaseSubtotal = unitPrice * selection.quantity
          
          // Calculate discount for this purchase if promo code applies
          let purchaseDiscount = 0
          if (promoCodeId && promoCodeDiscount > 0) {
            // Proportionally distribute discount
            purchaseDiscount = (purchaseSubtotal / subtotal) * promoCodeDiscount
          }

          await tx.ticketPurchase.create({
            data: {
              registrationId: registration.id,
              ticketTypeId: selection.ticketTypeId,
              quantity: selection.quantity,
              unitPrice: unitPrice,
              subtotal: purchaseSubtotal,
              discount: purchaseDiscount,
              promoCodeId: promoCodeId,
              ticketNumbers: ticketNumbers,
            }
          })

          // Update ticket type sold count
          await tx.ticketType.update({
            where: { id: selection.ticketTypeId },
            data: {
              quantitySold: {
                increment: selection.quantity
              }
            }
          })
        }
      }

      // Update promo code usage count
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: {
            usedCount: {
              increment: 1
            }
          }
        })
      }

      return registration
    })

    // Generate QR code
    const totalQuantity = useTicketingSystem
      ? ticketPurchases.reduce((sum, tp) => sum + tp.quantity, 0)
      : body.quantity || 1

    const qrData = generateQRData({
      registrationId: result.id,
      eventId: eventId,
      userId: user.id,
      ticketNumber: result.ticketNumber || result.id,
      quantity: totalQuantity,
    })

    // Update registration with QR code
    const updatedRegistration = await prisma.registration.update({
      where: { id: result.id },
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
        ticketPurchases: {
          include: {
            ticketType: true,
            promoCode: true,
          }
        }
      },
    })

    return NextResponse.json(
      {
        registration: updatedRegistration,
        message: `Successfully registered for the event`,
        summary: {
          subtotal,
          discount: promoCodeDiscount,
          total: finalAmount,
          ticketCount: totalQuantity,
        }
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

// GET - Fetch user registrations
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
        ticketPurchases: {
          include: {
            ticketType: true
          }
        }
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

    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: id,
        },
      },
      include: {
        ticketPurchases: true
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'You are not registered for this event' },
        { status: 404 }
      )
    }

    const eventStartDate = new Date(event.startDate)
    const now = new Date()
    const hoursUntilEvent = (eventStartDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilEvent < 24 && hoursUntilEvent > 0) {
      return NextResponse.json(
        { error: 'Cannot cancel registration within 24 hours of event start' },
        { status: 400 }
      )
    }

    // Delete in transaction to update ticket counts
    await prisma.$transaction(async (tx) => {
      // Update ticket type sold counts
      for (const purchase of registration.ticketPurchases) {
        await tx.ticketType.update({
          where: { id: purchase.ticketTypeId },
          data: {
            quantitySold: {
              decrement: purchase.quantity
            }
          }
        })
      }

      // Delete registration (cascades to ticket purchases)
      await tx.registration.delete({
        where: {
          id: registration.id,
        },
      })
    })

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