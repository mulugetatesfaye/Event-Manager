// app/api/admin/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { RegistrationMetadata } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const currentUser = await getOrCreateUser()

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')

    // Fetch all events (or limit for recent events)
    const events = await prisma.event.findMany({
      take: limit > 0 ? limit : undefined,
      orderBy: { createdAt: 'desc' },
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
        ticketTypes: {
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
          }
        }
      }
    })

    // Calculate tickets sold for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        // Count tickets from ticket purchases
        const ticketPurchasesCount = await prisma.ticketPurchase.aggregate({
          where: {
            registration: {
              eventId: event.id,
              status: 'CONFIRMED'
            }
          },
          _sum: { quantity: true }
        })

        // Count legacy registrations
        const legacyRegistrations = await prisma.registration.findMany({
          where: {
            eventId: event.id,
            status: 'CONFIRMED',
            ticketPurchases: { none: {} }
          },
          select: { metadata: true }
        })

        let legacyCount = 0
        for (const reg of legacyRegistrations) {
          const metadata = reg.metadata as RegistrationMetadata | null
          legacyCount += metadata?.quantity || 1
        }

        const totalTicketsSold = (ticketPurchasesCount._sum.quantity || 0) + legacyCount
        const availableSpots = Math.max(0, event.capacity - totalTicketsSold)

        // Calculate revenue
        const ticketRevenue = await prisma.ticketPurchase.aggregate({
          where: {
            registration: {
              eventId: event.id,
              status: 'CONFIRMED'
            }
          },
          _sum: { subtotal: true }
        })

        const legacyRevenue = legacyCount * event.price
        const totalRevenue = (ticketRevenue._sum.subtotal || 0) + legacyRevenue

        return {
          ...event,
          totalTicketsSold,
          availableSpots,
          totalRevenue,
          fillRate: event.capacity > 0 
            ? Math.round((totalTicketsSold / event.capacity) * 100)
            : 0
        }
      })
    )

    return NextResponse.json(eventsWithStats)
  } catch (error) {
    console.error('Error fetching admin events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}