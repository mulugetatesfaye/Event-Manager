"use client";

import {
  useMyRegistrations,
  useMyEvents,
  useCancelRegistration,
} from "@/hooks";
import { useCurrentUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/ui/fade-in";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Users,
  Eye,
  Mail,
  X,
  CheckCircle2,
  Clock,
  Search,
  DollarSign,
  ChevronDown,
  AlertTriangle,
  Shield,
  Building,
  Sparkles,
  CalendarDays,
  Ticket,
  Star,
  Rocket,
  ChevronUp,
  UserCheck,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import {
  DashboardEvent,
  DashboardRegistration,
  RegistrationWithRelations,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STAT_COLORS = {
  primary: {
    bg: "bg-orange-50",
    icon: "bg-orange-600",
    gradient: "from-orange-50 to-white",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-600",
    gradient: "from-blue-50 to-white",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-600",
    gradient: "from-emerald-50 to-white",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-600",
    gradient: "from-purple-50 to-white",
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
  color?: keyof typeof STAT_COLORS;
  delay?: number;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "primary",
  delay = 0,
}: StatCardProps) {
  const colorConfig = STAT_COLORS[color];

  return (
    <FadeIn direction="up" delay={delay}>
      <Card
        className={cn(
          "group relative overflow-hidden border-slate-200 bg-white transition-all duration-300",
          "hover:border-orange-300 hover:shadow-lg h-full"
        )}
      >
        <div
          className={cn(
            "absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full blur-2xl opacity-30 -mr-10 -mt-10 transition-opacity group-hover:opacity-50",
            colorConfig.bg
          )}
        />

        <CardContent className="p-4 sm:p-5 lg:p-6 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">
                {title}
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
                {typeof value === "number" ? formatNumber(value) : value}
              </p>
              {subtitle && (
                <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
                colorConfig.icon
              )}
            >
              <Icon className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; href: string; icon?: React.ElementType };
}) {
  return (
    <div className="text-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 mb-4 sm:mb-6">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 mb-6 sm:mb-8 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <Button
          asChild
          size="lg"
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

function LoadingSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-slate-700" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 bg-slate-700" />
            <Skeleton className="h-4 w-48 sm:w-64 bg-slate-700" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 sm:h-4 w-14 sm:w-20" />
                  <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
                  <Skeleton className="h-2 sm:h-3 w-16 sm:w-24" />
                </div>
                <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 rounded-lg sm:rounded-xl flex-shrink-0" />
              </div>
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

export default function RegistrationsPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  if (userLoading) {
    return <LoadingSkeleton />;
  }

  if (currentUser?.role === "ADMIN") {
    return <AdminView />;
  } else if (currentUser?.role === "ATTENDEE") {
    return <AttendeeView />;
  } else {
    return <OrganizerView />;
  }
}

// ============================================================================
// ADMIN VIEW
// ============================================================================

function AdminView() {
  const { data: allEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["admin-all-events"],
    queryFn: async () => {
      const response = await fetch("/api/admin/events?limit=0");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const { data: allRegistrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ["admin-all-registrations"],
    queryFn: async () => {
      const response = await fetch("/api/admin/registrations");
      if (!response.ok) throw new Error("Failed to fetch registrations");
      return response.json();
    },
  });

  const stats = useMemo(() => {
    if (!allRegistrations || !allEvents)
      return {
        totalEvents: 0,
        totalRegistrations: 0,
        upcomingEvents: 0,
        totalRevenue: 0,
      };

    const totalRegistrations = allRegistrations.length;

    const totalRevenue = allRegistrations.reduce(
      (sum: number, reg: RegistrationWithRelations) =>
        sum + (reg.finalAmount || reg.totalAmount || reg.event?.price || 0),
      0
    );

    const upcomingEvents = allEvents.filter(
      (event: DashboardEvent) => new Date(event.startDate) > new Date()
    ).length;

    return {
      totalEvents: allEvents.length,
      totalRegistrations,
      upcomingEvents,
      totalRevenue,
    };
  }, [allEvents, allRegistrations]);

  const eventRegistrations = useMemo(() => {
    if (!allEvents || !allRegistrations) return [];

    return allEvents
      .map((event: DashboardEvent) => {
        const registrations = allRegistrations.filter(
          (reg: RegistrationWithRelations) => reg.eventId === event.id
        );

        return {
          event,
          registrations,
          count: registrations.length,
          fillRate: Math.round((registrations.length / event.capacity) * 100),
        };
      })
      .sort(
        (a: { event: DashboardEvent }, b: { event: DashboardEvent }) =>
          new Date(b.event.startDate).getTime() -
          new Date(a.event.startDate).getTime()
      );
  }, [allEvents, allRegistrations]);

  const isLoading = eventsLoading || registrationsLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-red-600/20 rounded-full blur-3xl -mr-16 sm:-mr-32 -mt-16 sm:-mt-32" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-orange-600/10 rounded-full blur-2xl -ml-12 sm:-ml-24 -mb-12 sm:-mb-24" />

          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  All Registrations
                </h1>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/25 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base">
                System-wide view of all event registrations
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          color="primary"
          delay={100}
        />
        <StatCard
          title="Total Registrations"
          value={stats.totalRegistrations}
          icon={Users}
          color="blue"
          delay={150}
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={Clock}
          color="purple"
          delay={200}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="emerald"
          delay={250}
        />
      </div>

      {/* Events with Registrations */}
      <div>
        <FadeIn direction="up" delay={300}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                <BarChart3 className="w-3 h-3 mr-1.5" />
                Event Registrations
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              All Event Registrations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View registrations across all events in the system
            </p>
          </div>
        </FadeIn>

        {eventRegistrations.length === 0 ? (
          <FadeIn direction="up" delay={350}>
            <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
              <EmptyState
                icon={Calendar}
                title="No events in system"
                description="No events have been created yet"
              />
            </Card>
          </FadeIn>
        ) : (
          <div className="space-y-4">
            {eventRegistrations.map(
              (
                item: {
                  event: DashboardEvent;
                  registrations: RegistrationWithRelations[];
                  count: number;
                  fillRate: number;
                },
                index: number
              ) => (
                <FadeIn
                  key={item.event.id}
                  direction="up"
                  delay={350 + index * 50}
                >
                  <EventWithRegistrationsCard
                    event={item.event}
                    registrations={item.registrations}
                    count={item.count}
                    fillRate={item.fillRate}
                    isAdmin={true}
                  />
                </FadeIn>
              )
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <FadeIn direction="up" delay={500}>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Admin Access</span>
          </div>
          <div className="w-px h-3 sm:h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Full Control</span>
          </div>
          <div className="w-px h-3 sm:h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Real-time Updates</span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

// ============================================================================
// ATTENDEE VIEW
// ============================================================================

function AttendeeView() {
  const { data: registrations, isLoading } = useMyRegistrations();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>("");
  const [selectedEventStartDate, setSelectedEventStartDate] = useState<
    Date | string | null
  >(null);

  const handleCancelClick = (
    eventId: string,
    eventTitle: string,
    eventStartDate: Date | string
  ) => {
    setSelectedEventId(eventId);
    setSelectedEventTitle(eventTitle);
    setSelectedEventStartDate(eventStartDate);
    setCancelDialogOpen(true);
  };

  const cancelMutation = useCancelRegistration(selectedEventId || "");

  const handleCancelConfirm = async () => {
    if (selectedEventId && selectedEventStartDate) {
      await cancelMutation.mutateAsync(selectedEventStartDate);
      setCancelDialogOpen(false);
      setSelectedEventId(null);
      setSelectedEventTitle("");
      setSelectedEventStartDate(null);
    }
  };

  const upcomingRegistrations = useMemo(() => {
    return (
      registrations
        ?.filter(
          (reg: DashboardRegistration) =>
            new Date(reg.event.startDate) > new Date()
        )
        .sort(
          (a: DashboardRegistration, b: DashboardRegistration) =>
            new Date(a.event.startDate).getTime() -
            new Date(b.event.startDate).getTime()
        ) || []
    );
  }, [registrations]);

  const pastRegistrations = useMemo(() => {
    return (
      registrations
        ?.filter(
          (reg: DashboardRegistration) =>
            new Date(reg.event.startDate) <= new Date()
        )
        .sort(
          (a: DashboardRegistration, b: DashboardRegistration) =>
            new Date(b.event.startDate).getTime() -
            new Date(a.event.startDate).getTime()
        ) || []
    );
  }, [registrations]);

  const stats = useMemo(() => {
    return {
      total: registrations?.length || 0,
      upcoming: upcomingRegistrations.length,
      past: pastRegistrations.length,
    };
  }, [registrations, upcomingRegistrations, pastRegistrations]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-orange-600/20 rounded-full blur-3xl -mr-16 sm:-mr-32 -mt-16 sm:-mt-32" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-orange-600/10 rounded-full blur-2xl -ml-12 sm:-ml-24 -mb-12 sm:-mb-24" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/30">
                <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    My Registrations
                  </h1>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/25 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Attendee
                  </Badge>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm lg:text-base">
                  Events you&apos;re registered to attend
                </p>
              </div>
            </div>

            <Button
              asChild
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 text-xs sm:text-sm h-9 sm:h-10"
            >
              <Link href="/events">
                <Search className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Browse</span> Events
              </Link>
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title="Total"
            value={stats.total}
            icon={Calendar}
            color="primary"
            delay={100}
          />
          <StatCard
            title="Upcoming"
            value={stats.upcoming}
            icon={Clock}
            color="blue"
            delay={150}
          />
          <StatCard
            title="Completed"
            value={stats.past}
            icon={CheckCircle2}
            color="emerald"
            delay={200}
          />
        </div>
      )}

      {/* Events Tabs */}
      <FadeIn direction="up" delay={250}>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-10 sm:h-11 bg-slate-100 p-1">
            <TabsTrigger
              value="upcoming"
              className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
            >
              Upcoming ({formatNumber(upcomingRegistrations.length)})
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
            >
              Past ({formatNumber(pastRegistrations.length)})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingRegistrations.length === 0 ? (
              <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
                <EmptyState
                  icon={Calendar}
                  title="No upcoming events"
                  description="Discover and register for exciting events happening around you"
                  action={{
                    label: "Browse Events",
                    href: "/events",
                    icon: Search,
                  }}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {upcomingRegistrations.map(
                  (registration: DashboardRegistration) => (
                    <EventRegistrationCard
                      key={registration.id}
                      registration={registration}
                      onCancel={handleCancelClick}
                      isUpcoming
                    />
                  )
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastRegistrations.length === 0 ? (
              <Card className="border-slate-200">
                <EmptyState
                  icon={CheckCircle2}
                  title="No past events"
                  description="Events you've attended will appear here"
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {pastRegistrations.map(
                  (registration: DashboardRegistration) => (
                    <EventRegistrationCard
                      key={registration.id}
                      registration={registration}
                      onCancel={handleCancelClick}
                      isUpcoming={false}
                    />
                  )
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </FadeIn>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="border-slate-200 max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg sm:text-xl font-bold text-slate-900">
                  Cancel Registration?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm text-slate-500 mt-1">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-orange-800">
                Are you sure you want to cancel your registration for{" "}
                <span className="font-semibold">{selectedEventTitle}</span>?
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 sm:mt-6 flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="border-slate-300 hover:bg-slate-50 w-full sm:w-auto">
              Keep Registration
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 w-full sm:w-auto"
            >
              {cancelMutation.isPending
                ? "Cancelling..."
                : "Cancel Registration"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <FadeIn direction="up" delay={400}>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Secure Platform</span>
          </div>
          <div className="w-px h-3 sm:h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Trusted by thousands</span>
          </div>
          <div className="w-px h-3 sm:h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Fast & Reliable</span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

// ============================================================================
// EVENT REGISTRATION CARD
// ============================================================================

function EventRegistrationCard({
  registration,
  onCancel,
  isUpcoming,
}: {
  registration: DashboardRegistration;
  onCancel: (eventId: string, title: string, startDate: Date | string) => void;
  isUpcoming: boolean;
}) {
  return (
    <Card
      className={cn(
        "border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 h-full overflow-hidden",
        !isUpcoming && "opacity-75 hover:opacity-90"
      )}
    >
      <CardContent className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {registration.event.category && (
            <Badge
              className="text-xs font-medium"
              style={{
                backgroundColor: registration.event.category.color || "#6b7280",
                color: "white",
                borderColor: registration.event.category.color || "#6b7280",
              }}
            >
              {registration.event.category.name}
            </Badge>
          )}
          <Badge
            className={cn(
              "text-xs flex-shrink-0",
              isUpcoming
                ? registration.status === "CONFIRMED"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-blue-100 text-blue-700 border-blue-200"
            )}
          >
            {isUpcoming ? registration.status : "COMPLETED"}
          </Badge>
        </div>

        {/* Event Title */}
        <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-4 line-clamp-2 min-h-[3rem]">
          {registration.event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-slate-900">
                {format(
                  new Date(registration.event.startDate),
                  "EEEE, MMM dd, yyyy"
                )}
              </div>
              <div className="text-xs text-slate-500">
                {format(new Date(registration.event.startDate), "h:mm a")}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{registration.event.location}</span>
          </div>
          {registration.event.price > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-medium text-slate-900">
                {formatCurrency(registration.event.price)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            className={cn(
              "flex-1 h-9 text-sm",
              isUpcoming
                ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
                : "border-slate-300 hover:bg-slate-50"
            )}
            variant={isUpcoming ? "default" : "outline"}
          >
            <Link href={`/events/${registration.event.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Event
            </Link>
          </Button>
          {isUpcoming && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
              onClick={() =>
                onCancel(
                  registration.event.id,
                  registration.event.title,
                  registration.event.startDate
                )
              }
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ORGANIZER VIEW
// ============================================================================

function OrganizerView() {
  const { data: myEvents, isLoading: eventsLoading } = useMyEvents();

  const { data: allRegistrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ["organizer-registrations"],
    queryFn: async () => {
      const response = await fetch("/api/registrations/my-events");
      if (!response.ok) throw new Error("Failed to fetch registrations");
      return response.json();
    },
    enabled: !!myEvents && myEvents.length > 0,
  });

  const stats = useMemo(() => {
    if (!allRegistrations)
      return {
        totalEvents: myEvents?.length || 0,
        totalRegistrations: 0,
        upcomingEvents: 0,
        totalRevenue: 0,
      };

    const totalRegistrations = allRegistrations.length;

    const totalRevenue = allRegistrations.reduce(
      (sum: number, reg: RegistrationWithRelations) =>
        sum + (reg.finalAmount || reg.totalAmount || reg.event?.price || 0),
      0
    );

    const upcomingEvents =
      myEvents?.filter(
        (event: DashboardEvent) => new Date(event.startDate) > new Date()
      ).length || 0;

    return {
      totalEvents: myEvents?.length || 0,
      totalRegistrations,
      upcomingEvents,
      totalRevenue,
    };
  }, [myEvents, allRegistrations]);

  const eventRegistrations = useMemo(() => {
    if (!myEvents || !allRegistrations) return [];

    return myEvents
      .map((event: DashboardEvent) => {
        const registrations = allRegistrations.filter(
          (reg: RegistrationWithRelations) => reg.eventId === event.id
        );

        return {
          event,
          registrations,
          count: registrations.length,
          fillRate: Math.round((registrations.length / event.capacity) * 100),
        };
      })
      .sort(
        (a: { event: DashboardEvent }, b: { event: DashboardEvent }) =>
          new Date(b.event.startDate).getTime() -
          new Date(a.event.startDate).getTime()
      );
  }, [myEvents, allRegistrations]);

  const isLoading = eventsLoading || registrationsLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <FadeIn direction="down">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-orange-600/20 rounded-full blur-3xl -mr-16 sm:-mr-32 -mt-16 sm:-mt-32" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-orange-600/10 rounded-full blur-2xl -ml-12 sm:-ml-24 -mb-12 sm:-mb-24" />

          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/30">
              <Ticket className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  Event Registrations
                </h1>
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/25 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Organizer
                </Badge>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm lg:text-base">
                View and manage registrations across all your events
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      {stats.totalEvents > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            color="primary"
            delay={100}
          />
          <StatCard
            title="Registrations"
            value={stats.totalRegistrations}
            icon={Users}
            color="blue"
            delay={150}
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingEvents}
            icon={Clock}
            color="purple"
            delay={200}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            color="emerald"
            delay={250}
          />
        </div>
      )}

      {/* Events with Registrations */}
      <div>
        <FadeIn direction="up" delay={300}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                <BarChart3 className="w-3 h-3 mr-1.5" />
                Event Details
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Event Registrations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Click on an event to view registrant details
            </p>
          </div>
        </FadeIn>

        {eventRegistrations.length === 0 ? (
          <FadeIn direction="up" delay={350}>
            <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
              <EmptyState
                icon={Calendar}
                title="No events yet"
                description="Create your first event to start receiving registrations"
                action={{
                  label: "Create Event",
                  href: "/events/create",
                  icon: Calendar,
                }}
              />
            </Card>
          </FadeIn>
        ) : (
          <div className="space-y-4">
            {eventRegistrations.map(
              (
                item: {
                  event: DashboardEvent;
                  registrations: RegistrationWithRelations[];
                  count: number;
                  fillRate: number;
                },
                index: number
              ) => (
                <FadeIn
                  key={item.event.id}
                  direction="up"
                  delay={350 + index * 50}
                >
                  <EventWithRegistrationsCard
                    event={item.event}
                    registrations={item.registrations}
                    count={item.count}
                    fillRate={item.fillRate}
                  />
                </FadeIn>
              )
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <FadeIn direction="up" delay={500}>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Secure Platform</span>
          </div>
          <div className="w-px h-3 sm:h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Trusted by thousands</span>
          </div>
          <div className="w-px h-3 sm:h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            <span>Fast & Reliable</span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

// ============================================================================
// EVENT WITH REGISTRATIONS CARD
// ============================================================================

function EventWithRegistrationsCard({
  event,
  registrations,
  count,
  fillRate,
  isAdmin = false,
}: {
  event: DashboardEvent;
  registrations: RegistrationWithRelations[];
  count: number;
  fillRate: number;
  isAdmin?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isUpcoming = new Date(event.startDate) > new Date();

  return (
    <Card className="border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        {/* Event Header */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 sm:gap-4 mb-3">
              <div className="h-11 w-11 sm:h-12 sm:w-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900 truncate">
                    {event.title}
                  </h3>
                  <Badge
                    className={cn(
                      "text-xs flex-shrink-0",
                      event.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    )}
                  >
                    {event.status}
                  </Badge>
                  {!isUpcoming && (
                    <Badge className="text-xs flex-shrink-0 bg-blue-100 text-blue-700 border-blue-200">
                      Past
                    </Badge>
                  )}
                  {isAdmin && event.organizer && (
                    <Badge className="text-xs flex-shrink-0 border-purple-200 bg-purple-50 text-purple-700">
                      <Building className="w-3 h-3 mr-1" />
                      {event.organizer.firstName} {event.organizer.lastName}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(new Date(event.startDate), "MMM dd, yyyy")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {format(new Date(event.startDate), "h:mm a")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                      {event.location}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center min-w-[100px] sm:min-w-[120px]">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {formatNumber(count)}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mb-3">
                of {formatNumber(event.capacity)}
              </p>
              <Progress value={fillRate} className="h-1.5 sm:h-2 w-full mb-1" />
              <p className="text-[10px] sm:text-xs text-slate-600">
                {fillRate}% filled
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {count > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 hover:border-orange-300 hover:bg-orange-50 text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <ChevronUp className="w-4 h-4 sm:mr-1.5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:mr-1.5" />
                  )}
                  <span className="hidden sm:inline">
                    {expanded ? "Hide" : "Show"}
                  </span>{" "}
                  ({formatNumber(count)})
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-slate-300 hover:border-orange-300 hover:bg-orange-50 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Link href={`/events/${event.id}`}>
                  <Eye className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">View</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Registrations List */}
        {expanded && count > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="space-y-3">
              {registrations.map((registration: RegistrationWithRelations) => (
                <div
                  key={registration.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-slate-200">
                      <AvatarImage
                        src={registration.user?.imageUrl || undefined}
                        alt={`${registration.user?.firstName} ${registration.user?.lastName}`}
                      />
                      <AvatarFallback className="bg-orange-600 text-white text-xs sm:text-sm font-semibold">
                        {registration.user?.firstName?.[0]}
                        {registration.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                        {registration.user?.firstName}{" "}
                        {registration.user?.lastName}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {registration.user?.email}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <Badge
                      className={cn(
                        "text-xs mb-1",
                        registration.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      )}
                    >
                      {registration.status}
                    </Badge>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      {format(new Date(registration.createdAt), "MMM dd")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
