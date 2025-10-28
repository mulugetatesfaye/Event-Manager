// components/events/registration-modal.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import NextImage from 'next/image'
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
  Minus,
  Plus,
  Clock,
  Info,
  AlertCircle,
  Tag,
  X,
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

interface TicketSelectionRequest {
  ticketTypeId: string
  quantity: number
}

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

const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  termsAccepted: z.boolean(),
  marketingEmails: z.boolean(),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

const STEPS_WITH_TICKETS = [
  { id: 1, name: 'Select Tickets', icon: Ticket },
  { id: 2, name: 'Your Information', icon: User },
  { id: 3, name: 'Review & Confirm', icon: CheckCircle2 },
]

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

    ctx.fillStyle = '#2563EB'
    ctx.fillRect(0, 0, canvas.width, 80)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('EVENT TICKET', canvas.width / 2, 50)

    ctx.fillStyle = '#000000'
    ctx.font = 'bold 18px Arial'
    const eventTitle = event.title.length > 30 ? event.title.substring(0, 30) + '...' : event.title
    ctx.fillText(eventTitle, canvas.width / 2, 120)

    const img = new window.Image()
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
  const hasTicketTypes = !!(event.ticketTypes && event.ticketTypes.length > 0)
  const steps = hasTicketTypes ? STEPS_WITH_TICKETS : SIMPLE_STEPS
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [registrationData, setRegistrationData] = useState<RegistrationWithRelations | null>(null)
  const [qrCodeImage, setQrCodeImage] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState(false)
  const queryClient = useQueryClient()
  
  const [ticketSelections, setTicketSelections] = useState<Map<string, number>>(new Map())
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<ValidatedPromoCode | null>(null)
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)

  // Track if modal is open to prevent showing success after close
  const isModalOpenRef = useRef(isOpen)

  // Update ref when modal open state changes
  useEffect(() => {
    isModalOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (!hasTicketTypes && ticketSelections.size === 0) {
      setTicketSelections(new Map([['simple', 1]]))
    }
  }, [hasTicketTypes, ticketSelections.size])

  const availableTickets = hasTicketTypes ? (event.ticketTypes || []).filter(t => t.status === 'ACTIVE') : []

  const calculateTotals = () => {
    let subtotal = 0
    let totalTickets = 0

    if (hasTicketTypes) {
      ticketSelections.forEach((quantity, ticketTypeId) => {
        const ticket = availableTickets.find(t => t.id === ticketTypeId)
        if (ticket) {
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
      const requestBody: RegistrationRequestBody = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        termsAccepted: data.termsAccepted,
        marketingEmails: data.marketingEmails,
      }

      if (hasTicketTypes) {
        const ticketSelectionsArray: TicketSelectionRequest[] = Array.from(ticketSelections.entries())
          .filter(([_, quantity]) => quantity > 0)
          .map(([ticketTypeId, quantity]) => ({
            ticketTypeId,
            quantity
          }))

        requestBody.ticketSelections = ticketSelectionsArray
      } else {
        requestBody.quantity = ticketSelections.get('simple') || 1
      }

      if (appliedPromo?.code) {
        requestBody.promoCode = appliedPromo.code
      }

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
      // Only invalidate queries if modal is still open
      if (isModalOpenRef.current) {
        queryClient.invalidateQueries({ queryKey: ['event', event.id] })
        queryClient.invalidateQueries({ queryKey: ['registrations'] })
        queryClient.invalidateQueries({ queryKey: ['user-registrations'] })
      }
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
    if (registrationData && isSuccess && isModalOpenRef.current) {
      const qrContent = generateUserFriendlyQRContent(registrationData, event)
      
      QRCode.toDataURL(qrContent, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then(setQrCodeImage)
      .catch(console.error)
    }
  }, [registrationData, isSuccess, event])

  const handleNext = async () => {
    if (hasTicketTypes && currentStep === 1) {
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

    if (hasTicketTypes && totals.totalTickets === 0) {
      toast.error('Please select at least one ticket')
      return
    }

    try {
      setIsProcessing(true)
      
      const response = await registerMutation.mutateAsync(data)
      
      // Only show success if modal is still open
      if (isModalOpenRef.current) {
        setRegistrationData(response.registration)
        setIsSuccess(true)
        toast.success('Successfully registered for the event!')
      }
      
    } catch (error) {
      // Only show error if modal is still open
      if (isModalOpenRef.current) {
        toast.error(error instanceof Error ? error.message : 'Failed to register. Please try again.')
      }
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
    
    const ticketTypeNames = registrationData.ticketPurchases?.map(
      purchase => (purchase.ticketType as { name?: string }).name || ''
    ).filter(Boolean) || []
    
    downloadTicketAsImage(qrCodeImage, event, registrationData, attendeeName, {
      ticketTypes: ticketTypeNames,
      quantity: totals.totalTickets
    })
  }

  const handleClose = () => {
    // If currently processing, don't allow close
    if (isProcessing) {
      return
    }

    // Reset all state completely
    setCurrentStep(1)
    setIsSuccess(false)
    setRegistrationData(null)
    setQrCodeImage('')
    setTicketSelections(new Map())
    setPromoCode('')
    setAppliedPromo(null)
    setIsProcessing(false)
    form.reset()
    onClose()
  }

  const { watch, register, setValue, formState: { errors } } = form

  const renderStepContent = () => {
    if (isSuccess && registrationData) {
      return (
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
            <p className="text-sm text-gray-600">
              You&apos;re all set for {event.title}
            </p>
          </div>

          {qrCodeImage && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-col items-center mb-6">
                  <div className="p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                    <NextImage 
                      src={qrCodeImage} 
                      alt="Event QR Code" 
                      width={192}
                      height={192}
                      className="w-48 h-48"
                      unoptimized={true}
                      priority={true}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">Ticket Number</p>
                    <p className="text-sm font-bold text-gray-900">
                      #{registrationData.ticketNumber || registrationData.id.slice(-8)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-gray-600">Event</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{event.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(event.startDate), 'PPP')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time</span>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(event.startDate), 'p')}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-gray-600">Location</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{event.location}</span>
                  </div>
                  {totals.total > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Amount Paid</span>
                      <span className="text-base font-bold text-blue-600">
                        ${totals.total.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Important Information</p>
                    <p className="text-blue-800">
                      Save or screenshot this QR code. You&apos;ll need it for event check-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              onClick={handleDownloadTicket}
              variant="outline"
              className="flex-1 h-11"
              disabled={!qrCodeImage}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
            >
              Done
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 pt-2">
            A confirmation email has been sent to <span className="font-medium text-gray-700">{watch('email')}</span>
          </p>
        </div>
      )
    }

    if (hasTicketTypes && currentStep === 1) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Ticket className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Select Your Tickets</p>
                <p className="text-xs text-blue-800">Choose the ticket types and quantities you&apos;d like to purchase</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {availableTickets.length > 0 ? (
              availableTickets.map((ticket) => {
                const now = new Date()
                const isEarlyBird = ticket.earlyBirdEndDate 
                  ? new Date(ticket.earlyBirdEndDate) > now
                  : false
                
                const currentPrice = isEarlyBird && ticket.earlyBirdPrice 
                  ? ticket.earlyBirdPrice 
                  : ticket.price

                const available = ticket.quantity - (ticket.quantitySold || 0)
                const isSoldOut = available <= 0
                const isSelected = (ticketSelections.get(ticket.id) || 0) > 0

                return (
                  <div
                    key={ticket.id}
                    className={cn(
                      "border-2 rounded-xl p-5 transition-all",
                      isSoldOut
                        ? "bg-gray-50 opacity-60 cursor-not-allowed border-gray-200" 
                        : isSelected
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-base text-gray-900">{ticket.name}</h4>
                          {isEarlyBird && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Early Bird
                            </Badge>
                          )}
                          {isSoldOut && (
                            <Badge variant="destructive">
                              Sold Out
                            </Badge>
                          )}
                        </div>

                        {ticket.description && (
                          <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                        )}

                        <div className="flex items-center gap-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-gray-900">
                              ${currentPrice.toFixed(2)}
                            </span>
                            {isEarlyBird && ticket.price !== currentPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                ${ticket.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="text-sm text-gray-600">
                            {available} available
                          </span>
                        </div>
                      </div>
                      
                      {!isSoldOut && (
                        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-gray-100"
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
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-10 text-center font-semibold text-base">
                            {ticketSelections.get(ticket.id) || 0}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-gray-100"
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
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-medium text-gray-900 mb-1">No tickets available</p>
                <p className="text-sm">Please check back later</p>
              </div>
            )}
          </div>

          {availableTickets.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <Label htmlFor="promoCode" className="text-sm font-medium mb-3 block">
                Have a promo code?
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="promoCode"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="pl-10 h-10"
                    disabled={!!appliedPromo}
                  />
                </div>
                {!appliedPromo ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={validatePromoCode}
                    disabled={!promoCode || isValidatingPromo}
                    className="h-10 px-6"
                  >
                    {isValidatingPromo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setAppliedPromo(null)
                      setPromoCode('')
                    }}
                    className="h-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {appliedPromo && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {appliedPromo.type === 'PERCENTAGE' 
                    ? `${appliedPromo.discountValue}% discount applied`
                    : `$${appliedPromo.discountValue} discount applied`}
                </p>
              )}
            </div>
          )}

          {totals.totalTickets > 0 && (
            <div className="bg-gray-900 text-white rounded-xl p-5">
              <h4 className="font-semibold text-base mb-4">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({totals.totalTickets} {totals.totalTickets === 1 ? 'ticket' : 'tickets'})</span>
                  <span className="font-medium text-white">${totals.subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && totals.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedPromo.code})</span>
                    <span className="font-medium">-${totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-3 bg-gray-700" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    const adjustedStep = hasTicketTypes ? currentStep - 1 : currentStep

    switch (adjustedStep) {
      case 1:
        return (
          <div className="space-y-6">
            {!hasTicketTypes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-2">Event Details</p>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p>Price: {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}</p>
                      {event.price > 0 && (
                        <div className="mt-3">
                          <Label htmlFor="simpleQuantity" className="text-sm font-medium text-blue-900 mb-2 block">
                            Number of tickets
                          </Label>
                          <div className="flex items-center gap-3 bg-white rounded-lg border border-blue-200 p-1 w-fit">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={() => {
                                const current = ticketSelections.get('simple') || 1
                                if (current > 1) {
                                  const newSelections = new Map(ticketSelections)
                                  newSelections.set('simple', current - 1)
                                  setTicketSelections(newSelections)
                                }
                              }}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center font-semibold">
                              {ticketSelections.get('simple') || 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={() => {
                                const current = ticketSelections.get('simple') || 1
                                if (current < 10) {
                                  const newSelections = new Map(ticketSelections)
                                  newSelections.set('simple', current + 1)
                                  setTicketSelections(newSelections)
                                }
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm font-medium text-blue-900 mt-2">
                            Total: ${(event.price * (ticketSelections.get('simple') || 1)).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="h-10"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="h-10"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10 h-10"
                  {...register('email')}
                />
              </div>
              <p className="text-xs text-gray-500">
                Confirmation and QR code will be sent here
              </p>
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10 h-10"
                  {...register('phone')}
                />
              </div>
              <p className="text-xs text-gray-500">
                For event updates and emergencies
              </p>
              {errors.phone && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-base text-gray-900">Registration Summary</h4>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Event</span>
                  <span className="font-medium text-gray-900 text-right">{event.title}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium text-gray-900">
                    {watch('firstName')} {watch('lastName')}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{watch('email')}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium text-gray-900">{watch('phone')}</span>
                </div>
                
                <Separator className="my-3" />
                
                {hasTicketTypes ? (
                  <>
                    <div className="space-y-2">
                      {getSelectedTicketTypes().map((ticket) => (
                        <div key={ticket.id} className="flex justify-between py-1">
                          <span className="text-gray-600">
                            {ticket.name} ×{ticket.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
                            ${(ticket.price * ticket.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {appliedPromo && totals.discount > 0 && (
                      <div className="flex justify-between py-1 text-green-600">
                        <span>Discount ({appliedPromo.code})</span>
                        <span className="font-medium">-${totals.discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-300">
                      <span className="text-gray-900">Total Amount</span>
                      <span className="text-blue-600">
                        ${totals.total.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Tickets</span>
                      <span className="font-medium text-gray-900">{ticketSelections.get('simple') || 1}</span>
                    </div>
                    
                    <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-300">
                      <span className="text-gray-900">Total Amount</span>
                      <span className="text-blue-600">
                        {event.price === 0 ? 'Free' : `$${(event.price * (ticketSelections.get('simple') || 1)).toFixed(2)}`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="terms"
                  checked={watch('termsAccepted')}
                  onCheckedChange={(checked) => setValue('termsAccepted', !!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium text-gray-900 cursor-pointer block mb-1"
                  >
                    I accept the terms and conditions <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-600">
                    By registering, you agree to our event policies and guidelines
                  </p>
                  {errors.termsAccepted && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.termsAccepted.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="marketing"
                  checked={watch('marketingEmails')}
                  onCheckedChange={(checked) => setValue('marketingEmails', !!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="marketing"
                    className="text-sm font-medium text-gray-900 cursor-pointer block mb-1"
                  >
                    Keep me updated about future events
                  </label>
                  <p className="text-xs text-gray-600">
                    Receive notifications about similar events (you can unsubscribe anytime)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-800">
                Your information is encrypted and will not be shared with third parties
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
        onPointerDownOutside={(e) => {
          // Prevent closing if currently processing
          if (isProcessing) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing if currently processing
          if (isProcessing) {
            e.preventDefault()
          }
        }}
      >
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {isSuccess ? 'Registration Complete' : 'Event Registration'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {isSuccess 
                ? 'Your ticket is ready!' 
                : `Register for ${event.title}`}
            </DialogDescription>
          </DialogHeader>

          {!isSuccess && currentStep <= steps.length && (
            <div className="mt-6">
              <Progress value={progressPercentage} className="h-2 mb-4" />
              <div className="flex justify-between">
                {steps.map((step) => {
                  const Icon = step.icon
                  const isActive = currentStep >= step.id
                  const isComplete = currentStep > step.id
                  
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "flex flex-col items-center gap-2 flex-1",
                        isActive ? "text-blue-600" : "text-gray-400"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                          isActive
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-gray-300 text-gray-400"
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-center hidden sm:block">
                        {step.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
            {renderStepContent()}

            {!isSuccess && currentStep <= steps.length && (
              <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 1 ? handleClose : handleBack}
                  disabled={isProcessing}
                  className="h-11 px-6"
                >
                  {currentStep === 1 ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </>
                  )}
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isProcessing || (hasTicketTypes && currentStep === 1 && totals.totalTickets === 0)}
                    className="h-11 px-8 bg-blue-600 hover:bg-blue-700"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isProcessing || !watch('termsAccepted')}
                    className="h-11 px-8 bg-blue-600 hover:bg-blue-700 min-w-[160px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete Registration
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}