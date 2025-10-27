// components/events/event-card.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  TrendingUp,
  Ticket,
  Clock,
  Building2,
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isFuture, isToday, isTomorrow } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { EventWithRelations } from '@/types'
import { cn } from '@/lib/utils'
import { 
  calculateTotalTicketsSold, 
  calculateAvailableSpots, 
  calculateFillPercentage,
  usesTicketingSystem,
  getCheapestTicketPrice
} from '@/lib/event-utils'

interface EventCardProps {
  event: EventWithRelations
}

// Ethiopian Birr formatter
const formatETB = (amount: number): string => {
  return `${amount.toFixed(2)} ETB`
}

export function EventCard({ event }: EventCardProps) {
  // Use utility functions for calculations
  const totalTicketsSold = event.totalTicketsSold ?? calculateTotalTicketsSold(event)
  const availableSpots = event.availableSpots ?? calculateAvailableSpots(event)
  const fillPercentage = calculateFillPercentage(event)
  const hasTicketTypes = usesTicketingSystem(event)
  const displayPrice = hasTicketTypes ? getCheapestTicketPrice(event) : event.price

  const isFull = availableSpots <= 0
  const isUpcoming = isFuture(new Date(event.startDate))
  const isPastEvent = isPast(new Date(event.endDate))
  const isEventToday = isToday(new Date(event.startDate))
  const isEventTomorrow = isTomorrow(new Date(event.startDate))
  
  // Get status badge
  const getStatusBadge = () => {
    if (isPastEvent) return { label: 'Ended', variant: 'secondary' as const }
    if (isFull) return { label: 'Sold Out', variant: 'destructive' as const }
    if (isEventToday) return { label: 'Today', variant: 'default' as const }
    if (isEventTomorrow) return { label: 'Tomorrow', variant: 'default' as const }
    if (fillPercentage > 80) return { label: 'Filling Fast', variant: 'default' as const }
    if (isUpcoming) return { label: 'Available', variant: 'outline' as const }
    return null
  }

  const statusBadge = getStatusBadge()

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <div className="overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 h-full flex flex-col bg-white hover:border-gray-300">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 shrink-0">
          {event.imageUrl ? (
            <>
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">No image</p>
              </div>
            </div>
          )}
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            {/* Category Badge */}
            {event.category && (
              <Badge
                className="text-xs font-medium"
                style={{
                  backgroundColor: event.category.color || '#6b7280',
                  color: 'white'
                }}
              >
                {event.category.name}
              </Badge>
            )}

            {/* Status Badge */}
            {statusBadge && (
              <Badge variant={statusBadge.variant} className="text-xs font-medium bg-white text-gray-900">
                {statusBadge.label}
              </Badge>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-3 right-3">
            {displayPrice > 0 ? (
              <div className="bg-white rounded-lg px-3 py-2 shadow-md">
                <span className="font-bold text-sm text-gray-900">
                  {hasTicketTypes && <span className="text-xs font-normal text-gray-600">From </span>}
                  {formatETB(displayPrice)}
                </span>
              </div>
            ) : (
              <div className="bg-green-600 text-white rounded-lg px-3 py-2 shadow-md font-bold text-sm">
                FREE
              </div>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex flex-col grow p-5 space-y-4">
          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-3 grow">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {format(new Date(event.startDate), 'MMM dd, yyyy')}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(event.startDate), 'h:mm a')}
                  </p>
                  {isUpcoming && !isEventToday && !isEventTomorrow && (
                    <span className="text-xs text-blue-600 font-medium">
                      {formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {event.location}
                </p>
                {event.venue && (
                  <p className="text-xs text-gray-600 line-clamp-1 flex items-center gap-1 mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {event.venue}
                  </p>
                )}
              </div>
            </div>

            {/* Ticket Types or Capacity */}
            {hasTicketTypes && event.ticketTypes && event.ticketTypes.length > 0 ? (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {event.ticketTypes.length} Ticket Type{event.ticketTypes.length === 1 ? '' : 's'}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                    {event.ticketTypes.slice(0, 2).map(tt => tt.name).join(', ')}
                    {event.ticketTypes.length > 2 && ` +${event.ticketTypes.length - 2}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {totalTicketsSold} / {event.capacity}
                    </p>
                    <span className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-full",
                      isFull ? "bg-red-100 text-red-700" : 
                      fillPercentage > 80 ? "bg-orange-100 text-orange-700" : 
                      "bg-green-100 text-green-700"
                    )}>
                      {isFull ? 'Sold Out' : `${availableSpots} Left`}
                    </span>
                  </div>
                  <Progress 
                    value={fillPercentage} 
                    className={cn(
                      "h-2",
                      fillPercentage >= 100 ? "[&>div]:bg-red-500" : 
                      fillPercentage > 80 ? "[&>div]:bg-orange-500" : 
                      "[&>div]:bg-green-500"
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Trending Indicator */}
          {fillPercentage > 60 && !isFull && !isPastEvent && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-orange-900">
                {Math.round(fillPercentage)}% Booked - Filling Fast
              </span>
            </div>
          )}

          {/* Organizer */}
          {event.organizer && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8 border-2 border-gray-200 shrink-0">
                  <AvatarImage 
                    src={event.organizer.imageUrl || undefined} 
                    alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                    {event.organizer.firstName?.[0]}{event.organizer.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Hosted by</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}