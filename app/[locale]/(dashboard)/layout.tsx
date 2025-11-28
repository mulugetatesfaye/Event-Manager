// app/[locale]/(dashboard)/layout.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/navbar";
import { useCurrentUser } from "@/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/app/i18n/routing";
import { Locale } from "@/app/i18n/config";
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
  ChevronLeft,
  ChevronRight,
  Plus,
  HelpCircle,
  Menu,
  X,
  Home,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type UserRole = "ADMIN" | "ORGANIZER" | "ATTENDEE";

interface CurrentUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  role: UserRole;
}

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
  badgeColor?: "default" | "success" | "warning" | "destructive";
  section?: "overview" | "events" | "admin" | "settings";
  description?: string;
};

interface SidebarContentProps {
  navigation: NavigationItem[];
  pathname: string;
  userRole?: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  pathname: string;
  userRole?: UserRole;
  currentUser: CurrentUser | null | undefined;
}

// ============================================================================
// SIDEBAR CONTENT COMPONENT
// ============================================================================

const SidebarContent = ({
  navigation,
  pathname,
  userRole,
  isCollapsed = false,
}: SidebarContentProps) => {
  const t = useTranslations("dashboard.sections");
  const tNav = useTranslations("nav");

  // Group navigation by section
  const overviewItems = navigation.filter(
    (item) => item.section === "overview"
  );
  const eventItems = navigation.filter((item) => item.section === "events");
  const adminItems = navigation.filter((item) => item.section === "admin");
  const settingsItems = navigation.filter(
    (item) => item.section === "settings"
  );

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    const isAdminItem = item.roles.includes("ADMIN") && item.roles.length === 1;

    const navLink = (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center justify-between gap-3 text-sm font-medium rounded-xl transition-all duration-200",
          isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
          isActive
            ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
            : isAdminItem
            ? "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5 transition-colors flex-shrink-0",
              isActive
                ? "text-white"
                : isAdminItem
                ? "text-purple-500 group-hover:text-purple-600"
                : "text-slate-400 group-hover:text-slate-600"
            )}
          />
          {!isCollapsed && <span className="font-medium">{item.name}</span>}
        </div>
        {!isCollapsed && item.badge && (
          <Badge
            variant={isActive ? "secondary" : "outline"}
            className={cn(
              "text-[10px] font-semibold",
              isActive && "bg-white/20 text-white border-white/30",
              !isActive &&
                item.badgeColor === "success" &&
                "bg-emerald-100 text-emerald-700 border-emerald-200",
              !isActive &&
                item.badgeColor === "warning" &&
                "bg-amber-100 text-amber-700 border-amber-200",
              !isActive &&
                item.badgeColor === "destructive" &&
                "bg-red-100 text-red-700 border-red-200"
            )}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.name} delayDuration={0}>
          <TooltipTrigger asChild>{navLink}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.name}
            {item.badge && (
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {item.badge}
              </Badge>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.name}>{navLink}</div>;
  };

  const renderSection = (
    title: string,
    items: NavigationItem[],
    isAdmin = false
  ) => {
    if (items.length === 0) return null;

    return (
      <div key={title} className="mb-6">
        {!isCollapsed && (
          <div
            className={cn(
              "px-4 mb-2 flex items-center gap-2",
              isAdmin && "pt-4 border-t border-slate-200"
            )}
          >
            {isAdmin && <Shield className="w-3.5 h-3.5 text-purple-500" />}
            <h3
              className={cn(
                "text-xs font-bold uppercase tracking-wider",
                isAdmin ? "text-purple-600" : "text-slate-400"
              )}
            >
              {title}
            </h3>
          </div>
        )}
        {isCollapsed && isAdmin && (
          <Separator className="my-4 mx-3 bg-slate-200" />
        )}
        <div className="space-y-1 px-3">{items.map(renderNavItem)}</div>
      </div>
    );
  };

  return (
    <nav className={cn("mt-6", isCollapsed ? "px-2" : "px-3")}>
      {/* Quick Actions */}
      {!isCollapsed && userRole !== "ATTENDEE" && (
        <div className="px-3 mb-6">
          <Button
            asChild
            className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 font-semibold h-11"
          >
            <Link href="/events/create">
              <Plus className="w-4 h-4 mr-2" />
              {tNav("createEvent")}
            </Link>
          </Button>
        </div>
      )}

      {isCollapsed && userRole !== "ATTENDEE" && (
        <div className="px-2 mb-6">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="icon"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20"
              >
                <Link href="/events/create">
                  <Plus className="w-5 h-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {tNav("createEvent")}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {renderSection(t("overview"), overviewItems)}
      {renderSection(t("events"), eventItems)}
      {renderSection(t("adminTools"), adminItems, true)}
      {renderSection(t("account"), settingsItems)}
    </nav>
  );
};

// ============================================================================
// LOADING COMPONENT
// ============================================================================

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Skeleton Navbar */}
      <div className="h-16 bg-white border-b border-slate-200" />

      <div className="flex">
        {/* Skeleton Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-slate-200">
          <div className="flex-1 p-4 space-y-4">
            <Skeleton className="h-11 w-full rounded-xl" />
            <div className="space-y-2 mt-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </aside>

        {/* Skeleton Main Content */}
        <main className="flex-1 lg:pl-64 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl mt-6" />
          </div>
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// MOBILE SIDEBAR
// ============================================================================

