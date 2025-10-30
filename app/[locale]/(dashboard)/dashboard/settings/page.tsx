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
  Award,
  Lock,
  Settings as SettingsIcon,
  Bell,
  Eye,
  Globe,
  Clock,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Permission Item Component
function PermissionItem({ icon: Icon, text }: { icon: ComponentType<SVGProps<SVGSVGElement>>, text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-600">
      <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
      <span>{text}</span>
    </li>
  )
}

// Role Icon Component
function RoleIconDisplay({ role }: { role: string }) {
  switch (role) {
    case 'ADMIN':
      return <Shield className="w-6 h-6 text-blue-600" />
    case 'ORGANIZER':
      return <Award className="w-6 h-6 text-blue-600" />
    case 'ATTENDEE':
      return <UserIcon className="w-6 h-6 text-blue-600" />
    default:
      return <UserIcon className="w-6 h-6 text-blue-600" />
  }
}

// Helper function for role badge color
function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'ADMIN':
      return 'destructive'
    case 'ORGANIZER':
      return 'default'
    case 'ATTENDEE':
      return 'secondary'
    default:
      return 'secondary'
  }
}

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Settings
          </h1>
          <p className="text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <FadeIn direction="up" delay={100}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle className="text-base font-semibold">Profile Information</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Your profile is managed by Clerk authentication
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full ring-2 ring-gray-200 overflow-hidden">
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: 'w-16 h-16'
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                  <Badge 
                    variant="outline" 
                    className="mt-2 text-xs border-gray-300"
                  >
                    <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                    Verified Account
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-700 font-medium">First Name</Label>
                    <Input 
                      value={user?.firstName || ''} 
                      disabled 
                      className="mt-2 bg-gray-50 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-700 font-medium">Last Name</Label>
                    <Input 
                      value={user?.lastName || ''} 
                      disabled 
                      className="mt-2 bg-gray-50 border-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 font-medium">Email Address</Label>
                  <Input 
                    value={user?.email || ''} 
                    disabled 
                    className="mt-2 bg-gray-50 border-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  To update your profile information, click on your avatar above
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Account Role */}
        <FadeIn direction="up" delay={150}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle className="text-base font-semibold">Account Role</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Your current role and permissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
                  <RoleIconDisplay role={user?.role || 'ATTENDEE'} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-600 mb-2">Current Role</p>
                  <Badge 
                    variant={getRoleBadgeVariant(user?.role || 'ATTENDEE')}
                    className="text-sm"
                  >
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="font-semibold text-sm text-gray-900">Role Permissions:</p>
                <ul className="space-y-2">
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
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      Want to create events?
                    </p>
                    <p className="text-sm text-blue-700">
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
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-base font-semibold">Account Details</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Information about your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Account Created
                </Label>
                <p className="font-semibold text-base text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Last Updated
                </Label>
                <p className="font-semibold text-base text-gray-900">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Account Status
                </Label>
                <Badge variant="default" className="text-sm bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Active
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  Email Status
                </Label>
                <Badge variant="default" className="text-sm bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Verified
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Preferences */}
      <FadeIn direction="up" delay={250}>
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-base font-semibold">Preferences</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Customize your experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-600 mt-0.5">Receive event updates via email</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Enabled
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Profile Visibility</p>
                    <p className="text-xs text-gray-600 mt-0.5">Control who can see your profile</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Language</p>
                    <p className="text-xs text-gray-600 mt-0.5">Choose your preferred language</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  English
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Danger Zone */}
      <FadeIn direction="up" delay={300}>
        <Card className="border-2 border-red-200 hover:shadow-lg transition-shadow duration-200 bg-red-50">
          <CardHeader className="border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <CardTitle className="text-base font-semibold text-red-600">Danger Zone</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Irreversible and destructive actions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-2 border-red-200 rounded-lg bg-white">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-red-600">Delete Account</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Permanently delete your account and all data
                    </p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  disabled
                  className="w-full sm:w-auto disabled:opacity-50"
                >
                  Delete Account
                </Button>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-orange-800">
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