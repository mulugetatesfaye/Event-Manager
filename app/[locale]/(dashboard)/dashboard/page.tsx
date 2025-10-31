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
} from "lucide-react";
import { format } from "date-fns";
import { EventWithRelations } from "@/types";
import { useMemo } from "react";

// Import utility functions
import {
  calculateTotalTicketsSold,
  calculateEventRevenue,
  usesTicketingSystem,
  calculateFillPercentage,
} from "@/lib/event-utils";

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `Br ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Helper function to format numbers
const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US");
};

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
      // Admin sees system-wide stats
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

    // Organizer/Attendee stats
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
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* Header Section */}
      <FadeIn direction="down">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {t("welcome.title", { name: user?.firstName || "User" })}
              </h1>
              <p className="text-sm text-gray-600">
                {isAdmin
                  ? t("welcome.adminSubtitle")
                  : isOrganizer
                  ? t("welcome.organizerSubtitle")
                  : t("welcome.attendeeSubtitle")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
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
                className="border-gray-300 hover:bg-gray-50"
              >
                <Link href="/events">
                  <Search className="w-4 h-4 mr-2" />
                  {tNav("browseEvents")}
                </Link>
              </Button>
              {isOrganizer && (
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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

      {/* Stats Grid - ADMIN VIEW */}
      {isAdmin ? (
        <>
          {/* Admin Main Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FadeIn direction="up" delay={100}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t("stats.totalEvents")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatNumber(stats.totalEvents)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>
                      {formatNumber(stats.publishedEvents)}{" "}
                      {t("stats.published")}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>
                      {formatNumber(stats.upcomingEvents)}{" "}
                      {t("stats.upcomingEvents").toLowerCase()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={200}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t("stats.totalUsers")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatNumber(stats.totalUsers || 0)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>
                      {formatNumber(stats.totalOrganizers || 0)}{" "}
                      {t("stats.organizers")}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>
                      {formatNumber(stats.recentRegistrations || 0)}{" "}
                      {t("stats.recent")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={300}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t("stats.totalRevenue")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-gray-600">
                    {t("stats.fromTicketsSold", {
                      count: formatNumber(stats.totalTickets || 0),
                    })}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={400}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t("stats.checkInRate")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.checkInRate || 0}%
                  </div>
                  <Progress value={stats.checkInRate || 0} className="h-2" />
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Admin System Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FadeIn direction="up" delay={500}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    {t("systemActivity.avgFillRate")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.avgFillRate}%
                  </div>
                  <Progress value={stats.avgFillRate} className="h-2 mt-3" />
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={600}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    {t("systemActivity.checkIns")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(stats.totalCheckIns || 0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {t("systemActivity.totalCheckedIn")}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={700}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {t("systemActivity.recentActivity")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(stats.recentRegistrations || 0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {t("systemActivity.registrationsLast7Days")}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Admin Recent Events List */}
          <FadeIn direction="up" delay={800}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      {t("recentEvents.title")}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {t("recentEvents.subtitle")}
                    </CardDescription>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link
                      href="/events"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {tCommon("viewAll")}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {adminEvents && adminEvents.length > 0 ? (
                  <div className="space-y-3">
                    {adminEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate text-gray-900">
                              {event.title}
                            </h4>
                            <Badge
                              variant={
                                event.status === "PUBLISHED"
                                  ? "default"
                                  : "secondary"
                              }
                              className="flex-shrink-0"
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {event.organizer.firstName}{" "}
                              {event.organizer.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Ticket className="w-3.5 h-3.5" />
                              {formatNumber(event.totalTicketsSold)} /{" "}
                              {formatNumber(event.capacity)}
                            </span>
                            {event.totalRevenue > 0 && (
                              <span className="flex items-center gap-1">
                                {formatCurrency(event.totalRevenue)}
                              </span>
                            )}
                          </div>
                          <Progress value={event.fillRate} className="h-1.5" />
                        </div>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                        >
                          <Link href={`/events/${event.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="text-sm text-gray-600 mt-4">
                      {t("recentEvents.noEvents")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Admin Top Performing Events */}
          <FadeIn direction="up" delay={900}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      {t("topPerforming.title")}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {t("topPerforming.subtitle")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {adminEvents &&
                adminEvents.filter((e) => e.status === "PUBLISHED").length >
                  0 ? (
                  <div className="space-y-3">
                    {adminEvents
                      .filter((event) => event.status === "PUBLISHED")
                      .sort((a, b) => b.fillRate - a.fillRate)
                      .slice(0, 5)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0 space-y-2">
                            <h4 className="font-semibold text-sm truncate text-gray-900">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {event.organizer.firstName}{" "}
                                {event.organizer.lastName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3.5 h-3.5" />
                                {formatNumber(event.totalTicketsSold)} /{" "}
                                {formatNumber(event.capacity)}
                              </span>
                              {event.totalRevenue > 0 && (
                                <span className="flex items-center gap-1">
                                  {formatCurrency(event.totalRevenue)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={event.fillRate}
                                className="h-1.5 flex-1"
                              />
                              <span className="text-xs font-semibold text-gray-700 min-w-[3rem] text-right">
                                {event.fillRate}%
                              </span>
                            </div>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                          >
                            <Link href={`/events/${event.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <BarChart3 className="w-12 h-12 mx-auto text-gray-300" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">
                        {t("topPerforming.noPublished")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("topPerforming.publishToSee")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </>
      ) : isOrganizer ? (
        <>
          {/* ORGANIZER VIEW - Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FadeIn direction="up" delay={100}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t("stats.totalEvents")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatNumber(stats.totalEvents)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>
                      {formatNumber(stats.publishedEvents)}{" "}
                      {t("stats.published")}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>
                      {formatNumber(stats.draftEvents)} {t("stats.drafts")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={200}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t("stats.ticketsSold")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatNumber(stats.totalTickets)}
                  </div>
                  <p className="text-xs text-gray-600">
                    {t("stats.acrossAllEvents")}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={300}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t("stats.totalRevenue")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <p className="text-xs text-gray-600">
                    {t("stats.fromTicketSales")}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn direction="up" delay={400}>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {t("stats.avgFillRate")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.avgFillRate}%
                  </div>
                  <Progress value={stats.avgFillRate} className="h-2" />
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Next Event Highlight - Organizer */}
          {nextOrganizerEvent && (
            <FadeIn direction="up" delay={500}>
              <Card className="border-2 border-blue-100 bg-blue-50/30 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {t("nextEvent.title")}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {t("nextEvent.upcomingDetails")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {nextOrganizerEvent.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(
                              new Date(nextOrganizerEvent.startDate),
                              "PPP"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(
                              new Date(nextOrganizerEvent.startDate),
                              "p"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                          <span>
                            {formatNumber(
                              calculateTotalTicketsSold(
                                nextOrganizerEvent as unknown as EventWithRelations
                              )
                            )}{" "}
                            / {formatNumber(nextOrganizerEvent.capacity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className="border-gray-300"
                      >
                        <Link href={`/events/${nextOrganizerEvent.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          {tCommon("view")}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Link href={`/events/${nextOrganizerEvent.id}/manage`}>
                          {t("nextEvent.manageEvent")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </>
      ) : (
        <>
          {/* ATTENDEE VIEW - Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: t("stats.myRegistrations"),
                value: stats.totalRegistrations,
                icon: Users,
                link:
                  stats.totalRegistrations > 0
                    ? "/dashboard/registrations"
                    : null,
              },
              {
                title: t("stats.upcomingEvents"),
                value: stats.upcomingRegistrations,
                icon: TrendingUp,
                link:
                  stats.upcomingRegistrations > 0
                    ? "/dashboard/registrations"
                    : null,
              },
              {
                title: t("stats.eventsAttended"),
                value: stats.totalRegistrations - stats.upcomingRegistrations,
                icon: CheckCircle2,
              },
              {
                title: t("stats.discoverMore"),
                value: t("stats.browse"),
                icon: Search,
                link: "/events",
              },
            ].map((stat, index) => (
              <FadeIn key={index} direction="up" delay={(index + 1) * 100}>
                <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <stat.icon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-3xl font-bold text-gray-900">
                      {typeof stat.value === "number"
                        ? formatNumber(stat.value)
                        : stat.value}
                    </div>
                    {stat.link && (
                      <Button asChild variant="link" className="px-0 h-auto">
                        <Link
                          href={stat.link}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {tCommon("viewDetails")}{" "}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Next Event for Attendees */}
          {nextEvent && (
            <FadeIn direction="up" delay={500}>
              <Card className="border-2 border-blue-100 bg-blue-50/30 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {t("nextEvent.title")}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {t("nextEvent.comingSoon")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {nextEvent.event.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(nextEvent.event.startDate), "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(new Date(nextEvent.event.startDate), "p")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{nextEvent.event.location}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-white"
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
        </>
      )}

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        {isOrganizer && !isAdmin && (
          <FadeIn direction="up" delay={600}>
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      {t("recentEvents.yourEvents")}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {t("recentEvents.recentlyCreated")}
                    </CardDescription>
                  </div>
                  {myEvents && myEvents.length > 0 && (
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href="/dashboard/my-events"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {tCommon("viewAll")}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {myEvents && myEvents.length > 0 ? (
                  <div className="space-y-3">
                    {myEvents.slice(0, 5).map((event) => {
                      const eventData = event as unknown as EventWithRelations;
                      const ticketsSold = calculateTotalTicketsSold(eventData);
                      const fillRate = calculateFillPercentage(eventData);

                      return (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm truncate text-gray-900">
                                {event.title}
                              </h4>
                              <Badge
                                variant={
                                  event.status === "PUBLISHED"
                                    ? "default"
                                    : "secondary"
                                }
                                className="flex-shrink-0"
                              >
                                {event.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(event.startDate), "MMM dd")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3.5 h-3.5" />
                                {formatNumber(ticketsSold)} /{" "}
                                {formatNumber(event.capacity)}
                              </span>
                            </div>
                            <Progress value={fillRate} className="h-1.5" />
                          </div>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                          >
                            <Link href={`/events/${event.id}/manage`}>
                              <Settings className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">
                        {t("recentEvents.noEventsYet")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("recentEvents.createFirst")}
                      </p>
                    </div>
                    <Button
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Link href="/events/create">
                        <Plus className="w-4 h-4 mr-2" />
                        {tNav("createEvent")}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Upcoming Registrations / Top Performing */}
        <FadeIn direction="up" delay={isOrganizer && !isAdmin ? 700 : 600}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    {isOrganizer && !isAdmin
                      ? t("topPerforming.title")
                      : t("upcomingRegistrations.title")}
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {isOrganizer && !isAdmin
                      ? t("topPerforming.subtitle")
                      : t("upcomingRegistrations.subtitle")}
                  </CardDescription>
                </div>
                {myRegistrations &&
                  myRegistrations.length > 0 &&
                  !isOrganizer && (
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href="/dashboard/registrations"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {tCommon("viewAll")}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  )}
              </div>
            </CardHeader>
            <CardContent>
              {isOrganizer && !isAdmin ? (
                myEvents &&
                myEvents.filter((e) => e.status === "PUBLISHED").length > 0 ? (
                  <div className="space-y-3">
                    {myEvents
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
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex-1 min-w-0 space-y-2">
                              <h4 className="font-semibold text-sm truncate text-gray-900">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Ticket className="w-3.5 h-3.5" />
                                  {formatNumber(ticketsSold)} /{" "}
                                  {formatNumber(event.capacity)}
                                </span>
                                {revenue > 0 && (
                                  <span className="flex items-center gap-1">
                                    {formatCurrency(revenue)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={fillRate}
                                  className="h-1.5 flex-1"
                                />
                                <span className="text-xs font-semibold text-gray-700 min-w-[3rem] text-right">
                                  {fillRate.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                            >
                              <Link href={`/events/${event.id}/manage`}>
                                <Settings className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <BarChart3 className="w-12 h-12 mx-auto text-gray-300" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">
                        {t("topPerforming.noPublished")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("topPerforming.publishToSee")}
                      </p>
                    </div>
                  </div>
                )
              ) : myRegistrations &&
                myRegistrations.filter(
                  (reg) => new Date(reg.event.startDate) > new Date()
                ).length > 0 ? (
                <div className="space-y-3">
                  {myRegistrations
                    .filter((reg) => new Date(reg.event.startDate) > new Date())
                    .slice(0, 5)
                    .map((registration) => (
                      <div
                        key={registration.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0 space-y-2">
                          <h4 className="font-semibold text-sm truncate text-gray-900">
                            {registration.event.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(
                                new Date(registration.event.startDate),
                                "MMM dd, yyyy"
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {registration.event.location}
                              </span>
                            </span>
                          </div>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                        >
                          <Link href={`/events/${registration.event.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <Users className="w-12 h-12 mx-auto text-gray-300" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">
                      {t("upcomingRegistrations.noUpcoming")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("upcomingRegistrations.browseToFind")}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href="/events">
                      <Search className="w-4 h-4 mr-2" />
                      {tNav("browseEvents")}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Performance Insights - Organizers Only */}
      {isOrganizer && !isAdmin && myEvents && myEvents.length > 0 && (
        <FadeIn direction="up" delay={800}>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle className="text-base font-semibold">
                    {t("performanceInsights.title")}
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {t("performanceInsights.subtitle")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Most Popular Event */}
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">
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
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {mostPopular.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatNumber(
                            calculateTotalTicketsSold(
                              mostPopular as unknown as EventWithRelations
                            )
                          )}{" "}
                          {t("performanceInsights.ticketsSold")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">
                        {t("performanceInsights.noPublishedEvents")}
                      </p>
                    );
                  })()}
                </div>

                {/* Highest Revenue */}
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">
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
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {highestRevenue.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatCurrency(revenue)}{" "}
                          {t("performanceInsights.earned")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">
                        {t("performanceInsights.noPaidEvents")}
                      </p>
                    );
                  })()}
                </div>

                {/* Next Event */}
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">
                      {t("performanceInsights.comingNext")}
                    </h4>
                  </div>
                  {nextOrganizerEvent ? (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {nextOrganizerEvent.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(
                          new Date(nextOrganizerEvent.startDate),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">
                      {t("performanceInsights.noUpcomingEvents")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Quick Actions */}
      <FadeIn direction="up" delay={900}>
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  {t("quickActions.title")}
                </CardTitle>
                <CardDescription className="mt-1 text-xs">
                  {t("quickActions.subtitle")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isAdmin && (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto p-6 justify-start border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group"
                  >
                    <Link href="/dashboard/users" className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <UserCog className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-gray-900">
                            {t("quickActions.manageUsers.title")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t("quickActions.manageUsers.description")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-auto p-6 justify-start border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group"
                  >
                    <Link href="/dashboard/categories" className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <Settings className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-gray-900">
                            {t("quickActions.categories.title")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t("quickActions.categories.description")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-auto p-6 justify-start border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group"
                  >
                    <Link href="/events/create" className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <Plus className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-gray-900">
                            {t("quickActions.createEvent.title")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t("quickActions.createEvent.description")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </>
              )}

              {isOrganizer && !isAdmin && (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto p-6 justify-start border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group"
                  >
                    <Link href="/events/create" className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <Plus className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-gray-900">
                            {t("quickActions.createEvent.title")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t("quickActions.createEvent.description")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-auto p-6 justify-start border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group"
                  >
                    <Link href="/dashboard/my-events" className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <Calendar className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-gray-900">
                            {t("quickActions.myEvents.title")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t("quickActions.myEvents.description")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-auto p-6 justify-start border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group"
                  >
                    <Link href="/dashboard/analytics" className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <BarChart3 className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm text-gray-900">
                            {t("quickActions.analytics.title")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t("quickActions.analytics.description")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </>
              )}

              <Button
                asChild
                variant="outline"
                className="h-auto p-6 justify-start border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group"
              >
                <Link href="/events" className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Search className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm text-gray-900">
                        {t("quickActions.browseEvents.title")}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t("quickActions.browseEvents.description")}
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-6 justify-start border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group"
              >
                <Link href="/dashboard/settings" className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Settings className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm text-gray-900">
                        {t("quickActions.settings.title")}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t("quickActions.settings.description")}
                      </div>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
