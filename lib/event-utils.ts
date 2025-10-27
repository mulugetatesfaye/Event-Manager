// lib/event-utils.ts

import { EventWithRelations,RegistrationMetadata  } from '@/types'

/**
 * Calculate total tickets sold for an event
 * Handles both new ticketing system and legacy registrations
 */
export function calculateTotalTicketsSold(event: EventWithRelations): number {
  let total = 0

  // NEW SYSTEM: Count from ticket purchases
  if (event.registrations) {
    for (const registration of event.registrations) {
      if (registration.status !== 'CONFIRMED') continue

      if (registration.ticketPurchases && registration.ticketPurchases.length > 0) {
        // New ticketing system - sum ticket purchases
        total += registration.ticketPurchases.reduce(
          (sum, purchase) => sum + purchase.quantity,
          0
        )
      } else {
        // Legacy system - use metadata quantity or default to 1
        const metadata = registration.metadata as RegistrationMetadata | null
        total += metadata?.quantity || 1
      }
    }
  }

  return total
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
  if (event.capacity === 0) return 0
  return Math.min(100, (totalTicketsSold / event.capacity) * 100)
}

/**
 * Check if event is full
 */
export function isEventFull(event: EventWithRelations): boolean {
  return calculateAvailableSpots(event) <= 0
}

/**
 * Check if event uses new ticketing system
 */
export function usesTicketingSystem(event: EventWithRelations): boolean {
  return !!(event.ticketTypes && event.ticketTypes.length > 0)
}

/**
 * Get the cheapest ticket price for an event
 */
export function getCheapestTicketPrice(event: EventWithRelations): number {
  if (!usesTicketingSystem(event)) {
    return event.price
  }

  if (!event.ticketTypes || event.ticketTypes.length === 0) {
    return event.price
  }

  const now = new Date()
  let minPrice = Infinity

  for (const ticketType of event.ticketTypes) {
    if (ticketType.status !== 'ACTIVE') continue

    // Check for early bird pricing
    const isEarlyBird = ticketType.earlyBirdEndDate 
      ? new Date(ticketType.earlyBirdEndDate) > now
      : false

    const currentPrice = isEarlyBird && ticketType.earlyBirdPrice
      ? ticketType.earlyBirdPrice
      : ticketType.price

    minPrice = Math.min(minPrice, currentPrice)
  }

  return minPrice === Infinity ? event.price : minPrice
}

/**
 * Get the highest ticket price for an event
 */
export function getHighestTicketPrice(event: EventWithRelations): number {
  if (!usesTicketingSystem(event)) {
    return event.price
  }

  if (!event.ticketTypes || event.ticketTypes.length === 0) {
    return event.price
  }

  const now = new Date()
  let maxPrice = 0

  for (const ticketType of event.ticketTypes) {
    if (ticketType.status !== 'ACTIVE') continue

    // Check for early bird pricing
    const isEarlyBird = ticketType.earlyBirdEndDate 
      ? new Date(ticketType.earlyBirdEndDate) > now
      : false

    const currentPrice = isEarlyBird && ticketType.earlyBirdPrice
      ? ticketType.earlyBirdPrice
      : ticketType.price

    maxPrice = Math.max(maxPrice, currentPrice)
  }

  return maxPrice
}

/**
 * Get available ticket types for an event
 */
