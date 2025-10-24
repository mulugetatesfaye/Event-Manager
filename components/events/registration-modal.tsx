// components/events/registration-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  Loader2,
  Download,
  Ticket,
  QrCode,
} from 'lucide-react'
import { EventWithRelations, User as UserType, RegistrationWithRelations } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import QRCode from 'qrcode'

interface RegistrationModalProps {
  event: EventWithRelations
  isOpen: boolean
  onClose: () => void
  currentUser: UserType
}

// Fixed schema with proper default values
const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  organization: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  specialRequirements: z.string().optional(),
  ticketType: z.string().optional(),
  quantity: z.number().min(1).max(10),
  termsAccepted: z.boolean(),
  marketingEmails: z.boolean(),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

const STEPS = [
  { id: 1, name: 'Your Information', icon: User },
  { id: 2, name: 'Additional Details', icon: FileText },
  { id: 3, name: 'Review & Confirm', icon: CheckCircle2 },
]

// Generate user-friendly QR code content
function generateUserFriendlyQRContent(registration: RegistrationWithRelations, event: EventWithRelations) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'
  
  // Create a check-in URL that includes the registration ID
  // This URL can be scanned by staff or lead to a check-in page
  return `${baseUrl}/check-in/${registration.id}?event=${event.id}&ticket=${registration.ticketNumber || registration.id}`
}

// Download ticket as image
async function downloadTicketAsImage(
  qrCodeImage: string,
  event: EventWithRelations,
  registration: RegistrationWithRelations,
  attendeeName: { firstName: string; lastName: string }
) {
  try {
    // Create a canvas to draw the ticket
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 600

    // Draw white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw header
    ctx.fillStyle = '#6366F1'
    ctx.fillRect(0, 0, canvas.width, 80)

    // Add title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('EVENT TICKET', canvas.width / 2, 50)

    // Add event name
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 18px Arial'
    const eventTitle = event.title.length > 30 ? event.title.substring(0, 30) + '...' : event.title
    ctx.fillText(eventTitle, canvas.width / 2, 120)

    // Load and draw QR code
    const img = new Image()
    img.onload = () => {
      // Draw QR code
      ctx.drawImage(img, 100, 150, 200, 200)

      // Add ticket number
      ctx.fillStyle = '#666666'
      ctx.font = '14px Arial'
      ctx.fillText(`Ticket #${registration.ticketNumber || registration.id.slice(-8)}`, canvas.width / 2, 380)

      // Add event details
      ctx.fillStyle = '#000000'
      ctx.font = '14px Arial'
      ctx.textAlign = 'left'
      
      ctx.fillText(`Date: ${format(new Date(event.startDate), 'PPP')}`, 50, 430)
      ctx.fillText(`Time: ${format(new Date(event.startDate), 'p')}`, 50, 455)
      ctx.fillText(`Location: ${event.location}`, 50, 480)
      ctx.fillText(`Attendee: ${attendeeName.firstName} ${attendeeName.lastName}`, 50, 505)

      // Add footer
      ctx.fillStyle = '#999999'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Show this ticket at the entrance', canvas.width / 2, 560)

      // Download the canvas as image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `ticket-${event.title.replace(/\s+/g, '-')}-${registration.ticketNumber || registration.id.slice(-8)}.png`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
      })
    }
    img.src = qrCodeImage
  } catch (error) {
    console.error('Error downloading ticket:', error)
    toast.error('Failed to download ticket')
  }
}

