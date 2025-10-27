'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { EventForm } from '@/components/events/event-form'
import Navbar from '@/components/layout/navbar'
import { useCurrentUser } from '@/hooks/use-user'
import { toast } from 'sonner'

export default function CreateEventPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const { data: currentUser, isLoading } = useCurrentUser()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      toast.error('Please sign in to create events')
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (currentUser && currentUser.role === 'ATTENDEE') {
      toast.error('You need to be an organizer to create events')
      router.push('/events')
    }
  }, [currentUser, router])

  if (!isLoaded || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <EventForm />
    </>
  )
}