"use client";

import { useState, useCallback, useEffect } from "react";
import { useEvents, useCategories } from "@/hooks";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Grid3x3,
  List,
  Eye,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { EventWithRelations, CategoryWithCount } from "@/types";
import { cn } from "@/lib/utils";
import { Link } from "@/app/i18n/routing";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/use-user";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Locale } from "@/app/i18n/config";

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Loading skeleton grid
const EventsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden border-gray-200">
        <Skeleton className="h-48 w-full" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </Card>
    ))}
  </div>
);

// Sidebar Filter Component
interface FilterSidebarProps {
  className?: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  category: string;
  handleCategoryChange: (value: string) => void;
  priceFilter: string;
  setPriceFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  categories: CategoryWithCount[] | undefined;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

const FilterSidebar = ({
  className,
  searchTerm,
  setSearchTerm,
  category,
  handleCategoryChange,
  priceFilter,
  setPriceFilter,
  dateFilter,
  setDateFilter,
  categories,
  hasActiveFilters,
  clearFilters,
}: FilterSidebarProps) => {
  const t = useTranslations("events.filters");
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    date: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search */}
      <div>
        <Label className="text-sm font-semibold text-gray-900 mb-3 block">
          {t("search")}
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 border-gray-300 focus:border-blue-500"
          />
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full mb-3"
        >
          <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
            {t("categories")}
          </Label>
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {expandedSections.categories && (
          <div className="space-y-2">
            <button
              onClick={() => handleCategoryChange("")}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                !category
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {t("allEvents")}
            </button>
            {categories?.map((cat: CategoryWithCount) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                  category === cat.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color || "#6b7280" }}
                  />
                  <span>{cat.name}</span>
                </div>
                {cat._count?.events > 0 && (
                  <Badge variant="secondary" className="text-xs h-5 px-2">
                    {cat._count.events}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Price Filter */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-3"
        >
          <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
            {t("price")}
          </Label>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {expandedSections.price && (
          <RadioGroup value={priceFilter} onValueChange={setPriceFilter}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="price-all" />
                <Label
                  htmlFor="price-all"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t("priceAll")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="price-free" />
                <Label
                  htmlFor="price-free"
                  className="text-sm text-gray-700 cursor-pointer flex items-center gap-2"
                >
                  {t("priceFree")}
                  <Badge variant="secondary" className="text-xs">
                    {t("popular")}
                  </Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="price-paid" />
                <Label
                  htmlFor="price-paid"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t("pricePaid")}
                </Label>
              </div>
            </div>
          </RadioGroup>
        )}
      </div>

      <Separator />

      {/* Date Filter */}
      <div>
        <button
          onClick={() => toggleSection("date")}
          className="flex items-center justify-between w-full mb-3"
        >
          <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
            {t("date")}
          </Label>
          {expandedSections.date ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {expandedSections.date && (
          <RadioGroup value={dateFilter} onValueChange={setDateFilter}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="date-all" />
                <Label
                  htmlFor="date-all"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t("dateAll")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="today" id="date-today" />
                <Label
                  htmlFor="date-today"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t("today")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tomorrow" id="date-tomorrow" />
                <Label
                  htmlFor="date-tomorrow"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t("tomorrow")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="week" id="date-week" />
                <Label
                  htmlFor="date-week"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t("thisWeek")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekend" id="date-weekend" />
                <Label
                  htmlFor="date-weekend"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t("thisWeekend")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="date-month" />
                <Label
                  htmlFor="date-month"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t("thisMonth")}
                </Label>
              </div>
            </div>
          </RadioGroup>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-gray-300 hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-2" />
            {t("clearAll")}
          </Button>
        </>
      )}
    </div>
  );
};

export default function EventsPage() {
  const { isSignedIn } = useUser();
  const { data: currentUser } = useCurrentUser();
  const t = useTranslations("events");
  const tNav = useTranslations("nav");
  const params = useParams();
  const locale = (params?.locale as Locale) || "am";

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [priceFilter, setPriceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const {
    data: eventsData,
    isLoading,
    error,
  } = useEvents({
    page,
    limit: viewMode === "grid" ? 12 : 10,
    search: debouncedSearch,
    category,
  });

  const { data: categories } = useCategories();

  const handleCategoryChange = (value: string) => {
    setCategory(value === category ? "" : value);
    setPage(1);
  };

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setCategory("");
    setPriceFilter("all");
    setDateFilter("all");
    setPage(1);
  }, []);

  const hasActiveFilters = Boolean(
    category || priceFilter !== "all" || dateFilter !== "all" || debouncedSearch
  );

  const totalEvents = eventsData?.pagination?.total ?? 0;
  const currentEvents = eventsData?.events?.length ?? 0;
  const totalPages = eventsData?.pagination?.totalPages ?? 0;

  const canCreateEvent = isSignedIn && currentUser?.role !== "ATTENDEE";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t("title")}
                </h1>
                <p className="text-gray-600">{t("subtitle")}</p>
              </div>

