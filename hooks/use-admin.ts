// hooks/use-admin.ts
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'

interface AdminStats {
  // Overview
  totalEvents: number
  totalUsers: number
  totalRevenue: number
  totalTicketsSold: number
  avgFillRate: number

  // User breakdown
  totalOrganizers: number
  totalAdmins: number
  totalAttendees: number

  // Event status
  publishedEvents: number
  draftEvents: number
  completedEvents: number
  cancelledEvents: number

  // Time-based
  upcomingEvents: number
  pastEvents: number
  ongoingEvents: number

  // Additional metrics
  totalCapacity: number
  recentRegistrations: number
  totalCheckIns: number
  eventsWithTicketing: number
  totalCategories: number
  checkInRate: number
  avgRevenuePerEvent: number
}

export interface AdminEvent {
  id: string
  title: string
  status: string
  startDate: Date
  endDate: Date
  capacity: number
  price: number
  totalTicketsSold: number
  availableSpots: number
  totalRevenue: number
  fillRate: number
  organizer: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    imageUrl: string | null
  }
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
  _count: {
    registrations: number
    ticketTypes: number
  }
}

/**
 * Fetch system-wide statistics (Admin only)
 */
export function useAdminStats() {
  const { isSignedIn } = useAuth()

  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch admin statistics')
      }
      return response.json()
    },
    enabled: isSignedIn,
    retry: false,
  })
}

/**
 * Fetch all events in the system (Admin only)
 */
export function useAdminEvents(limit?: number) {
  const { isSignedIn } = useAuth()

  return useQuery<AdminEvent[]>({
    queryKey: ['admin-events', limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (limit) params.set('limit', limit.toString())
      
      const response = await fetch(`/api/admin/events?${params}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch events')
      }
      return response.json()
    },
    enabled: isSignedIn,
    retry: false,
  })
}