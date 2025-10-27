// types/index.ts
import { 
  Event, 
  User, 
  Category, 
  Registration, 
  UserRole, 
  EventStatus,
  TicketType,
  TicketPurchase,
  PromoCode,
  Seat,
  TicketTypeStatus,
  PromoCodeType
} from '@prisma/client'

// ============================================================================
// Re-export Prisma types
// ============================================================================
export type { 
  Event, 
  User, 
  Category, 
  Registration, 
  UserRole, 
  EventStatus,
  TicketType,
  TicketPurchase,
  PromoCode,
  Seat,
  TicketTypeStatus,
  PromoCodeType
}

// ============================================================================
// User Types
// ============================================================================

// User with limited fields for display
export type UserBasic = Pick<User, 'id' | 'firstName' | 'lastName' | 'imageUrl' | 'email'>

// User with relations
export interface UserWithRelations extends User {
  organizedEvents?: Event[]
  registrations?: Registration[]
  createdEvents?: Event[]
}

// User with counts for admin dashboard
export interface UserWithCounts extends User {
  _count: {
    organizedEvents: number
    registrations: number
  }
}

// ============================================================================
// Ticket Types
// ============================================================================

// Ticket Type with relations - FIXED
export interface TicketTypeWithRelations extends TicketType {
  event?: Event
  ticketPurchases?: TicketPurchase[]
  _count?: {
    ticketPurchases: number
  }
  // Computed fields (these are optional as they're calculated)
  available?: number
  isSoldOut?: boolean
  isEarlyBird?: boolean
  currentPrice?: number
}

// Ticket Purchase with relations
export interface TicketPurchaseWithRelations extends TicketPurchase {
  registration?: Registration
  ticketType?: TicketType
  promoCode?: PromoCode | null
}

// Promo Code with relations
export interface PromoCodeWithRelations extends PromoCode {
  event?: Event | null
  ticketPurchases?: TicketPurchase[]
  _count?: {
    ticketPurchases: number
  }
}

// ============================================================================
// Registration Types
// ============================================================================

// Full registration with relations
export interface RegistrationWithRelations extends Registration {
  event?: EventWithRelations
  user?: User
  ticketPurchases?: TicketPurchaseWithRelations[]
}

// Registration for dashboard views
export interface DashboardRegistration extends Registration {
  event: Event & {
    category?: Category | null
    organizer?: UserBasic | null
  }
  ticketPurchases?: TicketPurchaseWithRelations[]
}

// Registration with full user details (for organizer views)
export interface RegistrationWithUser extends Registration {
  user: UserBasic
  event?: Event
  ticketPurchases?: TicketPurchaseWithRelations[]
}

// ============================================================================
// Event Types
// ============================================================================

// Event with all relations
export interface EventWithRelations extends Event {
  category?: Category | null
  organizer?: User | null
  creator?: User | null
  registrations?: RegistrationWithRelations[]
  ticketTypes?: TicketTypeWithRelations[]
  promoCodes?: PromoCode[]
  seats?: Seat[]
  _count?: {
    registrations: number
    ticketTypes: number
  }
  // Server-calculated fields for ticket availability
  totalTicketsSold?: number
  availableSpots?: number
}

// Event for dashboard (minimal)
export interface DashboardEvent extends Event {
  category?: Category | null
  organizer?: UserBasic | null
  ticketTypes?: TicketTypeWithRelations[]
  _count?: {
    registrations: number
    ticketTypes: number
  }
  totalTicketsSold?: number
  availableSpots?: number
}

// ============================================================================
// Category Types
// ============================================================================

// Category with event count
export interface CategoryWithCount extends Category {
  _count: {
    events: number
  }
}

// ============================================================================
// QR Code & Check-in Types
// ============================================================================

// QR Code data structure
export interface QRCodeData {
  registrationId: string
  eventId: string
  userId: string
  ticketNumber: string
  quantity: number
  timestamp: number
}

// Check-in response from API
export interface CheckInResponse {
  success: boolean
  alreadyCheckedIn?: boolean
  registration: RegistrationWithRelations
  message: string
  checkedInAt?: Date | string | null
}

