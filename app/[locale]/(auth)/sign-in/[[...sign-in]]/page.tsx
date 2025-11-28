// app/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Shield,
  Users,
  Zap,
  Star,
  CheckCircle,
  Globe,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Calendar,
    title: "Create Amazing Events",
    description: "Build and manage events with our powerful tools",
  },
  {
    icon: Users,
    title: "Grow Your Audience",
    description: "Reach thousands of attendees and build your community",
  },
  {
    icon: Zap,
    title: "Real-time Analytics",
    description: "Track registrations, engagement, and revenue instantly",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security for your peace of mind",
  },
];

const STATS = [
  { value: "50K+", label: "Events Hosted" },
  { value: "2M+", label: "Attendees" },
  { value: "99.9%", label: "Uptime" },
];

export default function SignInPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "am";

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Header */}
          <div>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2.5 group"
            >
              <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 transition-transform group-hover:scale-105">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Megbiya</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="py-12">
            <Badge className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/25">
              <Star className="w-3 h-3 mr-1.5 fill-orange-400" />
              Trusted by 10,000+ organizers
            </Badge>

            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Welcome back to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                Megbiya
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-md leading-relaxed">
              Sign in to manage your events, connect with attendees, and grow
              your community.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                  >
                    <div className="h-10 w-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {STATS.map((stat, index) => (
                <div key={index}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Available Worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden w-full border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 group"
            >
              <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Megbiya</span>
            </Link>

            <Link
              href={`/${locale}`}
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Link>
          </div>
        </header>

        {/* Desktop Back Button */}
        <div className="hidden lg:block p-6">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-[400px]">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                Sign in to your account
              </h1>
              <p className="text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/${locale}/sign-up`}
                  className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  Sign up free
                </Link>
              </p>
            </div>

            {/* Clerk SignIn Component */}
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none p-0 bg-transparent border-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  header: "hidden",
                  socialButtonsBlockButton:
                    "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm h-11 rounded-xl transition-all shadow-sm hover:shadow",
                  socialButtonsBlockButtonText: "font-medium text-sm",
                  socialButtonsProviderIcon: "w-5 h-5",
                  dividerRow: "my-6",
                  dividerLine: "bg-slate-200",
                  dividerText:
                    "text-slate-400 text-xs px-3 uppercase tracking-wide",
                  form: "space-y-4",
                  formFieldRow: "space-y-1.5",
                  formFieldLabel: "text-sm font-semibold text-slate-700",
                  formFieldInput:
                    "w-full h-11 px-4 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-slate-400",
                  formFieldInputShowPasswordButton:
                    "text-slate-400 hover:text-slate-600",
                  formButtonPrimary:
                    "w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-11 rounded-xl transition-all text-sm shadow-md shadow-orange-600/20 hover:shadow-lg hover:shadow-orange-600/25",
                  footerAction: "hidden",
                  footerActionText: "text-sm text-slate-600",
                  footerActionLink:
                    "text-orange-600 hover:text-orange-700 font-semibold",
                  formResendCodeLink:
                    "text-orange-600 hover:text-orange-700 font-semibold text-sm",
                  identityPreviewEditButton:
                    "text-orange-600 hover:text-orange-700 font-semibold",
                  identityPreview:
                    "border border-slate-200 rounded-xl p-4 bg-slate-50",
                  identityPreviewText: "text-slate-900 font-medium",
                  identityPreviewEditButtonIcon: "text-orange-600",
                  otpCodeFieldInput:
                    "border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent h-12 text-lg",
                  formFieldError:
                    "text-red-600 text-xs mt-1.5 flex items-center gap-1",
                  formFieldErrorText: "text-red-600 text-xs",
                  formFieldSuccessText: "text-emerald-600 text-xs",
                  alert:
                    "border border-red-200 bg-red-50 rounded-xl text-sm p-4",
                  alertText: "text-red-800 text-sm",
                  alertIcon: "text-red-600",
                  formFieldAction:
                    "text-orange-600 hover:text-orange-700 font-medium text-sm",
                  formFieldHintText: "text-slate-500 text-xs mt-1",
                  backLink:
                    "text-orange-600 hover:text-orange-700 font-medium text-sm",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                  showOptionalFields: false,
                },
              }}
              routing="path"
              path={`/${locale}/sign-in`}
              signUpUrl={`/${locale}/sign-up`}
              afterSignInUrl={`/${locale}/dashboard`}
              redirectUrl={`/${locale}/dashboard`}
            />

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-200 bg-white">
          <div className="max-w-md mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <Link
                href={`/${locale}/help`}
                className="hover:text-slate-900 transition-colors"
              >
                Help Center
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="hover:text-slate-900 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href={`/${locale}/privacy`}
                className="hover:text-slate-900 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-slate-400">© 2024 Megbiya</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
