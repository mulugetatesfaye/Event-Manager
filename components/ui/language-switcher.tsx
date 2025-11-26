"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { Locale, localeNames, localeFlags } from "@/app/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentLocale = (params.locale as Locale) || "am";

  const switchLocale = (newLocale: Locale) => {
    startTransition(() => {
      // Replace the locale in the pathname
      const newPathname = pathname.replace(
        `/${currentLocale}`,
        `/${newLocale}`
      );
      router.replace(newPathname);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 font-medium"
          disabled={isPending}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">
            {localeFlags[currentLocale]} {localeNames[currentLocale]}
          </span>
          <span className="sm:hidden">{localeFlags[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.entries(localeNames).map(([locale, name]) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale as Locale)}
            className={cn(
              "cursor-pointer flex items-center justify-between",
              currentLocale === locale && "bg-gray-100"
            )}
          >
            <span className="flex items-center gap-2">
              <span>{localeFlags[locale as Locale]}</span>
              <span>{name}</span>
            </span>
            {currentLocale === locale && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
