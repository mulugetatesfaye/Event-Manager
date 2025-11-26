"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  MapPin,
  Users,
  Ticket,
  Clock,
  Building2,
  Flame,
  Sparkles,
  CheckCircle,
  XCircle,
  Timer,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";
import {
  format,
  formatDistanceToNow,
  isPast,
  isFuture,
  isToday,
  isTomorrow,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import { Link } from "@/app/i18n/routing";
import Image from "next/image";
import { EventWithRelations } from "@/types";
import { cn } from "@/lib/utils";
import {
  calculateTotalTicketsSold,
  calculateAvailableSpots,
  calculateFillPercentage,
  usesTicketingSystem,
  getCheapestTicketPrice,
} from "@/lib/event-utils";
import { useTranslations } from "next-intl";

// ============================================================================
// TYPES
// ============================================================================

interface EventCardProps {
  event: EventWithRelations;
  showOrganizer?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: LucideIcon;
  iconColor: string;
  pulse?: boolean;
}

type StatusKey =
  | "ended"
  | "soldOut"
  | "today"
  | "tomorrow"
  | "fillingFast"
  | "available";

// ============================================================================
// CONSTANTS
// ============================================================================

const formatETB = (amount: number): string => {
  return (
    new Intl.NumberFormat("en-ET", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount) + " ETB"
  );
};

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  ended: {
    label: "status.ended",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    icon: XCircle,
    iconColor: "text-slate-400",
    pulse: false,
  },
  soldOut: {
    label: "status.soldOut",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    icon: XCircle,
    iconColor: "text-red-500",
    pulse: false,
  },
  today: {
    label: "status.today",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: Sparkles,
    iconColor: "text-emerald-500",
    pulse: true,
  },
  tomorrow: {
    label: "status.tomorrow",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: Timer,
    iconColor: "text-blue-500",
    pulse: false,
  },
  fillingFast: {
    label: "status.fillingFast",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    icon: Flame,
    iconColor: "text-orange-500",
    pulse: false,
  },
  available: {
    label: "status.available",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: CheckCircle,
    iconColor: "text-emerald-500",
    pulse: false,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EventCard({
  event,
  showOrganizer = true,
  className,
}: EventCardProps) {
  const t = useTranslations("events.card");

  const totalTicketsSold =
    event.totalTicketsSold ?? calculateTotalTicketsSold(event);
  const availableSpots = event.availableSpots ?? calculateAvailableSpots(event);
  const fillPercentage = calculateFillPercentage(event);
  const hasTicketTypes = usesTicketingSystem(event);
  const displayPrice = hasTicketTypes
    ? getCheapestTicketPrice(event)
    : event.price;

  const isFull = availableSpots <= 0;
  const isUpcoming = isFuture(new Date(event.startDate));
  const isPastEvent = isPast(new Date(event.endDate));
  const isEventToday = isToday(new Date(event.startDate));
  const isEventTomorrow = isTomorrow(new Date(event.startDate));
  const hoursUntilEvent = differenceInHours(
    new Date(event.startDate),
    new Date()
  );
  const daysUntilEvent = differenceInDays(
    new Date(event.startDate),
    new Date()
  );

  const getStatusKey = (): StatusKey | null => {
    if (isPastEvent) return "ended";
    if (isFull) return "soldOut";
    if (isEventToday) return "today";
    if (isEventTomorrow) return "tomorrow";
    if (fillPercentage > 80) return "fillingFast";
    if (isUpcoming) return "available";
    return null;
  };

  const statusKey = getStatusKey();
  const statusConfig = statusKey ? STATUS_CONFIG[statusKey] : null;

  const getUrgencyLevel = (): "none" | "high" | "medium" | "low" => {
    if (isPastEvent || isFull) return "none";
    if (isEventToday || hoursUntilEvent <= 24) return "high";
    if (isEventTomorrow || daysUntilEvent <= 3) return "medium";
    if (fillPercentage > 80) return "medium";
    return "low";
  };

  const urgencyLevel = getUrgencyLevel();

  const getProgressColor = (): string => {
    if (fillPercentage >= 100) return "bg-red-500";
    if (fillPercentage > 80) return "bg-orange-500";
    if (fillPercentage > 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn("group block h-full", className)}
    >
      <article
        className={cn(
          "relative overflow-hidden rounded-xl border bg-white h-full flex flex-col",
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:shadow-slate-200/60",
          "hover:-translate-y-0.5",
          urgencyLevel === "high" && "ring-1 ring-emerald-500/20",
          isPastEvent && "opacity-75",
          isFull && !isPastEvent && "ring-1 ring-red-500/10",
          "border-slate-200 hover:border-slate-300"
        )}
      >
        {/* Image Section */}
        <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 shrink-0">
          {event.imageUrl ? (
            <>
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className={cn(
                  "object-cover transition-transform duration-500",
                  "group-hover:scale-105",
                  isPastEvent && "grayscale"
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-200/50 flex items-center justify-center mx-auto">
                  <CalendarDays className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {/* Top Row - Category & Status */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 z-20">
            {event.category && (
              <Badge
                className="px-2 py-0.5 text-[10px] font-semibold shadow-md backdrop-blur-sm border-0"
                style={{
                  backgroundColor: `${event.category.color || "#64748b"}E6`,
                  color: "white",
                }}
              >
                {event.category.name}
              </Badge>
            )}

            {statusConfig && (
              <Badge
                className={cn(
                  "px-2 py-0.5 text-[10px] font-semibold shadow-md backdrop-blur-sm",
                  "flex items-center gap-1 border",
                  statusConfig.bgColor,
                  statusConfig.textColor,
                  statusConfig.borderColor
                )}
              >
                {statusConfig.pulse ? (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                ) : (
                  <statusConfig.icon
                    className={cn("w-3 h-3", statusConfig.iconColor)}
                  />
                )}
                {t(statusConfig.label)}
              </Badge>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-2.5 right-2.5 z-20">
            <div
              className={cn(
                "rounded-lg px-2.5 py-1.5 shadow-md backdrop-blur-sm",
                displayPrice > 0
                  ? "bg-white/95"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600"
              )}
            >
              {displayPrice > 0 ? (
                <div className="text-right">
                  {hasTicketTypes && (
                    <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wide block leading-none">
                      {t("from")}
                    </span>
                  )}
                  <span className="font-bold text-xs text-slate-900">
                    {formatETB(displayPrice)}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  {t("free")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col grow p-3.5 space-y-3">
          {/* Title */}
          <div>
            <h3
              className={cn(
                "text-sm font-semibold line-clamp-2 text-slate-900 leading-snug",
                "transition-colors duration-300",
                "group-hover:text-orange-600"
              )}
            >
              {event.title}
            </h3>
          </div>

          {/* Event Details */}
          <div className="space-y-2 grow">
            {/* Date & Time */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <CalendarDays className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {format(new Date(event.startDate), "EEE, MMM dd")} •{" "}
                  {format(new Date(event.startDate), "h:mm a")}
                </p>
                {isUpcoming && !isEventToday && !isEventTomorrow && (
                  <p className="text-[10px] text-orange-600 font-medium">
                    {formatDistanceToNow(new Date(event.startDate), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {event.location}
                </p>
                {event.venue && (
                  <p className="text-[10px] text-slate-500 truncate">
                    {event.venue}
                  </p>
                )}
              </div>
            </div>

            {/* Capacity / Tickets */}
            {hasTicketTypes &&
            event.ticketTypes &&
            event.ticketTypes.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Ticket className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900">
                    {event.ticketTypes.length}{" "}
                    {event.ticketTypes.length === 1
                      ? t("ticketType")
                      : t("ticketTypes")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-slate-900">
                      {totalTicketsSold}/{event.capacity}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                        isFull
                          ? "bg-red-100 text-red-700"
                          : fillPercentage > 80
                          ? "bg-orange-100 text-orange-700"
                          : "bg-emerald-100 text-emerald-700"
                      )}
                    >
                      {isFull
                        ? t("status.soldOut")
                        : `${availableSpots} ${t("left")}`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getProgressColor()
                      )}
                      style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trending Indicator */}
          {fillPercentage > 70 && !isFull && !isPastEvent && (
            <div
              className={cn(
                "rounded-lg px-2.5 py-2 flex items-center gap-2",
                "border",
                fillPercentage > 85
                  ? "bg-orange-50 border-orange-200"
                  : "bg-amber-50 border-amber-200"
              )}
            >
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                  fillPercentage > 85 ? "bg-orange-500" : "bg-amber-500"
                )}
              >
                <Flame className="w-3 h-3 text-white" />
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  fillPercentage > 85 ? "text-orange-800" : "text-amber-800"
                )}
              >
                {Math.round(fillPercentage)}% {t("booked")}
              </span>
            </div>
          )}

          {/* Organizer */}
          {showOrganizer && event.organizer && (
            <div className="pt-2.5 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="w-6 h-6 shrink-0 ring-1 ring-slate-200">
                    <AvatarImage
                      src={event.organizer.imageUrl || undefined}
                      alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-[10px] font-semibold">
                      {event.organizer.firstName?.[0]}
                      {event.organizer.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 leading-none">
                      {t("hostedBy")}
                    </p>
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {event.organizer.firstName} {event.organizer.lastName}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                    "bg-slate-100 text-slate-400",
                    "transition-all duration-300",
                    "group-hover:bg-orange-600 group-hover:text-white"
                  )}
                >
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

export function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white h-full",
        className
      )}
    >
      <div className="h-36 w-full bg-slate-100 animate-pulse" />
      <div className="p-3.5 space-y-3">
        <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-100 animate-pulse" />
              <div className="flex-1 h-4 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-slate-100 animate-pulse" />
            <div className="flex-1 h-4 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT (Horizontal)
// ============================================================================

export function EventCardCompact({
  event,
  className,
}: {
  event: EventWithRelations;
  className?: string;
}) {
  const t = useTranslations("events.card");

  const hasTicketTypes = usesTicketingSystem(event);
  const displayPrice = hasTicketTypes
    ? getCheapestTicketPrice(event)
    : event.price;
  const isEventToday = isToday(new Date(event.startDate));

  return (
    <Link href={`/events/${event.id}`} className={cn("group block", className)}>
      <div
        className={cn(
          "flex gap-3 p-3 rounded-xl border border-slate-200 bg-white",
          "transition-all duration-300",
          "hover:shadow-md hover:shadow-slate-200/60 hover:border-slate-300",
          "hover:-translate-y-0.5"
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-slate-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                {event.title}
              </h3>
              {isEventToday && (
                <Badge className="shrink-0 px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-700 border-0 font-semibold">
                  {t("status.today")}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              <span className="truncate">{event.location}</span>
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {format(new Date(event.startDate), "MMM dd, h:mm a")}
            </p>
            <div
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-semibold",
                displayPrice > 0
                  ? "bg-slate-100 text-slate-900"
                  : "bg-emerald-100 text-emerald-700"
              )}
            >
              {displayPrice > 0 ? formatETB(displayPrice) : t("free")}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// FEATURED VARIANT
// ============================================================================

export function EventCardFeatured({
  event,
  className,
}: {
  event: EventWithRelations;
  className?: string;
}) {
  const t = useTranslations("events.card");

  const hasTicketTypes = usesTicketingSystem(event);
  const displayPrice = hasTicketTypes
    ? getCheapestTicketPrice(event)
    : event.price;

  return (
    <Link href={`/events/${event.id}`} className={cn("group block", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-slate-200 bg-white",
          "transition-all duration-500",
          "hover:shadow-xl hover:shadow-slate-200/60",
          "hover:-translate-y-1"
        )}
      >
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden">
          {event.imageUrl ? (
            <>
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
              <CalendarDays className="w-12 h-12 text-slate-300" />
            </div>
          )}

          {/* Featured Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md text-xs font-semibold">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>

          {/* Category */}
          {event.category && (
            <div className="absolute top-3 right-3">
              <Badge
                className="px-2 py-0.5 text-[10px] font-semibold shadow-md backdrop-blur-sm border-0"
                style={{
                  backgroundColor: `${event.category.color || "#64748b"}E6`,
                  color: "white",
                }}
              >
                {event.category.name}
              </Badge>
            </div>
          )}

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-3 text-white/90 text-xs">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {format(new Date(event.startDate), "MMM dd")}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-4 flex items-center justify-between">
          {event.organizer && (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 ring-1 ring-slate-200">
                <AvatarImage
                  src={event.organizer.imageUrl || undefined}
                  alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-semibold">
                  {event.organizer.firstName?.[0]}
                  {event.organizer.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[10px] text-slate-500">{t("hostedBy")}</p>
                <p className="text-xs font-semibold text-slate-900">
                  {event.organizer.firstName} {event.organizer.lastName}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {displayPrice > 0 ? (
              <div className="text-right">
                {hasTicketTypes && (
                  <p className="text-[9px] text-slate-500 uppercase font-medium">
                    {t("from")}
                  </p>
                )}
                <p className="text-sm font-bold text-slate-900">
                  {formatETB(displayPrice)}
                </p>
              </div>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-700 border-0 font-semibold text-xs">
                {t("free")}
              </Badge>
            )}
            <div
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center",
                "bg-orange-600 text-white shadow-md",
                "transition-all duration-300",
                "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-600/25"
              )}
            >
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// MINI VARIANT (For sidebars, lists)
// ============================================================================

export function EventCardMini({
  event,
  className,
}: {
  event: EventWithRelations;
  className?: string;
}) {
  const t = useTranslations("events.card");
  const isEventToday = isToday(new Date(event.startDate));
  const isEventTomorrow = isTomorrow(new Date(event.startDate));

  return (
    <Link href={`/events/${event.id}`} className={cn("group block", className)}>
      <div
        className={cn(
          "flex items-center gap-3 p-2.5 rounded-lg",
          "transition-all duration-200",
          "hover:bg-slate-50"
        )}
      >
        {/* Date Badge */}
        <div className="h-12 w-12 rounded-lg bg-orange-50 flex flex-col items-center justify-center shrink-0 border border-orange-100">
          <span className="text-[10px] font-semibold text-orange-600 uppercase">
            {format(new Date(event.startDate), "MMM")}
          </span>
          <span className="text-lg font-bold text-slate-900 leading-none">
            {format(new Date(event.startDate), "dd")}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {event.title}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(event.startDate), "h:mm a")}
            {(isEventToday || isEventTomorrow) && (
              <Badge
                className={cn(
                  "ml-1 px-1.5 py-0 text-[9px] font-semibold border-0",
                  isEventToday
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                )}
              >
                {isEventToday ? t("status.today") : t("status.tomorrow")}
              </Badge>
            )}
          </p>
        </div>

        {/* Arrow */}
        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
          <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-orange-600" />
        </div>
      </div>
    </Link>
  );
}
