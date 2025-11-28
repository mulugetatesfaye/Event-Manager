// app/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Shield,
  Users,
  Zap,
  CheckCircle,
  Globe,
  Lock,
  Star,
  Sparkles,
  Award,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BENEFITS = [
  "Create unlimited events",
  "Accept payments online",
  "Real-time analytics dashboard",
  "Custom event branding",
  "Attendee management tools",
  "Email & SMS notifications",
];

const TESTIMONIAL = {
  quote:
    "AddisVibe transformed how we run our tech meetups. The platform is incredibly intuitive and our attendance has grown 3x!",
  author: "Abebe Kebede",
  role: "Tech Community Lead",
  avatar: "AK",
};

export default function SignUpPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "am";

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Benefits (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl" />
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Header */}
          <div>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2.5 group"
            >
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-white">AddisVibe</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="py-12">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/25">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Start for free today
            </Badge>

            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Start creating
              <br />
              <span className="text-orange-200">amazing events</span>
            </h1>

            <p className="text-lg text-orange-100 mb-10 max-w-md leading-relaxed">
              Join thousands of event organizers who trust AddisVibe to power
              their events.
            </p>

            {/* Benefits List */}
            <div className="space-y-3 mb-10">
              {BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-orange-200 text-orange-200"
                  />
                ))}
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                &ldquo;{TESTIMONIAL.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                  {TESTIMONIAL.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {TESTIMONIAL.author}
                  </p>
                  <p className="text-orange-200 text-xs">{TESTIMONIAL.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-6 text-sm text-orange-200">
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

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col bg-white">
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
              <span className="text-lg font-bold text-slate-900">
                AddisVibe
              </span>
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
                Create your account
              </h1>
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href={`/${locale}/sign-in`}
                  className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Clerk SignUp Component */}
            <SignUp
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
              path={`/${locale}/sign-up`}
              signInUrl={`/${locale}/sign-in`}
              afterSignUpUrl={`/${locale}/onboarding`}
              redirectUrl={`/${locale}/onboarding`}
            />

            {/* Terms */}
            <p className="mt-6 text-xs text-center text-slate-500 leading-relaxed">
              By signing up, you agree to our{" "}
              <Link
                href={`/${locale}/terms`}
                className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href={`/${locale}/privacy`}
                className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
              >
                Privacy Policy
              </Link>
            </p>

            {/* Trust Indicators */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>No credit card</span>
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
              <span className="text-slate-400">© 2024 AddisVibe</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
