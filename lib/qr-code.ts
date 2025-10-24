// lib/qr-code.ts
import QRCode from 'qrcode'
import { createHash } from 'crypto'

export interface QRCodeData {
  registrationId: string
  eventId: string
  userId: string
  ticketNumber: string
  quantity: number
  timestamp: number
}

export function generateQRData(data: Omit<QRCodeData, 'timestamp'>): string {
  const qrData: QRCodeData = {
    ...data,
    timestamp: Date.now()
  }
  
  // Create a hash for security
  const hash = createHash('sha256')
    .update(JSON.stringify(qrData) + (process.env.QR_SECRET_KEY || 'default-secret-key'))
    .digest('hex')
  
  return JSON.stringify({ ...qrData, hash })
}

export function verifyQRData(qrDataString: string): QRCodeData | null {
  try {
    const data = JSON.parse(qrDataString)
    const { hash, ...qrData } = data
    
    // Verify hash
    const expectedHash = createHash('sha256')
      .update(JSON.stringify(qrData) + (process.env.QR_SECRET_KEY || 'default-secret-key'))
      .digest('hex')
    
    if (hash !== expectedHash) {
      return null
    }
    
    return qrData
  } catch {
    return null
  }
}

export async function generateQRCodeImage(data: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('QR code generation error:', error)
    throw new Error('Failed to generate QR code')
  }
}