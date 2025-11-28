"use client";

import { useCurrentUser, useMyEvents, useMyRegistrations } from "@/hooks";
import { useAdminStats, useAdminEvents } from "@/hooks/use-admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/ui/fade-in";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/app/i18n/routing";
import { Locale } from "@/app/i18n/config";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Search,
  Settings,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  MapPin,
  Eye,
  Target,
  DollarSign,
  Ticket,
  Award,
  UserCog,
  Activity,
  Globe,
  Sparkles,
  Zap,
  LayoutDashboard,
  ChevronRight,
  CalendarDays,
  TrendingDown,
  ArrowUpRight,
  Star,
  Shield,
  Rocket,
} from "lucide-react";
import { format } from "date-fns";
import { EventWithRelations } from "@/types";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

// Import utility functions
import {
  calculateTotalTicketsSold,
  calculateEventRevenue,
  usesTicketingSystem,
  calculateFillPercentage,
} from "@/lib/event-utils";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STAT_COLORS = {
  primary: {
    bg: "bg-orange-50",
    icon: "bg-orange-600",
    text: "text-orange-600",
    border: "border-orange-200",
    hover: "hover:border-orange-300",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-600",
    text: "text-blue-600",
    border: "border-blue-200",
    hover: "hover:border-blue-300",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-200",
    hover: "hover:border-emerald-300",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-600",
    text: "text-purple-600",
    border: "border-purple-200",
    hover: "hover:border-purple-300",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-600",
    text: "text-amber-600",
    border: "border-amber-200",
    hover: "hover:border-amber-300",
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  return `Br ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString("en-US");
};

const formatNumberFull = (num: number): string => {
  return num.toLocaleString("en-US");
};

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: keyof typeof STAT_COLORS;
  delay?: number;
  href?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "primary",
  delay = 0,
  href,
}: StatCardProps) {
  const colorConfig = STAT_COLORS[color];

  const content = (
    <Card
      className={cn(
        "group relative overflow-hidden border-slate-200 bg-white transition-all duration-300",
        colorConfig.hover,
        "hover:shadow-lg cursor-pointer"
      )}
    >
      {/* Decorative gradient */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 transition-opacity group-hover:opacity-30",
          colorConfig.bg
        )}
      />

      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {typeof value === "number" ? formatNumber(value) : value}
              </span>
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center text-xs font-semibold",
                    trend.isPositive ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
              colorConfig.icon
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <FadeIn direction="up" delay={delay}>
        <Link href={href}>{content}</Link>
      </FadeIn>
    );
  }

  return (
    <FadeIn direction="up" delay={delay}>
      {content}
    </FadeIn>
  );
}

interface SectionHeaderProps {
  badge?: {
    icon: React.ElementType;
    text: string;
  };
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

function SectionHeader({
  badge,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        {badge && (
          <Badge className="mb-3 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
            <badge.icon className="w-3 h-3 mr-1.5" />
            {badge.text}
          </Badge>
        )}
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {action && (
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        >
          <Link href={action.href}>
            {action.label}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      )}
    </div>
  );
}

interface EventListItemProps {
  title: string;
  status?: string;
  metadata: { icon: React.ElementType; text: string }[];
  progress?: number;
  href: string;
  actionIcon?: React.ElementType;
}

function EventListItem({
  title,
  status,
  metadata,
  progress,
  href,
  actionIcon: ActionIcon = Eye,
}: EventListItemProps) {
  return (
    <div className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-300">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm text-slate-900 truncate group-hover:text-orange-600 transition-colors">
            {title}
          </h4>
          {status && (
            <Badge
              variant={status === "PUBLISHED" ? "default" : "secondary"}
              className={cn(
                "flex-shrink-0 text-xs",
                status === "PUBLISHED"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              )}
            >
              {status}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {metadata.map((item, index) => (
            <span key={index} className="flex items-center gap-1">
              <item.icon className="w-3.5 h-3.5" />
              {item.text}
            </span>
          ))}
        </div>
        {progress !== undefined && (
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs font-medium text-slate-600 min-w-[2.5rem] text-right">
              {progress}%
            </span>
          </div>
        )}
      </div>
      <Button
        asChild
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-all ml-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
      >
        <Link href={href}>
          <ActionIcon className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ElementType;
  };
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <Button
          asChild
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
        >
          <Link href={action.href}>
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color?: keyof typeof STAT_COLORS;
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color = "primary",
}: QuickActionCardProps) {
  const colorConfig = STAT_COLORS[color];

  return (
    <Link href={href}>
      <Card className="group h-full border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                colorConfig.bg,
                "group-hover:" + colorConfig.icon
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  colorConfig.text,
                  "group-hover:text-white"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-20 w-full rounded-xl" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const params = useParams();
  const locale = (params?.locale as Locale) || "am";

  // Fetch admin data if user is admin
  const { data: adminStats, isLoading: adminStatsLoading } = useAdminStats();
  const { data: adminEvents, isLoading: adminEventsLoading } =
    useAdminEvents(10);

  // Fetch regular user data
  const { data: myEvents, isLoading: eventsLoading } = useMyEvents();
  const { data: myRegistrations, isLoading: registrationsLoading } =
    useMyRegistrations();

  const isAdmin = user?.role === "ADMIN";
  const isOrganizer = user?.role === "ORGANIZER" || isAdmin;

  // Calculate stats based on role
  const stats = useMemo(() => {
    if (isAdmin && adminStats) {
      return {
        totalEvents: adminStats.totalEvents,
        upcomingEvents: adminStats.upcomingEvents,
        totalRegistrations: 0,
        upcomingRegistrations: 0,
        totalTickets: adminStats.totalTicketsSold,
        totalRevenue: adminStats.totalRevenue,
        avgFillRate: adminStats.avgFillRate,
        publishedEvents: adminStats.publishedEvents,
        draftEvents: adminStats.draftEvents,
        completedEvents: adminStats.completedEvents,
        eventsWithTicketTypes: adminStats.eventsWithTicketing,
        totalUsers: adminStats.totalUsers,
        totalOrganizers: adminStats.totalOrganizers,
        totalCheckIns: adminStats.totalCheckIns,
        recentRegistrations: adminStats.recentRegistrations,
        checkInRate: adminStats.checkInRate,
      };
    }

    const totalEvents = myEvents?.length || 0;
    const upcomingEvents =
      myEvents?.filter((event) => new Date(event.startDate) > new Date())
        .length || 0;

    const totalRegistrations = myRegistrations?.length || 0;
    const upcomingRegistrations =
      myRegistrations?.filter(
        (reg) => new Date(reg.event.startDate) > new Date()
      ).length || 0;

    let totalTickets = 0;
    let totalRevenue = 0;
    let totalCapacity = 0;

    myEvents?.forEach((event) => {
      const eventData = event as unknown as EventWithRelations;
      const ticketsSold = calculateTotalTicketsSold(eventData);
      const revenue = calculateEventRevenue(eventData);

      totalTickets += ticketsSold;
      totalRevenue += revenue;
      totalCapacity += event.capacity;
    });

    const avgFillRate =
      totalCapacity > 0 ? Math.round((totalTickets / totalCapacity) * 100) : 0;

    const publishedEvents =
      myEvents?.filter((event) => event.status === "PUBLISHED").length || 0;

    const draftEvents =
      myEvents?.filter((event) => event.status === "DRAFT").length || 0;

    const completedEvents =
      myEvents?.filter((event) => event.status === "COMPLETED").length || 0;

    const eventsWithTicketTypes =
      myEvents?.filter((event) =>
        usesTicketingSystem(event as unknown as EventWithRelations)
      ).length || 0;

    return {
      totalEvents,
      upcomingEvents,
      totalRegistrations,
      upcomingRegistrations,
      totalTickets,
      totalRevenue,
      avgFillRate,
      publishedEvents,
      draftEvents,
      completedEvents,
      eventsWithTicketTypes,
    };
  }, [myEvents, myRegistrations, isAdmin, adminStats]);

  // Get next upcoming event for attendees
  const nextEvent = useMemo(() => {
    if (isAdmin) return null;
    if (!myRegistrations || myRegistrations.length === 0) return null;

    return (
      myRegistrations
        .filter((reg) => new Date(reg.event.startDate) > new Date())
        .sort(
          (a, b) =>
            new Date(a.event.startDate).getTime() -
            new Date(b.event.startDate).getTime()
        )[0] || null
    );
  }, [myRegistrations, isAdmin]);

  // Get next upcoming event for organizers/admins
  const nextOrganizerEvent = useMemo(() => {
    const events = isAdmin ? adminEvents : myEvents;
    if (!events || events.length === 0) return null;

    return (
      events
        .filter((event) => new Date(event.startDate) > new Date())
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )[0] || null
    );
  }, [myEvents, adminEvents, isAdmin]);

  const isLoading =
    userLoading ||
    (isAdmin
      ? adminStatsLoading || adminEventsLoading
      : eventsLoading || registrationsLoading);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* ============================================================ */}
      {/* HEADER SECTION */}
      {/* ============================================================ */}
      <FadeIn direction="down">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/10 rounded-full blur-2xl -ml-24 -mb-24" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/30">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {t("welcome.title", { name: user?.firstName || "User" })}
                  </h1>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/25">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {isAdmin ? "Admin" : isOrganizer ? "Organizer" : "Attendee"}
                  </Badge>
                </div>
                <p className="text-slate-300 text-sm sm:text-base">
                  {isAdmin
                    ? t("welcome.adminSubtitle")
                    : isOrganizer
                    ? t("welcome.organizerSubtitle")
                    : t("welcome.attendeeSubtitle")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
                >
                  <Link href="/dashboard/users">
                    <UserCog className="w-4 h-4 mr-2" />
                    {tNav("manageUsers")}
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
              >
                <Link href="/events">
                  <Search className="w-4 h-4 mr-2" />
                  {tNav("browseEvents")}
                </Link>
              </Button>
              {isOrganizer && (
                <Button
                  asChild
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30"
                >
                  <Link href="/events/create">
                    <Plus className="w-4 h-4 mr-2" />
                    {tNav("createEvent")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ============================================================ */}
      {/* ADMIN VIEW */}
      {/* ============================================================ */}
      {isAdmin ? (
        <>
          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={t("stats.totalEvents")}
              value={stats.totalEvents}
              subtitle={`${formatNumberFull(stats.publishedEvents)} ${t(
                "stats.published"
              )} • ${formatNumberFull(stats.upcomingEvents)} upcoming`}
              icon={Globe}
              color="primary"
              delay={100}
            />
            <StatCard
              title={t("stats.totalUsers")}
              value={stats.totalUsers || 0}
              subtitle={`${formatNumberFull(stats.totalOrganizers || 0)} ${t(
                "stats.organizers"
              )}`}
              icon={Users}
              color="blue"
              delay={200}
            />
            <StatCard
              title={t("stats.totalRevenue")}
              value={formatCurrency(stats.totalRevenue || 0)}
              subtitle={t("stats.fromTicketsSold", {
                count: formatNumberFull(stats.totalTickets || 0),
              })}
              icon={DollarSign}
              color="emerald"
              delay={300}
            />
            <StatCard
              title={t("stats.checkInRate")}
              value={`${stats.checkInRate || 0}%`}
              subtitle={`${formatNumberFull(
                stats.totalCheckIns || 0
              )} total check-ins`}
              icon={CheckCircle2}
              color="purple"
              delay={400}
            />
          </div>

          {/* Admin Secondary Stats */}
          <FadeIn direction="up" delay={500}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-slate-200 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {t("systemActivity.avgFillRate")}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-900">
                          {stats.avgFillRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Progress value={stats.avgFillRate} className="h-2 mt-4" />
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Ticket className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {t("systemActivity.checkIns")}
                      </p>
                      <span className="text-2xl font-bold text-slate-900">
                        {formatNumber(stats.totalCheckIns || 0)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    {t("systemActivity.totalCheckedIn")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        {t("systemActivity.recentActivity")}
                      </p>
                      <span className="text-2xl font-bold text-slate-900">
                        {formatNumber(stats.recentRegistrations || 0)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    {t("systemActivity.registrationsLast7Days")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </FadeIn>

          {/* Admin Events Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Events */}
            <FadeIn direction="up" delay={600}>
              <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <SectionHeader
                    badge={{ icon: Globe, text: "Platform Events" }}
                    title={t("recentEvents.title")}
                    description={t("recentEvents.subtitle")}
                    action={{ label: tCommon("viewAll"), href: "/events" }}
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  {adminEvents && adminEvents.length > 0 ? (
                    adminEvents.slice(0, 5).map((event) => (
                      <EventListItem
                        key={event.id}
                        title={event.title}
                        status={event.status}
                        metadata={[
                          {
                            icon: Users,
                            text: `${event.organizer.firstName} ${event.organizer.lastName}`,
                          },
                          {
                            icon: Ticket,
                            text: `${formatNumberFull(
                              event.totalTicketsSold
                            )} / ${formatNumberFull(event.capacity)}`,
                          },
                          ...(event.totalRevenue > 0
                            ? [
                                {
                                  icon: DollarSign,
                                  text: formatCurrency(event.totalRevenue),
                                },
                              ]
                            : []),
                        ]}
                        progress={event.fillRate}
                        href={`/events/${event.id}`}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={Globe}
                      title={t("recentEvents.noEvents")}
                      description="No events have been created yet"
                    />
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            {/* Top Performing Events */}
            <FadeIn direction="up" delay={700}>
              <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <SectionHeader
                    badge={{ icon: Award, text: "Top Performers" }}
                    title={t("topPerforming.title")}
                    description={t("topPerforming.subtitle")}
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  {adminEvents &&
                  adminEvents.filter((e) => e.status === "PUBLISHED").length >
                    0 ? (
                    adminEvents
                      .filter((event) => event.status === "PUBLISHED")
                      .sort((a, b) => b.fillRate - a.fillRate)
                      .slice(0, 5)
                      .map((event) => (
                        <EventListItem
                          key={event.id}
                          title={event.title}
                          metadata={[
                            {
                              icon: Users,
                              text: `${event.organizer.firstName} ${event.organizer.lastName}`,
                            },
                            {
                              icon: Ticket,
                              text: `${formatNumberFull(
                                event.totalTicketsSold
                              )} / ${formatNumberFull(event.capacity)}`,
                            },
                          ]}
                          progress={event.fillRate}
                          href={`/events/${event.id}`}
                        />
                      ))
                  ) : (
                    <EmptyState
                      icon={BarChart3}
                      title={t("topPerforming.noPublished")}
                      description={t("topPerforming.publishToSee")}
                    />
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </>
      ) : isOrganizer ? (
        <>
          {/* ============================================================ */}
          {/* ORGANIZER VIEW */}
          {/* ============================================================ */}

          {/* Organizer Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={t("stats.totalEvents")}
              value={stats.totalEvents}
              subtitle={`${formatNumberFull(stats.publishedEvents)} ${t(
                "stats.published"
              )} • ${formatNumberFull(stats.draftEvents)} ${t("stats.drafts")}`}
              icon={Calendar}
              color="primary"
              delay={100}
              href="/dashboard/my-events"
            />
            <StatCard
              title={t("stats.ticketsSold")}
              value={stats.totalTickets}
              subtitle={t("stats.acrossAllEvents")}
              icon={Ticket}
              color="blue"
              delay={200}
            />
            <StatCard
              title={t("stats.totalRevenue")}
              value={formatCurrency(stats.totalRevenue)}
              subtitle={t("stats.fromTicketSales")}
              icon={DollarSign}
              color="emerald"
              delay={300}
            />
            <StatCard
              title={t("stats.avgFillRate")}
              value={`${stats.avgFillRate}%`}
              subtitle="Capacity utilization"
              icon={Target}
              color="purple"
              delay={400}
            />
          </div>

          {/* Next Event Highlight */}
          {nextOrganizerEvent && (
            <FadeIn direction="up" delay={500}>
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl -mr-32 -mt-32" />
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                      <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Badge className="mb-1 bg-orange-100 text-orange-700 border-orange-200">
                        <Clock className="w-3 h-3 mr-1" />
                        {t("nextEvent.title")}
                      </Badge>
                      <CardDescription className="text-xs">
                        {t("nextEvent.upcomingDetails")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900">
                        {nextOrganizerEvent.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span>
                            {format(
                              new Date(nextOrganizerEvent.startDate),
                              "PPP"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span>
                            {format(
                              new Date(nextOrganizerEvent.startDate),
                              "p"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Ticket className="w-4 h-4 text-orange-600" />
                          <span>
                            {formatNumberFull(
                              calculateTotalTicketsSold(
                                nextOrganizerEvent as unknown as EventWithRelations
                              )
                            )}{" "}
                            / {formatNumberFull(nextOrganizerEvent.capacity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className="border-slate-300 hover:border-orange-300"
                      >
                        <Link href={`/events/${nextOrganizerEvent.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          {tCommon("view")}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
                      >
                        <Link href={`/events/${nextOrganizerEvent.id}/manage`}>
                          <Settings className="w-4 h-4 mr-2" />
                          {t("nextEvent.manageEvent")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Events Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Events */}
            <FadeIn direction="up" delay={600}>
              <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <SectionHeader
                    badge={{ icon: Calendar, text: "Your Events" }}
                    title={t("recentEvents.yourEvents")}
                    description={t("recentEvents.recentlyCreated")}
                    action={
                      myEvents && myEvents.length > 0
                        ? {
                            label: tCommon("viewAll"),
                            href: "/dashboard/my-events",
                          }
                        : undefined
                    }
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  {myEvents && myEvents.length > 0 ? (
                    myEvents.slice(0, 5).map((event) => {
                      const eventData = event as unknown as EventWithRelations;
                      const ticketsSold = calculateTotalTicketsSold(eventData);
                      const fillRate = calculateFillPercentage(eventData);

                      return (
                        <EventListItem
                          key={event.id}
                          title={event.title}
                          status={event.status}
                          metadata={[
                            {
                              icon: Calendar,
                              text: format(new Date(event.startDate), "MMM dd"),
                            },
                            {
                              icon: Ticket,
                              text: `${formatNumberFull(
                                ticketsSold
                              )} / ${formatNumberFull(event.capacity)}`,
                            },
                          ]}
                          progress={fillRate}
                          href={`/events/${event.id}/manage`}
                          actionIcon={Settings}
                        />
                      );
                    })
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title={t("recentEvents.noEventsYet")}
                      description={t("recentEvents.createFirst")}
                      action={{
                        label: tNav("createEvent"),
                        href: "/events/create",
                        icon: Plus,
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            {/* Top Performing */}
            <FadeIn direction="up" delay={700}>
              <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <SectionHeader
                    badge={{ icon: Award, text: "Performance" }}
                    title={t("topPerforming.title")}
                    description={t("topPerforming.subtitle")}
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  {myEvents &&
                  myEvents.filter((e) => e.status === "PUBLISHED").length >
                    0 ? (
                    myEvents
                      .filter((event) => event.status === "PUBLISHED")
                      .sort((a, b) => {
                        const rateA = calculateFillPercentage(
                          a as unknown as EventWithRelations
                        );
                        const rateB = calculateFillPercentage(
                          b as unknown as EventWithRelations
                        );
                        return rateB - rateA;
                      })
                      .slice(0, 5)
                      .map((event) => {
                        const eventData =
                          event as unknown as EventWithRelations;
                        const ticketsSold =
                          calculateTotalTicketsSold(eventData);
                        const fillRate = calculateFillPercentage(eventData);
                        const revenue = calculateEventRevenue(eventData);

                        return (
                          <EventListItem
                            key={event.id}
                            title={event.title}
                            metadata={[
                              {
                                icon: Ticket,
                                text: `${formatNumberFull(
                                  ticketsSold
                                )} / ${formatNumberFull(event.capacity)}`,
                              },
                              ...(revenue > 0
                                ? [
                                    {
                                      icon: DollarSign,
                                      text: formatCurrency(revenue),
                                    },
                                  ]
                                : []),
                            ]}
                            progress={fillRate}
                            href={`/events/${event.id}/manage`}
                            actionIcon={Settings}
                          />
                        );
                      })
                  ) : (
                    <EmptyState
                      icon={BarChart3}
                      title={t("topPerforming.noPublished")}
                      description={t("topPerforming.publishToSee")}
                    />
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Performance Insights */}
          {myEvents && myEvents.length > 0 && (
            <FadeIn direction="up" delay={800}>
              <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <SectionHeader
                    badge={{ icon: TrendingUp, text: "Insights" }}
                    title={t("performanceInsights.title")}
                    description={t("performanceInsights.subtitle")}
                  />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Most Popular Event */}
                    <div className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full blur-2xl -mr-12 -mt-12" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-sm text-slate-900">
                            {t("performanceInsights.mostPopular")}
                          </h4>
                        </div>
                        {(() => {
                          const mostPopular = myEvents
                            .filter((event) => event.status === "PUBLISHED")
                            .sort(
                              (a, b) =>
                                calculateTotalTicketsSold(
                                  b as unknown as EventWithRelations
                                ) -
                                calculateTotalTicketsSold(
                                  a as unknown as EventWithRelations
                                )
                            )[0];

                          return mostPopular ? (
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900 truncate">
                                {mostPopular.title}
                              </p>
                              <p className="text-sm text-slate-500">
                                {formatNumberFull(
                                  calculateTotalTicketsSold(
                                    mostPopular as unknown as EventWithRelations
                                  )
                                )}{" "}
                                {t("performanceInsights.ticketsSold")}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">
                              {t("performanceInsights.noPublishedEvents")}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Highest Revenue */}
                    <div className="relative overflow-hidden p-6 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full blur-2xl -mr-12 -mt-12" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/20">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-sm text-slate-900">
                            {t("performanceInsights.highestRevenue")}
                          </h4>
                        </div>
                        {(() => {
                          const highestRevenue = myEvents.sort(
                            (a, b) =>
                              calculateEventRevenue(
                                b as unknown as EventWithRelations
                              ) -
                              calculateEventRevenue(
                                a as unknown as EventWithRelations
                              )
                          )[0];

                          const revenue = highestRevenue
                            ? calculateEventRevenue(
                                highestRevenue as unknown as EventWithRelations
                              )
                            : 0;

                          return highestRevenue && revenue > 0 ? (
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900 truncate">
                                {highestRevenue.title}
                              </p>
                              <p className="text-sm text-slate-500">
                                {formatCurrency(revenue)}{" "}
                                {t("performanceInsights.earned")}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">
                              {t("performanceInsights.noPaidEvents")}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Next Event */}
                    <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl -mr-12 -mt-12" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-sm text-slate-900">
                            {t("performanceInsights.comingNext")}
                          </h4>
                        </div>
                        {nextOrganizerEvent ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900 truncate">
                              {nextOrganizerEvent.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              {format(
                                new Date(nextOrganizerEvent.startDate),
                                "MMM dd, yyyy"
                              )}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            {t("performanceInsights.noUpcomingEvents")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </>
      ) : (
        <>
          {/* ============================================================ */}
          {/* ATTENDEE VIEW */}
          {/* ============================================================ */}

          {/* Attendee Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={t("stats.myRegistrations")}
              value={stats.totalRegistrations}
              subtitle="Events you've registered for"
              icon={Users}
              color="primary"
              delay={100}
              href={
                stats.totalRegistrations > 0
                  ? "/dashboard/registrations"
                  : undefined
              }
            />
            <StatCard
              title={t("stats.upcomingEvents")}
              value={stats.upcomingRegistrations}
              subtitle="Events coming up"
              icon={TrendingUp}
              color="blue"
              delay={200}
              href={
                stats.upcomingRegistrations > 0
                  ? "/dashboard/registrations"
                  : undefined
              }
            />
            <StatCard
              title={t("stats.eventsAttended")}
              value={stats.totalRegistrations - stats.upcomingRegistrations}
              subtitle="Past events"
              icon={CheckCircle2}
              color="emerald"
              delay={300}
            />
            <StatCard
              title={t("stats.discoverMore")}
              value={t("stats.browse")}
              subtitle="Find new events"
              icon={Search}
              color="purple"
              delay={400}
              href="/events"
            />
          </div>

          {/* Next Event for Attendees */}
          {nextEvent && (
            <FadeIn direction="up" delay={500}>
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl -mr-32 -mt-32" />
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                      <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Badge className="mb-1 bg-orange-100 text-orange-700 border-orange-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t("nextEvent.title")}
                      </Badge>
                      <CardDescription className="text-xs">
                        {t("nextEvent.comingSoon")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900">
                        {nextEvent.event.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span>
                            {format(new Date(nextEvent.event.startDate), "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span>
                            {format(new Date(nextEvent.event.startDate), "p")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <span className="truncate max-w-[200px]">
                            {nextEvent.event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
                    >
                      <Link href={`/events/${nextEvent.event.id}`}>
                        {tCommon("viewDetails")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Upcoming Registrations */}
          <FadeIn direction="up" delay={600}>
            <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <SectionHeader
                  badge={{ icon: Calendar, text: "Your Events" }}
                  title={t("upcomingRegistrations.title")}
                  description={t("upcomingRegistrations.subtitle")}
                  action={
                    myRegistrations && myRegistrations.length > 0
                      ? {
                          label: tCommon("viewAll"),
                          href: "/dashboard/registrations",
                        }
                      : undefined
                  }
                />
              </CardHeader>
              <CardContent className="space-y-3">
                {myRegistrations &&
                myRegistrations.filter(
                  (reg) => new Date(reg.event.startDate) > new Date()
                ).length > 0 ? (
                  myRegistrations
                    .filter((reg) => new Date(reg.event.startDate) > new Date())
                    .slice(0, 5)
                    .map((registration) => (
                      <EventListItem
                        key={registration.id}
                        title={registration.event.title}
                        metadata={[
                          {
                            icon: Calendar,
                            text: format(
                              new Date(registration.event.startDate),
                              "MMM dd, yyyy"
                            ),
                          },
                          {
                            icon: MapPin,
                            text: registration.event.location,
                          },
                        ]}
                        href={`/events/${registration.event.id}`}
                      />
                    ))
                ) : (
                  <EmptyState
                    icon={Users}
                    title={t("upcomingRegistrations.noUpcoming")}
                    description={t("upcomingRegistrations.browseToFind")}
                    action={{
                      label: tNav("browseEvents"),
                      href: "/events",
                      icon: Search,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </>
      )}

      {/* ============================================================ */}
      {/* QUICK ACTIONS - ALL USERS */}
      {/* ============================================================ */}
      <FadeIn direction="up" delay={900}>
        <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <SectionHeader
              badge={{ icon: Zap, text: "Quick Access" }}
              title={t("quickActions.title")}
              description={t("quickActions.subtitle")}
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isAdmin && (
                <>
                  <QuickActionCard
                    icon={UserCog}
                    title={t("quickActions.manageUsers.title")}
                    description={t("quickActions.manageUsers.description")}
                    href="/dashboard/users"
                    color="primary"
                  />
                  <QuickActionCard
                    icon={Settings}
                    title={t("quickActions.categories.title")}
                    description={t("quickActions.categories.description")}
                    href="/dashboard/categories"
                    color="purple"
                  />
                  <QuickActionCard
                    icon={Plus}
                    title={t("quickActions.createEvent.title")}
                    description={t("quickActions.createEvent.description")}
                    href="/events/create"
                    color="emerald"
                  />
                </>
              )}

              {isOrganizer && !isAdmin && (
                <>
                  <QuickActionCard
                    icon={Plus}
                    title={t("quickActions.createEvent.title")}
                    description={t("quickActions.createEvent.description")}
                    href="/events/create"
                    color="primary"
                  />
                  <QuickActionCard
                    icon={Calendar}
                    title={t("quickActions.myEvents.title")}
                    description={t("quickActions.myEvents.description")}
                    href="/dashboard/my-events"
                    color="blue"
                  />
                  <QuickActionCard
                    icon={BarChart3}
                    title={t("quickActions.analytics.title")}
                    description={t("quickActions.analytics.description")}
                    href="/dashboard/analytics"
                    color="emerald"
                  />
                </>
              )}

              <QuickActionCard
                icon={Search}
                title={t("quickActions.browseEvents.title")}
                description={t("quickActions.browseEvents.description")}
                href="/events"
                color={isAdmin || isOrganizer ? "blue" : "primary"}
              />

              <QuickActionCard
                icon={Settings}
                title={t("quickActions.settings.title")}
                description={t("quickActions.settings.description")}
                href="/dashboard/settings"
                color="amber"
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* ============================================================ */}
      {/* FOOTER TRUST BADGES */}
      {/* ============================================================ */}
      <FadeIn direction="up" delay={1000}>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Secure Platform</span>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-slate-400" />
            <span>Trusted by thousands</span>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-slate-400" />
            <span>Fast & Reliable</span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
