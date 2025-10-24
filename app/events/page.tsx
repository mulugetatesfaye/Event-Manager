// app/events/page.tsx
'use client'

import { useState } from 'react'
import { useEvents, useCategories } from '@/hooks'
import { EventCard } from '@/components/events/event-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Calendar, 
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react'
import Navbar from '@/components/layout/navbar'
import { EventWithRelations, CategoryWithCount } from '@/types'
import { cn } from '@/lib/utils'

export default function EventsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [tempSearch, setTempSearch] = useState('')

  const { data: eventsData, isLoading, error } = useEvents({
    page,
    limit: 12,
    search,
    category,
  })

  const { data: categories } = useCategories()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(tempSearch)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? '' : value)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setTempSearch('')
    setCategory('')
    setPage(1)
  }

  const hasActiveFilters = search || category

  const selectedCategory = categories?.find((cat: CategoryWithCount) => cat.id === category)

  const totalEvents = eventsData?.pagination?.total ?? 0
  const currentEvents = eventsData?.events?.length ?? 0
  const totalPages = eventsData?.pagination?.totalPages ?? 0
  const totalCategories = categories?.length ?? 0

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50/50 via-white to-white">
        {/* Compact Hero Section */}
        <div className="relative bg-gradient-to-br from-gray-50 via-white to-white border-b overflow-hidden">
          {/* Dense Background Patterns */}
          <div 
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(0, 0, 0) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(0, 0, 0) 1px, transparent 1px)
              `,
              backgroundSize: '1.5rem 1.5rem'
            }}
          />
          
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 1px, transparent 1px)',
              backgroundSize: '1rem 1rem'
            }}
          />

          {/* Animated mesh gradient - subtle */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          </div>

          {/* Radial gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative">
            <div className="text-center mb-6">
              <Badge variant="outline" className="mb-3 backdrop-blur-sm bg-white/80 border-gray-200/50 shadow-sm text-[10px] h-5">
                <Sparkles className="w-2.5 h-2.5 mr-1 text-primary" />
                <span className="font-medium text-gray-700">
                  {totalEvents} events available
                </span>
              </Badge>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Discover Events
                </span>
              </h1>
              <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                Find and join events across Ethiopia
              </p>
            </div>

            {/* Compact Search and Filters */}
            <div className="max-w-3xl mx-auto space-y-2.5">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Search events, venues, or locations..."
                    value={tempSearch}
                    onChange={(e) => setTempSearch(e.target.value)}
                    className="pl-10 pr-20 h-9 text-sm border-gray-300 focus:border-primary shadow-sm bg-white/80 backdrop-blur-sm"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-6 text-xs px-3 shadow-sm"
                    size="sm"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {/* Active Filters - Compact */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5">
                  {search && (
                    <Badge variant="secondary" className="px-2 py-0.5 text-[10px] h-5 bg-gray-100 text-gray-700">
                      Search: &quot;{search}&quot;
                      <button 
                        onClick={() => { setSearch(''); setTempSearch(''); }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge 
                      variant="secondary" 
                      className="px-2 py-0.5 text-[10px] h-5"
                      style={{ 
                        backgroundColor: (selectedCategory.color || '#6b7280') + '20',
                        color: selectedCategory.color || '#6b7280',
                        border: `1px solid ${(selectedCategory.color || '#6b7280')}40`
                      }}
                    >
                      {selectedCategory.name}
                      <button 
                        onClick={() => setCategory('')}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Stats Bar - Centered and Padded */}
        {!isLoading && eventsData && (
          <div className="bg-white border-b border-gray-100 relative">
            {/* Subtle pattern */}
            <div 
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
                backgroundSize: '1rem 1rem'
              }}
            />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { icon: Calendar, value: totalEvents, label: 'Events', color: 'from-blue-500 to-blue-600' },
                    { icon: TrendingUp, value: totalCategories, label: 'Categories', color: 'from-green-500 to-green-600' },
                    { icon: Users, value: currentEvents, label: 'Showing', color: 'from-purple-500 to-purple-600' },
                    { icon: Sparkles, value: totalPages, label: 'Pages', color: 'from-orange-500 to-orange-600' }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <div className={`w-7 h-7 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                        <stat.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-base md:text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className="text-[10px] text-gray-600">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid - Updated for 4 columns */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-72 animate-pulse bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">Error Loading Events</h3>
              <p className="text-sm text-gray-600 mb-4">Something went wrong. Please try again.</p>
              <Button onClick={() => window.location.reload()} size="sm" className="h-8 text-xs">
                Retry
              </Button>
            </div>
          ) : !eventsData || eventsData.events.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
                <Calendar className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">No events found</h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                We couldn&apos;t find any events matching your criteria. Try adjusting your filters.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" size="sm" className="h-8 text-xs">
                  <X className="w-3 h-3 mr-1.5" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Results Header with Filters on Right */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                {/* Left - Title and Count */}
                <div>
                  <h2 className="text-base md:text-lg font-bold text-gray-900">
                    {hasActiveFilters ? 'Search Results' : 'All Events'}
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {currentEvents} of {totalEvents} events
                  </p>
                </div>

                {/* Right - Filters and Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <Select value={category || 'all'} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[140px] md:w-[160px] h-7 text-xs bg-white border-gray-300 hover:border-primary transition-colors">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3 h-3" />
                          All Categories
                        </div>
                      </SelectItem>
                      {categories?.map((cat: CategoryWithCount) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-1.5 text-xs">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: cat.color || '#6b7280' }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort (placeholder for future) */}
                  <Select defaultValue="date">
                    <SelectTrigger className="w-[100px] md:w-[120px] h-7 text-xs bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">
                        <div className="flex items-center gap-1.5 text-xs">
                          <ArrowUpDown className="w-3 h-3" />
                          By Date
                        </div>
                      </SelectItem>
                      <SelectItem value="popular">
                        <div className="flex items-center gap-1.5 text-xs">
                          <TrendingUp className="w-3 h-3" />
                          Popular
                        </div>
                      </SelectItem>
                      <SelectItem value="price">
                        <div className="flex items-center gap-1.5 text-xs">
                          <ArrowUpDown className="w-3 h-3" />
                          By Price
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-600 hover:text-primary h-7 text-xs px-2"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Events Grid - Updated to 4 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {eventsData.events.map((event: EventWithRelations) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Compact Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-gray-600 order-2 sm:order-1">
                    Page {page} of {totalPages}
                  </div>
                  
                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPage(page - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={page === 1}
                      className="h-7 text-xs px-2 border-gray-300"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline ml-1">Prev</span>
                    </Button>

                    {/* Page Numbers - Compact */}
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
                              "w-7 h-7 text-xs p-0",
                              page === pageNum && "shadow-sm"
                            )}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    {/* Mobile Page Indicator - Compact */}
                    <div className="flex sm:hidden items-center gap-1 px-2 text-xs">
                      <span className="font-medium text-gray-900">{page}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{totalPages}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPage(page + 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={page === totalPages}
                      className="h-7 text-xs px-2 border-gray-300"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="text-xs text-gray-600 order-3">
                    {totalEvents} total
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}