export function RegistrationModal({
  event,
  isOpen,
  onClose,
  currentUser,
}: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [registrationData, setRegistrationData] = useState<RegistrationWithRelations | null>(null)
  const [qrCodeImage, setQrCodeImage] = useState<string>('')
  const queryClient = useQueryClient()

  // Create the registration mutation directly
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register')
      }

      return result
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['event', event.id] })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['user-registrations'] })
    },
  })

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phone: '',
      organization: '',
      dietaryRequirements: '',
      specialRequirements: '',
      ticketType: '',
      quantity: 1,
      termsAccepted: false,
      marketingEmails: false,
    },
  })

  const availableSpots = event.capacity - (event._count?.registrations || 0)
  const progressPercentage = (currentStep / STEPS.length) * 100

  // Generate QR code when registration is successful
  useEffect(() => {
    if (registrationData && currentStep === 4) {
      // Generate user-friendly QR content
      const qrContent = generateUserFriendlyQRContent(registrationData, event)
      
      QRCode.toDataURL(qrContent, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then(setQrCodeImage)
      .catch(console.error)
    }
  }, [registrationData, currentStep, event])

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = []

    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone']
    } else if (currentStep === 2) {
      fieldsToValidate = ['organization', 'dietaryRequirements', 'specialRequirements', 'quantity']
    }

    const isValid = fieldsToValidate.length > 0 
      ? await form.trigger(fieldsToValidate)
      : true

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: RegistrationFormData) => {
    // Validate terms are accepted
    if (!data.termsAccepted) {
      form.setError('termsAccepted', {
        type: 'manual',
        message: 'You must accept the terms and conditions',
      })
      return
    }

    try {
      setIsProcessing(true)
      
      // Register for the event with additional data
      const response = await registerMutation.mutateAsync(data)
      
      // Store registration data for ticket display
      setRegistrationData(response.registration)
      
      // Show success state with QR code
      setCurrentStep(4)
      toast.success('Successfully registered for the event!')
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadTicket = () => {
    if (!qrCodeImage || !registrationData) {
      toast.error('Ticket data not available')
      return
    }
    
    // Use the stored form data for the attendee name
    const attendeeName = {
      firstName: form.getValues('firstName'),
      lastName: form.getValues('lastName')
    }
    
    downloadTicketAsImage(qrCodeImage, event, registrationData, attendeeName)
  }

  const handleClose = () => {
    setCurrentStep(1)
    setRegistrationData(null)
    setQrCodeImage('')
    form.reset()
    onClose()
  }

  const { watch, register, setValue, formState: { errors } } = form

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="h-9 text-sm"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="h-9 text-sm"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-9 h-9 text-sm"
                  {...register('email')}
                />
              </div>
              <p className="text-xs text-gray-500">
                We&apos;ll send your registration confirmation and QR code here
              </p>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-9 h-9 text-sm"
                  {...register('phone')}
                />
              </div>
              <p className="text-xs text-gray-500">
                For event updates and emergencies
              </p>
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="organization" className="text-xs">Organization/Company</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  id="organization"
                  placeholder="Acme Corp (Optional)"
                  className="pl-9 h-9 text-sm"
                  {...register('organization')}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="dietaryRequirements" className="text-xs">Dietary Requirements</Label>
              <Textarea
                id="dietaryRequirements"
                placeholder="e.g., Vegetarian, Vegan, Gluten-free, Allergies..."
                className="min-h-[60px] text-sm"
                {...register('dietaryRequirements')}
              />
              <p className="text-xs text-gray-500">
                Let us know if you have any dietary restrictions
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="specialRequirements" className="text-xs">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                placeholder="e.g., Wheelchair access, Sign language interpreter..."
                className="min-h-[60px] text-sm"
                {...register('specialRequirements')}
              />
              <p className="text-xs text-gray-500">
                Any accessibility needs or special accommodations?
              </p>
            </div>
            
            {event.price > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs">Number of Tickets</Label>
                <Select
                  value={watch('quantity').toString()}
                  onValueChange={(value) => setValue('quantity', parseInt(value, 10))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(5, availableSpots) }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Ticket' : 'Tickets'} - ${(event.price * num).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Registration Summary
              </h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-medium text-right">{event.title}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {watch('firstName')} {watch('lastName')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{watch('email')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{watch('phone')}</span>
                </div>
                
                {watch('organization') && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Organization:</span>
                    <span className="font-medium">{watch('organization')}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                {event.price > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tickets:</span>
                      <span className="font-medium">{watch('quantity')}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">
                        ${(event.price * watch('quantity')).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={watch('termsAccepted')}
                  onCheckedChange={(checked) => setValue('termsAccepted', !!checked)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I accept the terms and conditions *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    By registering, you agree to our event policies
                  </p>
                  {errors.termsAccepted && (
                    <p className="text-xs text-red-500">{errors.termsAccepted.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={watch('marketingEmails')}
                  onCheckedChange={(checked) => setValue('marketingEmails', !!checked)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5 leading-none">
                  <label
                    htmlFor="marketing"
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Send me updates about future events
                  </label>
                  <p className="text-xs text-muted-foreground">
                    You can unsubscribe at any time
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 rounded-lg p-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Your information is secure and will not be shared</span>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            {/* Success Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold mb-1">Registration Successful!</h3>
              <p className="text-sm text-gray-600">
                You have successfully registered for {event.title}
              </p>
            </div>

            {/* QR Code Ticket */}
            {qrCodeImage && registrationData && (
              <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm">Your Event Ticket</h4>
                </div>
                
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  {/* QR Code */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="p-3 bg-white rounded-lg border-2 border-gray-200">
                      <img 
                        src={qrCodeImage} 
                        alt="Event QR Code" 
                        className="w-32 h-32"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Ticket #{registrationData.ticketNumber || registrationData.id.slice(-8)}
                    </p>
                  </div>

                  {/* Event Info */}
                  <div className="space-y-1.5 text-xs border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Event:</span>
                      <span className="font-medium text-right">{event.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {format(new Date(event.startDate), 'PP')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {format(new Date(event.startDate), 'p')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-right">{event.location}</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Important:</strong> Save this QR code for event check-in
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleDownloadTicket}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={!qrCodeImage}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download Ticket
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                size="sm"
                className="flex-1"
              >
                <Ticket className="w-3.5 h-3.5 mr-1.5" />
                Close
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Confirmation email sent to {watch('email')}
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        {currentStep <= 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Register for Event</DialogTitle>
              <DialogDescription className="text-xs">
                Complete your registration for {event.title}
              </DialogDescription>
            </DialogHeader>

            <div className="mb-4">
              <Progress value={progressPercentage} className="h-1.5 mb-3" />
              <div className="flex justify-between">
                {STEPS.map((step) => {
                  const Icon = step.icon
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "flex flex-col items-center gap-1",
                        currentStep >= step.id ? "text-primary" : "text-gray-400"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                          currentStep >= step.id
                            ? "bg-primary border-primary text-white"
                            : "bg-white border-gray-300"
                        )}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-xs font-medium hidden sm:block">
                        {step.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {renderStepContent()}

          {currentStep <= 3 && (
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={currentStep === 1 ? handleClose : handleBack}
                disabled={isProcessing}
              >
                {currentStep === 1 ? 'Cancel' : (
                  <>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Back
                  </>
                )}
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  disabled={isProcessing}
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing || !watch('termsAccepted')}
                  className="min-w-[120px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Complete
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}