// Check-in statistics
export interface CheckInStats {
  totalRegistrations: number
  checkedInCount: number
  notCheckedInCount: number
  checkInRate: number
}

// ============================================================================
// Form Data Types (for forms, we use undefined instead of null)
// ============================================================================

export interface EventFormData {
  title: string
  description?: string
  location: string
  venue?: string
  startDate: string
  endDate: string
  capacity: number
  price: number
  imageUrl?: string
  status: EventStatus
  categoryId?: string
  requiresSeating?: boolean
  allowGroupBooking?: boolean
  groupDiscountPercentage?: number | null  // Changed: Added | null
  groupMinQuantity?: number
}

export interface CategoryFormData {
  name: string
  slug: string
  description?: string
  color?: string
}

export interface RegistrationFormData {
  eventId: string
  metadata?: Record<string, unknown>
}

// Form data for creating ticket types
export interface TicketTypeFormData {
  name: string
  description?: string
  price: number
  quantity: number
  earlyBirdPrice?: number
  earlyBirdEndDate?: string
  minQuantity?: number
  maxQuantity?: number
  features?: string[]
  status?: TicketTypeStatus
  sortOrder?: number
}

// Form data for creating promo codes
export interface PromoCodeFormData {
  code: string
  eventId?: string
  type: PromoCodeType
  discountValue: number
  maxUses?: number
  maxUsesPerUser?: number
  validFrom?: string
  validUntil?: string
  minPurchaseAmount?: number
  applicableTicketTypes?: string[]
  isActive?: boolean
}

// Registration request with ticket purchases
export interface TicketRegistrationRequest {
  ticketSelections: Array<{
    ticketTypeId: string
    quantity: number
  }>
  promoCode?: string
  seatSelections?: Array<{
    ticketTypeId: string
    seatNumbers: string[]
  }>
  // User info
  firstName: string
  lastName: string
  email: string
  phone: string
  organization?: string
  dietaryRequirements?: string
  specialRequirements?: string
  marketingEmails?: boolean
  termsAccepted: boolean
}

// Ticket availability info
export interface TicketAvailability {
  ticketTypeId: string
  name: string
  price: number
  available: number
  total: number
  isSoldOut: boolean
  isEarlyBird: boolean
  earlyBirdPrice?: number
  currentPrice: number
}

// ============================================================================
// API Response Types
// ============================================================================

