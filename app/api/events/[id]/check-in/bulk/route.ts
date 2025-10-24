// app/api/events/[id]/check-in/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { Prisma } from '@prisma/client'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Define metadata type
interface RegistrationMetadata {
  checkInNotes?: string
  undoReason?: string
  checkInHistory?: Array<{
    action: string
    timestamp: string
    userId: string
    userName?: string
    notes?: string
    reason?: string
  }>
  [key: string]: unknown
}

// Define result types
interface CheckInSuccessResult {
  id: string
  success: true
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    imageUrl: string | null
  }
}

interface CheckInAlreadyCheckedInResult {
  id: string
  success: false
  error: string
  alreadyCheckedIn: true
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    imageUrl: string | null
  }
}

interface CheckInErrorResult {
  id: string
  success: false
  error: string
  alreadyCheckedIn?: false
}

type CheckInResult = CheckInSuccessResult | CheckInAlreadyCheckedInResult | CheckInErrorResult

// POST /api/events/[id]/check-in/bulk - Bulk check-in
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getOrCreateUser()
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check event and permissions
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to perform bulk check-ins' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { registrationIds, notes } = body

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json(
        { error: 'Registration IDs array is required' },
        { status: 400 }
      )
    }

    // Perform bulk check-in
    const results = await Promise.allSettled(
      registrationIds.map(async (regId: string): Promise<CheckInResult> => {
        try {
          // Verify registration belongs to this event
          const registration = await prisma.registration.findFirst({
            where: {
              id: regId,
              eventId: eventId,
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  imageUrl: true,
                }
              }
            }
          })

          if (!registration) {
            return {
              id: regId,
              success: false,
              error: 'Registration not found or not for this event'
            }
          }

          if (registration.checkedIn) {
            return {
              id: regId,
              success: false,
              error: 'Already checked in',
              alreadyCheckedIn: true,
              user: registration.user
            }
          }

          // Prepare metadata
          const existingMetadata = (registration.metadata || {}) as RegistrationMetadata
          const updatedMetadata = {
            ...existingMetadata,
            checkInNotes: notes || existingMetadata.checkInNotes,
            checkInHistory: [
              ...(existingMetadata.checkInHistory || []),
              {
                action: 'BULK_CHECK_IN',
                timestamp: new Date().toISOString(),
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`,
                notes
              }
            ]
          }

          // Update registration
          await prisma.registration.update({
            where: { id: regId },
            data: {
              checkedIn: true,
              checkedInAt: new Date(),
              checkedInBy: user.id,
              metadata: updatedMetadata as Prisma.InputJsonValue,
            }
          })

          return {
            id: regId,
            success: true,
            user: registration.user
          }
        } catch (error) {
          return {
            id: regId,
            success: false,
            error: 'Failed to process check-in'
          }
        }
      })
    )

    // Process results
    const processed = results.map((result, index): CheckInResult => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          id: registrationIds[index],
          success: false,
          error: result.reason?.message || 'Unknown error'
        }
      }
    })

    const successful = processed.filter(r => r.success).length
    const failed = processed.filter(r => !r.success).length
    const alreadyCheckedIn = processed.filter(r => 
      !r.success && r.alreadyCheckedIn === true
    ).length

    return NextResponse.json({
      success: true,
      summary: {
        total: registrationIds.length,
        successful,
        failed,
        alreadyCheckedIn,
      },
      results: processed,
      message: `Bulk check-in completed: ${successful} successful, ${failed} failed`
    })

  } catch (error) {
    console.error('Bulk check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk check-in' },
      { status: 500 }
    )
  }
}