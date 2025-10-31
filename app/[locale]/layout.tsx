import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/app/i18n/routing";
import { isValidLocale } from "@/app/i18n/config";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid using type guard
  if (!isValidLocale(locale)) {
    notFound();
  }

  // After the type guard, TypeScript knows locale is Locale type
  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html
        lang={locale}
        className={inter.variable}
        suppressHydrationWarning
        dir="ltr"
      >
        <body className={inter.className} suppressHydrationWarning>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <div className="min-h-screen flex flex-col">
                <div className="flex-1 pt-14 md:pt-16">{children}</div>
              </div>
              <Toaster
                position="top-center"
                closeButton
                richColors
                toastOptions={{
                  duration: 4000,
                  classNames: {
                    toast: "border border-gray-200 shadow-lg",
                    title: "text-sm font-medium text-gray-900",
                    description: "text-sm text-gray-600",
                    actionButton: "bg-blue-600 text-white hover:bg-blue-700",
                    cancelButton: "bg-gray-100 text-gray-900 hover:bg-gray-200",
                    closeButton:
                      "bg-white border border-gray-200 text-gray-500 hover:text-gray-900",
                    success: "border-green-200 bg-green-50",
                    error: "border-red-200 bg-red-50",
                    warning: "border-yellow-200 bg-yellow-50",
                    info: "border-blue-200 bg-blue-50",
                  },
                }}
              />
            </QueryProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
