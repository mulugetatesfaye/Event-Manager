// app/events/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { useEvents, useCategories } from '@/hooks'
import { EventCard } from '@/components/events/event-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Calendar, 
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  DollarSign,
  Grid3x3,
  List,
  CalendarRange,
  Eye,
  Tag,
  Plus,
  TrendingUp
} from 'lucide-react'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { EventWithRelations, CategoryWithCount } from '@/types'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/components/ui/fade-in'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCurrentUser } from '@/hooks/use-user'

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  })

  return debouncedValue
}

// Loading skeleton grid
const EventsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </Card>
    ))}
  </div>
)

// Filter pills component
interface FilterItem {
  key: string
  value: string
  label: string
}

const FilterPills = ({ 
  filters, 
  onRemove 
}: { 
  filters: FilterItem[]
  onRemove: (key: string) => void 
}) => {
  if (filters.length === 0) return null
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <Badge 
          key={filter.key}
          variant="secondary" 
          className="px-3 py-1.5 text-sm"
        >
          {filter.label}
          <button 
            onClick={() => onRemove(filter.key)}
            className="ml-2 hover:text-red-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => filters.forEach(f => onRemove(f.key))}
        className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        Clear all
      </Button>
    </div>
  )
}

export default function EventsPage() {
  const { isSignedIn } = useUser()
  const { data: currentUser } = useCurrentUser()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [priceFilter, setPriceFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data: eventsData, isLoading, error } = useEvents({
    page,
    limit: viewMode === 'grid' ? 12 : 10,
    search: debouncedSearch,
    category,
  })

  const { data: categories } = useCategories()

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? '' : value)
    setPage(1)
  }

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setCategory('')
    setPriceFilter('all')
    setDateFilter('all')
    setSortBy('date')
    setPage(1)
  }, [])

  // Build active filters array
  const activeFilters: FilterItem[] = []
  if (debouncedSearch) activeFilters.push({ key: 'search', value: debouncedSearch, label: `Search: "${debouncedSearch}"` })
  if (category) {
    const cat = categories?.find((c: CategoryWithCount) => c.id === category)
    if (cat) activeFilters.push({ key: 'category', value: category, label: cat.name })
  }
  if (priceFilter !== 'all') activeFilters.push({ key: 'price', value: priceFilter, label: priceFilter === 'free' ? 'Free Events' : 'Paid Events' })
  if (dateFilter !== 'all') {
    const labels: Record<string, string> = {
      today: 'Today',
      tomorrow: 'Tomorrow',
      week: 'This Week',
      month: 'This Month',
      weekend: 'This Weekend'
    }
    activeFilters.push({ key: 'date', value: dateFilter, label: labels[dateFilter] || dateFilter })
  }

  const removeFilter = (key: string) => {
    switch(key) {
      case 'search':
        setSearchTerm('')
        break
      case 'category':
        setCategory('')
        break
      case 'price':
        setPriceFilter('all')
        break
      case 'date':
        setDateFilter('all')
        break
    }
    setPage(1)
  }

  const hasActiveFilters = activeFilters.length > 0
  const totalEvents = eventsData?.pagination?.total ?? 0
  const currentEvents = eventsData?.events?.length ?? 0
  const totalPages = eventsData?.pagination?.totalPages ?? 0
  const totalCategories = categories?.length ?? 0
  
  const canCreateEvent = isSignedIn && currentUser?.role !== 'ATTENDEE'

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FadeIn direction="up">
              <div className="text-center mb-8">
                <Badge 
                  variant="outline" 
                  className="mb-4 border-gray-300"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  <span className="font-medium text-gray-700">
                    {totalEvents} events available
                  </span>
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                  Discover Amazing Events
                </h1>
                
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Find and join events that match your interests across Ethiopia
                </p>
              </div>
            </FadeIn>

            {/* Search Bar */}
            <FadeIn direction="up" delay={100}>
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search events, venues, locations, or categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-32 h-14 text-base border-gray-300 focus:border-blue-600"
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <SlidersHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setPriceFilter('free')}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Free Events Only
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDateFilter('today')}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Today&apos;s Events
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDateFilter('week')}>
                            <CalendarRange className="w-4 h-4 mr-2" />
                            This Week
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy('popular')}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Most Popular
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Search className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Search</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  <Button
                    variant={!category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange('all')}
                    className={cn(
                      "rounded-full",
                      !category && "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                  >
                    All Events
                  </Button>
                  {categories?.slice(0, 6).map((cat: CategoryWithCount) => (
                    <Button
                      key={cat.id}
                      variant={category === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "rounded-full border-gray-300",
                        category === cat.id && "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      )}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: cat.color || '#6b7280' }}
                      />
                      {cat.name}
                      {cat._count?.events > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {cat._count.events}
                        </Badge>
                      )}
                    </Button>
                  ))}
                  {categories && categories.length > 6 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full border-gray-300">
                          More Categories
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {categories.slice(6).map((cat: CategoryWithCount) => (
                          <DropdownMenuItem
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                          >
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: cat.color || '#6b7280' }}
                            />
                            {cat.name}
                            {cat._count?.events > 0 && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {cat._count.events}
                              </Badge>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Stats Bar */}
        {!isLoading && eventsData && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                  {[
                    { icon: Calendar, value: totalEvents, label: 'Total Events' },
                    { icon: Eye, value: currentEvents, label: 'Showing' },
                    { icon: Tag, value: totalCategories, label: 'Categories' },
                  ].map((stat, i) => {
                    const Icon = stat.icon
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </p>
                          <p className="text-xs text-gray-600">{stat.label}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* View Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "h-9 px-3",
                        viewMode === 'grid' && "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "h-9 px-3",
                        viewMode === 'list' && "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px] border-gray-300">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">By Date</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>

                  {canCreateEvent && (
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Link href="/events/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {hasActiveFilters && (
            <FilterPills filters={activeFilters} onRemove={removeFilter} />
          )}

          {isLoading ? (
            <EventsGridSkeleton />
          ) : error ? (
            <div className="text-center py-16">
              <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Events</h3>
              <p className="text-gray-600 mb-6">Something went wrong. Please try again.</p>
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
                Retry
              </Button>
            </div>
          ) : !eventsData || eventsData.events.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No events found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {hasActiveFilters 
                  ? "We couldn't find any events matching your criteria. Try adjusting your filters."
                  : "There are no events available at the moment. Check back later!"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" className="border-gray-300">
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
                {canCreateEvent && !hasActiveFilters && (
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Link href="/events/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create the First Event
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              )}>
                {eventsData.events.map((event: EventWithRelations) => (
                  <div key={event.id}>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 order-2 sm:order-1">
                    Showing <span className="font-semibold">{(page - 1) * 12 + 1}</span> to{' '}
                    <span className="font-semibold">
                      {Math.min(page * 12, totalEvents)}
                    </span>{' '}
                    of <span className="font-semibold">{totalEvents}</span> events
                  </div>
                  
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPage(page - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={page === 1}
                      className="border-gray-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>

                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                              setPage(pageNum)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className={cn(
                              "w-10 h-10",
                              page === pageNum && "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            )}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <div className="flex sm:hidden items-center gap-2 px-4">
                      <span className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setPage(page + 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={page === totalPages}
                      className="border-gray-300"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}