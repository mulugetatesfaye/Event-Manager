// components/registration/qr-code-ticket.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RegistrationWithRelations } from '@/types'
import { format } from 'date-fns'
import { 
  Calendar, 
  MapPin, 
  User, 
  Download,
  CheckCircle,
  Clock,
  Ticket
} from 'lucide-react'
import { generateQRCodeImage } from '@/lib/qr-code'

interface QRCodeTicketProps {
  registration: RegistrationWithRelations
}

export function QRCodeTicket({ registration }: QRCodeTicketProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (registration.qrCode) {
      generateQRCodeImage(registration.qrCode)
        .then(setQrCodeImage)
        .finally(() => setLoading(false))
    }
  }, [registration.qrCode])

  const downloadTicket = () => {
    if (!qrCodeImage) return
    
    const link = document.createElement('a')
    link.download = `ticket-${registration.ticketNumber}.png`
    link.href = qrCodeImage
    link.click()
  }

  return (
    <Card className="border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-base">Your Event Ticket</CardTitle>
          </div>
          {registration.checkedIn && (
            <Badge className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Checked In
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          Show this QR code at the event entrance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex flex-col items-center">
          {loading ? (
            <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
          ) : qrCodeImage ? (
            <div className="relative p-4 bg-white rounded-lg border-2 border-gray-200">
              <img 
                src={qrCodeImage} 
                alt="Event QR Code" 
                className="w-56 h-56"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-sm text-gray-500">QR Code not available</p>
            </div>
          )}
          
          <p className="text-xs text-gray-600 mt-3">
            Ticket #{registration.ticketNumber}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold text-sm text-gray-900">
            {registration.event?.title}
          </h4>
          
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {registration.event && format(new Date(registration.event.startDate), 'PPP')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {registration.event && format(new Date(registration.event.startDate), 'p')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{registration.event?.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>{registration.user?.firstName} {registration.user?.lastName}</span>
            </div>
          </div>
        </div>

        {/* Check-in Status */}
        {registration.checkedIn && registration.checkedInAt && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>Checked in:</strong> {format(new Date(registration.checkedInAt), 'PPP p')}
            </p>
          </div>
        )}

        {/* Download Button */}
        <Button 
          onClick={downloadTicket}
          variant="outline"
          className="w-full"
          disabled={!qrCodeImage}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Ticket
        </Button>
      </CardContent>
    </Card>
  )
}