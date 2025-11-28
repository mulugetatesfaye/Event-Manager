// app/[locale]/(auth)/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Megbiya",
  description: "Sign in or create an account to access Megbiya",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
