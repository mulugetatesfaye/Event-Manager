// hooks/use-events.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import { 
  EventWithRelations, 
  EventFormData, 
  RegistrationWithRelations,
  DashboardEvent,
  DashboardRegistration
} from '@/types'

// ============================================================================
// Types
// ============================================================================

interface EventsResponse {
  events: EventWithRelations[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface EventsParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if registration can be cancelled
 * Returns true if cancellation is allowed, false if within 24 hours of event start
 */
export function canCancelRegistration(eventStartDate: Date | string): boolean {
  const start = new Date(eventStartDate)
  const now = new Date()
  const hoursUntilEvent = (start.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntilEvent > 24
}

/**
 * Get hours remaining until cancellation deadline
 */
export function getHoursUntilCancellationDeadline(eventStartDate: Date | string): number {
  const start = new Date(eventStartDate)
  const now = new Date()
  const hoursUntilEvent = (start.getTime() - now.getTime()) / (1000 * 60 * 60)
  return Math.max(0, hoursUntilEvent)
}

/**
 * Get user-friendly cancellation policy message
 */
export function getCancellationPolicyMessage(eventStartDate: Date | string): string {
  const hoursRemaining = getHoursUntilCancellationDeadline(eventStartDate)
  
  if (hoursRemaining > 24) {
    return `You can cancel until 24 hours before the event`
  } else if (hoursRemaining > 0) {
    const hours = Math.floor(hoursRemaining)
    const minutes = Math.floor((hoursRemaining - hours) * 60)
    return `Cancellation not allowed (event starts in ${hours}h ${minutes}m)`
  } else {
    return 'Event has started - cancellation not allowed'
  }
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch paginated list of events
 */
export function useEvents(params?: EventsParams) {
  return useQuery<EventsResponse>({
    queryKey: ['events', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.search) searchParams.set('search', params.search)
      if (params?.category) searchParams.set('category', params.category)
      if (params?.status) searchParams.set('status', params.status)

      const response = await fetch(`/api/events?${searchParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch events')
      }
      return response.json()
    },
  })
}

/**
 * Fetch a single event by ID
 */
export function useEvent(id: string) {
  return useQuery<EventWithRelations>({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error('Event ID is required')
      
      const response = await fetch(`/api/events/${id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch event')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

/**
 * Fetch current user's organized events (for organizers)
 */
export function useMyEvents() {
  const { isSignedIn } = useAuth()
  
  return useQuery<DashboardEvent[]>({
    queryKey: ['my-events'],
    queryFn: async () => {
      const response = await fetch('/api/events/my-events')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch your events')
      }
      return response.json()
    },
    enabled: isSignedIn,
  })
}

/**
 * Fetch registrations for a specific event
 */
export function useEventRegistrations(eventId: string, options?: { enabled?: boolean }) {
  return useQuery<RegistrationWithRelations[]>({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      if (!eventId) return []
      
      const response = await fetch(`/api/events/${eventId}/registrations`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch event registrations')
      }
      return response.json()
    },
    enabled: options?.enabled ?? !!eventId,
  })
}

/**
 * Fetch current user's registrations (events they're attending)
 */
export function useMyRegistrations() {
  const { isSignedIn } = useAuth()
  
  return useQuery<DashboardRegistration[]>({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const response = await fetch('/api/registrations/my')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch your registrations')
      }
      return response.json()
    },
    enabled: isSignedIn,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<EventFormData>) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event')
      }
      return result
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      toast.success('Event created successfully')
      return data
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Update an existing event
 */
export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<EventFormData>) => {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update event')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      toast.success('Event updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete event')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      toast.success('Event deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Register for an event
 */
export function useRegisterForEvent(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data?: unknown) => {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to register for event')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] })
      toast.success('Successfully registered for the event')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Cancel event registration
 */
export function useCancelRegistration(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventStartDate?: Date | string) => {
      // Client-side validation before making the request
      if (eventStartDate && !canCancelRegistration(eventStartDate)) {
        throw new Error('Cannot cancel registration within 24 hours of event start')
      }

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel registration')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] })
      toast.success('Registration cancelled successfully')
    },
    onError: (error: Error) => {
      // Provide more user-friendly error messages
      const message = error.message.includes('within 24 hours')
        ? 'Cancellations are not allowed within 24 hours of the event start time'
        : error.message
      toast.error(message, {
        description: 'If you need assistance, please contact support',
      })
    },
  })
}

/**
 * Check in an attendee
 */
export function useCheckInAttendee(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (registrationId: string) => {
      const response = await fetch(`/api/events/${eventId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to check in attendee')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] })
      queryClient.invalidateQueries({ queryKey: ['check-in-data', eventId] })
      toast.success('Attendee checked in successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Undo check-in for an attendee
 */
export function useUndoCheckIn(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (registrationId: string) => {
      const response = await fetch(`/api/events/${eventId}/check-in`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to undo check-in')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] })
      queryClient.invalidateQueries({ queryKey: ['check-in-data', eventId] })
      toast.success('Check-in undone successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

/**
 * Bulk check-in multiple attendees
 */
export function useBulkCheckIn(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (registrationIds: string[]) => {
      const response = await fetch(`/api/events/${eventId}/check-in/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationIds }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to bulk check-in attendees')
      }
      return result
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] })
      queryClient.invalidateQueries({ queryKey: ['check-in-data', eventId] })
      toast.success(
        `Checked in ${data.summary?.successful || 0} of ${data.summary?.total || 0} attendees`
      )
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}