"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  UserPlus,
  Users,
  Tag,
  Shield,
  UserCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-user";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Locale } from "@/app/i18n/config";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const { data: currentUser } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as Locale) || "am";

  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");

  const isAdmin = currentUser?.role === "ADMIN";
  const isOrganizer = currentUser?.role === "ORGANIZER" || isAdmin;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    const currentPath = pathname.replace(`/${locale}`, "");
    return currentPath === path || pathname === `/${locale}${path}`;
  };

  const getLocalizedPath = (path: string) => `/${locale}${path}`;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200",
          scrolled
            ? "shadow-sm border-b border-gray-200"
            : "border-b border-gray-200"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link
                href={getLocalizedPath("/")}
                className="flex items-center gap-2.5 group"
              >
                <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {tCommon("appName")}
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                <Link
                  href={getLocalizedPath("/events")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive("/events")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {t("browseEvents")}
                </Link>

                {isSignedIn && (
                  <>
                    <Link
                      href={getLocalizedPath("/dashboard")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2",
                        isActive("/dashboard")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t("dashboard")}
                    </Link>

                    {/* Admin Menu */}
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all inline-flex items-center gap-1.5 group">
                            <Shield className="w-4 h-4" />
                            {t("admin")}
                            <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuLabel className="text-xs text-gray-500">
                            {t("systemManagement")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/users")}
                              className="cursor-pointer"
                            >
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              {t("manageUsers")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/categories")}
                              className="cursor-pointer"
                            >
                              <Tag className="w-4 h-4 mr-2 text-gray-400" />
                              {t("categories")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/check-ins")}
                              className="cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4 mr-2 text-gray-400" />
                              {t("checkIns")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/events")}
                              className="cursor-pointer"
                            >
                              <Search className="w-4 h-4 mr-2 text-gray-400" />
                              {t("allEvents")}
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {/* Events Menu - Organizers & Admins */}
                    {isOrganizer && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all inline-flex items-center gap-1.5 group">
                            {t("myEvents")}
                            <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuLabel className="text-xs text-gray-500">
                            {t("eventManagement")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/my-events")}
                              className="cursor-pointer"
                            >
                              <FolderOpen className="w-4 h-4 mr-2 text-gray-400" />
                              {t("allEvents")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/analytics")}
                              className="cursor-pointer"
                            >
                              <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                              {t("analytics")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/check-ins")}
                              className="cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4 mr-2 text-gray-400" />
                              {t("checkIns")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/events/create")}
                              className="cursor-pointer text-blue-600 font-medium"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t("createEvent")}
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <Link
                      href={getLocalizedPath("/dashboard/registrations")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive("/dashboard/registrations")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {t("registrations")}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {isSignedIn ? (
                <>
                  {/* Role Badge */}
                  {currentUser && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize font-medium text-xs",
                        currentUser.role === "ADMIN"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : currentUser.role === "ORGANIZER"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-green-200 bg-green-50 text-green-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-1.5",
                          currentUser.role === "ADMIN"
                            ? "bg-red-500"
                            : currentUser.role === "ORGANIZER"
                            ? "bg-blue-600"
                            : "bg-green-500"
                        )}
                      />
                      {tRoles(currentUser.role.toLowerCase())}
                    </Badge>
                  )}

                  {/* Create Event Button */}
                  {isOrganizer && (
                    <Button
                      asChild
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      <Link href={getLocalizedPath("/events/create")}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t("createEvent")}
                      </Link>
                    </Button>
                  )}

                  {/* User Profile */}
                  <UserButton
                    afterSignOutUrl={getLocalizedPath("/")}
                    appearance={{
                      elements: {
                        avatarBox:
                          "w-9 h-9 rounded-full ring-2 ring-gray-200 hover:ring-gray-300 transition-all",
                        userButtonPopoverCard: "shadow-lg",
                        userButtonPopoverFooter: "hidden",
                      },
                    }}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Link href={getLocalizedPath("/sign-in")}>
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("signIn")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Link href={getLocalizedPath("/sign-up")}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t("getStarted")}
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Language Switcher - Mobile */}
              <LanguageSwitcher />

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
      <div
        className={cn(
          "fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 lg:hidden transition-all duration-300 transform",
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-6 space-y-1">
            {/* Browse Events */}
            <Link
              href={getLocalizedPath("/events")}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive("/events")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-gray-600" />
              </div>
              <span>{t("browseEvents")}</span>
            </Link>

            {isSignedIn && (
              <>
                {/* Dashboard */}
                <Link
                  href={getLocalizedPath("/dashboard")}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive("/dashboard")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>{t("dashboard")}</span>
                </Link>

                {/* Admin Section */}
                {isAdmin && (
                  <>
                    <div className="px-4 pt-4 pb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        {t("admin")}
                      </p>
                    </div>

                    <Link
                      href={getLocalizedPath("/dashboard/users")}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive("/dashboard/users")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>{t("manageUsers")}</span>
                    </Link>

                    <Link
                      href={getLocalizedPath("/dashboard/categories")}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive("/dashboard/categories")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>{t("categories")}</span>
                    </Link>

                    <div className="px-4 pt-4 pb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {t("eventManagement")}
                      </p>
                    </div>
                  </>
                )}

                {/* Registrations */}
                <Link
                  href={getLocalizedPath("/dashboard/registrations")}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive("/dashboard/registrations")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>{t("myRegistrations")}</span>
                </Link>

                {/* Organizer/Admin Only */}
                {isOrganizer && (
                  <>
                    {/* My Events */}
                    <Link
                      href={getLocalizedPath("/dashboard/my-events")}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive("/dashboard/my-events")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>{t("myEvents")}</span>
                    </Link>

                    {/* Analytics */}
                    <Link
                      href={getLocalizedPath("/dashboard/analytics")}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive("/dashboard/analytics")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>{t("analytics")}</span>
                    </Link>

                    {/* Check-ins */}
                    <Link
                      href={getLocalizedPath("/dashboard/check-ins")}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive("/dashboard/check-ins")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>{t("checkIns")}</span>
                    </Link>

                    {/* Create Event - Highlighted */}
                    <Link
                      href={getLocalizedPath("/events/create")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
                    >
                      <div className="h-9 w-9 bg-white/20 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <span>{t("createEvent")}</span>
                    </Link>
                  </>
                )}

                {/* Settings */}
                <Link
                  href={getLocalizedPath("/dashboard/settings")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>{t("settings")}</span>
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
                  <Link
                    href={getLocalizedPath("/sign-in")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {t("signIn")}
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link
                    href={getLocalizedPath("/sign-up")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t("getStarted")}
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
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      currentUser.role === "ADMIN"
                        ? "bg-red-600"
                        : currentUser.role === "ORGANIZER"
                        ? "bg-blue-600"
                        : "bg-green-600"
                    )}
                  >
                    {currentUser.role === "ADMIN" ? (
                      <Shield className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-xs mt-1",
                        currentUser.role === "ADMIN"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : currentUser.role === "ORGANIZER"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-green-200 bg-green-50 text-green-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-1.5",
                          currentUser.role === "ADMIN"
                            ? "bg-red-500"
                            : currentUser.role === "ORGANIZER"
                            ? "bg-blue-600"
                            : "bg-green-500"
                        )}
                      />
                      {tRoles(currentUser.role.toLowerCase())}
                    </Badge>
                  </div>
                </div>
                <UserButton
                  afterSignOutUrl={getLocalizedPath("/")}
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 rounded-full ring-2 ring-gray-300 transition-all",
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
