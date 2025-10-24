// components/events/event-card.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { EventWithRelations } from '@/types'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface EventCardProps {
  event: EventWithRelations
}

export function EventCard({ event }: EventCardProps) {
  // Debug logging - remove after fixing
  useEffect(() => {
    console.log('=== EventCard Debug ===')
    console.log('Event title:', event.title)
    console.log('Event capacity:', event.capacity)
    console.log('totalTicketsSold from API:', event.totalTicketsSold)
    console.log('availableSpots from API:', event.availableSpots)
    console.log('_count.registrations:', event._count?.registrations)
    console.log('registrations array:', event.registrations)
  }, [event])

  // Calculate tickets sold - prioritize API-calculated values
  const totalTicketsSold = (() => {
    // First, try to use server-calculated value
    if (typeof event.totalTicketsSold === 'number') {
      console.log('Using totalTicketsSold from API:', event.totalTicketsSold)
      return event.totalTicketsSold
    }
    
    // Second, calculate from registrations array if available
    if (event.registrations && Array.isArray(event.registrations) && event.registrations.length > 0) {
      const calculated = event.registrations.reduce((sum, reg) => {
        const qty = reg.quantity || 1
        console.log(`Registration ${reg.id}: quantity = ${qty}`)
        return sum + qty
      }, 0)
      console.log('Calculated from registrations array:', calculated)
      return calculated
    }
    
    // Fallback to registration count (less accurate)
    const fallback = event._count?.registrations || 0
    console.log('Fallback to _count:', fallback)
    return fallback
  })()

  // Calculate available spots
  const availableSpots = (() => {
    // First, try to use server-calculated value
    if (typeof event.availableSpots === 'number') {
      console.log('Using availableSpots from API:', event.availableSpots)
      return event.availableSpots
    }
    
    // Otherwise calculate it
    const calculated = Math.max(0, event.capacity - totalTicketsSold)
    console.log('Calculated availableSpots:', calculated)
    return calculated
  })()

  const fillPercentage = (totalTicketsSold / event.capacity) * 100
  const isFull = availableSpots <= 0
  const isUpcoming = isFuture(new Date(event.startDate))
  const isPastEvent = isPast(new Date(event.endDate))
  
  console.log('Final values:', { totalTicketsSold, availableSpots, fillPercentage })
  console.log('======================')
  
  // Get status badge
  const getStatusBadge = () => {
    if (isPastEvent) return { label: 'Ended', color: 'bg-gray-500' }
    if (isFull) return { label: 'Full', color: 'bg-red-500' }
    if (fillPercentage > 80) return { label: 'Filling', color: 'bg-orange-500' }
    if (isUpcoming) return { label: 'Open', color: 'bg-green-500' }
    return null
  }

  const statusBadge = getStatusBadge()

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <div className="overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 hover:border-transparent h-full flex flex-col bg-white relative">
        {/* Subtle texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none z-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
            backgroundSize: '1rem 1rem'
          }}
        />

        {/* Image Section - Covers Top Completely */}
        <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10 flex-shrink-0">
          {event.imageUrl ? (
            <>
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CalendarDays className="w-10 h-10 text-primary/20" />
            </div>
          )}
          
          {/* Category Badge */}
          {event.category && (
            <Badge
              className="absolute top-2 left-2 text-[10px] h-5 shadow-md border-white/20 backdrop-blur-sm"
              style={{
                backgroundColor: event.category.color || undefined,
              }}
            >
              {event.category.name}
            </Badge>
          )}

          {/* Status Badge */}
          {statusBadge && (
            <Badge
              className={cn(
                "absolute top-2 right-2 text-[10px] h-5 shadow-md text-white border-0",
                statusBadge.color
              )}
            >
              {statusBadge.label}
            </Badge>
          )}

          {/* Price Tag */}
          <div className="absolute bottom-2 right-2">
            {event.price > 0 ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-md flex items-center gap-0.5">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="font-semibold text-xs text-gray-900">${event.price}</span>
              </div>
            ) : (
              <div className="bg-green-500 text-white rounded-full px-2 py-0.5 shadow-md font-semibold text-[10px]">
                FREE
              </div>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex flex-col flex-grow p-3 space-y-2.5 relative">
          {/* Title */}
          <div>
            <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug text-gray-900">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-xs text-gray-600 line-clamp-1 mt-1 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-2 flex-grow">
            {/* Date */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-3 h-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">
                  {format(new Date(event.startDate), 'MMM dd, yyyy')}
                </p>
                <p className="text-[10px] text-gray-600">
                  {format(new Date(event.startDate), 'h:mm a')}
                  {isUpcoming && (
                    <span className="hidden sm:inline">
                      {` • ${formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}`}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3 h-3 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                  {event.location}
                </p>
                {event.venue && (
                  <p className="text-[10px] text-gray-600 line-clamp-1">
                    {event.venue}
                  </p>
                )}
              </div>
            </div>

            {/* Capacity */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-3 h-3 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-900">
                    {totalTicketsSold}/{event.capacity}
                  </p>
                  <span className={cn(
                    "text-[10px] font-semibold",
                    isFull ? "text-red-600" : fillPercentage > 80 ? "text-orange-600" : "text-green-600"
                  )}>
                    {isFull ? 'Full' : `${availableSpots} left`}
                  </span>
                </div>
                <Progress 
                  value={fillPercentage} 
                  className={cn(
                    "h-1",
                    fillPercentage >= 100 ? "[&>div]:bg-red-500" : 
                    fillPercentage > 80 ? "[&>div]:bg-orange-500" : 
                    "[&>div]:bg-green-500"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Trending Indicator */}
          {fillPercentage > 60 && !isFull && !isPastEvent && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-md px-2 py-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-orange-600 flex-shrink-0" />
              <span className="text-[10px] font-medium text-orange-800">
                {Math.round(fillPercentage)}% booked
              </span>
            </div>
          )}

          {/* Organizer & CTA */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            {event.organizer ? (
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Avatar className="w-6 h-6 border border-gray-200 flex-shrink-0">
                  <AvatarImage 
                    src={event.organizer.imageUrl || undefined} 
                    alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-[10px]">
                    {event.organizer.firstName?.[0]}{event.organizer.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500">By</p>
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1" />
            )}
            
            <Button 
              size="sm" 
              className="gap-1 shadow-sm group-hover:shadow-md transition-all h-7 text-[11px] px-2.5 relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative">View</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform relative" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}