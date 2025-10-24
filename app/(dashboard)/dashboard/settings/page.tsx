'use client'

import type { ComponentType, SVGProps } from 'react'
import { useCurrentUser } from '@/hooks/use-user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FadeIn } from '@/components/ui/fade-in'
import { UserButton } from '@clerk/nextjs'
import { 
  Shield, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  Award,
  Lock,
  Settings as SettingsIcon,
  Bell,
  Eye,
  Globe,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
// Permission Item Component
function PermissionItem({ icon: Icon, text }: { icon: ComponentType<SVGProps<SVGSVGElement>>, text: string }) {
  return (
    <li className="flex items-center gap-2 text-[10px] text-gray-600">
      <Icon className="w-3 h-3 text-green-600 flex-shrink-0" />
      <span>{text}</span>
    </li>
  )
}


// Role Icon Component
function RoleIconDisplay({ role }: { role: string }) {
  switch (role) {
    case 'ADMIN':
      return <Shield className="w-6 h-6 text-white" />
    case 'ORGANIZER':
      return <Award className="w-6 h-6 text-white" />
    case 'ATTENDEE':
      return <UserIcon className="w-6 h-6 text-white" />
    default:
      return <UserIcon className="w-6 h-6 text-white" />
  }
}

// Helper function for role color
function getRoleColor(role: string) {
  switch (role) {
    case 'ADMIN':
      return 'from-red-500 to-orange-600'
    case 'ORGANIZER':
      return 'from-blue-500 to-blue-600'
    case 'ATTENDEE':
      return 'from-green-500 to-green-600'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-5 pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">
            Manage your account settings and preferences
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile Information */}
        <FadeIn direction="up" delay={100}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-white" />
                </div>
                <CardTitle className="text-sm">Profile Information</CardTitle>
              </div>
              <CardDescription className="text-[10px]">
                Your profile is managed by Clerk authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full ring-2 ring-gray-100 overflow-hidden">
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: 'w-14 h-14'
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                  <Badge 
                    variant="outline" 
                    className="mt-1 text-[10px] h-4 px-1.5"
                  >
                    Verified Account
                  </Badge>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] text-gray-600 font-medium">First Name</Label>
                    <Input 
                      value={user?.firstName || ''} 
                      disabled 
                      className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-600 font-medium">Last Name</Label>
                    <Input 
                      value={user?.lastName || ''} 
                      disabled 
                      className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-gray-600 font-medium">Email Address</Label>
                  <Input 
                    value={user?.email || ''} 
                    disabled 
                    className="h-8 text-xs mt-1 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-blue-800">
                  To update your profile, click on your avatar above
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Account Role */}
        <FadeIn direction="up" delay={150}>
          <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
            <CardHeader className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <CardTitle className="text-sm">Account Role</CardTitle>
              </div>
              <CardDescription className="text-[10px]">
                Your current role and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-sm",
                  getRoleColor(user?.role || 'ATTENDEE')
                )}>
                  <RoleIconDisplay role={user?.role || 'ATTENDEE'} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-xs text-gray-600 mb-0.5">Current Role</p>
                  <Badge 
                    variant={user?.role === 'ADMIN' ? 'default' : 'secondary'}
                    className="text-xs h-5 px-2"
                  >
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div className="space-y-2">
                <p className="font-semibold text-xs text-gray-900">Role Permissions:</p>
                <ul className="space-y-1.5">
                  {user?.role === 'ADMIN' && (
                    <>
                      <PermissionItem icon={CheckCircle} text="Full access to all features" />
                      <PermissionItem icon={CheckCircle} text="Manage users and permissions" />
                      <PermissionItem icon={CheckCircle} text="Manage categories and settings" />
                      <PermissionItem icon={CheckCircle} text="Create and manage events" />
                      <PermissionItem icon={CheckCircle} text="View analytics and reports" />
                    </>
                  )}
                  {user?.role === 'ORGANIZER' && (
                    <>
                      <PermissionItem icon={CheckCircle} text="Create and manage events" />
                      <PermissionItem icon={CheckCircle} text="View event analytics" />
                      <PermissionItem icon={CheckCircle} text="Manage event registrations" />
                      <PermissionItem icon={CheckCircle} text="Register for other events" />
                    </>
                  )}
                  {user?.role === 'ATTENDEE' && (
                    <>
                      <PermissionItem icon={CheckCircle} text="Browse and search events" />
                      <PermissionItem icon={CheckCircle} text="Register for events" />
                      <PermissionItem icon={CheckCircle} text="View your registrations" />
                    </>
                  )}
                </ul>
              </div>

              {user?.role === 'ATTENDEE' && (
                <div className="flex items-start gap-2 p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-blue-800 font-medium mb-0.5">
                      Want to create events?
                    </p>
                    <p className="text-[10px] text-blue-700">
                      Contact an administrator to upgrade to Organizer
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Account Details */}
      <FadeIn direction="up" delay={200}>
        <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
          <CardHeader className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded flex items-center justify-center">
                <Calendar className="w-3 h-3 text-white" />
              </div>
              <CardTitle className="text-sm">Account Details</CardTitle>
            </div>
            <CardDescription className="text-[10px]">
              Information about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  Account Created
                </Label>
                <p className="font-semibold text-xs text-gray-900 tabular-nums">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              
              <div className="space-y-1">
                <Label className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  Last Updated
                </Label>
                <p className="font-semibold text-xs text-gray-900 tabular-nums">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  Account Status
                </Label>
                <Badge variant="default" className="text-[10px] h-5 px-2">
                  <CheckCircle className="w-2.5 h-2.5 mr-1" />
                  Active
                </Badge>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5" />
                  Email Status
                </Label>
                <Badge variant="default" className="text-[10px] h-5 px-2">
                  <CheckCircle className="w-2.5 h-2.5 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Preferences */}
      <FadeIn direction="up" delay={250}>
        <Card className="border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-white/50">
          <CardHeader className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded flex items-center justify-center">
                <SettingsIcon className="w-3 h-3 text-white" />
              </div>
              <CardTitle className="text-sm">Preferences</CardTitle>
            </div>
            <CardDescription className="text-[10px]">
              Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200/50 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-xs text-gray-900">Email Notifications</p>
                    <p className="text-[10px] text-gray-600">Receive event updates via email</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 px-2">
                  Enabled
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200/50 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                    <Eye className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-xs text-gray-900">Profile Visibility</p>
                    <p className="text-[10px] text-gray-600">Control who can see your profile</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 px-2">
                  Public
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200/50 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Globe className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-xs text-gray-900">Language</p>
                    <p className="text-[10px] text-gray-600">Choose your preferred language</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 px-2">
                  English
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Danger Zone */}
      <FadeIn direction="up" delay={300}>
        <Card className="border border-red-200/50 hover:border-red-300/50 hover:shadow-lg transition-all backdrop-blur-sm bg-red-50/30">
          <CardHeader className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
              <CardTitle className="text-sm text-red-600">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-[10px]">
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-red-200 rounded-lg bg-white/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-xs text-red-600">Delete Account</p>
                    <p className="text-[10px] text-gray-600">
                      Permanently delete your account and all data
                    </p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  disabled
                  size="sm"
                  className="h-7 text-xs px-3 w-full sm:w-auto"
                >
                  Delete Account
                </Button>
              </div>
              
              <div className="flex items-start gap-2 p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-orange-800">
                  Account deletion is currently disabled. Please contact support if you need assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}