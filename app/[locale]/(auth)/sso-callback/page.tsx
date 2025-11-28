// app/[locale]/(auth)/sso-callback/page.tsx
"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2, Calendar } from "lucide-react";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-slate-900">AddisVibe</span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-slate-600 font-medium">Completing sign in...</p>
      </div>

      <AuthenticateWithRedirectCallback />
    </div>
  );
}
