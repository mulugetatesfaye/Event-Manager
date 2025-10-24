// lib/event-utils.ts

import { EventWithRelations } from '@/types'

/**
 * Calculate total tickets sold for an event
 * Sums up all quantities from registrations
 */
export function calculateTotalTicketsSold(event: EventWithRelations): number {
  if (event.registrations && event.registrations.length > 0) {
    // Sum up all quantities from registrations
    return event.registrations.reduce((sum, reg) => sum + (reg.quantity || 1), 0)
  }
  // Fallback to registration count (less accurate if quantities > 1)
  return event._count?.registrations || 0
}

/**
 * Calculate available spots for an event
 */
export function calculateAvailableSpots(event: EventWithRelations): number {
  const totalTicketsSold = calculateTotalTicketsSold(event)
  return Math.max(0, event.capacity - totalTicketsSold)
}

/**
 * Calculate fill percentage for an event
 */
export function calculateFillPercentage(event: EventWithRelations): number {
  const totalTicketsSold = calculateTotalTicketsSold(event)
  return (totalTicketsSold / event.capacity) * 100
}

/**
 * Check if event is full
 */
export function isEventFull(event: EventWithRelations): boolean {
  return calculateAvailableSpots(event) <= 0
}