const MobileSidebar = ({
  isOpen,
  onClose,
  navigation,
  pathname,
  userRole,
  currentUser,
}: MobileSidebarProps) => {
  const tNav = useTranslations("nav");
  const tRoles = useTranslations("roles");

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">AddisVibe</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        {currentUser && (
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-slate-200">
                <AvatarImage src={currentUser.imageUrl || undefined} />
                <AvatarFallback
                  className={cn(
                    "font-semibold text-white",
                    currentUser.role === "ADMIN"
                      ? "bg-purple-600"
                      : currentUser.role === "ORGANIZER"
                      ? "bg-orange-600"
                      : "bg-emerald-600"
                  )}
                >
                  {currentUser.firstName?.charAt(0)}
                  {currentUser.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize text-xs mt-1 font-medium",
                    currentUser.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700 border-purple-200"
                      : currentUser.role === "ORGANIZER"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-emerald-100 text-emerald-700 border-emerald-200"
                  )}
                >
                  {tRoles(currentUser.role?.toLowerCase() || "attendee")}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action */}
        {userRole !== "ATTENDEE" && (
          <div className="p-4 border-b border-slate-200">
            <Button
              asChild
              className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 font-semibold h-11"
              onClick={onClose}
            >
              <Link href="/events/create">
                <Plus className="w-4 h-4 mr-2" />
                {tNav("createEvent")}
              </Link>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4">
          <SidebarContent
            navigation={navigation}
            pathname={pathname}
            userRole={userRole}
          />
        </nav>

        {/* Footer Links */}
        <div className="p-4 border-t border-slate-200 mt-auto">
          <div className="space-y-1">
            <Link
              href="/events"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Home className="w-5 h-5 text-slate-400" />
              Browse Events
            </Link>
            <Link
              href="/help"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              Help & Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// MAIN DASHBOARD LAYOUT
// ============================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as Locale) || "am";
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const tNav = useTranslations("nav");
  const tRoles = useTranslations("roles");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Track previous pathname to detect route changes
  const prevPathnameRef = useRef(pathname);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/${locale}/sign-in`);
    }
  }, [isLoaded, isSignedIn, router, locale]);

  // Close mobile sidebar on route change - Fixed version
  useEffect(() => {
    // Only close sidebar if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      // Use a microtask to avoid synchronous setState in effect
      queueMicrotask(() => {
        setIsMobileSidebarOpen(false);
      });
    }
  }, [pathname]);

  // Typed user role
  const userRole = (currentUser?.role as UserRole) || "ATTENDEE";

  // Navigation items
  const navigation: NavigationItem[] = [
    // Overview Section
    {
      name: tNav("dashboard"),
      href: `/dashboard`,
      icon: LayoutDashboard,
      roles: ["ADMIN", "ORGANIZER", "ATTENDEE"],
      section: "overview",
      description: "Overview of your activity",
    },

    // Events Section
    {
      name: tNav("myEvents"),
      href: `/dashboard/my-events`,
      icon: Calendar,
      roles: ["ORGANIZER", "ADMIN"],
      section: "events",
      description: "Events you organize",
    },
    {
      name: tNav("registrations"),
      href: `/dashboard/registrations`,
      icon: FolderOpen,
      roles: ["ATTENDEE", "ORGANIZER", "ADMIN"],
      section: "events",
      description: "Your event registrations",
    },
    {
      name: tNav("analytics"),
      href: `/dashboard/analytics`,
      icon: BarChart3,
      roles: ["ORGANIZER", "ADMIN"],
      section: "events",
      description: "Event performance metrics",
    },
    {
      name: tNav("checkIns"),
      href: `/dashboard/check-ins`,
      icon: UserCheck,
      roles: ["ORGANIZER", "ADMIN"],
      section: "events",
      description: "Manage attendee check-ins",
    },

    // Admin Section
    {
      name: tNav("manageUsers"),
      href: `/dashboard/users`,
      icon: Users,
      roles: ["ADMIN"],
      section: "admin",
      description: "User management",
    },
    {
      name: tNav("categories"),
      href: `/dashboard/categories`,
      icon: Tag,
      roles: ["ADMIN"],
      section: "admin",
      description: "Event categories",
    },

    // Settings Section
    {
      name: tNav("settings"),
      href: `/dashboard/settings`,
      icon: Settings,
      roles: ["ADMIN", "ORGANIZER", "ATTENDEE"],
      section: "settings",
      description: "Account settings",
    },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  // Handle mobile sidebar close
  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Handle mobile sidebar toggle
  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  // Show loading state
  if (!isLoaded || isUserLoading) {
    return <DashboardSkeleton />;
  }

  // Show nothing if not signed in (will redirect)
  if (!isSignedIn) {
    return <DashboardSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside
            className={cn(
              "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-slate-200 transition-all duration-300 z-20",
              isSidebarCollapsed ? "lg:w-20" : "lg:w-64"
            )}
          >
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Collapse Toggle */}
              <div
                className={cn(
                  "flex items-center p-3 border-b border-slate-100",
                  isSidebarCollapsed ? "justify-center" : "justify-end"
                )}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100"
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-2">
                <SidebarContent
                  navigation={filteredNavigation}
                  pathname={pathname}
                  userRole={userRole}
                  isCollapsed={isSidebarCollapsed}
                />
              </div>

              {/* Sidebar Footer - User Info */}
              <div className="flex-shrink-0 border-t border-slate-200 p-4">
                {isSidebarCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">
                        <Avatar className="h-10 w-10 border-2 border-slate-200">
                          <AvatarImage
                            src={currentUser?.imageUrl || undefined}
                          />
                          <AvatarFallback
                            className={cn(
                              "font-semibold text-white text-sm",
                              currentUser?.role === "ADMIN"
                                ? "bg-purple-600"
                                : currentUser?.role === "ORGANIZER"
                                ? "bg-orange-600"
                                : "bg-emerald-600"
                            )}
                          >
                            {currentUser?.firstName?.charAt(0)}
                            {currentUser?.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="p-3">
                      <p className="font-semibold">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {currentUser?.role?.toLowerCase()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl">
                    <Avatar className="h-10 w-10 border-2 border-slate-200 shrink-0">
                      <AvatarImage src={currentUser?.imageUrl || undefined} />
                      <AvatarFallback
                        className={cn(
                          "font-semibold text-white text-sm",
                          currentUser?.role === "ADMIN"
                            ? "bg-purple-600"
                            : currentUser?.role === "ORGANIZER"
                            ? "bg-orange-600"
                            : "bg-emerald-600"
                        )}
                      >
                        {currentUser?.firstName?.charAt(0)}
                        {currentUser?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-[10px] mt-1 font-semibold border-0",
                          currentUser?.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : currentUser?.role === "ORGANIZER"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full mr-1.5",
                            currentUser?.role === "ADMIN"
                              ? "bg-purple-500"
                              : currentUser?.role === "ORGANIZER"
                              ? "bg-orange-600"
                              : "bg-emerald-500"
                          )}
                        />
                        {tRoles(currentUser?.role?.toLowerCase() || "attendee")}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main
            className={cn(
              "flex-1 transition-all duration-300",
              isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
            )}
          >
            {/* Page Content */}
            <div className="py-6 lg:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto pb-24 lg:pb-8">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-lg safe-area-bottom">
          <div className="flex items-center justify-around py-2 px-2">
            {filteredNavigation
              .filter(
                (item) =>
                  item.section === "overview" ||
                  (item.section === "events" &&
                    item.name === tNav("registrations")) ||
                  (item.section === "events" &&
                    item.name === tNav("myEvents")) ||
                  item.section === "settings"
              )
              .slice(0, 4)
              .map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative min-w-[64px]",
                      isActive
                        ? "text-orange-600"
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {isActive && (
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-600 rounded-full" />
                    )}
                    <Icon
                      className={cn("h-5 w-5", isActive && "text-orange-600")}
                    />
                    <span className="text-[10px] font-semibold truncate max-w-[56px]">
                      {item.name.split(" ")[0]}
                    </span>
                  </Link>
                );
              })}

            {/* More Menu Button */}
            <button
              type="button"
              onClick={handleToggleMobileSidebar}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all min-w-[64px]"
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-semibold">More</span>
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={handleCloseMobileSidebar}
          navigation={filteredNavigation}
          pathname={pathname}
          userRole={userRole}
          currentUser={currentUser as CurrentUser | null | undefined}
        />
      </div>
    </TooltipProvider>
  );
}
