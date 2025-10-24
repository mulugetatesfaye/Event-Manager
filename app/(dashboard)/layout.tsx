'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Navbar from '@/components/layout/navbar'
import { useCurrentUser } from '@/hooks/use-user'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  BarChart3,
  FolderOpen,
  UserCog,
  UserCheck,
} from 'lucide-react'

// Define navigation item type
type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

// Define SidebarContent component outside of the main component
const SidebarContent = ({ 
  navigation, 
  pathname 
}: { 
  navigation: NavigationItem[]
  pathname: string 
}) => {
  return (
    <nav className="mt-5 px-2">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1',
              pathname === item.href
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon
              className={cn(
                'mr-3 h-5 w-5',
                pathname === item.href
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

// Loading component
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

// Main dashboard layout component
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { data: currentUser } = useCurrentUser()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'ORGANIZER', 'ATTENDEE'],
    },
    {
      name: 'My Events',
      href: '/dashboard/my-events',
      icon: Calendar,
      roles: ['ORGANIZER', 'ADMIN'],
    },
    {
      name: 'Registrations',
      href: '/dashboard/registrations',
      icon: FolderOpen,
      roles: ['ATTENDEE', 'ORGANIZER', 'ADMIN'],
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      roles: ['ORGANIZER', 'ADMIN'],
    },
    {
      name: 'Users',
      href: '/dashboard/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      name: 'Categories',
      href: '/dashboard/categories',
      icon: UserCog,
      roles: ['ADMIN'],
    },
    {
      name: 'Check-ins',
      href: '/dashboard/check-ins',
      icon: UserCheck,
      roles: ['ORGANIZER', 'ADMIN'],
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['ADMIN', 'ORGANIZER', 'ATTENDEE'],
    },
  ]

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(currentUser?.role || 'ATTENDEE')
  )

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-md min-h-screen">
            <SidebarContent 
              navigation={filteredNavigation} 
              pathname={pathname} 
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}