              {canCreateEvent && (
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white hidden md:flex"
                >
                  <Link href="/events/create">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("createEvent")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {t("filters.title")}
                  </h2>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="text-xs">
                      {t("filters.active")}
                    </Badge>
                  )}
                </div>
                <FilterSidebar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  category={category}
                  handleCategoryChange={handleCategoryChange}
                  priceFilter={priceFilter}
                  setPriceFilter={setPriceFilter}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  categories={categories}
                  hasActiveFilters={hasActiveFilters}
                  clearFilters={clearFilters}
                />
              </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-4 right-4 z-40">
              <Button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-12 px-6"
              >
                <Filter className="w-4 h-4 mr-2" />
                {t("filters.title")}
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-white text-blue-600"
                  >
                    {t("filters.active")}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
              <div
                className="lg:hidden fixed inset-0 z-50 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-semibold text-gray-900 text-lg">
                        {t("filters.title")}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileFilters(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    <FilterSidebar
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      category={category}
                      handleCategoryChange={handleCategoryChange}
                      priceFilter={priceFilter}
                      setPriceFilter={setPriceFilter}
                      dateFilter={dateFilter}
                      setDateFilter={setDateFilter}
                      categories={categories}
                      hasActiveFilters={hasActiveFilters}
                      clearFilters={clearFilters}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Stats & Controls Bar */}
              {!isLoading && eventsData && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          <span className="font-semibold text-gray-900">
                            {totalEvents}
                          </span>{" "}
                          {t("stats.total")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span>
                          {t("stats.showing")}{" "}
                          <span className="font-semibold text-gray-900">
                            {currentEvents}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* View Controls */}
                    <div className="flex items-center gap-3">
                      {/* View Mode Toggle */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className={cn(
                            "h-8 px-3",
                            viewMode === "grid" && "bg-white shadow-sm"
                          )}
                        >
                          <Grid3x3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className={cn(
                            "h-8 px-3",
                            viewMode === "list" && "bg-white shadow-sm"
                          )}
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Sort */}
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px] h-9 border-gray-300">
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">
                            {t("sort.byDate")}
                          </SelectItem>
                          <SelectItem value="popular">
                            {t("sort.popular")}
                          </SelectItem>
                          <SelectItem value="price-low">
                            {t("sort.priceLow")}
                          </SelectItem>
                          <SelectItem value="price-high">
                            {t("sort.priceHigh")}
                          </SelectItem>
                          <SelectItem value="newest">
                            {t("sort.newest")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Events Grid/List */}
              {isLoading ? (
                <EventsGridSkeleton />
              ) : error ? (
                <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                  <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <X className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {t("error.title")}
                  </h3>
                  <p className="text-gray-600 mb-6">{t("error.description")}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {t("error.retry")}
                  </Button>
                </div>
              ) : !eventsData || eventsData.events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                  <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {t("empty.title")}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {hasActiveFilters
                      ? t("empty.description")
                      : t("empty.descriptionNoFilters")}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {hasActiveFilters && (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="border-gray-300"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t("empty.clearFilters")}
                      </Button>
                    )}
                    {canCreateEvent && !hasActiveFilters && (
                      <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Link href="/events/create">
                          <Plus className="w-4 h-4 mr-2" />
                          {t("empty.createFirst")}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    )}
                  >
                    {eventsData.events.map((event: EventWithRelations) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-600 order-2 sm:order-1">
                        {t("pagination.showing")}{" "}
                        <span className="font-semibold text-gray-900">
                          {(page - 1) * 12 + 1}
                        </span>{" "}
                        {t("pagination.to")}{" "}
                        <span className="font-semibold text-gray-900">
                          {Math.min(page * 12, totalEvents)}
                        </span>{" "}
                        {t("pagination.of")}{" "}
                        <span className="font-semibold text-gray-900">
                          {totalEvents}
                        </span>{" "}
                        {t("pagination.events")}
                      </div>

                      <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPage(page - 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={page === 1}
                          className="border-gray-300"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          {t("pagination.previous")}
                        </Button>

                        {/* Page Numbers - Desktop */}
                        <div className="hidden sm:flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (page <= 3) {
                                pageNum = i + 1;
                              } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = page - 2 + i;
                              }

                              return (
                                <Button
                                  key={pageNum}
                                  variant={
                                    page === pageNum ? "default" : "ghost"
                                  }
                                  size="sm"
                                  onClick={() => {
                                    setPage(pageNum);
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                  className={cn(
                                    "w-10 h-10",
                                    page === pageNum &&
                                      "bg-blue-600 hover:bg-blue-700 text-white"
                                  )}
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                          )}
                        </div>

                        {/* Page Indicator - Mobile */}
                        <div className="flex sm:hidden items-center gap-2 px-4">
                          <span className="text-sm font-medium text-gray-700">
                            {t("pagination.page")} {page} {t("pagination.of")}{" "}
                            {totalPages}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setPage(page + 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={page === totalPages}
                          className="border-gray-300"
                        >
                          {t("pagination.next")}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
