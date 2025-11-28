"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEvent, useCancelRegistration } from "@/hooks";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  User as UserIcon,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Edit,
  Mail,
  ArrowRight,
  Settings,
  AlertCircle,
  Building2,
  Loader2,
  MessageSquare,
  Bookmark,
  Navigation,
  Calendar,
  Trophy,
  Wifi,
  Coffee,
  Award,
  Ticket,
  Sparkles,
  Shield,
  Star,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Image from "next/image";
import { toast } from "sonner";
import { RegistrationWithRelations } from "@/types";
import { RegistrationModal } from "@/components/events/registration-modal";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  usesTicketingSystem,
  getEventPriceRange,
  calculateAvailableSpots,
  calculateTotalTicketsSold,
  calculateFillPercentage,
  isEventFull,
  hasEarlyBirdTickets,
  getTicketTypeSummary,
  getTimeUntilEvent,
  getEventStatusLabel,
  canRegisterForEvent,
} from "@/lib/event-utils";
import confetti from "canvas-confetti";

// Ethiopian Birr formatter
const formatETB = (amount: number): string => {
  return `${amount.toFixed(2)} ETB`;
};

// Loading skeleton component
const EventDetailsSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <div className="h-80 bg-slate-200 animate-pulse" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="h-48 animate-pulse bg-slate-100 border-slate-200"
            />
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card
              key={i}
              className="h-64 animate-pulse bg-slate-100 border-slate-200"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { data: currentUser } = useCurrentUser();
  const eventId = params.id as string;
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: event, isLoading, error } = useEvent(eventId);
  const cancelMutation = useCancelRegistration(eventId);

  // Calculate registration status
  const isRegistered = useMemo(() => {
    if (!event || !currentUser) return false;
    return (
      event.registrations?.some(
        (reg: RegistrationWithRelations) =>
          reg.user?.id === currentUser.id && reg.status === "CONFIRMED"
      ) ?? false
    );
  }, [event, currentUser]);

  // Get event metrics
  const hasTickets = event ? usesTicketingSystem(event) : false;
  const priceRange = event ? getEventPriceRange(event) : "Free";
  const hasEarlyBird = event ? hasEarlyBirdTickets(event) : false;
  const ticketSummary = event ? getTicketTypeSummary(event) : null;
  const totalTicketsSold = event ? calculateTotalTicketsSold(event) : 0;
  const availableSpots = event ? calculateAvailableSpots(event) : 0;
  const fillPercentage = event ? calculateFillPercentage(event) : 0;
  const isFull = event ? isEventFull(event) : false;
  const canRegister = event ? canRegisterForEvent(event) : false;
  const timeUntilEvent = event ? getTimeUntilEvent(event) : null;
  const eventStatus = event ? getEventStatusLabel(event) : null;

  const isPastEvent = event ? isPast(new Date(event.endDate)) : false;
  const isOrganizer = isSignedIn && currentUser?.id === event?.organizer?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isOrganizer || isAdmin;

  const handleCancelRegistration = async () => {
    if (!confirm("Are you sure you want to cancel your registration?")) return;

    try {
      await cancelMutation.mutateAsync(eventId);
      toast.success("Registration cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel registration");
      console.error("Cancellation error:", error);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from saved events" : "Event saved!");
  };

  const handleRegistrationComplete = () => {
    setShowRegistrationModal(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    toast.success("🎉 Successfully registered for the event!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share - do nothing
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <EventDetailsSkeleton />
        <Footer />
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="h-20 w-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Event not found
            </h2>
            <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">
              The event you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button
              onClick={() => router.push("/events")}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Events
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-slate-200">
          {event.imageUrl ? (
            <div className="relative h-80 md:h-96 w-full">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/20" />

              {/* Top Navigation */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push("/events")}
                  className="bg-white/95 hover:bg-white shadow-md backdrop-blur-sm border-0"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  {eventStatus && (
                    <Badge
                      className={cn(
                        "shadow-md backdrop-blur-sm font-semibold",
                        eventStatus.color === "green"
                          ? "bg-emerald-500 text-white border-0"
                          : eventStatus.color === "red"
                          ? "bg-red-500 text-white border-0"
                          : "bg-white/95 text-slate-700 border-0"
                      )}
                    >
                      {eventStatus.color === "green" && (
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                      )}
                      {eventStatus.label}
                    </Badge>
                  )}
                  {hasEarlyBird && !isPastEvent && (
                    <Badge className="bg-amber-500 text-white border-0 shadow-md">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Early Bird
                    </Badge>
                  )}
                </div>
              </div>

              {/* Hero Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                  {event.category && (
                    <Badge
                      className="mb-3 shadow-md border-0"
                      style={{
                        backgroundColor: event.category.color || "#64748b",
                        color: "white",
                      }}
                    >
                      {event.category.name}
                    </Badge>
                  )}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl">
                    {event.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 border-2 border-white shadow-lg">
                      <AvatarImage
                        src={event.organizer?.imageUrl || undefined}
                      />
                      <AvatarFallback className="bg-orange-600 text-white font-semibold">
                        {event.organizer?.firstName?.charAt(0)}
                        {event.organizer?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-white">
                      <p className="text-xs opacity-80">Organized by</p>
                      <p className="font-semibold">
                        {event.organizer?.firstName} {event.organizer?.lastName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/events")}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  {eventStatus && (
                    <Badge
                      className={cn(
                        "font-semibold",
                        eventStatus.color === "green"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : eventStatus.color === "red"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      )}
                    >
                      {eventStatus.label}
                    </Badge>
                  )}
                  {hasEarlyBird && !isPastEvent && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Early Bird
                    </Badge>
                  )}
                </div>
              </div>

              {event.category && (
                <Badge
                  className="mb-4 border-0"
                  style={{
                    backgroundColor: event.category.color || "#64748b",
                    color: "white",
                  }}
                >
                  {event.category.name}
                </Badge>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                {event.title}
              </h1>

              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-slate-200 shadow-sm">
                  <AvatarImage src={event.organizer?.imageUrl || undefined} />
                  <AvatarFallback className="bg-orange-600 text-white font-semibold">
                    {event.organizer?.firstName?.charAt(0)}
                    {event.organizer?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-slate-500">Organized by</p>
                  <p className="font-semibold text-slate-900">
                    {event.organizer?.firstName} {event.organizer?.lastName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <CalendarDays className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {format(new Date(event.startDate), "dd")}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {format(new Date(event.startDate), "MMM yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {format(new Date(event.startDate), "h:mm")}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {format(new Date(event.startDate), "a")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {totalTicketsSold}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {hasTickets ? "Tickets Sold" : "Registered"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <Ticket className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  {priceRange === "Free" ? (
                    <>
                      <p className="text-2xl font-bold text-emerald-600">
                        FREE
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        No ticket required
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-slate-900">
                        {priceRange.replace("$", "").replace("-", " - ")} ETB
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {priceRange.includes("-") ? "Starting from" : "Price"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Progress */}
        {!isPastEvent && (
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Event Capacity
                </span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    fillPercentage >= 90
                      ? "text-red-600"
                      : fillPercentage >= 70
                      ? "text-orange-600"
                      : "text-emerald-600"
                  )}
                >
                  {fillPercentage.toFixed(0)}% Full
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    fillPercentage >= 90
                      ? "bg-red-500"
                      : fillPercentage >= 70
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                <span className="font-medium">
                  {totalTicketsSold}{" "}
                  {hasTickets ? "tickets sold" : "registered"}
                </span>
                {isFull ? (
                  <span className="text-red-600 font-semibold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Event Full
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {availableSpots} {hasTickets ? "tickets" : "spots"}{" "}
                    available
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Event */}
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-orange-600" />
                    </div>
                    About this event
                  </h2>
                  <div className="prose prose-slate prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                      {event.description || "No description provided."}
                    </p>
                  </div>

                  {/* Event Highlights */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: Trophy, label: "Prizes", color: "amber" },
                      { icon: Wifi, label: "Free WiFi", color: "blue" },
                      { icon: Coffee, label: "Refreshments", color: "orange" },
                      { icon: Award, label: "Certificate", color: "purple" },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-sm",
                            item.color === "amber" &&
                              "bg-amber-50 border-amber-100",
                            item.color === "blue" &&
                              "bg-blue-50 border-blue-100",
                            item.color === "orange" &&
                              "bg-orange-50 border-orange-100",
                            item.color === "purple" &&
                              "bg-purple-50 border-purple-100"
                          )}
                        >
                          <div
                            className={cn(
                              "h-9 w-9 rounded-lg flex items-center justify-center",
                              item.color === "amber" && "bg-amber-100",
                              item.color === "blue" && "bg-blue-100",
                              item.color === "orange" && "bg-orange-100",
                              item.color === "purple" && "bg-purple-100"
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-4 h-4",
                                item.color === "amber" && "text-amber-600",
                                item.color === "blue" && "text-blue-600",
                                item.color === "orange" && "text-orange-600",
                                item.color === "purple" && "text-purple-600"
                              )}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Types */}
              {hasTickets &&
                ticketSummary &&
                ticketSummary.ticketTypes.length > 0 && (
                  <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Ticket className="w-4 h-4 text-purple-600" />
                          </div>
                          Ticket Options
                        </h2>
                        {hasEarlyBird && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Early Bird Available
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-4">
                        {ticketSummary.ticketTypes.map((ticket) => (
                          <div
                            key={ticket.id}
                            className={cn(
                              "border rounded-xl p-5 transition-all duration-200",
                              ticket.isSoldOut
                                ? "bg-slate-50 opacity-60 border-slate-200"
                                : "border-slate-200 hover:border-orange-300 hover:shadow-md bg-white"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold text-lg text-slate-900">
                                    {ticket.name}
                                  </h4>
                                  {ticket.isEarlyBird && !ticket.isSoldOut && (
                                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                                      Early Bird
                                    </Badge>
                                  )}
                                  {ticket.isSoldOut && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Sold Out
                                    </Badge>
                                  )}
                                </div>

                                {ticket.description && (
                                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                                    {ticket.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    {ticket.available} / {ticket.total}{" "}
                                    available
                                  </span>
                                </div>

                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      ticket.isSoldOut
                                        ? "bg-red-500"
                                        : 1 - ticket.available / ticket.total >
                                          0.8
                                        ? "bg-orange-500"
                                        : "bg-emerald-500"
                                    )}
                                    style={{
                                      width: `${
                                        (1 - ticket.available / ticket.total) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="text-right ml-6">
                                <p className="text-2xl font-bold text-orange-600">
                                  {formatETB(ticket.price)}
                                </p>
                                {ticket.isEarlyBird &&
                                  ticket.regularPrice !== ticket.price && (
                                    <>
                                      <p className="text-sm text-slate-400 line-through">
                                        {formatETB(ticket.regularPrice)}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="text-xs mt-1 border-emerald-200 text-emerald-700 bg-emerald-50"
                                      >
                                        Save{" "}
                                        {formatETB(
                                          ticket.regularPrice - ticket.price
                                        )}
                                      </Badge>
                                    </>
                                  )}
                              </div>
                            </div>

                            {!ticket.isSoldOut && ticket.available < 10 && (
                              <div className="mt-4 pt-3 border-t border-slate-200">
                                <p className="text-sm text-orange-600 font-semibold flex items-center gap-1.5">
                                  <AlertCircle className="w-4 h-4" />
                                  Only {ticket.available} tickets left – book
                                  now!
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Event Details */}
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-blue-600" />
                    </div>
                    Event Details
                  </h2>
                  <div className="space-y-4">
                    {/* Location */}
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 mb-1">
                          Location
                        </p>
                        <p className="text-slate-700">{event.location}</p>
                        {event.venue && (
                          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                            <Building2 className="w-4 h-4" />
                            {event.venue}
                          </p>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-2 text-orange-600 hover:text-orange-700"
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Get directions
                        </Button>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                        <CalendarDays className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 mb-1">
                          Date & Time
                        </p>
                        <p className="text-slate-700">
                          {format(
                            new Date(event.startDate),
                            "EEEE, MMMM dd, yyyy"
                          )}
                        </p>
                        <p className="text-slate-700">
                          {format(new Date(event.startDate), "h:mm a")} -{" "}
                          {format(new Date(event.endDate), "h:mm a")}
                        </p>
                        {timeUntilEvent && timeUntilEvent.isUpcoming && (
                          <div className="mt-2">
                            {isToday(new Date(event.startDate)) ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                <span className="relative flex h-2 w-2 mr-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                Today at{" "}
                                {format(new Date(event.startDate), "h:mm a")}
                              </Badge>
                            ) : isTomorrow(new Date(event.startDate)) ? (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                Tomorrow
                              </Badge>
                            ) : (
                              <p className="text-sm text-orange-600 font-semibold">
                                Starts in {timeUntilEvent.days} days
                              </p>
                            )}
                          </div>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-2 text-orange-600 hover:text-orange-700"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Add to calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendees */}
              {event.registrations && event.registrations.length > 0 && (
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-emerald-600" />
                        </div>
                        Who&apos;s Coming
                      </h2>
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                        {event._count?.registrations || 0} attendees
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {event.registrations
                        .filter(
                          (r: RegistrationWithRelations) =>
                            r.status === "CONFIRMED"
                        )
                        .slice(0, 17)
                        .map((registration: RegistrationWithRelations) => (
                          <div
                            key={registration.id}
                            className="flex flex-col items-center gap-2 group"
                          >
                            <Avatar className="h-12 w-12 border-2 border-slate-200 shadow-sm group-hover:border-orange-300 transition-colors">
                              <AvatarImage
                                src={registration.user?.imageUrl || undefined}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold text-sm">
                                {registration.user?.firstName?.charAt(0)}
                                {registration.user?.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-slate-700 text-center line-clamp-1">
                              {registration.user?.firstName}{" "}
                              {registration.user?.lastName?.charAt(0)}.
                            </span>
                          </div>
                        ))}
                      {(event._count?.registrations || 0) > 17 && (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                            <Users className="w-6 h-6 text-slate-500" />
                          </div>
                          <span className="text-xs font-bold text-slate-600">
                            +{(event._count?.registrations || 0) - 17}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Action Card */}
              <Card className="border-slate-200 shadow-lg sticky top-32 overflow-hidden">
                <CardContent className="p-6">
                  {/* Status Banners */}
                  {isPastEvent ? (
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 mb-4 text-center">
                      <XCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">
                        Event Ended
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        This event has already taken place
                      </p>
                    </div>
                  ) : isRegistered ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="font-semibold text-emerald-800">
                        You&apos;re Registered!
                      </p>
                      <p className="text-sm text-emerald-600 mt-1">
                        Check your email for confirmation
                      </p>
                    </div>
                  ) : isFull ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
                      <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="font-semibold text-red-800">Event Full</p>
                      <p className="text-sm text-red-600 mt-1">
                        No more spots available
                      </p>
                    </div>
                  ) : !canRegister ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 text-center">
                      <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="font-semibold text-orange-800">
                        Registration Closed
                      </p>
                      <p className="text-sm text-orange-600 mt-1">
                        Registration period has ended
                      </p>
                    </div>
                  ) : null}

                  {/* Price Display */}
                  {!isPastEvent && (
                    <div className="text-center py-4 border-b border-slate-200 mb-4">
                      {hasTickets ? (
                        <>
                          <p className="text-sm text-slate-500 mb-1 font-medium">
                            Tickets from
                          </p>
                          <p className="text-3xl font-bold text-slate-900">
                            {priceRange.replace("$", "").split("-")[0]} ETB
                          </p>
                        </>
                      ) : (
                        <>
                          {event.price > 0 ? (
                            <>
                              <p className="text-sm text-slate-500 mb-1 font-medium">
                                Ticket Price
                              </p>
                              <p className="text-3xl font-bold text-slate-900">
                                {formatETB(event.price)}
                              </p>
                            </>
                          ) : (
                            <div className="inline-flex items-center gap-2 bg-emerald-100 rounded-full px-5 py-2.5">
                              <Sparkles className="w-5 h-5 text-emerald-600" />
                              <span className="text-lg font-bold text-emerald-700">
                                Free Event
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {!isSignedIn ? (
                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md h-12 font-semibold"
                        onClick={() => router.push("/sign-in")}
                      >
                        Sign In to Register
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    ) : isPastEvent ? (
                      <Button className="w-full h-12" disabled>
                        Event Ended
                      </Button>
                    ) : canManage ? (
                      <>
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md h-12 font-semibold"
                          onClick={() =>
                            router.push(`/events/${event.id}/manage`)
                          }
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Event
                        </Button>
                        <Button
                          className="w-full border-slate-300 hover:bg-slate-50 h-11"
                          variant="outline"
                          onClick={() =>
                            router.push(`/events/${event.id}/edit`)
                          }
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </Button>
                      </>
                    ) : isRegistered ? (
                      <Button
                        className="w-full border-slate-300 hover:bg-slate-50 h-11"
                        variant="outline"
                        onClick={handleCancelRegistration}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Registration"
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md h-12 font-semibold"
                          onClick={() => setShowRegistrationModal(true)}
                          disabled={isFull || !canRegister}
                        >
                          {isFull
                            ? "Event Full"
                            : hasTickets
                            ? "Get Tickets"
                            : "Register Now"}
                          {!isFull && canRegister && (
                            <ArrowRight className="ml-2 w-4 h-4" />
                          )}
                        </Button>
                        {!isFull && canRegister && availableSpots < 20 && (
                          <div className="flex items-center justify-center gap-1.5 text-sm text-orange-600 font-semibold">
                            <AlertCircle className="w-4 h-4" />
                            Only {availableSpots} spots left!
                          </div>
                        )}
                      </>
                    )}

                    <Separator className="bg-slate-200" />

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={handleBookmark}
                        className={cn(
                          "border-slate-300 hover:bg-slate-50",
                          isBookmarked &&
                            "bg-orange-50 border-orange-200 hover:bg-orange-100"
                        )}
                      >
                        <Bookmark
                          className={cn(
                            "w-4 h-4",
                            isBookmarked && "fill-current text-orange-600"
                          )}
                        />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organizer Card */}
              {event.organizer && (
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-500" />
                      Event Organizer
                    </h3>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-slate-200 shadow-sm">
                        <AvatarImage
                          src={event.organizer.imageUrl || undefined}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold">
                          {event.organizer.firstName?.charAt(0)}
                          {event.organizer.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">
                          {event.organizer.firstName} {event.organizer.lastName}
                        </p>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                          <Mail className="w-4 h-4 shrink-0" />
                          <p className="text-sm truncate">
                            {event.organizer.email}
                          </p>
                        </div>
                        {event.organizer.role && (
                          <Badge
                            className={cn(
                              "mt-2",
                              event.organizer.role === "ADMIN"
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                            )}
                          >
                            {event.organizer.role}
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 border-slate-300 hover:bg-slate-50 font-medium"
                          onClick={() =>
                            toast.info("Contact feature coming soon!")
                          }
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Organizer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Why Attend */}
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Why Attend?
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        icon: Trophy,
                        text: "Win exciting prizes and giveaways",
                        color: "amber",
                      },
                      {
                        icon: Users,
                        text: "Network with industry professionals",
                        color: "blue",
                      },
                      {
                        icon: Coffee,
                        text: "Enjoy refreshments and snacks",
                        color: "orange",
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div
                            className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                              item.color === "amber" && "bg-amber-100",
                              item.color === "blue" && "bg-blue-100",
                              item.color === "orange" && "bg-orange-100"
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-4 h-4",
                                item.color === "amber" && "text-amber-600",
                                item.color === "blue" && "text-blue-600",
                                item.color === "orange" && "text-orange-600"
                              )}
                            />
                          </div>
                          <span className="text-sm text-slate-700 font-medium">
                            {item.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-orange-600 to-orange-700 py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/25">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Discover More
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Explore More Events?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join amazing events happening around you and connect with
              like-minded people
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg h-12 font-semibold"
              >
                <Link href="/events">
                  Browse All Events
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              {isSignedIn && currentUser?.role !== "ATTENDEE" && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-orange-600 h-12 font-semibold bg-transparent"
                >
                  <Link href="/events/create">Create Your Event</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />

      {/* Registration Modal */}
      {showRegistrationModal && currentUser && (
        <RegistrationModal
          event={event}
          isOpen={showRegistrationModal}
          onClose={handleRegistrationComplete}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
