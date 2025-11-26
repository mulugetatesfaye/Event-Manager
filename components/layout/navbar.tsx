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
      setScrolled(window.scrollY > 10);
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
          "fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300",
          scrolled
            ? "shadow-md shadow-slate-200/60 border-b border-slate-200"
            : "border-b border-slate-100"
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
                <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm shadow-orange-500/20 transition-all duration-300 group-hover:shadow-md group-hover:shadow-orange-500/30 group-hover:scale-105">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800">
                  {tCommon("appName")}
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                <Link
                  href={getLocalizedPath("/events")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive("/events")
                      ? "text-orange-600 bg-orange-50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {t("browseEvents")}
                </Link>

                {isSignedIn && (
                  <>
                    <Link
                      href={getLocalizedPath("/dashboard")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-2",
                        isActive("/dashboard")
                          ? "text-orange-600 bg-orange-50"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t("dashboard")}
                    </Link>

                    {/* Admin Menu */}
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 inline-flex items-center gap-1.5 group">
                            <Shield className="w-4 h-4" />
                            {t("admin")}
                            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-52 shadow-lg border-slate-200"
                        >
                          <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                            {t("systemManagement")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-200" />
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/users")}
                              className="cursor-pointer"
                            >
                              <Users className="w-4 h-4 mr-2 text-slate-500" />
                              {t("manageUsers")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/categories")}
                              className="cursor-pointer"
                            >
                              <Tag className="w-4 h-4 mr-2 text-slate-500" />
                              {t("categories")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/check-ins")}
                              className="cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4 mr-2 text-slate-500" />
                              {t("checkIns")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-200" />
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/events")}
                              className="cursor-pointer"
                            >
                              <Search className="w-4 h-4 mr-2 text-slate-500" />
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
                          <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 inline-flex items-center gap-1.5 group">
                            {t("myEvents")}
                            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-52 shadow-lg border-slate-200"
                        >
                          <DropdownMenuLabel className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                            {t("eventManagement")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-200" />
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/my-events")}
                              className="cursor-pointer"
                            >
                              <FolderOpen className="w-4 h-4 mr-2 text-slate-500" />
                              {t("allEvents")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/analytics")}
                              className="cursor-pointer"
                            >
                              <BarChart3 className="w-4 h-4 mr-2 text-slate-500" />
                              {t("analytics")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/dashboard/check-ins")}
                              className="cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4 mr-2 text-slate-500" />
                              {t("checkIns")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-200" />
                          <DropdownMenuItem asChild>
                            <Link
                              href={getLocalizedPath("/events/create")}
                              className="cursor-pointer text-orange-600 font-semibold"
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
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive("/dashboard/registrations")
                          ? "text-orange-600 bg-orange-50"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
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
                        "capitalize font-medium text-xs border",
                        currentUser.role === "ADMIN"
                          ? "border-purple-200 bg-purple-50 text-purple-700"
                          : currentUser.role === "ORGANIZER"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-1.5",
                          currentUser.role === "ADMIN"
                            ? "bg-purple-500"
                            : currentUser.role === "ORGANIZER"
                            ? "bg-blue-500"
                            : "bg-emerald-500"
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
                      className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
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
                          "w-9 h-9 rounded-full ring-2 ring-slate-200 hover:ring-slate-300 transition-all duration-200",
                        userButtonPopoverCard: "shadow-xl border-slate-200",
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
                    className="font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <Link href={getLocalizedPath("/sign-in")}>
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("signIn")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
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
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
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
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-40 lg:hidden transition-all duration-300 transform",
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
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive("/events")
                  ? "text-orange-700 bg-orange-50"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                  isActive("/events") ? "bg-orange-100" : "bg-slate-100"
                )}
              >
                <Search
                  className={cn(
                    "w-5 h-5",
                    isActive("/events") ? "text-orange-600" : "text-slate-600"
                  )}
                />
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive("/dashboard")
                      ? "text-orange-700 bg-orange-50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                      isActive("/dashboard") ? "bg-orange-100" : "bg-slate-100"
                    )}
                  >
                    <LayoutDashboard
                      className={cn(
                        "w-5 h-5",
                        isActive("/dashboard")
                          ? "text-orange-600"
                          : "text-slate-600"
                      )}
                    />
                  </div>
                  <span>{t("dashboard")}</span>
                </Link>

                {/* Admin Section */}
                {isAdmin && (
                  <>
                    <div className="px-4 pt-6 pb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        {t("admin")}
                      </p>
                    </div>

                    <Link
                      href={getLocalizedPath("/dashboard/users")}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive("/dashboard/users")
                          ? "text-orange-700 bg-orange-50"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          isActive("/dashboard/users")
                            ? "bg-orange-100"
                            : "bg-slate-100"
                        )}
                      >
                        <Users
                          className={cn(
                            "w-5 h-5",
                            isActive("/dashboard/users")
                              ? "text-orange-600"
                              : "text-slate-600"
                          )}
                        />
                      </div>
                      <span>{t("manageUsers")}</span>
                    </Link>

                    <Link
                      href={getLocalizedPath("/dashboard/categories")}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive("/dashboard/categories")
                          ? "text-orange-700 bg-orange-50"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          isActive("/dashboard/categories")
                            ? "bg-orange-100"
                            : "bg-slate-100"
                        )}
                      >
                        <Tag
                          className={cn(
                            "w-5 h-5",
                            isActive("/dashboard/categories")
                              ? "text-orange-600"
                              : "text-slate-600"
                          )}
                        />
                      </div>
                      <span>{t("categories")}</span>
                    </Link>

                    <div className="px-4 pt-6 pb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive("/dashboard/registrations")
                      ? "text-orange-700 bg-orange-50"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      isActive("/dashboard/registrations")
                        ? "bg-orange-100"
                        : "bg-slate-100"
                    )}
                  >
                    <FolderOpen
                      className={cn(
                        "w-5 h-5",
                        isActive("/dashboard/registrations")
                          ? "text-orange-600"
                          : "text-slate-600"
                      )}
                    />
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
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive("/dashboard/my-events")
                          ? "text-orange-700 bg-orange-50"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          isActive("/dashboard/my-events")
                            ? "bg-orange-100"
                            : "bg-slate-100"
                        )}
                      >
                        <Calendar
                          className={cn(
                            "w-5 h-5",
                            isActive("/dashboard/my-events")
                              ? "text-orange-600"
                              : "text-slate-600"
                          )}
                        />
                      </div>
                      <span>{t("myEvents")}</span>
                    </Link>

                    {/* Analytics */}
                    <Link
                      href={getLocalizedPath("/dashboard/analytics")}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive("/dashboard/analytics")
                          ? "text-orange-700 bg-orange-50"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          isActive("/dashboard/analytics")
                            ? "bg-orange-100"
                            : "bg-slate-100"
                        )}
                      >
                        <BarChart3
                          className={cn(
                            "w-5 h-5",
                            isActive("/dashboard/analytics")
                              ? "text-orange-600"
                              : "text-slate-600"
                          )}
                        />
                      </div>
                      <span>{t("analytics")}</span>
                    </Link>

                    {/* Check-ins */}
                    <Link
                      href={getLocalizedPath("/dashboard/check-ins")}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive("/dashboard/check-ins")
                          ? "text-orange-700 bg-orange-50"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          isActive("/dashboard/check-ins")
                            ? "bg-orange-100"
                            : "bg-slate-100"
                        )}
                      >
                        <UserCheck
                          className={cn(
                            "w-5 h-5",
                            isActive("/dashboard/check-ins")
                              ? "text-orange-600"
                              : "text-slate-600"
                          )}
                        />
                      </div>
                      <span>{t("checkIns")}</span>
                    </Link>

                    {/* Create Event - Highlighted */}
                    <Link
                      href={getLocalizedPath("/events/create")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <span>{t("createEvent")}</span>
                    </Link>
                  </>
                )}

                {/* Settings */}
                <Link
                  href={getLocalizedPath("/dashboard/settings")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
                >
                  <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-slate-600" />
                  </div>
                  <span>{t("settings")}</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Auth Section */}
          {!isSignedIn && (
            <div className="px-4 py-6 border-t border-slate-200 bg-slate-50">
              <div className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-medium"
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
                  className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md font-medium"
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
            <div className="px-4 py-6 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-11 w-11 rounded-lg flex items-center justify-center shadow-sm",
                      currentUser.role === "ADMIN"
                        ? "bg-purple-500 shadow-purple-500/20"
                        : currentUser.role === "ORGANIZER"
                        ? "bg-blue-500 shadow-blue-500/20"
                        : "bg-emerald-500 shadow-emerald-500/20"
                    )}
                  >
                    {currentUser.role === "ADMIN" ? (
                      <Shield className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-xs mt-1.5 border font-medium",
                        currentUser.role === "ADMIN"
                          ? "border-purple-200 bg-purple-50 text-purple-700"
                          : currentUser.role === "ORGANIZER"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mr-1.5",
                          currentUser.role === "ADMIN"
                            ? "bg-purple-500"
                            : currentUser.role === "ORGANIZER"
                            ? "bg-blue-500"
                            : "bg-emerald-500"
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
                        "w-10 h-10 rounded-full ring-2 ring-slate-200 hover:ring-slate-300 transition-all",
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
