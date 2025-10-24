// app/api/check-in/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { verifyQRData } from '@/lib/qr-code'
import { getOrCreateUser } from '@/lib/get-or-create-user'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getOrCreateUser()

    // Only organizers and admins can check in attendees
    if (user?.role === 'ATTENDEE') {
      return NextResponse.json(
        { error: 'You do not have permission to check in attendees' },
        { status: 403 }
      )
    }

    const { qrData } = await req.json()

    if (!qrData) {
      return NextResponse.json(
        { error: 'QR code data is required' },
        { status: 400 }
      )
    }

    // Verify QR code
    const verified = verifyQRData(qrData)
    
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 400 }
      )
    }

    // Find registration
    const registration = await prisma.registration.findUnique({
      where: { id: verified.registrationId },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Check if user is organizer of this event
    if (registration.event.organizerId !== user?.id && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You are not the organizer of this event' },
        { status: 403 }
      )
    }

    // Check if already checked in
    if (registration.checkedIn) {
      return NextResponse.json(
        {
          alreadyCheckedIn: true,
          registration,
          checkedInAt: registration.checkedInAt,
          message: 'Already checked in'
        },
        { status: 200 }
      )
    }

    // Perform check-in
    const updatedRegistration = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: user?.id,
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Check-in successful'
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    )
  }
}