// components/events/event-form.tsx
'use client'

import { useForm, useFieldArray, UseFormReturn, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { FadeIn } from '@/components/ui/fade-in'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateEvent, useUpdateEvent, useCategories } from '@/hooks'
import { useRouter } from 'next/navigation'
import { EventWithRelations, CategoryWithCount } from '@/types'
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Image as ImageIcon, 
  FileText,
  Clock,
  Building,
  Type,
  Save,
  X,
  AlertCircle,
  Tag,
  Ticket,
  Percent,
  Info,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Navigation,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Ethiopian Birr formatter
const formatETB = (amount: number): string => {
  return `${amount.toFixed(2)} ETB`
}

// Ticket type schema
const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name is required'),
  description: z.string().default(''),
  price: z.number().min(0, 'Price cannot be negative'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  earlyBirdPrice: z.number().min(0).nullable().optional(),
  earlyBirdEndDate: z.string().default(''),
  minQuantity: z.number().min(1).default(1),
  maxQuantity: z.number().min(1).default(10),
})

// Main event schema
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().default(''),
  location: z.string().min(1, 'Location is required'),
  venue: z.string().default(''),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  registrationDeadline: z.string().default(''),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().default(''),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  categoryId: z.string().default(''),
  requiresSeating: z.boolean().default(false),
  allowGroupBooking: z.boolean().default(true),
  groupDiscountPercentage: z.number().min(0).max(100).nullable().optional(),
  groupMinQuantity: z.number().min(2).default(5),
  maxTicketsPerPerson: z.number().min(1).max(50).default(10),
  useAdvancedTicketing: z.boolean().default(false),
  ticketTypes: z.array(ticketTypeSchema).default([]),
})

type EventFormValues = z.infer<typeof eventSchema>

interface EventFormProps {
  event?: EventWithRelations
  isEdit?: boolean
}

