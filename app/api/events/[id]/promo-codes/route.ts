// app/api/events/[id]/promo-codes/route.ts
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

const createPromoCodeSchema = z.object({
  code: z.string().min(1).max(50),
  eventId: z.string(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'EARLY_BIRD']),
  discountValue: z.number().min(0),
  maxUses: z.number().nullable().optional(),
  maxUsesPerUser: z.number().min(1).default(1),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  minPurchaseAmount: z.number().nullable().optional(),
  isActive: z.boolean().default(true),
})

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

    const promoCodes = await prisma.promoCode.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { ticketPurchases: true }
        }
      }
    })

    return NextResponse.json(promoCodes)
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

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

    // Check if user is organizer or admin
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.organizerId !== user?.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only organizers can create promo codes' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createPromoCodeSchema.parse(body)

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: validatedData.code }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 400 }
      )
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: validatedData.code,
        eventId: validatedData.eventId,
        type: validatedData.type,
        discountValue: validatedData.discountValue,
        maxUses: validatedData.maxUses,
        maxUsesPerUser: validatedData.maxUsesPerUser,
        validFrom: validatedData.validFrom ? new Date(validatedData.validFrom) : null,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        minPurchaseAmount: validatedData.minPurchaseAmount,
        isActive: validatedData.isActive,
        applicableTicketTypes: [],
      }
    })

    return NextResponse.json(promoCode, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error },
        { status: 400 }
      )
    }

    console.error('Error creating promo code:', error)
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    )
  }
}