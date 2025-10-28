// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'

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

    // Get all events with ticket data
    const allEvents = await prisma.event.findMany({
      include: {
        ticketTypes: {
          select: {
            quantitySold: true,
            price: true,
          }
        },
        registrations: {
          where: { status: 'CONFIRMED' },
          include: {
            ticketPurchases: {
              select: {
                quantity: true,
                unitPrice: true,
                subtotal: true,
              }
            }
          }
        },
        _count: {
          select: {
            registrations: true,
          }
        }
      }
    })

    // Calculate system-wide statistics
    let totalRevenue = 0
    let totalTicketsSold = 0
    let totalCapacity = 0

    allEvents.forEach(event => {
      // Add capacity
      totalCapacity += event.capacity

      // Calculate tickets sold from ticket purchases
      event.registrations.forEach(registration => {
        if (registration.ticketPurchases.length > 0) {
          registration.ticketPurchases.forEach(purchase => {
            totalTicketsSold += purchase.quantity
            totalRevenue += purchase.subtotal
          })
        } else {
          // Legacy registration without ticket purchases
          totalTicketsSold += 1
          totalRevenue += event.price
        }
      })
    })

    // Get user counts
    const totalUsers = await prisma.user.count()
    const totalOrganizers = await prisma.user.count({
      where: { role: 'ORGANIZER' }
    })
    const totalAdmins = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    // Event status counts
    const publishedEvents = allEvents.filter(e => e.status === 'PUBLISHED').length
    const draftEvents = allEvents.filter(e => e.status === 'DRAFT').length
    const completedEvents = allEvents.filter(e => e.status === 'COMPLETED').length
    const cancelledEvents = allEvents.filter(e => e.status === 'CANCELLED').length

    // Time-based event counts
    const now = new Date()
    const upcomingEvents = allEvents.filter(e => new Date(e.startDate) > now).length
    const pastEvents = allEvents.filter(e => new Date(e.endDate) < now).length
    const ongoingEvents = allEvents.filter(e => 
      new Date(e.startDate) <= now && new Date(e.endDate) >= now
    ).length

    // Calculate average fill rate
    const avgFillRate = totalCapacity > 0 
      ? Math.round((totalTicketsSold / totalCapacity) * 100)
      : 0

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentRegistrations = await prisma.registration.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: 'CONFIRMED'
      }
    })

    // Get total check-ins
    const totalCheckIns = await prisma.registration.count({
      where: { checkedIn: true }
    })

    // Events with ticketing system
    const eventsWithTicketing = allEvents.filter(e => 
      e.ticketTypes && e.ticketTypes.length > 0
    ).length

    // Get categories count
    const totalCategories = await prisma.category.count()

    return NextResponse.json({
      // Overview stats
      totalEvents: allEvents.length,
      totalUsers,
      totalRevenue,
      totalTicketsSold,
      avgFillRate,

      // User breakdown
      totalOrganizers,
      totalAdmins,
      totalAttendees: totalUsers - totalOrganizers - totalAdmins,

      // Event status breakdown
      publishedEvents,
      draftEvents,
      completedEvents,
      cancelledEvents,

      // Time-based events
      upcomingEvents,
      pastEvents,
      ongoingEvents,

      // Additional metrics
      totalCapacity,
      recentRegistrations,
      totalCheckIns,
      eventsWithTicketing,
      totalCategories,

      // Calculated metrics
      checkInRate: totalTicketsSold > 0 
        ? Math.round((totalCheckIns / totalTicketsSold) * 100)
        : 0,
      avgRevenuePerEvent: allEvents.length > 0
        ? totalRevenue / allEvents.length
        : 0,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}