export function EventForm({ event, isEdit = false }: EventFormProps) {
  const router = useRouter()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent(event?.id || '')
  const { data: categories } = useCategories()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormValues>,
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      location: event?.location || '',
      venue: event?.venue || '',
      startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      registrationDeadline: '',
      capacity: event?.capacity || 100,
      price: event?.price || 0,
      imageUrl: event?.imageUrl || '',
      status: event?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      categoryId: event?.categoryId || '',
      requiresSeating: event?.requiresSeating || false,
      allowGroupBooking: event?.allowGroupBooking ?? true,
      groupDiscountPercentage: event?.groupDiscountPercentage ?? null,
      groupMinQuantity: event?.groupMinQuantity || 5,
      maxTicketsPerPerson: 10,
      useAdvancedTicketing: false,
      ticketTypes: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ticketTypes',
  })

  const watchAllowGroupBooking = form.watch('allowGroupBooking')
  const watchUseAdvancedTicketing = form.watch('useAdvancedTicketing')
  const watchTicketTypes = form.watch('ticketTypes')
  const watchCapacity = form.watch('capacity')
  const watchPrice = form.watch('price')
  const watchStatus = form.watch('status')

  // Calculate total ticket capacity
  const totalTicketCapacity = watchTicketTypes.reduce((sum, t) => sum + (t?.quantity || 0), 0)
  const remainingCapacity = watchCapacity - totalTicketCapacity
  const capacityFillPercentage = watchCapacity > 0 ? (totalTicketCapacity / watchCapacity) * 100 : 0

  const addTicketType = () => {
    const remainingCap = watchCapacity - totalTicketCapacity
    append({
      name: '',
      description: '',
      price: 0,
      quantity: remainingCap > 0 ? Math.min(10, remainingCap) : 10,
      earlyBirdPrice: null,
      earlyBirdEndDate: '',
      minQuantity: 1,
      maxQuantity: 10,
    })
  }

  const onSubmit = async (data: EventFormValues) => {
    try {
      // Manual validation for complex business rules
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      
      if (endDate <= startDate) {
        toast.error('End date must be after start date')
        return
      }

      if (data.registrationDeadline) {
        const regDeadline = new Date(data.registrationDeadline)
        if (regDeadline > startDate) {
          toast.error('Registration deadline must be before event start')
          return
        }
      }

      // Validate ticket types if advanced ticketing is enabled
      if (data.useAdvancedTicketing) {
        if (!data.ticketTypes || data.ticketTypes.length === 0) {
          toast.error('Please add at least one ticket type')
          return
        }

        const totalCapacity = data.ticketTypes.reduce((sum, t) => sum + t.quantity, 0)
        if (totalCapacity > data.capacity) {
          toast.error(`Total ticket capacity (${totalCapacity}) exceeds event capacity (${data.capacity})`)
          return
        }

        if (totalCapacity < data.capacity) {
          const proceed = confirm(
            `Total ticket capacity (${totalCapacity}) is less than event capacity (${data.capacity}). Continue anyway?`
          )
          if (!proceed) return
        }
      }

      if (isEdit) {
        await updateEvent.mutateAsync(data)
        toast.success('Event updated successfully')
        router.push(`/events/${event?.id}`)
      } else {
        const newEvent = await createEvent.mutateAsync(data)
        toast.success('🎉 Event created successfully!')
        
        if (data.status === 'DRAFT') {
          toast.info('Your event is saved as draft. Publish it to make it visible to attendees.')
        }
        
        router.push(`/events/${newEvent.id}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save event')
    }
  }

  const isSubmitting = createEvent.isPending || updateEvent.isPending

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Event' : 'Create New Event'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isEdit ? 'Update your event details' : 'Fill in the details to create your event'}
              </p>
            </div>
            <Badge
              variant={watchStatus === 'PUBLISHED' ? 'default' : 'secondary'}
              className="h-6"
            >
              {watchStatus === 'PUBLISHED' ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Published
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Basic Information */}
            <FadeIn direction="up" delay={100}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="border-b border-gray-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Type className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Basic Information
                      </h2>
                      <p className="text-sm text-gray-600">
                        Event title, description and category
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Event Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Tech Conference 2024" 
                            className="h-11 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your event, what attendees can expect, key highlights..."
                            className="min-h-[140px] text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500">
                          A detailed description helps attract more attendees
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Category
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: CategoryWithCount) => (
                              <SelectItem key={category.id} value={category.id} className="text-sm">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: category.color || '#6b7280' }}
                                  />
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs text-gray-500">
                          Choose a category for better discoverability
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FadeIn>

            {/* Location & Venue */}
            <FadeIn direction="up" delay={150}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="border-b border-gray-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Location Details
                      </h2>
                      <p className="text-sm text-gray-600">
                        Where will your event take place?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Location <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                placeholder="e.g., Addis Ababa, Ethiopia" 
                                className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Venue
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                placeholder="e.g., Millennium Hall" 
                                className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Date & Time */}
            <FadeIn direction="up" delay={200}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="border-b border-gray-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Date & Time
                      </h2>
                      <p className="text-sm text-gray-600">
                        When will your event happen?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Start Date & Time <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              <Input 
                                type="datetime-local" 
                                className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            End Date & Time <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              <Input 
                                type="datetime-local" 
                                className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationDeadline"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Registration Deadline (Optional)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              <Input 
                                type="datetime-local" 
                                className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Last date/time for registrations. Defaults to event start time if not set.
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Capacity & Ticketing */}
            <FadeIn direction="up" delay={250}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="border-b border-gray-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Ticketing & Capacity
                        </h2>
                        <p className="text-sm text-gray-600">
                          Configure pricing and capacity
                        </p>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="useAdvancedTicketing"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormLabel className="text-sm font-medium text-gray-700 cursor-pointer">
                            Advanced Ticketing
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Total Capacity <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                type="number"
                                min="1"
                                className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="100"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Maximum number of attendees
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {!watchUseAdvancedTicketing && (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900">
                              Ticket Price (ETB) <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                              {watchPrice === 0 ? (
                                <span className="text-green-600 font-medium">Free Event</span>
                              ) : (
                                `Ticket price: ${formatETB(watchPrice)}`
                              )}
                            </FormDescription>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="maxTicketsPerPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Max Tickets Per Person
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Limit tickets per registration
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Advanced Ticketing Section */}
                  {watchUseAdvancedTicketing && (
                    <>
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Ticket Types</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Create different ticket types with varying prices
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTicketType}
                            className="h-9 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Ticket Type
                          </Button>
                        </div>

                        {/* Capacity Indicator */}
                        {totalTicketCapacity > 0 && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">
                                Ticket Capacity Allocation
                              </span>
                              <Badge
                                variant={
                                  totalTicketCapacity > watchCapacity
                                    ? 'destructive'
                                    : totalTicketCapacity === watchCapacity
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {totalTicketCapacity} / {watchCapacity}
                              </Badge>
                            </div>
                            <Progress value={capacityFillPercentage} className="h-2 mb-2" />
                            <div className="flex items-center justify-between text-xs">
                              {totalTicketCapacity > watchCapacity ? (
                                <span className="text-red-600 font-medium flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Exceeds capacity by {totalTicketCapacity - watchCapacity}
                                </span>
                              ) : totalTicketCapacity === watchCapacity ? (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  All spots allocated
                                </span>
                              ) : (
                                <span className="text-gray-600">
                                  {remainingCapacity} spots remaining
                                </span>
                              )}
                              <span className="text-gray-500">
                                {capacityFillPercentage.toFixed(0)}% allocated
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Ticket Type Cards */}
                        {fields.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Ticket className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">No ticket types yet</p>
                            <p className="text-xs text-gray-500">Click &quot;Add Ticket Type&quot; to create your first ticket</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {fields.map((field, index) => (
                              <Card key={field.id} className="border-gray-300 shadow-sm">
                                <CardContent className="p-5">
                                  <div className="flex items-center justify-between mb-4">
                                    <Badge variant="secondary" className="font-medium">
                                      Ticket Type #{index + 1}
                                    </Badge>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`ticketTypes.${index}.name`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs font-medium text-gray-700">
                                            Ticket Name <span className="text-red-500">*</span>
                                          </FormLabel>
                                          <FormControl>
                                            <Input 
                                              placeholder="e.g., VIP, General Admission" 
                                              className="h-10 text-sm border-gray-300 focus:border-blue-500"
                                              {...field} 
                                            />
                                          </FormControl>
                                          <FormMessage className="text-xs" />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`ticketTypes.${index}.price`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs font-medium text-gray-700">
                                            Price (ETB) <span className="text-red-500">*</span>
                                          </FormLabel>
                                          <FormControl>
                                            <div className="relative">
                                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                              <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="h-10 pl-10 text-sm border-gray-300 focus:border-blue-500"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                              />
                                            </div>
                                          </FormControl>
                                          <FormMessage className="text-xs" />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`ticketTypes.${index}.quantity`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs font-medium text-gray-700">
                                            Quantity <span className="text-red-500">*</span>
                                          </FormLabel>
                                          <FormControl>
                                            <div className="relative">
                                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                              <Input
                                                type="number"
                                                min="1"
                                                className="h-10 pl-10 text-sm border-gray-300 focus:border-blue-500"
                                                placeholder="50"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                              />
                                            </div>
                                          </FormControl>
                                          <FormMessage className="text-xs" />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`ticketTypes.${index}.earlyBirdPrice`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3 text-yellow-500" />
                                            Early Bird Price
                                          </FormLabel>
                                          <FormControl>
                                            <div className="relative">
                                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                              <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Optional"
                                                className="h-10 pl-10 text-sm border-gray-300 focus:border-blue-500"
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                  const value = e.target.value === '' ? null : parseFloat(e.target.value)
                                                  field.onChange(value)
                                                }}
                                              />
                                            </div>
                                          </FormControl>
                                          <FormMessage className="text-xs" />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`ticketTypes.${index}.description`}
                                      render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                          <FormLabel className="text-xs font-medium text-gray-700">
                                            Description
                                          </FormLabel>
                                          <FormControl>
                                            <Textarea
                                              placeholder="Describe what's included in this ticket..."
                                              className="min-h-[80px] text-sm border-gray-300 focus:border-blue-500 resize-none"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage className="text-xs" />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Group Booking Options */}
                  {!watchUseAdvancedTicketing && (
                    <>
                      <Separator />
                      
                      <FormField
                        control={form.control}
                        name="allowGroupBooking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-0.5"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none flex-1">
                              <FormLabel className="text-sm font-medium text-gray-900 cursor-pointer">
                                Allow Group Bookings
                              </FormLabel>
                              <FormDescription className="text-xs text-gray-600">
                                Enable attendees to purchase multiple tickets with optional discounts
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {watchAllowGroupBooking && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
                          <FormField
                            control={form.control}
                            name="groupMinQuantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-900">
                                  Min Group Size
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                      type="number"
                                      min="2"
                                      placeholder="5"
                                      className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500">
                                  Minimum tickets for group discount
                                </FormDescription>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="groupDiscountPercentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-900">
                                  Group Discount (%)
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="1"
                                      placeholder="10"
                                      className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500"
                                      value={field.value ?? ''}
                                      onChange={(e) => {
                                        const value = e.target.value === '' ? null : parseFloat(e.target.value)
                                        field.onChange(value)
                                      }}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500">
                                  Discount percentage for group purchases
                                </FormDescription>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <Separator />

                  <FormField
                    control={form.control}
                    name="requiresSeating"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none flex-1">
                          <FormLabel className="text-sm font-medium text-gray-900 cursor-pointer">
                            Reserved Seating
                          </FormLabel>
                          <FormDescription className="text-xs text-gray-600">
                            Enable seat selection for attendees (configure seats later)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FadeIn>

            {/* Media & Status */}
            <FadeIn direction="up" delay={300}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="border-b border-gray-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Media & Publishing
                      </h2>
                      <p className="text-sm text-gray-600">
                        Event image and visibility settings
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Event Image URL
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                              placeholder="https://example.com/event-image.jpg" 
                              className="h-11 pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500">
                          Add an attractive cover image for your event (recommended: 1200x630px)
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Event Status <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-blue-500">
                              <SelectValue placeholder="Select event status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DRAFT" className="text-sm">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                  <EyeOff className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Draft</p>
                                  <p className="text-xs text-gray-500">Not visible to attendees</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="PUBLISHED" className="text-sm">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                  <Eye className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Published</p>
                                  <p className="text-xs text-gray-500">Visible to everyone</p>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs text-gray-500">
                          {watchStatus === 'PUBLISHED' ? (
                            <span className="text-green-600 font-medium">
                              ✓ Your event will be visible to all attendees
                            </span>
                          ) : (
                            <span className="text-gray-600">
                              Your event will remain private until published
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FadeIn>

            {/* Submit Section */}
            <FadeIn direction="up" delay={350}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky bottom-4">
                <div className="p-6">
                  {/* Info Alert */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 text-sm text-blue-800">
                      <p className="font-semibold mb-2">Before you submit:</p>
                      <ul className="space-y-1.5 text-xs">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          Double-check your event dates and times
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          Ensure the capacity matches your venue
                        </li>
                        {watchUseAdvancedTicketing && (
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            Verify ticket types total capacity doesn&apos;t exceed event capacity
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          Set status to &quot;Published&quot; to make it visible to attendees
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isEdit ? 'Update Event' : 'Create Event'}
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1 sm:flex-initial h-11 border-gray-300 hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </form>
      </Form>
    </div>
  )
}