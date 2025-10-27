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
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  User,
  Mail,
  Phone,
  Loader2,
  Download,
  Ticket,
  QrCode,
  Minus,
  Plus,
  Clock,
  Info,
  AlertCircle,
} from 'lucide-react'
import { 
  EventWithRelations, 
  User as UserType, 
  RegistrationWithRelations, 
  PromoCodeType 
} from '@/types'
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

// Type for the validated promo code response
interface ValidatedPromoCode {
  id: string
  code: string
  type: PromoCodeType
  discountValue: number
  maxUses: number | null
  usedCount: number
  maxUsesPerUser: number
  validFrom: Date | string | null
  validUntil: Date | string | null
  minPurchaseAmount: number | null
  applicableTicketTypes: string[]
  isActive: boolean
}

// Type for ticket selection in request
interface TicketSelectionRequest {
  ticketTypeId: string
  quantity: number
}

// Type for the registration request body
interface RegistrationRequestBody {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization?: string
  dietaryRequirements?: string
  specialRequirements?: string
  termsAccepted: boolean
  marketingEmails: boolean
  ticketSelections?: TicketSelectionRequest[]
  quantity?: number
  promoCode?: string
}

// Registration schema - removed organization
const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  termsAccepted: z.boolean(),
  marketingEmails: z.boolean(),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

// Steps for events with ticket types
const STEPS_WITH_TICKETS = [
  { id: 1, name: 'Select Tickets', icon: Ticket },
  { id: 2, name: 'Your Information', icon: User },
  { id: 3, name: 'Review & Confirm', icon: CheckCircle2 },
]

// Steps for simple events
const SIMPLE_STEPS = [
  { id: 1, name: 'Your Information', icon: User },
  { id: 2, name: 'Review & Confirm', icon: CheckCircle2 },
]

function generateUserFriendlyQRContent(registration: RegistrationWithRelations, event: EventWithRelations) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'
  return `${baseUrl}/check-in/${registration.id}?event=${event.id}&ticket=${registration.ticketNumber || registration.id}`
}

