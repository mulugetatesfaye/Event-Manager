"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/use-user";
import { useEvents, useCategories } from "@/hooks";
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
  MousePointer,
  Layers,
  RefreshCw,
  ArrowDown,
  ChevronLeft,
  Tag,
  Music,
  Briefcase,
  GraduationCap,
  Heart,
  Palette,
  Coffee,
  Code,
  Dumbbell,
  Camera,
  Plane,
  Gamepad2,
  Baby,
  Car,
  Home,
  Utensils,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { EventWithRelations, CategoryWithCount } from "@/types";
import { Locale } from "@/app/i18n/config";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useRef } from "react";

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

// Category icon mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  music: Music,
  business: Briefcase,
  education: GraduationCap,
  health: Heart,
  art: Palette,
  food: Utensils,
  technology: Code,
  sports: Dumbbell,
  photography: Camera,
  travel: Plane,
  gaming: Gamepad2,
  family: Baby,
  automotive: Car,
  "real estate": Home,
  entertainment: Star,
  networking: Users,
  conference: Calendar,
  workshop: GraduationCap,
  default: Tag,
};

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
// UTILITY COMPONENTS
// ============================================================================

function StatCard({ value, labelKey, icon: Icon, delay = 0 }: StatCardProps) {
  const t = useTranslations("home.stats");

  return (
    <FadeIn direction="up" delay={delay}>
      <div className="group relative">
        <div className="relative bg-white border border-slate-200 rounded-2xl p-6 text-center hover:border-orange-300 hover:shadow-lg transition-all duration-300">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 mb-4 group-hover:bg-orange-100 transition-colors">
            <Icon className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
          <div className="text-sm text-slate-600 font-medium">
            {t(labelKey)}
          </div>
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
      <Card className="group relative overflow-hidden border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-300 h-full">
        <CardContent className="p-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-600 shadow-lg shadow-orange-600/20 mb-6 group-hover:scale-105 transition-transform duration-300">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
          <p className="text-slate-600 leading-relaxed">{description}</p>
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
      <Card className="group relative overflow-hidden border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-300 h-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-orange-600" />
        <CardContent className="p-8">
          <div className="absolute top-6 right-6 text-6xl text-slate-100 font-serif leading-none select-none">
            &ldquo;
          </div>

          <div className="flex items-center gap-1 mb-4">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <p className="text-slate-700 mb-6 leading-relaxed relative z-10 text-lg">
            &ldquo;{content}&rdquo;
          </p>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-xl shadow-lg">
              {avatar}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{name}</p>
              <p className="text-sm text-slate-500">{role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

function TrustedBySection() {
  const t = useTranslations("home.trustedBy");

  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn direction="up">
          <p className="text-center text-sm font-medium text-slate-500 mb-8 uppercase tracking-wider">
            {t("title")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {TRUSTED_COMPANIES.map((company) => (
              <div
                key={company}
                className="flex items-center gap-2 text-slate-400 opacity-60 hover:opacity-100 transition-opacity"
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
    <section className="bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
              <Layers className="w-3 h-3 mr-1.5" />
              {t("badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("title")}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {INTEGRATION_LOGOS.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                </div>
                <span className="font-medium text-slate-700">{name}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ============================================================================
// CATEGORIES CAROUSEL - Circular Icons with Labels Below
// ============================================================================

function CategoriesCarousel({ locale }: { locale: Locale }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const { data: categories, isLoading } = useCategories();

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [checkScrollButtons, categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    for (const key in CATEGORY_ICONS) {
      if (name.includes(key)) {
        return CATEGORY_ICONS[key];
      }
    }
    return CATEGORY_ICONS.default;
  };

  if (isLoading) {
    return (
      <div className="flex gap-8 overflow-hidden py-6 px-6 justify-center">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex-none flex flex-col items-center gap-3">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Gradient Fade - Left */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Gradient Fade - Right */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-slate-50 hover:scale-110 hover:shadow-xl hover:border-slate-300",
            isHovering ? "opacity-100" : "opacity-0 md:opacity-100"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-slate-50 hover:scale-110 hover:shadow-xl hover:border-slate-300",
            isHovering ? "opacity-100" : "opacity-0 md:opacity-100"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      )}

      {/* Categories Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide scroll-smooth py-6 px-6"
      >
        {/* All Categories */}
        <Link
          href={`/${locale}/events`}
          className="flex-none group/item"
          style={{ animation: `fadeInScale 0.5s ease-out both` }}
        >
          <div className="flex flex-col items-center w-24 sm:w-28">
            {/* Circular Icon Container */}
            <div className="relative mb-3">
              {/* Main Circle */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/25 transition-all duration-300 group-hover/item:scale-110 group-hover/item:shadow-xl group-hover/item:shadow-orange-500/35">
                <Tag className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              {/* Animated ring on hover */}
              <div className="absolute -inset-1 rounded-full border-2 border-orange-400/50 opacity-0 group-hover/item:opacity-100 group-hover/item:scale-105 transition-all duration-300" />
            </div>

            {/* Label - Always Visible */}
            <div className="text-center w-full">
              <p className="font-semibold text-slate-900 text-sm leading-tight">
                All Events
              </p>
              <p className="text-xs text-slate-500 mt-1">Browse all</p>
            </div>
          </div>
        </Link>

        {/* Category Items */}
        {categories.map((category: CategoryWithCount, index: number) => {
          const IconComponent = getCategoryIcon(category.name);
          const eventCount = category._count?.events || 0;
          const categoryColor = category.color || "#ea580c";

          return (
            <Link
              key={category.id}
              href={`/${locale}/events?category=${category.id}`}
              className="flex-none group/item"
              style={{
                animation: `fadeInScale 0.5s ease-out ${
                  (index + 1) * 0.06
                }s both`,
              }}
            >
              <div className="flex flex-col items-center w-24 sm:w-28">
                {/* Circular Icon Container */}
                <div className="relative mb-3">
                  {/* Main Circle */}
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover/item:scale-110 group-hover/item:shadow-xl"
                    style={{
                      backgroundColor: categoryColor,
                      boxShadow: `0 10px 25px -5px ${categoryColor}40`,
                    }}
                  >
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>

                  {/* Animated ring on hover */}
                  <div
                    className="absolute -inset-1 rounded-full border-2 opacity-0 group-hover/item:opacity-100 group-hover/item:scale-105 transition-all duration-300"
                    style={{ borderColor: `${categoryColor}60` }}
                  />

                  {/* Event count badge */}
                  {eventCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 min-w-[22px] h-[22px] px-1.5 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-700 leading-none">
                        {eventCount > 99 ? "99+" : eventCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Label - Always Visible */}
                <div className="text-center w-full">
                  <p className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">
                    {category.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {eventCount === 0
                      ? "No events"
                      : eventCount === 1
                      ? "1 event"
                      : `${eventCount} events`}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/90" />
      </div>

      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust Badges */}
          <FadeIn direction="down" delay={100}>
            <div className="inline-flex items-center gap-3 mb-8 flex-wrap justify-center">
              <Badge className="bg-white/10 border-white/20 text-white px-4 py-2 hover:bg-white/15">
                <Sparkles className="w-4 h-4 mr-2 text-orange-400" />
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
                <AnimatedTextLoop
                  words={heroWords}
                  className="text-orange-400"
                />
              </span>
              <br />
              {t("hero.subtitle")}
            </h1>
          </FadeIn>

          {/* Description */}
          <FadeIn direction="up" delay={300}>
            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn direction="up" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base font-semibold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/25 transition-all duration-300"
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
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
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
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
    limit: 8,
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
        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <HeroSection
          t={t}
          heroWords={heroWords}
          primaryCTA={primaryCTA}
          secondaryCTA={secondaryCTA}
        />

        {/* ============================================================ */}
        {/* CATEGORIES SECTION */}
        {/* ============================================================ */}
        <section className="bg-white border-b border-slate-200 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn direction="up">
              <div className="text-center mb-10">
                <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                  <Tag className="w-3 h-3 mr-1.5" />
                  Browse by Category
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
                  Explore Event Categories
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Find events that match your interests across various
                  categories
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={200}>
              <CategoriesCarousel locale={locale} />
            </FadeIn>
          </div>
        </section>

        {/* ============================================================ */}
        {/* UPCOMING EVENTS SECTION */}
        {/* ============================================================ */}
        <section className="bg-white py-20 lg:py-24 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn direction="up">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
                <div>
                  <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    Upcoming Events
                  </Badge>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
                    Discover Amazing Events
                  </h2>
                  <p className="text-lg text-slate-600 max-w-2xl">
                    Join thousands of attendees at our curated events happening
                    near you
                  </p>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
                >
                  <Link href={`/${locale}/events`}>
                    View All Events
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </FadeIn>

            {/* Events Grid */}
            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <Card className="overflow-hidden border-slate-200">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-5 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : eventsData && eventsData.events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {eventsData.events.map(
                  (event: EventWithRelations, index: number) => (
                    <FadeIn key={event.id} direction="up" delay={index * 100}>
                      <EventCard event={event} />
                    </FadeIn>
                  )
                )}
              </div>
            ) : (
              <FadeIn direction="up">
                <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No upcoming events
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Be the first to create an event and connect with your
                    community
                  </p>
                  <Button asChild className="bg-orange-600 hover:bg-orange-700">
                    <Link href={`/${locale}/events/create`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Event
                    </Link>
                  </Button>
                </div>
              </FadeIn>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* STATS SECTION */}
        {/* ============================================================ */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <FadeIn direction="up">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
                  <BarChart className="w-3 h-3 mr-1.5" />
                  Platform Statistics
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                  Trusted by Thousands
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Join our growing community of event organizers and attendees
                </p>
              </div>
            </FadeIn>

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

        {/* ============================================================ */}
        {/* TRUSTED BY SECTION */}
        {/* ============================================================ */}
        <TrustedBySection />

        {/* ============================================================ */}
        {/* FEATURES SECTION */}
        {/* ============================================================ */}
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <FadeIn direction="up">
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                  <Zap className="w-3 h-3 mr-1.5" />
                  {t("features.badge")}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {t("features.title")}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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

        {/* ============================================================ */}
        {/* HOW IT WORKS SECTION */}
        {/* ============================================================ */}
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
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  {t("howItWorks.description")}
                </p>
              </div>
            </FadeIn>

            <div className="relative">
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
                      <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl">
                          {item.step}
                        </div>
                      </div>

                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <item.icon className="w-6 h-6 text-orange-400" />
                      </div>

                      <h3 className="text-xl font-semibold mb-3">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BENEFITS SECTION */}
        {/* ============================================================ */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeIn direction="left">
                <div>
                  <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                    <Award className="w-3 h-3 mr-1.5" />
                    {t("benefits.badge")}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    {t("benefits.title")}
                  </h2>
                  <p className="text-lg text-slate-600 mb-8">
                    {t("benefits.description")}
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        title: t("benefits.easyToUse.title"),
                        description: t("benefits.easyToUse.description"),
                        icon: MousePointer,
                        color: "orange" as const,
                      },
                      {
                        title: t("benefits.realTime.title"),
                        description: t("benefits.realTime.description"),
                        icon: Zap,
                        color: "amber" as const,
                      },
                      {
                        title: t("benefits.multiRole.title"),
                        description: t("benefits.multiRole.description"),
                        icon: Users,
                        color: "blue" as const,
                      },
                      {
                        title: t("benefits.comprehensiveAnalytics.title"),
                        description: t(
                          "benefits.comprehensiveAnalytics.description"
                        ),
                        icon: BarChart,
                        color: "emerald" as const,
                      },
                    ].map((benefit, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
                            {
                              "bg-orange-100": benefit.color === "orange",
                              "bg-amber-100": benefit.color === "amber",
                              "bg-blue-100": benefit.color === "blue",
                              "bg-emerald-100": benefit.color === "emerald",
                            }
                          )}
                        >
                          <benefit.icon
                            className={cn("w-6 h-6", {
                              "text-orange-600": benefit.color === "orange",
                              "text-amber-600": benefit.color === "amber",
                              "text-blue-600": benefit.color === "blue",
                              "text-emerald-600": benefit.color === "emerald",
                            })}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {benefit.title}
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
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
                      bgColor: "bg-orange-600",
                    },
                    {
                      icon: Zap,
                      title: t("benefits.fastSetup.title"),
                      description: t("benefits.fastSetup.description"),
                      bgColor: "bg-amber-600",
                    },
                    {
                      icon: Shield,
                      title: t("benefits.secure.title"),
                      description: t("benefits.secure.description"),
                      bgColor: "bg-emerald-600",
                    },
                    {
                      icon: BarChart,
                      title: t("benefits.analyticsCard.title"),
                      description: t("benefits.analyticsCard.description"),
                      bgColor: "bg-blue-600",
                    },
                  ].map((benefit, index) => (
                    <Card
                      key={index}
                      className="group border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
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
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-slate-600">
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

        {/* ============================================================ */}
        {/* INTEGRATIONS SECTION */}
        {/* ============================================================ */}
        <IntegrationsSection />

        {/* ============================================================ */}
        {/* TESTIMONIALS SECTION */}
        {/* ============================================================ */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <FadeIn direction="up">
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
                  <Star className="w-3 h-3 mr-1.5" />
                  {t("testimonials.badge")}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {t("testimonials.title")}
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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

        {/* ============================================================ */}
        {/* CTA SECTION */}
        {/* ============================================================ */}
        <section className="bg-orange-600">
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

                <p className="text-xl text-orange-100 mb-10 leading-relaxed">
                  {t("cta.description")}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 text-base font-semibold bg-white text-orange-600 hover:bg-orange-50 shadow-xl transition-all duration-300"
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
                    className="h-14 px-8 text-base font-semibold border-2 border-white/30 text-white bg-transparent hover:bg-white hover:text-orange-600 transition-all duration-300"
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

                <p className="text-sm text-orange-200">
                  {isSignedIn ? t("cta.startCreating") : t("cta.disclaimer")}
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECURITY BANNER */}
        {/* ============================================================ */}
        <section className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>{t("security.sslSecured")}</span>
              </div>
              <div className="w-px h-4 bg-slate-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <span>{t("security.gdprCompliant")}</span>
              </div>
              <div className="w-px h-4 bg-slate-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-500" />
                <span>{t("security.soc2Certified")}</span>
              </div>
              <div className="w-px h-4 bg-slate-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-slate-500" />
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
