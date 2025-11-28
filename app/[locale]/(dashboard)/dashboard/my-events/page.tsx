"use client";

import { useMyEvents, useDeleteEvent } from "@/hooks";
import { useCurrentUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/ui/fade-in";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Shield,
  Building,
  Sparkles,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  Settings,
  Ticket,
  Star,
  Rocket,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { DashboardEvent } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STAT_COLORS = {
  primary: {
    bg: "bg-orange-50",
    icon: "bg-orange-600",
    text: "text-orange-600",
    border: "border-orange-200",
    gradient: "from-orange-50 to-white",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-600",
    text: "text-blue-600",
    border: "border-blue-200",
    gradient: "from-blue-50 to-white",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-200",
    gradient: "from-emerald-50 to-white",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-600",
    text: "text-purple-600",
    border: "border-purple-200",
    gradient: "from-purple-50 to-white",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-600",
    text: "text-amber-600",
    border: "border-amber-200",
    gradient: "from-amber-50 to-white",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-600",
    text: "text-red-600",
    border: "border-red-200",
    gradient: "from-red-50 to-white",
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
// TYPES
// ============================================================================

interface AdminEventData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string;
  venue: string | null;
  startDate: Date | string;
  endDate: Date | string;
  capacity: number;
  price: number;
  status: string;
  totalTicketsSold: number;
  totalRevenue: number;
  fillRate: number;
  availableSpots: number;
  organizer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  _count: {
    registrations: number;
    ticketTypes: number;
  };
  ticketTypes?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    quantitySold: number;
  }>;
}

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
          "hover:border-orange-300 hover:shadow-lg"
        )}
      >
        {/* Decorative gradient */}
        <div
          className={cn(
            "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 -mr-12 -mt-12 transition-opacity group-hover:opacity-50",
            colorConfig.bg
          )}
        />

        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="text-2xl font-bold text-slate-900">
                {typeof value === "number" ? formatNumber(value) : value}
              </p>
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
    </FadeIn>
  );
}

interface SectionHeaderProps {
  badge?: {
    icon: React.ElementType;
    text: string;
    color?: "orange" | "blue" | "emerald" | "red";
  };
  title: string;
  description?: string;
}

