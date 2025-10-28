'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Navbar from '@/components/layout/navbar'
import { useCurrentUser } from '@/hooks/use-user'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  BarChart3,
  FolderOpen,
  Tag,
  UserCheck,
  Shield,
} from 'lucide-react'

// Define navigation item type
type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  badge?: string
  section?: 'overview' | 'events' | 'admin' | 'settings'
}

// Define SidebarContent component
const SidebarContent = ({ 
  navigation, 
  pathname,
  userRole 
}: { 
  navigation: NavigationItem[]
  pathname: string 
  userRole?: string
}) => {
  // Group navigation by section
  const overviewItems = navigation.filter(item => item.section === 'overview')
  const eventItems = navigation.filter(item => item.section === 'events')
  const adminItems = navigation.filter(item => item.section === 'admin')
  const settingsItems = navigation.filter(item => item.section === 'settings')

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    const isAdminItem = item.roles.includes('ADMIN') && item.roles.length === 1

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          'group flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : isAdminItem
            ? 'text-gray-600 hover:bg-red-50 hover:text-red-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={cn(
              'h-5 w-5 transition-colors flex-shrink-0',
              isActive
                ? 'text-white'
                : isAdminItem
                ? 'text-red-400 group-hover:text-red-600'
                : 'text-gray-400 group-hover:text-gray-600'
            )}
          />
          <span className="font-medium">{item.name}</span>
        </div>
        {item.badge && (
          <Badge 
            variant={isActive ? "secondary" : "outline"} 
            className={cn(
              "text-xs",
              isActive && "bg-white/20 text-white border-white/30"
            )}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    )
  }

  const renderSection = (title: string, items: NavigationItem[]) => {
    if (items.length === 0) return null
    
    const isAdminSection = title === 'Admin Tools'
    
    return (
      <div key={title} className="mb-6">
        <div className={cn(
          "px-4 mb-2 flex items-center gap-2",
          isAdminSection && "pt-4 border-t border-gray-200"
        )}>
          {isAdminSection && <Shield className="w-3.5 h-3.5 text-red-500" />}
          <h3 className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            isAdminSection ? "text-red-600" : "text-gray-500"
          )}>
            {title}
          </h3>
        </div>
        <div className="space-y-1">
          {items.map(renderNavItem)}
        </div>
      </div>
    )
  }

  return (
    <nav className="mt-8 px-4">
      {renderSection('Overview', overviewItems)}
      {renderSection('Events', eventItems)}
      {renderSection('Admin Tools', adminItems)}
      {renderSection('Account', settingsItems)}
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
    // Overview Section
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'ORGANIZER', 'ATTENDEE'],
      section: 'overview',
    },
    
    // Events Section
    {
      name: 'My Events',
      href: '/dashboard/my-events',
      icon: Calendar,
      roles: ['ORGANIZER', 'ADMIN'],
      section: 'events',
    },
    {
      name: 'Registrations',
      href: '/dashboard/registrations',
      icon: FolderOpen,
      roles: ['ATTENDEE', 'ORGANIZER', 'ADMIN'],
      section: 'events',
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      roles: ['ORGANIZER', 'ADMIN'],
      section: 'events',
    },
    {
      name: 'Check-ins',
      href: '/dashboard/check-ins',
      icon: UserCheck,
      roles: ['ORGANIZER', 'ADMIN'],
      section: 'events',
    },
    
    // Admin Section
    {
      name: 'Users',
      href: '/dashboard/users',
      icon: Users,
      roles: ['ADMIN'],
      section: 'admin',
    },
    {
      name: 'Categories',
      href: '/dashboard/categories',
      icon: Tag,
      roles: ['ADMIN'],
      section: 'admin',
    },
    
    // Settings Section
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['ADMIN', 'ORGANIZER', 'ATTENDEE'],
      section: 'settings',
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
                userRole={currentUser?.role}
              />
            </div>
            
            {/* Sidebar Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  currentUser?.role === 'ADMIN' ? 'bg-red-600' :
                  currentUser?.role === 'ORGANIZER' ? 'bg-blue-600' :
                  'bg-green-600'
                )}>
                  {currentUser?.role === 'ADMIN' ? (
                    <Shield className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {currentUser?.firstName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "capitalize text-xs mt-1 border-0",
                      currentUser?.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-700'
                        : currentUser?.role === 'ORGANIZER'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    )}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1.5",
                      currentUser?.role === 'ADMIN' ? 'bg-red-500' :
                      currentUser?.role === 'ORGANIZER' ? 'bg-blue-600' :
                      'bg-green-500'
                    )} />
                    {currentUser?.role?.toLowerCase() || 'user'}
                  </Badge>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {filteredNavigation
            .filter(item => 
              // For mobile, prioritize most important items
              item.section === 'overview' || 
              (item.section === 'events' && (item.name === 'My Events' || item.name === 'Registrations')) ||
              (item.section === 'admin' && currentUser?.role === 'ADMIN' && item.name === 'Users') ||
              item.section === 'settings'
            )
            .slice(0, 5)
            .map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isAdminItem = item.section === 'admin'
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative',
                    isActive
                      ? isAdminItem
                        ? 'text-red-600'
                        : 'text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  {isAdminItem && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium truncate max-w-[60px]">
                    {item.name}
                  </span>
                </Link>
              )
            })}
        </div>
      </div>
    </div>
  )
}