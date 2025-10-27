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

// Define SidebarContent component
const SidebarContent = ({ 
  navigation, 
  pathname 
}: { 
  navigation: NavigationItem[]
  pathname: string 
}) => {
  return (
    <nav className="mt-8 px-4 space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-colors',
                isActive
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-gray-600'
              )}
            />
            <span className="font-medium">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// Loading component
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">Loading...</p>
      </div>
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarContent 
                navigation={filteredNavigation} 
                pathname={pathname} 
              />
            </div>
            
            {/* Sidebar Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {currentUser?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {currentUser?.role?.toLowerCase() || 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-64">
          <div className="py-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {filteredNavigation.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}