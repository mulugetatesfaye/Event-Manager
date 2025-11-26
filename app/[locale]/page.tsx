"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/use-user";
import { useEvents } from "@/hooks";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/events/event-card";
import { AnimatedTextLoop } from "@/components/ui/animated-text-loop";
import { FadeIn } from "@/components/ui/fade-in";
import {
  Calendar,
  Users,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  Star,
  Rocket,
  BarChart,
  LayoutDashboard,
  Plus,
  MapPin,
  ChevronRight,
  Globe,
  Lock,
  Headphones,
  Award,
  Building2,
  Play,
  MousePointer,
  Layers,
  RefreshCw,
  ArrowDown,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { EventWithRelations } from "@/types";
import { Locale } from "@/app/i18n/config";
import { cn } from "@/lib/utils";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STATS_DATA = [
  { value: "50K+", labelKey: "eventsHosted", icon: Calendar },
  { value: "2M+", labelKey: "totalAttendees", icon: Users },
  { value: "99.9%", labelKey: "uptime", icon: Zap },
  { value: "150+", labelKey: "countries", icon: Globe },
] as const;

const TRUSTED_COMPANIES = [
  "TechCorp",
  "InnovateCo",
  "GlobalEvents",
  "Enterprise",
  "StartupHub",
  "EventPro",
] as const;

const INTEGRATION_LOGOS = [
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "Slack",
  "Stripe",
  "PayPal",
] as const;

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2070&q=80";

// ============================================================================
// TYPES
// ============================================================================

interface CTAConfig {
  href: string;
  text: string;
  icon: React.ElementType;
}

interface StatCardProps {
  value: string;
  labelKey: string;
  icon: React.ElementType;
  delay?: number;
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
  index: number;
}

interface HeroSectionProps {
  t: ReturnType<typeof useTranslations<"home">>;
  heroWords: string[];
  primaryCTA: CTAConfig;
  secondaryCTA: CTAConfig;
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function StatCard({ value, labelKey, icon: Icon, delay = 0 }: StatCardProps) {
  const t = useTranslations("home.stats");

  return (
    <FadeIn direction="up" delay={delay}>
      <div className="group relative">
        <div className="relative bg-white border border-gray-200 rounded-2xl p-6 text-center hover:border-blue-300 hover:shadow-lg transition-all duration-300">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-4 group-hover:bg-blue-100 transition-colors">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-sm text-gray-600 font-medium">{t(labelKey)}</div>
        </div>
      </div>
    </FadeIn>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: FeatureCardProps) {
  return (
    <FadeIn direction="up" delay={index * 100}>
      <Card className="group relative overflow-hidden border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full">
        <CardContent className="p-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20 mb-6 group-hover:scale-105 transition-transform duration-300">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

function TestimonialCard({
  name,
  role,
  content,
  avatar,
  rating,
  index,
}: TestimonialCardProps) {
  return (
    <FadeIn direction="up" delay={index * 100}>
      <Card className="group relative overflow-hidden border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
        <CardContent className="p-8">
          <div className="absolute top-6 right-6 text-6xl text-gray-100 font-serif leading-none select-none">
            &ldquo;
          </div>

          <div className="flex items-center gap-1 mb-4">
            {[...Array(rating)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed relative z-10 text-lg">
            &ldquo;{content}&rdquo;
          </p>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl shadow-lg">
              {avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{name}</p>
              <p className="text-sm text-gray-500">{role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden border-gray-200">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function TrustedBySection() {
  const t = useTranslations("home.trustedBy");

  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn direction="up">
          <p className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-wider">
            {t("title")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {TRUSTED_COMPANIES.map((company) => (
              <div
                key={company}
                className="flex items-center gap-2 text-gray-400 opacity-60 hover:opacity-100 transition-opacity"
              >
                <Building2 className="w-6 h-6" />
                <span className="font-semibold text-lg">{company}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  const t = useTranslations("home.integrations");

  return (
    <section className="bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
              <Layers className="w-3 h-3 mr-1.5" />
              {t("badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {INTEGRATION_LOGOS.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">{name}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection({
  t,
  heroWords,
  primaryCTA,
  secondaryCTA,
}: HeroSectionProps) {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-screen flex items-center bg-slate-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE_URL}
          alt="Conference background"
          fill
          className="object-cover"
          priority
          quality={85}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-900/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/70" />
      </div>

      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust Badges */}
          <FadeIn direction="down" delay={100}>
            <div className="inline-flex items-center gap-3 mb-8 flex-wrap justify-center">
              <Badge className="bg-white/10 border-white/20 text-white px-4 py-2 hover:bg-white/15">
                <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
                {t("hero.trustBadge")}
              </Badge>
              <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 px-3 py-2 hover:bg-emerald-500/25">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {t("hero.liveNow")}
              </Badge>
            </div>
          </FadeIn>

          {/* Main Heading */}
          <FadeIn direction="up" delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white">
              {t("hero.title")}{" "}
              <span className="inline-block">
                <AnimatedTextLoop words={heroWords} className="text-blue-400" />
              </span>
              <br />
              {t("hero.subtitle")}
            </h1>
          </FadeIn>

          {/* Description */}
          <FadeIn direction="up" delay={300}>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn direction="up" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all duration-300"
              >
                <Link href={primaryCTA.href}>
                  {primaryCTA.text}
                  <primaryCTA.icon className="ml-2 w-5 h-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-semibold border-2 border-white/25 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
              >
                <Link href={secondaryCTA.href}>
                  {secondaryCTA.text}
                  <secondaryCTA.icon className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{t("hero.freeToStart")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{t("hero.noCardRequired")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{t("hero.setupInMinutes")}</span>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Dashboard Preview */}
        <FadeIn direction="up" delay={500}>
          <div className="mt-16 lg:mt-20 relative max-w-5xl mx-auto">
            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-slate-800">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 bg-slate-800 rounded-md text-xs text-gray-400 font-mono flex items-center gap-2 border border-white/5">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    addisvibe.com/dashboard
                  </div>
                </div>
                <div className="w-[52px]" />
              </div>

              {/* Preview Content */}
              <div className="aspect-[16/9] bg-slate-800 flex items-center justify-center relative">
                {/* Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Mock UI - Header */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600" />
                    <div className="w-24 h-3 bg-white/10 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-8 bg-white/5 rounded-lg border border-white/10" />
                    <div className="w-8 h-8 bg-white/5 rounded-full border border-white/10" />
                  </div>
                </div>

                {/* Mock UI - Sidebar */}
                <div className="absolute left-6 top-20 bottom-6 w-48 bg-white/5 rounded-xl border border-white/10 p-4 hidden md:block">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-white/10" />
                        <div
                          className="h-2 bg-white/10 rounded"
                          style={{ width: `${50 + i * 10}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock UI - Main Content */}
                <div className="absolute md:left-60 left-6 right-6 top-20 bottom-6 flex flex-col gap-4">
                  <div className="flex gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-24 bg-white/5 rounded-xl border border-white/10 p-4 hidden sm:block"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 mb-2" />
                        <div className="w-16 h-2 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl border border-white/10" />
                </div>

                {/* Play Button */}
                <div className="relative z-10 text-center">
                  <button
                    className="group w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-xl shadow-blue-600/30 transition-all duration-300 hover:scale-105"
                    aria-label="Watch demo video"
                  >
                    <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                  <p className="mt-4 text-gray-300 font-medium">
                    {t("hero.watchDemo")}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">2 min overview</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
        aria-label="Scroll to content"
      >
        <span className="text-xs uppercase tracking-widest font-medium">
          Scroll
        </span>
        <ArrowDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HomePage() {
  const { isSignedIn } = useUser();
  const { data: currentUser } = useCurrentUser();
  const t = useTranslations("home");
  const params = useParams();
  const locale = (params?.locale as Locale) || "am";

  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    page: 1,
    limit: 4,
    search: "",
    category: "",
  });

  const features = [
    {
      icon: Calendar,
      title: t("features.eventCreation.title"),
      description: t("features.eventCreation.description"),
    },
    {
      icon: Users,
      title: t("features.registration.title"),
      description: t("features.registration.description"),
    },
    {
      icon: TrendingUp,
      title: t("features.analytics.title"),
      description: t("features.analytics.description"),
    },
    {
      icon: Shield,
      title: t("features.security.title"),
      description: t("features.security.description"),
    },
  ];

  const testimonials = [
    {
      name: t("testimonials.testimonial1.name"),
      role: t("testimonials.testimonial1.role"),
      content: t("testimonials.testimonial1.content"),
      avatar: "👩‍💼",
      rating: 5,
    },
    {
      name: t("testimonials.testimonial2.name"),
      role: t("testimonials.testimonial2.role"),
      content: t("testimonials.testimonial2.content"),
      avatar: "👨‍💻",
      rating: 5,
    },
    {
      name: t("testimonials.testimonial3.name"),
      role: t("testimonials.testimonial3.role"),
      content: t("testimonials.testimonial3.content"),
      avatar: "👩‍🎨",
      rating: 5,
    },
  ];

  const heroWords = [
    t("hero.words.conferences"),
    t("hero.words.workshops"),
    t("hero.words.meetups"),
    t("hero.words.webinars"),
    t("hero.words.seminars"),
  ];

  const getPrimaryCTA = (): CTAConfig => {
    if (!isSignedIn) {
      return {
        href: `/${locale}/sign-up`,
        text: t("buttons.getStartedFree"),
        icon: ArrowRight,
      };
    }
    if (currentUser?.role === "ATTENDEE") {
      return {
        href: `/${locale}/events`,
        text: t("buttons.browseEvents"),
        icon: Sparkles,
      };
    }
    return {
      href: `/${locale}/events/create`,
      text: t("buttons.createEvent"),
      icon: Plus,
    };
  };

  const getSecondaryCTA = (): CTAConfig => {
    if (!isSignedIn) {
      return {
        href: `/${locale}/events`,
        text: t("buttons.browseEvents"),
        icon: Sparkles,
      };
    }
    return {
      href: `/${locale}/dashboard`,
      text: t("buttons.goToDashboard"),
      icon: LayoutDashboard,
    };
  };

  const primaryCTA = getPrimaryCTA();
  const secondaryCTA = getSecondaryCTA();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* HERO SECTION */}
        <HeroSection
          t={t}
          heroWords={heroWords}
          primaryCTA={primaryCTA}
          secondaryCTA={secondaryCTA}
        />

        {/* STATS SECTION */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS_DATA.map((stat, index) => (
                <StatCard
                  key={stat.labelKey}
                  value={stat.value}
                  labelKey={stat.labelKey}
                  icon={stat.icon}
                  delay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>

        {/* TRUSTED BY SECTION */}
        <TrustedBySection />

        {/* LATEST EVENTS SECTION */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <FadeIn direction="up">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
                <div>
                  <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {t("upcomingEvents.badge")}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {t("upcomingEvents.title")}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {t("upcomingEvents.description")}
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <Link href={`/${locale}/events`}>
                    {t("upcomingEvents.viewAll")}
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </FadeIn>

            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : eventsData && eventsData.events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {eventsData.events.map(
                    (event: EventWithRelations, index: number) => (
                      <FadeIn key={event.id} direction="up" delay={index * 100}>
                        <EventCard event={event} />
                      </FadeIn>
                    )
                  )}
                </div>

                <FadeIn direction="up" delay={500}>
                  <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="flex flex-wrap items-center justify-center gap-8 text-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-600">
                          {t("upcomingEvents.stats.multipleCities")}
                        </span>
                      </div>
                      <div className="w-px h-8 bg-gray-300 hidden md:block" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-600">
                          <span className="font-bold text-gray-900">1000+</span>{" "}
                          {t("upcomingEvents.stats.attendees")}
                        </span>
                      </div>
                      <div className="w-px h-8 bg-gray-300 hidden md:block" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-gray-600">
                          {t("upcomingEvents.stats.newEvents")}
                        </span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </>
            ) : (
              <FadeIn direction="up">
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t("upcomingEvents.noEvents.title")}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {t("upcomingEvents.noEvents.description")}
                  </p>
                  <Button
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                  >
                    <Link
                      href={
                        isSignedIn
                          ? `/${locale}/events/create`
                          : `/${locale}/sign-up`
                      }
                    >
                      {isSignedIn
                        ? t("upcomingEvents.noEvents.createFirst")
                        : t("buttons.getStartedFree")}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </FadeIn>
            )}
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <FadeIn direction="up">
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                  <Zap className="w-3 h-3 mr-1.5" />
                  {t("features.badge")}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {t("features.title")}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {t("features.description")}
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <FadeIn direction="up">
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/15">
                  <MousePointer className="w-3 h-3 mr-1.5" />
                  {t("howItWorks.badge")}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t("howItWorks.title")}
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  {t("howItWorks.description")}
                </p>
              </div>
            </FadeIn>

            <div className="relative">
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-10 left-[16.67%] right-[16.67%] h-px bg-white/20" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
                {[
                  {
                    step: 1,
                    title: t("howItWorks.step1.title"),
                    description: t("howItWorks.step1.description"),
                    icon: Users,
                  },
                  {
                    step: 2,
                    title: t("howItWorks.step2.title"),
                    description: t("howItWorks.step2.description"),
                    icon: Calendar,
                  },
                  {
                    step: 3,
                    title: t("howItWorks.step3.title"),
                    description: t("howItWorks.step3.description"),
                    icon: Rocket,
                  },
                ].map((item, index) => (
                  <FadeIn key={index} direction="up" delay={index * 150}>
                    <div className="relative text-center">
                      {/* Step Number */}
                      <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl">
                          {item.step}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <item.icon className="w-6 h-6 text-blue-400" />
                      </div>

                      <h3 className="text-xl font-semibold mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeIn direction="left">
                <div>
                  <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                    <Award className="w-3 h-3 mr-1.5" />
                    {t("benefits.badge")}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {t("benefits.title")}
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    {t("benefits.description")}
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        title: t("benefits.easyToUse.title"),
                        description: t("benefits.easyToUse.description"),
                        icon: MousePointer,
                        color: "blue" as const,
                      },
                      {
                        title: t("benefits.realTime.title"),
                        description: t("benefits.realTime.description"),
                        icon: Zap,
                        color: "yellow" as const,
                      },
                      {
                        title: t("benefits.multiRole.title"),
                        description: t("benefits.multiRole.description"),
                        icon: Users,
                        color: "purple" as const,
                      },
                      {
                        title: t("benefits.comprehensiveAnalytics.title"),
                        description: t(
                          "benefits.comprehensiveAnalytics.description"
                        ),
                        icon: BarChart,
                        color: "green" as const,
                      },
                    ].map((benefit, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
                            {
                              "bg-blue-100": benefit.color === "blue",
                              "bg-yellow-100": benefit.color === "yellow",
                              "bg-purple-100": benefit.color === "purple",
                              "bg-green-100": benefit.color === "green",
                            }
                          )}
                        >
                          <benefit.icon
                            className={cn("w-6 h-6", {
                              "text-blue-600": benefit.color === "blue",
                              "text-yellow-600": benefit.color === "yellow",
                              "text-purple-600": benefit.color === "purple",
                              "text-green-600": benefit.color === "green",
                            })}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="right">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: Clock,
                      title: t("benefits.saveTime.title"),
                      description: t("benefits.saveTime.description"),
                      bgColor: "bg-blue-600",
                    },
                    {
                      icon: Zap,
                      title: t("benefits.fastSetup.title"),
                      description: t("benefits.fastSetup.description"),
                      bgColor: "bg-purple-600",
                    },
                    {
                      icon: Shield,
                      title: t("benefits.secure.title"),
                      description: t("benefits.secure.description"),
                      bgColor: "bg-green-600",
                    },
                    {
                      icon: BarChart,
                      title: t("benefits.analyticsCard.title"),
                      description: t("benefits.analyticsCard.description"),
                      bgColor: "bg-orange-600",
                    },
                  ].map((benefit, index) => (
                    <Card
                      key={index}
                      className="group border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className={cn(
                            "inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-4 group-hover:scale-105 transition-transform duration-300",
                            benefit.bgColor
                          )}
                        >
                          <benefit.icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {benefit.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* INTEGRATIONS SECTION */}
        <IntegrationsSection />

        {/* TESTIMONIALS SECTION */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <FadeIn direction="up">
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
                  <Star className="w-3 h-3 mr-1.5" />
                  {t("testimonials.badge")}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {t("testimonials.title")}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {t("testimonials.description")}
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <FadeIn direction="up">
              <div className="text-center max-w-3xl mx-auto">
                <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/25">
                  <Rocket className="w-3 h-3 mr-1.5" />
                  {t("cta.badge")}
                </Badge>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                  {t("cta.title")}
                </h2>

                <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                  {t("cta.description")}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-base font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-xl transition-all duration-300"
                  >
                    <Link
                      href={
                        isSignedIn
                          ? currentUser?.role !== "ATTENDEE"
                            ? `/${locale}/events/create`
                            : `/${locale}/events`
                          : `/${locale}/sign-up`
                      }
                    >
                      {isSignedIn
                        ? currentUser?.role !== "ATTENDEE"
                          ? t("buttons.createEvent")
                          : t("buttons.browseEvents")
                        : t("buttons.getStartedFree")}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base font-semibold border-2 border-white/30 text-white bg-transparent hover:bg-white hover:text-blue-600 transition-all duration-300"
                  >
                    <Link
                      href={
                        isSignedIn
                          ? `/${locale}/dashboard`
                          : `/${locale}/events`
                      }
                    >
                      {isSignedIn
                        ? t("buttons.goToDashboard")
                        : t("buttons.browseEvents")}
                      <Sparkles className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>

                <p className="text-sm text-blue-200">
                  {isSignedIn ? t("cta.startCreating") : t("cta.disclaimer")}
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* SECURITY BANNER */}
        <section className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <span>{t("security.sslSecured")}</span>
              </div>
              <div className="w-px h-4 bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span>{t("security.gdprCompliant")}</span>
              </div>
              <div className="w-px h-4 bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-500" />
                <span>{t("security.soc2Certified")}</span>
              </div>
              <div className="w-px h-4 bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-gray-500" />
                <span>{t("security.support247")}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
