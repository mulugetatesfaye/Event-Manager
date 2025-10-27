// components/layout/navbar.tsx
'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Calendar, 
  Menu, 
  X, 
  LayoutDashboard, 
  Plus,
  ChevronDown,
  User,
  Settings,
  BarChart3,
  FolderOpen,
  Search,
  LogIn,
  UserPlus
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/use-user'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { isSignedIn } = useUser()
  const { data: currentUser } = useCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change - FIXED
  useEffect(() => {
    // Only update state if menu is actually open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const isActive = (path: string) => pathname === path

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200",
          scrolled ? "shadow-sm border-b border-gray-200" : "border-b border-gray-200"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link 
                href="/" 
                className="flex items-center gap-2.5 group"
              >
                <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  EventHub
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                <Link 
                  href="/events" 
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive('/events')
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  Browse Events
                </Link>

                {isSignedIn && (
                  <>
                    <Link 
                      href="/dashboard" 
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2",
                        isActive('/dashboard')
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    {currentUser && currentUser.role !== 'ATTENDEE' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all inline-flex items-center gap-1.5 group">
                            My Events
                            <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuLabel className="text-xs text-gray-500">
                            Event Management
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/my-events" className="cursor-pointer">
                              <FolderOpen className="w-4 h-4 mr-2 text-gray-400" />
                              All Events
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/analytics" className="cursor-pointer">
                              <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                              Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/events/create" className="cursor-pointer text-blue-600 font-medium">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Event
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <Link 
                      href="/dashboard/registrations" 
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive('/dashboard/registrations')
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      Registrations
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {isSignedIn ? (
                <>
                  {/* Role Badge */}
                  {currentUser && (
                    <Badge 
                      variant="outline" 
                      className="capitalize font-medium text-xs border-gray-300"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full mr-1.5",
                        currentUser.role === 'ADMIN' ? 'bg-red-500' :
                        currentUser.role === 'ORGANIZER' ? 'bg-blue-600' :
                        'bg-green-500'
                      )} />
                      {currentUser.role.toLowerCase()}
                    </Badge>
                  )}

                  {/* Create Event Button */}
                  {currentUser && currentUser.role !== 'ATTENDEE' && (
                    <Button 
                      asChild 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      <Link href="/events/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </Link>
                    </Button>
                  )}

                  {/* User Profile */}
                  <div className="flex items-center ml-1">
                    <div className="w-9 h-9 rounded-full ring-2 ring-gray-100 hover:ring-gray-200 transition-all">
                      <UserButton 
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: "w-9 h-9",
                            userButtonPopoverCard: "shadow-lg",
                            userButtonPopoverFooter: "hidden"
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm" 
                    className="font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Link href="/sign-in">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Link href="/sign-up">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div className={cn(
        "fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 lg:hidden transition-all duration-300 transform",
        mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-6 space-y-1">
            {/* Browse Events */}
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive('/events')
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-gray-600" />
              </div>
              <span>Browse Events</span>
            </Link>

            {isSignedIn && (
              <>
                {/* Dashboard */}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive('/dashboard')
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Dashboard</span>
                </Link>

                {/* Registrations */}
                <Link
                  href="/dashboard/registrations"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive('/dashboard/registrations')
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>My Registrations</span>
                </Link>

                {/* Organizer/Admin Only */}
                {currentUser && currentUser.role !== 'ATTENDEE' && (
                  <>
                    {/* My Events */}
                    <Link
                      href="/dashboard/my-events"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive('/dashboard/my-events')
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>My Events</span>
                    </Link>

                    {/* Analytics */}
                    <Link
                      href="/dashboard/analytics"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive('/dashboard/analytics')
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>Analytics</span>
                    </Link>

                    {/* Create Event - Highlighted */}
                    <Link
                      href="/events/create"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
                    >
                      <div className="h-9 w-9 bg-white/20 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <span>Create Event</span>
                    </Link>
                  </>
                )}

                {/* Settings */}
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Settings</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Auth Section */}
          {!isSignedIn && (
            <div className="px-4 py-6 border-t border-gray-200 bg-gray-50">
              <div className="space-y-3">
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full justify-center border-gray-300"
                >
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button 
                  asChild 
                  className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Mobile User Info */}
          {isSignedIn && currentUser && (
            <div className="px-4 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="capitalize text-xs mt-1 border-gray-300"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full mr-1.5",
                        currentUser.role === 'ADMIN' ? 'bg-red-500' :
                        currentUser.role === 'ORGANIZER' ? 'bg-blue-600' :
                        'bg-green-500'
                      )} />
                      {currentUser.role.toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full ring-2 ring-gray-200">
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content jump */}
      <div className="h-16" />
    </>
  )
}