// Pagination parameters
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: EventStatus
  sortBy?: 'date' | 'title' | 'registrations'
  sortOrder?: 'asc' | 'desc'
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Events API response
export interface EventsApiResponse {
  events: EventWithRelations[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Registration API response
export interface RegistrationApiResponse {
  registration: RegistrationWithRelations
  message: string
  summary?: {
    subtotal: number
    discount: number
    total: number
    ticketCount: number
  }
}

// Generic API error
export interface ApiError {
  error: string
  details?: unknown
  statusCode?: number
}

// API success response
export interface ApiSuccess<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

// ============================================================================
// Analytics & Statistics Types
// ============================================================================

export interface EventAnalytics {
  eventId: string
  totalViews: number
  totalRegistrations: number
  totalRevenue: number
  fillRate: number
  checkInRate: number
  averageRegistrationTime: number
  registrationsByDay: Array<{
    date: string
    count: number
  }>
  registrationsBySource: Array<{
    source: string
    count: number
  }>
}

export interface DashboardStats {
  totalEvents: number
  totalRegistrations: number
  totalRevenue: number
  avgFillRate: number
  upcomingEvents: number
  pastEvents: number
  draftEvents: number
  publishedEvents: number
}

// ============================================================================
// Filter & Sort Types
// ============================================================================

export type EventSortField = 'startDate' | 'title' | 'createdAt' | 'capacity'
export type SortOrder = 'asc' | 'desc'

export interface EventFilters {
  search?: string
  category?: string
  status?: EventStatus
  dateFrom?: Date
  dateTo?: Date
  priceMin?: number
  priceMax?: number
  location?: string
}

// ============================================================================
// Utility Types
// ============================================================================

// For select options in forms
export interface SelectOption {
  label: string
  value: string
}

// For date range pickers
export interface DateRange {
  from: Date
  to: Date
}

// For capacity tracking
export interface CapacityInfo {
  total: number
  registered: number
  available: number
  percentage: number
  isFull: boolean
}

// ============================================================================
// Webhook & Integration Types
// ============================================================================

export interface WebhookPayload {
  event: 'registration.created' | 'registration.cancelled' | 'event.created' | 'event.updated' | 'check-in.completed'
  data: Registration | Event
  timestamp: string
}

// ============================================================================
// Mobile App Types (for Flutter integration)
// ============================================================================

export interface MobileAuthResponse {
  token: string
  user: UserBasic
  expiresAt: string
}

export interface MobileScanResult {
  success: boolean
  registration?: RegistrationWithRelations
  error?: string
}

export interface RegistrationMetadata {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  organization?: string
  dietaryRequirements?: string
  specialRequirements?: string
  marketingEmails?: boolean
  termsAccepted?: boolean
  registeredAt?: string
  quantity?: number // Legacy field for old registrations
  [key: string]: unknown // Allow additional fields
}

// ============================================================================
// Activity & Check-in Types
// ============================================================================

export interface Activity {
  id: string
  type: string
  userId: string
  eventId?: string | null
  metadata?: Record<string, unknown>
  createdAt: Date
  user?: UserBasic
  event?: Event
}

export interface CheckInHistory {
  id: string
  type: string
  createdAt: Date
  user: {
    firstName: string | null
    lastName: string | null
  }
  metadata?: Record<string, unknown>
}

export interface CheckInData {
  event: {
    id: string
    title: string
    capacity: number
    startDate: Date
    endDate: Date
  }
  statistics: {
    totalRegistrations: number
    totalTickets: number
    checkedInCount: number
    checkedInTickets: number
    notCheckedInCount: number
    notCheckedInTickets: number
    checkInRate: number
    ticketCheckInRate: number
  }
  timeline: Array<{
    time: string
    count: number
  }>
  recentCheckIns: Array<{
    id: string
    user: UserBasic
    checkedInAt: Date | string | null
    checkedInBy: string | null
    quantity: number
    notes: string | null
  }>
  registrations: Array<{
    id: string
    user: UserBasic
    status: string
    quantity: number
    checkedIn: boolean
    checkedInAt: Date | string | null
    checkedInBy: string | null
    checkInNotes: string | null
    ticketNumber: string | null
    createdAt: Date
  }>
}

export interface BulkCheckInResult {
  success: boolean
  summary: {
    total: number
    successful: number
    failed: number
    alreadyCheckedIn: number
  }
  results: Array<{
    id: string
    success: boolean
    error?: string
    alreadyCheckedIn?: boolean
    user?: UserBasic
  }>
  message: string
}

// ============================================================================
// Type Guards
// ============================================================================

export function isEventWithRelations(event: Event | EventWithRelations): event is EventWithRelations {
  return 'category' in event || 'organizer' in event || 'registrations' in event
}

export function isRegistrationWithRelations(reg: Registration | RegistrationWithRelations): reg is RegistrationWithRelations {
  return 'event' in reg || 'user' in reg
}

// ============================================================================
// Constants
// ============================================================================

export const EVENT_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Completed', value: 'COMPLETED' }
]

export const USER_ROLE_OPTIONS: SelectOption[] = [
  { label: 'Attendee', value: 'ATTENDEE' },
  { label: 'Organizer', value: 'ORGANIZER' },
  { label: 'Admin', value: 'ADMIN' }
]

export const REGISTRATION_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

export const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' }
]

export const TICKET_TYPE_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Sold Out', value: 'SOLD_OUT' },
  { label: 'Inactive', value: 'INACTIVE' }
]

export const PROMO_CODE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Percentage Discount', value: 'PERCENTAGE' },
  { label: 'Fixed Amount', value: 'FIXED_AMOUNT' },
  { label: 'Early Bird', value: 'EARLY_BIRD' }
]