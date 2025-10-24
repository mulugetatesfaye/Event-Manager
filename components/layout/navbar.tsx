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
  Sparkles,
  User,
  Settings,
  BarChart3,
  FolderOpen,
  Search,
  ArrowRight,
  Zap,
  Globe,
  Users,
  TrendingUp
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
      const isScrolled = window.scrollY > 10
      setScrolled(isScrolled)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false)
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

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled 
            ? "bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm" 
            : "bg-white/90 backdrop-blur-sm border-b border-gray-100"
        )}
      >
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
            backgroundSize: '1rem 1rem'
          }}
        />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex h-12 md:h-14 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-6 md:gap-8">
              <Link 
                href="/" 
                className="flex items-center space-x-2 group"
                onClick={handleLinkClick}
              >
                <div className="relative">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Calendar className="h-4 w-4 md:h-4.5 md:w-4.5 text-white" />
                  </div>
                  <Sparkles className="h-2.5 w-2.5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="text-base md:text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  EventHub
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-0.5">
                <Link 
                  href="/events" 
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all relative group",
                    isActive('/events')
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  )}
                >
                  <span className="relative">
                    Browse Events
                    {isActive('/events') && (
                      <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full" />
                    )}
                  </span>
                </Link>

                {isSignedIn && (
                  <>
                    <Link 
                      href="/dashboard" 
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all inline-flex items-center gap-1.5 relative group",
                        isActive('/dashboard')
                          ? "text-primary bg-primary/10"
                          : "text-gray-600 hover:text-primary hover:bg-gray-50"
                      )}
                    >
                      <LayoutDashboard className="w-3 h-3" />
                      <span className="relative">
                        Dashboard
                        {isActive('/dashboard') && (
                          <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full" />
                        )}
                      </span>
                    </Link>

                    {currentUser && currentUser.role !== 'ATTENDEE' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-all inline-flex items-center gap-1 group">
                            My Events
                            <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44 backdrop-blur-sm bg-white/95 border-gray-200/50">
                          <DropdownMenuLabel className="text-[10px] text-gray-500 font-medium">
                            EVENT MANAGEMENT
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-100" />
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/my-events" className="cursor-pointer text-xs group">
                              <FolderOpen className="w-3 h-3 mr-2 text-gray-400 group-hover:text-primary transition-colors" />
                              All Events
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/analytics" className="cursor-pointer text-xs group">
                              <BarChart3 className="w-3 h-3 mr-2 text-gray-400 group-hover:text-primary transition-colors" />
                              Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-100" />
                          <DropdownMenuItem asChild>
                            <Link href="/events/create" className="cursor-pointer text-primary text-xs font-medium group">
                              <div className="w-3 h-3 mr-2 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                                <Plus className="w-2 h-2 text-white" />
                              </div>
                              Create Event
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <Link 
                      href="/dashboard/registrations" 
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all relative",
                        isActive('/dashboard/registrations')
                          ? "text-primary bg-primary/10"
                          : "text-gray-600 hover:text-primary hover:bg-gray-50"
                      )}
                    >
                      <span className="relative">
                        Registrations
                        {isActive('/dashboard/registrations') && (
                          <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full" />
                        )}
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {isSignedIn ? (
                <>
                  {/* Role Badge */}
                  {currentUser && (
                    <Badge 
                      variant="outline" 
                      className="capitalize font-medium px-2 py-0.5 text-[10px] h-5 backdrop-blur-sm bg-white/50 border-gray-200/50"
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mr-1.5",
                        currentUser.role === 'ADMIN' ? 'bg-red-500' :
                        currentUser.role === 'ORGANIZER' ? 'bg-blue-500' :
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
                      className="h-7 text-xs px-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden"
                    >
                      <Link href="/events/create">
                        {/* Shimmer effect */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Plus className="w-3 h-3 mr-1.5 relative" />
                        <span className="relative">Create Event</span>
                      </Link>
                    </Button>
                  )}

                  {/* User Profile */}
                  <div className="flex items-center ml-2">
                    <div className="w-8 h-8 rounded-full ring-2 ring-gray-100 hover:ring-primary/20 transition-all">
                      <UserButton 
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8",
                            userButtonPopoverCard: "shadow-lg border backdrop-blur-sm bg-white/95",
                            userButtonPopoverActionButton: "text-xs",
                            userButtonPopoverActionButtonText: "text-xs",
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
                    className="font-medium h-7 text-xs px-3 text-gray-600 hover:text-primary"
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button 
                    asChild 
                    size="sm" 
                    className="h-7 text-xs px-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group relative overflow-hidden"
                  >
                    <Link href="/sign-up">
                      {/* Shimmer effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative">Get Started</span>
                      <Sparkles className="w-3 h-3 ml-1.5 relative group-hover:rotate-12 transition-transform" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:text-primary hover:bg-gray-50 transition-all"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
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
        "fixed top-12 md:top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 lg:hidden transition-all duration-300 transform",
        mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)',
            backgroundSize: '1rem 1rem'
          }}
        />
        
        <div className="relative">
          <div className="px-4 pt-3 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <Link
              href="/events"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                isActive('/events')
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              )}
            >
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-md flex items-center justify-center mr-2.5 group-hover:from-blue-500 group-hover:to-blue-600 transition-all">
                <Search className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
              </div>
              Browse Events
            </Link>

            {isSignedIn && (
              <>
                <Link
                  href="/dashboard"
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                    isActive('/dashboard')
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  )}
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-md flex items-center justify-center mr-2.5 group-hover:from-primary group-hover:to-purple-600 transition-all">
                    <LayoutDashboard className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                  </div>
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/registrations"
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                    isActive('/dashboard/registrations')
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  )}
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-md flex items-center justify-center mr-2.5 group-hover:from-purple-500 group-hover:to-pink-600 transition-all">
                    <FolderOpen className="w-3.5 h-3.5 text-purple-600 group-hover:text-white" />
                  </div>
                  My Registrations
                </Link>

                {currentUser && currentUser.role !== 'ATTENDEE' && (
                  <>
                    <Link
                      href="/dashboard/my-events"
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                        isActive('/dashboard/my-events')
                          ? "text-primary bg-primary/10"
                          : "text-gray-600 hover:text-primary hover:bg-gray-50"
                      )}
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-md flex items-center justify-center mr-2.5 group-hover:from-green-500 group-hover:to-green-600 transition-all">
                        <Calendar className="w-3.5 h-3.5 text-green-600 group-hover:text-white" />
                      </div>
                      My Events
                    </Link>

                    <Link
                      href="/events/create"
                      onClick={handleLinkClick}
                      className="flex items-center px-3 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg transition-all group"
                    >
                      <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center mr-2.5">
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </div>
                      Create Event
                      <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </>
                )}

                <Link
                  href="/dashboard/settings"
                  onClick={handleLinkClick}
                  className="flex items-center px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-all group"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center mr-2.5 group-hover:from-gray-500 group-hover:to-gray-600 transition-all">
                    <Settings className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
                  </div>
                  Settings
                </Link>
              </>
            )}
          </div>

          {!isSignedIn && (
            <div className="px-4 py-3 border-t bg-gradient-to-b from-gray-50/50 to-white">
              <div className="space-y-2">
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full justify-start h-8 text-xs border-gray-300"
                >
                  <Link href="/sign-in" onClick={handleLinkClick}>
                    <User className="w-3.5 h-3.5 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button 
                  asChild 
                  className="w-full justify-start h-8 text-xs shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <Link href="/sign-up" onClick={handleLinkClick}>
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    Get Started Free
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {isSignedIn && (
            <div className="px-4 py-3 border-t bg-gradient-to-b from-gray-50/50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    {currentUser && (
                      <Badge 
                        variant="outline" 
                        className="capitalize text-[10px] mt-0.5 h-4 px-1.5 border-gray-200"
                      >
                        <div className={cn(
                          "w-1 h-1 rounded-full mr-1",
                          currentUser.role === 'ADMIN' ? 'bg-red-500' :
                          currentUser.role === 'ORGANIZER' ? 'bg-blue-500' :
                          'bg-green-500'
                        )} />
                        {currentUser.role.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </div>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}