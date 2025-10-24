// hooks/use-event-registrations.ts (or add to your existing hooks file)
import { useQuery } from '@tanstack/react-query'
import { RegistrationWithRelations } from '@/types'

export function useEventRegistrations(eventId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async (): Promise<RegistrationWithRelations[]> => {
      if (!eventId) return []
      
      const response = await fetch(`/api/events/${eventId}/registrations`)
      if (!response.ok) {
        throw new Error('Failed to fetch event registrations')
      }
      return response.json()
    },
    enabled: options?.enabled ?? !!eventId,
  })
}