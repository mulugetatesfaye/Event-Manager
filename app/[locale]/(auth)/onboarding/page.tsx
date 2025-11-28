// app/[locale]/(auth)/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Users,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Loader2,
  User,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

type UserRole = "ATTENDEE" | "ORGANIZER";

interface RoleOption {
  value: UserRole;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  recommended?: boolean;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "ATTENDEE",
    title: "Event Attendee",
    description: "I want to discover and attend amazing events",
    icon: User,
    features: [
      "Browse and search events",
      "Register for free & paid events",
      "Manage your registrations",
      "Get event reminders",
    ],
  },
  {
    value: "ORGANIZER",
    title: "Event Organizer",
    description: "I want to create and manage my own events",
    icon: Building2,
    features: [
      "Create unlimited events",
      "Sell tickets & accept payments",
      "Access analytics dashboard",
      "Manage attendees & check-ins",
    ],
    recommended: true,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "am";
  const { user, isLoaded } = useUser();

  const [selectedRole, setSelectedRole] = useState<UserRole>("ATTENDEE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user in database with selected role
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user profile");
      }

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success("Welcome to AddisVibe! 🎉");

      // Redirect to dashboard
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 1000);
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">AddisVibe</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-2 w-24 bg-orange-600 rounded-full" />
            <div className="h-2 w-24 bg-slate-200 rounded-full" />
            <div className="h-2 w-24 bg-slate-200 rounded-full" />
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Welcome aboard!
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              How will you use AddisVibe?
            </h1>
            <p className="text-slate-600 max-w-md mx-auto">
              Choose your primary role. Don&apos;t worry, you can always change
              this later in settings.
            </p>
          </div>

          {/* Role Selection */}
          <RadioGroup
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as UserRole)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.value;

              return (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className="cursor-pointer"
                >
                  <Card
                    className={cn(
                      "relative overflow-hidden transition-all duration-200 h-full",
                      isSelected
                        ? "border-orange-500 ring-2 ring-orange-500/20 shadow-lg"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    )}
                  >
                    {option.recommended && (
                      <div className="absolute top-0 right-0">
                        <Badge className="rounded-none rounded-bl-lg bg-orange-600 text-white border-0">
                          Recommended
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="mt-1 border-slate-300 text-orange-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                isSelected ? "bg-orange-100" : "bg-slate-100"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "w-5 h-5",
                                  isSelected
                                    ? "text-orange-600"
                                    : "text-slate-600"
                                )}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {option.title}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {option.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            {option.features.map((feature, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-sm"
                              >
                                <CheckCircle
                                  className={cn(
                                    "w-4 h-4",
                                    isSelected
                                      ? "text-orange-600"
                                      : "text-slate-400"
                                  )}
                                />
                                <span className="text-slate-600">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              );
            })}
          </RadioGroup>

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white h-12 px-8 font-semibold shadow-lg shadow-orange-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              You can change your role anytime from your account settings
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-center text-xs text-slate-500">
            © 2024 Megbiya. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