export function getAvailableTicketTypes(event: EventWithRelations) {
  if (!event.ticketTypes) return []

  const now = new Date()

  return event.ticketTypes
    .filter(tt => tt.status === 'ACTIVE')
    .map(ticketType => {
      const available = ticketType.quantity - (ticketType.quantitySold || 0)
      const isEarlyBird = ticketType.earlyBirdEndDate 
        ? new Date(ticketType.earlyBirdEndDate) > now
        : false

      return {
        ...ticketType,
        available,
        isSoldOut: available <= 0,
        isEarlyBird,
        currentPrice: isEarlyBird && ticketType.earlyBirdPrice
          ? ticketType.earlyBirdPrice
          : ticketType.price
      }
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Calculate total revenue for an event
 */
export function calculateEventRevenue(event: EventWithRelations): number {
  let revenue = 0

  if (!event.registrations) return 0

  for (const registration of event.registrations) {
    if (registration.status !== 'CONFIRMED') continue

    // Use finalAmount if available (includes discounts)
    if (registration.finalAmount !== undefined && registration.finalAmount !== null) {
      revenue += registration.finalAmount
    } else if (registration.totalAmount !== undefined && registration.totalAmount !== null) {
      revenue += registration.totalAmount
    } else {
      // Fallback to legacy calculation
      const metadata = registration.metadata as RegistrationMetadata | null
      const quantity = metadata?.quantity || 1
      revenue += event.price * quantity
    }
  }

  return revenue
}

/**
 * Get ticket type availability summary
 */
export function getTicketTypeSummary(event: EventWithRelations) {
  if (!usesTicketingSystem(event)) {
    const totalSold = calculateTotalTicketsSold(event)
    return {
      totalCapacity: event.capacity,
      totalSold,
      totalAvailable: event.capacity - totalSold,
      ticketTypes: [],
      usesTicketingSystem: false
    }
  }

  const ticketTypes = getAvailableTicketTypes(event)
  const totalCapacity = ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0)
  const totalSold = ticketTypes.reduce((sum, tt) => sum + (tt.quantitySold || 0), 0)

  return {
    totalCapacity,
    totalSold,
    totalAvailable: totalCapacity - totalSold,
    usesTicketingSystem: true,
    ticketTypes: ticketTypes.map(tt => ({
      id: tt.id,
      name: tt.name,
      description: tt.description,
      price: tt.currentPrice,
      regularPrice: tt.price,
      earlyBirdPrice: tt.earlyBirdPrice,
      isEarlyBird: tt.isEarlyBird,
      available: tt.available,
      sold: tt.quantitySold || 0,
      total: tt.quantity,
      isSoldOut: tt.isSoldOut,
      minQuantity: tt.minQuantity,
      maxQuantity: tt.maxQuantity,
      features: tt.features,
    }))
  }
}

/**
 * Check if event has early bird tickets available
 */
export function hasEarlyBirdTickets(event: EventWithRelations): boolean {
  if (!usesTicketingSystem(event) || !event.ticketTypes) {
    return false
  }

  const now = new Date()
  return event.ticketTypes.some(tt => {
    return tt.status === 'ACTIVE' && 
           tt.earlyBirdEndDate && 
           new Date(tt.earlyBirdEndDate) > now &&
           tt.earlyBirdPrice !== null &&
           tt.earlyBirdPrice < tt.price
  })
}

/**
 * Get event price range as a formatted string
 */
export function getEventPriceRange(event: EventWithRelations): string {
  if (!usesTicketingSystem(event)) {
    return event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`
  }

  const cheapest = getCheapestTicketPrice(event)
  const highest = getHighestTicketPrice(event)

  if (cheapest === 0 && highest === 0) {
    return 'Free'
  }

  if (cheapest === highest) {
    return `$${cheapest.toFixed(2)}`
  }

  return `$${cheapest.toFixed(2)} - $${highest.toFixed(2)}`
}

/**
 * Check if user can still register for event
 */
export function canRegisterForEvent(event: EventWithRelations): boolean {
  // Check if event has ended
  if (new Date(event.endDate) < new Date()) {
    return false
  }

  // Check if event is published
  if (event.status !== 'PUBLISHED') {
    return false
  }

  // Check if event is full
  if (isEventFull(event)) {
    return false
  }

  return true
}

/**
 * Get time until event starts
 */
export function getTimeUntilEvent(event: EventWithRelations): {
  days: number
  hours: number
  minutes: number
  isUpcoming: boolean
  isPast: boolean
} {
  const now = new Date()
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)

  const isPast = endDate < now
  const isUpcoming = startDate > now

  if (isPast || !isUpcoming) {
    return { days: 0, hours: 0, minutes: 0, isUpcoming: false, isPast }
  }

  const diff = startDate.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes, isUpcoming: true, isPast: false }
}

/**
 * Format event duration
 */
export function getEventDuration(event: EventWithRelations): string {
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const diff = end.getTime() - start.getTime()

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }

  return `${hours}h ${minutes}m`
}

/**
 * Get event status label
 */
export function getEventStatusLabel(event: EventWithRelations): {
  label: string
  color: 'green' | 'orange' | 'red' | 'gray' | 'blue'
} {
  const now = new Date()
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)

  // Event has ended
  if (endDate < now) {
    return { label: 'Ended', color: 'gray' }
  }

  // Event is ongoing
  if (startDate <= now && endDate >= now) {
    return { label: 'Ongoing', color: 'blue' }
  }

  // Event is full
  if (isEventFull(event)) {
    return { label: 'Sold Out', color: 'red' }
  }

  // Event is filling fast
  const fillPercentage = calculateFillPercentage(event)
  if (fillPercentage > 80) {
    return { label: 'Filling Fast', color: 'orange' }
  }

  // Event is upcoming
  return { label: 'Available', color: 'green' }
}