async function downloadTicketAsImage(
  qrCodeImage: string,
  event: EventWithRelations,
  registration: RegistrationWithRelations,
  attendeeName: { firstName: string; lastName: string },
  ticketDetails?: { ticketTypes?: string[]; quantity?: number }
) {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 400
    canvas.height = 600

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#6366F1'
    ctx.fillRect(0, 0, canvas.width, 80)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('EVENT TICKET', canvas.width / 2, 50)

    ctx.fillStyle = '#000000'
    ctx.font = 'bold 18px Arial'
    const eventTitle = event.title.length > 30 ? event.title.substring(0, 30) + '...' : event.title
    ctx.fillText(eventTitle, canvas.width / 2, 120)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 100, 150, 200, 200)

      ctx.fillStyle = '#666666'
      ctx.font = '14px Arial'
      ctx.fillText(`Ticket #${registration.ticketNumber || registration.id.slice(-8)}`, canvas.width / 2, 380)

      ctx.fillStyle = '#000000'
      ctx.font = '14px Arial'
      ctx.textAlign = 'left'
      
      ctx.fillText(`Date: ${format(new Date(event.startDate), 'PPP')}`, 50, 430)
      ctx.fillText(`Time: ${format(new Date(event.startDate), 'p')}`, 50, 455)
      ctx.fillText(`Location: ${event.location}`, 50, 480)
      ctx.fillText(`Attendee: ${attendeeName.firstName} ${attendeeName.lastName}`, 50, 505)
      
      if (ticketDetails?.ticketTypes && ticketDetails.ticketTypes.length > 0) {
        const ticketTypesStr = ticketDetails.ticketTypes.join(', ')
        ctx.fillText(`Types: ${ticketTypesStr.length > 30 ? ticketTypesStr.substring(0, 30) + '...' : ticketTypesStr}`, 50, 530)
      }

      ctx.fillStyle = '#999999'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Show this ticket at the entrance', canvas.width / 2, 560)

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
  // Check if event has ticket types
  const hasTicketTypes = !!(event.ticketTypes && event.ticketTypes.length > 0)
  const steps = hasTicketTypes ? STEPS_WITH_TICKETS : SIMPLE_STEPS
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [registrationData, setRegistrationData] = useState<RegistrationWithRelations | null>(null)
  const [qrCodeImage, setQrCodeImage] = useState<string>('')
  const queryClient = useQueryClient()
  
  // Ticket selection state
  const [ticketSelections, setTicketSelections] = useState<Map<string, number>>(new Map())
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<ValidatedPromoCode | null>(null)
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)

  // Initialize ticket selection
  useEffect(() => {
    if (!hasTicketTypes && ticketSelections.size === 0) {
      // For simple events without ticket types
      setTicketSelections(new Map([['simple', 1]]))
    }
  }, [hasTicketTypes, ticketSelections.size])

  // Get available ticket types from event
  const availableTickets = hasTicketTypes ? (event.ticketTypes || []).filter(t => t.status === 'ACTIVE') : []

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0
    let totalTickets = 0

    if (hasTicketTypes) {
      ticketSelections.forEach((quantity, ticketTypeId) => {
        const ticket = availableTickets.find(t => t.id === ticketTypeId)
        if (ticket) {
          // Check for early bird pricing
          const now = new Date()
          const isEarlyBird = ticket.earlyBirdEndDate 
            ? new Date(ticket.earlyBirdEndDate) > now
            : false
          
          const price = isEarlyBird && ticket.earlyBirdPrice 
            ? ticket.earlyBirdPrice 
            : ticket.price

          subtotal += price * quantity
          totalTickets += quantity
        }
      })
    } else {
      // Simple ticketing
      const quantity = ticketSelections.get('simple') || 1
      subtotal = event.price * quantity
      totalTickets = quantity
    }

    let discount = 0
    if (appliedPromo) {
      if (appliedPromo.type === 'PERCENTAGE') {
        discount = (subtotal * appliedPromo.discountValue) / 100
      } else {
        discount = Math.min(appliedPromo.discountValue, subtotal)
      }
    }

    return {
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
      totalTickets
    }
  }

  const totals = calculateTotals()

  // Get selected ticket types for summary
  const getSelectedTicketTypes = (): Array<{ id: string; name: string; quantity: number; price: number }> => {
    const selected: Array<{ id: string; name: string; quantity: number; price: number }> = []
    
    if (hasTicketTypes) {
      ticketSelections.forEach((quantity, ticketTypeId) => {
        if (quantity > 0) {
          const ticket = availableTickets.find(t => t.id === ticketTypeId)
          if (ticket) {
            const now = new Date()
            const isEarlyBird = ticket.earlyBirdEndDate 
              ? new Date(ticket.earlyBirdEndDate) > now
              : false
            
            const price = isEarlyBird && ticket.earlyBirdPrice 
              ? ticket.earlyBirdPrice 
              : ticket.price

            selected.push({
              id: ticket.id,
              name: ticket.name,
              quantity,
              price
            })
          }
        }
      })
    }
    
    return selected
  }

  // Validate promo code
  const validatePromoCode = async () => {
    if (!promoCode) return

    setIsValidatingPromo(true)
    try {
      const response = await fetch(`/api/events/${event.id}/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      })

      if (response.ok) {
        const promo: ValidatedPromoCode = await response.json()
        setAppliedPromo(promo)
        toast.success('Promo code applied!')
      } else {
        toast.error('Invalid promo code')
        setPromoCode('')
      }
    } catch (error) {
      toast.error('Failed to validate promo code')
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      // Build the request body
      const requestBody: RegistrationRequestBody = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        termsAccepted: data.termsAccepted,
        marketingEmails: data.marketingEmails,
      }

      if (hasTicketTypes) {
        // For events with ticket types, send ticketSelections
        const ticketSelectionsArray: TicketSelectionRequest[] = Array.from(ticketSelections.entries())
          .filter(([_, quantity]) => quantity > 0)
          .map(([ticketTypeId, quantity]) => ({
            ticketTypeId,
            quantity
          }))

        requestBody.ticketSelections = ticketSelectionsArray
        
        console.log('Sending ticket selections:', ticketSelectionsArray)
      } else {
        // For simple events, send quantity
        requestBody.quantity = ticketSelections.get('simple') || 1
      }

      // Add promo code if applied
      if (appliedPromo?.code) {
        requestBody.promoCode = appliedPromo.code
      }

      console.log('Final registration request:', requestBody)

      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register')
      }

      return result
    },
    onSuccess: () => {
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
      termsAccepted: false,
      marketingEmails: false,
    },
  })

  const progressPercentage = (currentStep / steps.length) * 100

  useEffect(() => {
    const isSuccessStep = hasTicketTypes ? currentStep === 4 : currentStep === 3
    if (registrationData && isSuccessStep) {
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
  }, [registrationData, currentStep, event, hasTicketTypes])

  const handleNext = async () => {
    if (hasTicketTypes && currentStep === 1) {
      // Validate ticket selection
      if (totals.totalTickets === 0) {
        toast.error('Please select at least one ticket')
        return
      }
      setCurrentStep(2)
    } else {
      const adjustedStep = hasTicketTypes ? currentStep - 1 : currentStep

      if (adjustedStep === 1) {
        const fieldsToValidate: (keyof RegistrationFormData)[] = ['firstName', 'lastName', 'email', 'phone']
        const isValid = await form.trigger(fieldsToValidate)
        if (isValid && currentStep < steps.length) {
          setCurrentStep(currentStep + 1)
        }
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: RegistrationFormData) => {
    if (!data.termsAccepted) {
      form.setError('termsAccepted', {
        type: 'manual',
        message: 'You must accept the terms and conditions',
      })
      return
    }

    // Check if tickets are selected for events with ticket types
    if (hasTicketTypes && totals.totalTickets === 0) {
      toast.error('Please select at least one ticket')
      return
    }

    try {
      setIsProcessing(true)
      
      const response = await registerMutation.mutateAsync(data)
      
      setRegistrationData(response.registration)
      setCurrentStep(hasTicketTypes ? 4 : 3) // Success step
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
    
    const attendeeName = {
      firstName: form.getValues('firstName'),
      lastName: form.getValues('lastName')
    }
    
    // Get all selected ticket type names
    const ticketTypeNames = registrationData.ticketPurchases?.map(
      purchase => (purchase.ticketType as { name?: string }).name || ''
    ).filter(Boolean) || []
    
    downloadTicketAsImage(qrCodeImage, event, registrationData, attendeeName, {
      ticketTypes: ticketTypeNames,
      quantity: totals.totalTickets
    })
  }

  const handleClose = () => {
    setCurrentStep(1)
    setRegistrationData(null)
    setQrCodeImage('')
    setTicketSelections(new Map())
    setPromoCode('')
    setAppliedPromo(null)
    form.reset()
    onClose()
  }

  const { watch, register, setValue, formState: { errors } } = form

  const renderStepContent = () => {
    const isSuccessStep = hasTicketTypes ? currentStep === 4 : currentStep === 3
    
    if (isSuccessStep) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold mb-1">Registration Successful!</h3>
            <p className="text-sm text-gray-600">
              You have successfully registered for {event.title}
            </p>
          </div>

          {qrCodeImage && registrationData && (
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">Your Event Ticket</h4>
              </div>
              
              <div className="bg-white rounded-lg p-4 border shadow-sm">
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
                  {totals.total > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-bold text-primary">${totals.total.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Important:</strong> Save this QR code for event check-in
                </p>
              </div>
            </div>
          )}

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
    }

    // Ticket selection step (only for events with ticket types)
    if (hasTicketTypes && currentStep === 1) {
      return (
        <div className="space-y-4">
          {availableTickets.length > 0 ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium">Select Your Tickets</p>
                    <p className="mt-0.5">Choose the ticket type and quantity you want to purchase</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {availableTickets.map((ticket) => {
                  const now = new Date()
                  const isEarlyBird = ticket.earlyBirdEndDate 
                    ? new Date(ticket.earlyBirdEndDate) > now
                    : false
                  
                  const currentPrice = isEarlyBird && ticket.earlyBirdPrice 
                    ? ticket.earlyBirdPrice 
                    : ticket.price

                  const available = ticket.quantity - (ticket.quantitySold || 0)
                  const isSoldOut = available <= 0

                  return (
                    <div
                      key={ticket.id}
                      className={cn(
                        "border rounded-lg p-4 transition-all",
                        isSoldOut
                          ? "bg-gray-50 opacity-60 cursor-not-allowed" 
                          : "hover:border-primary/50 hover:shadow-sm",
                        ticketSelections.get(ticket.id) && ticketSelections.get(ticket.id)! > 0
                          ? "border-primary bg-primary/5"
                          : ""
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{ticket.name}</h4>
                            {isEarlyBird && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                <Clock className="w-3 h-3 mr-1" />
                                Early Bird
                              </Badge>
                            )}
                            {isSoldOut && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                Sold Out
                              </Badge>
                            )}
                          </div>
                          {ticket.description && (
                            <p className="text-xs text-gray-600 mb-2">{ticket.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-bold text-primary">
                              ${currentPrice.toFixed(2)}
                            </span>
                            {isEarlyBird && ticket.price !== currentPrice && (
                              <span className="text-gray-400 line-through">
                                ${ticket.price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-gray-500">
                              • {available} available
                            </span>
                          </div>
                        </div>
                        
                        {!isSoldOut && (
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const current = ticketSelections.get(ticket.id) || 0
                                if (current > 0) {
                                  const newSelections = new Map(ticketSelections)
                                  newSelections.set(ticket.id, current - 1)
                                  setTicketSelections(newSelections)
                                }
                              }}
                              disabled={!ticketSelections.get(ticket.id) || ticketSelections.get(ticket.id) === 0}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm">
                              {ticketSelections.get(ticket.id) || 0}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const current = ticketSelections.get(ticket.id) || 0
                                const maxQuantity = Math.min(ticket.maxQuantity, available)
                                if (current < maxQuantity) {
                                  const newSelections = new Map(ticketSelections)
                                  newSelections.set(ticket.id, current + 1)
                                  setTicketSelections(newSelections)
                                }
                              }}
                              disabled={
                                (ticketSelections.get(ticket.id) || 0) >= Math.min(ticket.maxQuantity, available)
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">No ticket types available</p>
              <p className="text-xs mt-1">Please check back later</p>
            </div>
          )}

          {/* Promo code section */}
          {availableTickets.length > 0 && (
            <div className="border-t pt-4">
              <Label htmlFor="promoCode" className="text-xs mb-2 block">Have a promo code?</Label>
              <div className="flex gap-2">
                <Input
                  id="promoCode"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="h-9 text-sm"
                  disabled={!!appliedPromo}
                />
                {!appliedPromo ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={validatePromoCode}
                    disabled={!promoCode || isValidatingPromo}
                    className="h-9"
                  >
                    {isValidatingPromo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppliedPromo(null)
                      setPromoCode('')
                    }}
                    className="h-9"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {appliedPromo && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {appliedPromo.type === 'PERCENTAGE' 
                    ? `${appliedPromo.discountValue}% discount applied`
                    : `$${appliedPromo.discountValue} discount applied`}
                </p>
              )}
            </div>
          )}

          {/* Order summary */}
          {totals.totalTickets > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-sm">Order Summary</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totals.totalTickets} {totals.totalTickets === 1 ? 'ticket' : 'tickets'})</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between font-bold text-sm">
                  <span>Total</span>
                  <span className="text-primary">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Adjust step numbers for non-ticketed events
    const adjustedStep = hasTicketTypes ? currentStep - 1 : currentStep

    switch (adjustedStep) {
      case 1: // Your Information step
        return (
          <div className="space-y-4">
            {!hasTicketTypes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Event Registration</p>
                    <p>Price: {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}</p>
                    {event.price > 0 && (
                      <div className="mt-2">
                        <Label htmlFor="simpleQuantity" className="text-xs">Number of tickets:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              const current = ticketSelections.get('simple') || 1
                              if (current > 1) {
                                const newSelections = new Map(ticketSelections)
                                newSelections.set('simple', current - 1)
                                setTicketSelections(newSelections)
                              }
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium text-sm">
                            {ticketSelections.get('simple') || 1}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              const current = ticketSelections.get('simple') || 1
                              if (current < 10) {
                                const newSelections = new Map(ticketSelections)
                                newSelections.set('simple', current + 1)
                                setTicketSelections(newSelections)
                              }
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs text-gray-600 ml-2">
                            Total: ${(event.price * (ticketSelections.get('simple') || 1)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
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

      case 2: // Review & Confirm step
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
                
                <Separator className="my-2" />
                
                {hasTicketTypes ? (
                  <>
                    <div className="space-y-1">
                      {getSelectedTicketTypes().map((ticket) => (
                        <div key={ticket.id} className="flex justify-between">
                          <span className="text-gray-600">
                            {ticket.name} x{ticket.quantity}
                          </span>
                          <span className="font-medium">
                            ${(ticket.price * ticket.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {appliedPromo && totals.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedPromo.code})</span>
                        <span>-${totals.discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">
                        ${totals.total.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tickets:</span>
                      <span className="font-medium">{ticketSelections.get('simple') || 1}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">
                        {event.price === 0 ? 'Free' : `$${(event.price * (ticketSelections.get('simple') || 1)).toFixed(2)}`}
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

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        {currentStep <= steps.length && (
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
                {steps.map((step) => {
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

          {currentStep <= steps.length && (
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

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  disabled={isProcessing || (hasTicketTypes && currentStep === 1 && totals.totalTickets === 0)}
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
                      Complete Registration
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