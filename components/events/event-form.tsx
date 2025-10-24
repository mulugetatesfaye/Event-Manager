'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FadeIn } from '@/components/ui/fade-in'
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
  Image, 
  FileText,
  Clock,
  Building,
  Type,
  Save,
  X,
  AlertCircle,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  venue: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  categoryId: z.string().optional(),
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
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      location: event?.location || '',
      venue: event?.venue || '',
      startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      capacity: event?.capacity || 50,
      price: event?.price || 0,
      imageUrl: event?.imageUrl || '',
      status: (event?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT') as 'DRAFT' | 'PUBLISHED',
      categoryId: event?.categoryId || '',
    },
  })

  const onSubmit = async (data: EventFormValues) => {
    try {
      if (isEdit) {
        await updateEvent.mutateAsync(data)
        router.push(`/events/${event?.id}`)
      } else {
        const newEvent = await createEvent.mutateAsync(data)
        router.push(`/events/${newEvent.id}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const isSubmitting = createEvent.isPending || updateEvent.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <FadeIn direction="up" delay={100}>
          <Card className="border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Type className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Event title, description and category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Event Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter event title" 
                        className="h-10 text-sm"
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
                    <FormLabel className="text-sm font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event (optional)"
                        className="min-h-[100px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Category
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="backdrop-blur-sm bg-white/95">
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
                    <FormDescription className="text-xs">
                      Choose a category for better discoverability
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </FadeIn>

        {/* Location & Venue */}
        <FadeIn direction="up" delay={150}>
          <Card className="border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-base">Location Details</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Where will your event take place?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Location *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="City, Country" 
                          className="h-10 text-sm"
                          {...field} 
                        />
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
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        Venue
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Specific venue name (optional)" 
                          className="h-10 text-sm"
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
        </FadeIn>

        {/* Date & Time */}
        <FadeIn direction="up" delay={200}>
          <Card className="border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-base">Date & Time</CardTitle>
              </div>
              <CardDescription className="text-sm">
                When will your event happen?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Start Date & Time *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          className="h-10 text-sm"
                          {...field} 
                        />
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
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        End Date & Time *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          className="h-10 text-sm"
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
        </FadeIn>

        {/* Capacity & Pricing */}
        <FadeIn direction="up" delay={250}>
          <Card className="border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-base">Capacity & Pricing</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Event size and ticket pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Capacity *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          className="h-10 text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Maximum number of attendees
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        Price ($) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-10 text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Set to 0 for free events
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Media & Status */}
        <FadeIn direction="up" delay={300}>
          <Card className="border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Image className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-base">Media & Publishing</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Event image and visibility settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5" />
                      Event Image URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg (optional)" 
                        className="h-10 text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Add an attractive image for your event
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Status *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="Select event status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="backdrop-blur-sm bg-white/95">
                        <SelectItem value="DRAFT" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            Draft - Not visible to attendees
                          </div>
                        </SelectItem>
                        <SelectItem value="PUBLISHED" className="text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Published - Visible to everyone
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Only published events are visible to attendees
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </FadeIn>

        {/* Form Actions */}
        <FadeIn direction="up" delay={350}>
          <Card className="border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardContent>
              <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Before you submit:</p>
                  <ul className="space-y-0.5 ml-4 list-disc">
                    <li>Double-check your event dates and times</li>
                    <li>Ensure the capacity matches your venue</li>
                    <li>Set status to &quot;Published&quot; to make it visible</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden flex-1 sm:flex-initial",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {!isSubmitting && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  )}
                  <Save className="w-4 h-4 mr-2 relative" />
                  <span className="relative">
                    {isSubmitting
                      ? 'Saving...'
                      : isEdit
                      ? 'Update Event'
                      : 'Create Event'}
                  </span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 sm:flex-initial"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </form>
    </Form>
  )
}