function SectionHeader({ badge, title, description }: SectionHeaderProps) {
  const badgeColors = {
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    red: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="flex items-center gap-3">
      {badge && (
        <Badge
          className={cn(
            "hover:bg-opacity-90",
            badgeColors[badge.color || "orange"]
          )}
        >
          <badge.icon className="w-3 h-3 mr-1.5" />
          {badge.text}
        </Badge>
      )}
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
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
    <div className="text-center py-16 px-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 mb-6">
        <Icon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
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

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-xl bg-slate-700" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-slate-700" />
            <Skeleton className="h-4 w-64 bg-slate-700" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200 bg-slate-50">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PUBLISHED":
      return {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    case "DRAFT":
      return {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: FileText,
      };
    case "CANCELLED":
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      };
    case "COMPLETED":
      return {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: CheckCircle2,
      };
    default:
      return {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: FileText,
      };
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MyEventsPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  if (userLoading) {
    return <LoadingSkeleton />;
  }

  if (isAdmin) {
    return <AdminMyEventsView />;
  }

  return <OrganizerMyEventsView />;
}

// ============================================================================
// ADMIN VIEW
// ============================================================================

function AdminMyEventsView() {
  const deleteEvent = useDeleteEvent();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery<AdminEventData[]>({
    queryKey: ["admin-my-events"],
    queryFn: async () => {
      const response = await fetch("/api/admin/events?limit=0");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const handleDeleteClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedEventId) {
      await deleteEvent.mutateAsync(selectedEventId);
      setDeleteDialogOpen(false);
      setSelectedEventId(null);
    }
  };

  const stats = useMemo(() => {
    if (!events)
      return {
        total: 0,
        published: 0,
        draft: 0,
        completed: 0,
        totalAttendees: 0,
        totalRevenue: 0,
      };

    return {
      total: events.length,
      published: events.filter((e: AdminEventData) => e.status === "PUBLISHED")
        .length,
      draft: events.filter((e: AdminEventData) => e.status === "DRAFT").length,
      completed: events.filter((e: AdminEventData) => e.status === "COMPLETED")
        .length,
      totalAttendees: events.reduce(
        (sum: number, e: AdminEventData) => sum + (e.totalTicketsSold || 0),
        0
      ),
      totalRevenue: events.reduce(
        (sum: number, e: AdminEventData) => sum + (e.totalRevenue || 0),
        0
      ),
    };
  }, [events]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      {/* ============================================================ */}
      {/* HEADER SECTION */}
      {/* ============================================================ */}
      <FadeIn direction="down">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/10 rounded-full blur-2xl -ml-24 -mb-24" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold">All Events</h1>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/25">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-slate-300 text-sm sm:text-base">
                  Manage and monitor all events across the platform
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
              >
                <Link href="/events">
                  <Eye className="w-4 h-4 mr-2" />
                  Browse Events
                </Link>
              </Button>
              <Button
                asChild
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30"
              >
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ============================================================ */}
      {/* STATS OVERVIEW */}
      {/* ============================================================ */}
      {events && events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          <StatCard
            title="Total Events"
            value={stats.total}
            subtitle="All events"
            icon={Calendar}
            color="primary"
            delay={100}
          />
          <StatCard
            title="Published"
            value={stats.published}
            subtitle="Live events"
            icon={CheckCircle2}
            color="emerald"
            delay={150}
          />
          <StatCard
            title="Drafts"
            value={stats.draft}
            subtitle="Unpublished"
            icon={FileText}
            color="amber"
            delay={200}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            subtitle="Past events"
            icon={Clock}
            color="blue"
            delay={250}
          />
          <StatCard
            title="Tickets Sold"
            value={stats.totalAttendees}
            subtitle="Total sales"
            icon={Users}
            color="purple"
            delay={300}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle="Total earned"
            icon={DollarSign}
            color="emerald"
            delay={350}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* EVENTS TABLE */}
      {/* ============================================================ */}
      {!events || events.length === 0 ? (
        <FadeIn direction="up" delay={200}>
          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
            <EmptyState
              icon={Calendar}
              title="No events in the system"
              description="No events have been created yet. Be the first to create one!"
              action={{
                label: "Create First Event",
                href: "/events/create",
                icon: Plus,
              }}
            />
          </Card>
        </FadeIn>
      ) : (
        <FadeIn direction="up" delay={400}>
          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <SectionHeader
                  badge={{
                    icon: BarChart3,
                    text: "Platform Events",
                    color: "orange",
                  }}
                  title="All Events"
                  description={`${formatNumberFull(events.length)} ${
                    events.length === 1 ? "event" : "events"
                  } total`}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Event
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Organizer
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Location
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Capacity
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event: AdminEventData, index: number) => {
                      const statusConfig = getStatusConfig(event.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow
                          key={event.id}
                          className="group hover:bg-orange-50/50 transition-colors border-b border-slate-100"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50 group-hover:scale-105 transition-transform">
                                <CalendarDays className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <span className="font-semibold text-sm text-slate-900 truncate max-w-[200px] block group-hover:text-orange-600 transition-colors">
                                  {event.title}
                                </span>
                                {event.category && (
                                  <span className="text-xs text-slate-500">
                                    {event.category.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                                <Building className="w-4 h-4 text-slate-500" />
                              </div>
                              <span className="text-sm text-slate-600 truncate max-w-[120px]">
                                {event.organizer.firstName}{" "}
                                {event.organizer.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium text-slate-900">
                                {format(
                                  new Date(event.startDate),
                                  "MMM dd, yyyy"
                                )}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(event.startDate), "h:mm a")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2 max-w-[180px]">
                              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600 truncate">
                                {event.location}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-2 min-w-[140px]">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1.5 text-slate-600">
                                  <Ticket className="w-4 h-4 text-slate-400" />
                                  <span className="font-medium text-slate-900">
                                    {formatNumberFull(
                                      event.totalTicketsSold || 0
                                    )}
                                  </span>
                                  <span className="text-slate-400">/</span>
                                  <span>
                                    {formatNumberFull(event.capacity)}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={event.fillRate || 0}
                                  className="h-1.5 flex-1"
                                />
                                <span className="text-xs font-semibold text-slate-600 min-w-[2.5rem] text-right">
                                  {event.fillRate || 0}%
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              className={cn(
                                "text-xs gap-1.5 font-medium",
                                statusConfig.color
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-100"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-slate-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 border-slate-200"
                              >
                                <DropdownMenuLabel className="text-xs text-slate-500 font-medium">
                                  Event Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem
                                  asChild
                                  className="cursor-pointer focus:bg-orange-50"
                                >
                                  <Link
                                    href={`/events/${event.id}`}
                                    className="flex items-center"
                                  >
                                    <Eye className="w-4 h-4 mr-2 text-slate-500" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  asChild
                                  className="cursor-pointer focus:bg-orange-50"
                                >
                                  <Link
                                    href={`/events/${event.id}/edit`}
                                    className="flex items-center"
                                  >
                                    <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                    Edit Event
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  asChild
                                  className="cursor-pointer focus:bg-orange-50"
                                >
                                  <Link
                                    href={`/events/${event.id}/manage`}
                                    className="flex items-center"
                                  >
                                    <Settings className="w-4 h-4 mr-2 text-slate-500" />
                                    Manage Event
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                  onClick={() => handleDeleteClick(event.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ============================================================ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-slate-200">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-slate-900">
                  Delete Event?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-slate-500 mt-1">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">
                This will permanently delete the event and all associated
                registrations, tickets, and data from our servers.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="border-slate-300 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================================ */}
      {/* FOOTER TRUST BADGES */}
      {/* ============================================================ */}
      <FadeIn direction="up" delay={500}>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Admin Access</span>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-slate-400" />
            <span>Full Control</span>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-slate-400" />
            <span>Real-time Updates</span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

// ============================================================================
// ORGANIZER VIEW
// ============================================================================

function OrganizerMyEventsView() {
  const { data: events, isLoading } = useMyEvents();
  const deleteEvent = useDeleteEvent();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleDeleteClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedEventId) {
      await deleteEvent.mutateAsync(selectedEventId);
      setDeleteDialogOpen(false);
      setSelectedEventId(null);
    }
  };

  const stats = useMemo(() => {
    if (!events)
      return {
        total: 0,
        published: 0,
        draft: 0,
        completed: 0,
        totalAttendees: 0,
        totalRevenue: 0,
      };

    return {
      total: events.length,
      published: events.filter((e: DashboardEvent) => e.status === "PUBLISHED")
        .length,
      draft: events.filter((e: DashboardEvent) => e.status === "DRAFT").length,
      completed: events.filter((e: DashboardEvent) => e.status === "COMPLETED")
        .length,
      totalAttendees: events.reduce(
        (sum: number, e: { _count?: { registrations?: number } }) =>
          sum + (e._count?.registrations || 0),
        0
      ),
      totalRevenue: events.reduce(
        (
          sum: number,
          e: { price: number; _count?: { registrations?: number } }
        ) => sum + e.price * (e._count?.registrations || 0),
        0
      ),
    };
  }, [events]);

  if (isLoading) {
    return <LoadingSkeleton />;
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
                <CalendarDays className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold">My Events</h1>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/25">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Organizer
                  </Badge>
                </div>
                <p className="text-slate-300 text-sm sm:text-base">
                  Manage and track all your events in one place
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
              >
                <Link href="/dashboard/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button
                asChild
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30"
              >
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ============================================================ */}
      {/* STATS OVERVIEW */}
      {/* ============================================================ */}
      {events && events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          <StatCard
            title="Total Events"
            value={stats.total}
            subtitle="All events"
            icon={Calendar}
            color="primary"
            delay={100}
          />
          <StatCard
            title="Published"
            value={stats.published}
            subtitle="Live events"
            icon={CheckCircle2}
            color="emerald"
            delay={150}
          />
          <StatCard
            title="Drafts"
            value={stats.draft}
            subtitle="Unpublished"
            icon={FileText}
            color="amber"
            delay={200}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            subtitle="Past events"
            icon={Clock}
            color="blue"
            delay={250}
          />
          <StatCard
            title="Attendees"
            value={stats.totalAttendees}
            subtitle="Total registered"
            icon={Users}
            color="purple"
            delay={300}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle="Total earned"
            icon={DollarSign}
            color="emerald"
            delay={350}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* EVENTS TABLE */}
      {/* ============================================================ */}
      {!events || events.length === 0 ? (
        <FadeIn direction="up" delay={200}>
          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
            <EmptyState
              icon={Calendar}
              title="No events yet"
              description="Get started by creating your first event and sharing it with your audience"
              action={{
                label: "Create Your First Event",
                href: "/events/create",
                icon: Plus,
              }}
            />
          </Card>
        </FadeIn>
      ) : (
        <FadeIn direction="up" delay={400}>
          <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <SectionHeader
                  badge={{
                    icon: Calendar,
                    text: "Your Events",
                    color: "orange",
                  }}
                  title="All Events"
                  description={`${formatNumberFull(events.length)} ${
                    events.length === 1 ? "event" : "events"
                  } total`}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Event
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Location
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Capacity
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event: DashboardEvent, index: number) => {
                      const fillRate = Math.round(
                        ((event._count?.registrations || 0) / event.capacity) *
                          100
                      );
                      const statusConfig = getStatusConfig(event.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow
                          key={event.id}
                          className="group hover:bg-orange-50/50 transition-colors border-b border-slate-100"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50 group-hover:scale-105 transition-transform">
                                <CalendarDays className="w-5 h-5 text-orange-600" />
                              </div>
                              <span className="font-semibold text-sm text-slate-900 truncate max-w-[200px] group-hover:text-orange-600 transition-colors">
                                {event.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium text-slate-900">
                                {format(
                                  new Date(event.startDate),
                                  "MMM dd, yyyy"
                                )}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(event.startDate), "h:mm a")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2 max-w-[180px]">
                              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600 truncate">
                                {event.location}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-2 min-w-[140px]">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1.5 text-slate-600">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  <span className="font-medium text-slate-900">
                                    {formatNumberFull(
                                      event._count?.registrations || 0
                                    )}
                                  </span>
                                  <span className="text-slate-400">/</span>
                                  <span>
                                    {formatNumberFull(event.capacity)}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={fillRate}
                                  className="h-1.5 flex-1"
                                />
                                <span className="text-xs font-semibold text-slate-600 min-w-[2.5rem] text-right">
                                  {fillRate}%
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              className={cn(
                                "text-xs gap-1.5 font-medium",
                                statusConfig.color
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-100"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-slate-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 border-slate-200"
                              >
                                <DropdownMenuLabel className="text-xs text-slate-500 font-medium">
                                  Event Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem
                                  asChild
                                  className="cursor-pointer focus:bg-orange-50"
                                >
                                  <Link
                                    href={`/events/${event.id}`}
                                    className="flex items-center"
                                  >
                                    <Eye className="w-4 h-4 mr-2 text-slate-500" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  asChild
                                  className="cursor-pointer focus:bg-orange-50"
                                >
                                  <Link
                                    href={`/events/${event.id}/edit`}
                                    className="flex items-center"
                                  >
                                    <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                    Edit Event
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  asChild
                                  className="cursor-pointer focus:bg-orange-50"
                                >
                                  <Link
                                    href={`/events/${event.id}/manage`}
                                    className="flex items-center"
                                  >
                                    <Settings className="w-4 h-4 mr-2 text-slate-500" />
                                    Manage Event
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                  onClick={() => handleDeleteClick(event.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* ============================================================ */}
      {/* QUICK TIP CARD */}
      {/* ============================================================ */}
      {events && events.length > 0 && (
        <FadeIn direction="up" delay={500}>
          <Card className="border-slate-200 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Pro Tip
                    </h3>
                    <p className="text-sm text-slate-600">
                      Promote your events on social media to increase ticket
                      sales. Events with images get 3x more engagement!
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Link href="/dashboard/analytics">
                    View Insights
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ============================================================ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-slate-200">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-slate-900">
                  Delete Event?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-slate-500 mt-1">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">
                This will permanently delete the event and all associated
                registrations, tickets, and data from our servers.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="border-slate-300 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ============================================================ */}
      {/* FOOTER TRUST BADGES */}
      {/* ============================================================ */}
      <FadeIn direction="up" delay={600}>
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
