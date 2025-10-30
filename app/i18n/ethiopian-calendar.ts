/**
 * Ethiopian Calendar Utilities
 * Converts between Gregorian and Ethiopian calendars
 */

export interface EthiopianDate {
  year: number
  month: number
  day: number
}

const ETHIOPIAN_MONTHS = [
  'መስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜን',
]

const ETHIOPIAN_MONTH_NAMES_SHORT = [
  'መስከ',
  'ጥቅም',
  'ኅዳር',
  'ታኅሣ',
  'ጥር',
  'የካቲ',
  'መጋቢ',
  'ሚያዝ',
  'ግንቦ',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜ',
]

/**
 * Convert Gregorian date to Ethiopian calendar
 */
export function gregorianToEthiopian(date: Date): EthiopianDate {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Ethiopian calendar is about 7-8 years behind Gregorian
  let ethYear = year - 8
  
  // Determine if it's after Ethiopian New Year (Sept 11/12 in Gregorian)
  const newYearDay = isLeapYear(year) ? 11 : 12
  
  if (month > 9 || (month === 9 && day >= newYearDay)) {
    ethYear = year - 7
  }

  // Calculate Ethiopian month and day
  let ethMonth: number
  let ethDay: number

  // Ethiopian New Year starts on Sept 11 (or 12 on leap year)
  const daysSinceNewYear = getDaysSinceEthiopianNewYear(date)
  
  if (daysSinceNewYear < 0) {
    // Before Ethiopian New Year - previous Ethiopian year
    ethYear--
    ethMonth = 13 // Pagumen
    ethDay = isEthiopianLeapYear(ethYear) ? 6 + daysSinceNewYear : 5 + daysSinceNewYear
  } else {
    // After or on Ethiopian New Year
    if (daysSinceNewYear < 360) {
      ethMonth = Math.floor(daysSinceNewYear / 30) + 1
      ethDay = (daysSinceNewYear % 30) + 1
    } else {
      ethMonth = 13 // Pagumen
      ethDay = daysSinceNewYear - 359
    }
  }

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
  }
}

/**
 * Convert Ethiopian date to Gregorian
 */
export function ethiopianToGregorian(ethDate: EthiopianDate): Date {
  const { year, month, day } = ethDate

  // Calculate Gregorian year
  const gregYear = year + 7
  
  // Calculate days from Ethiopian New Year
  let daysSinceNewYear: number
  
  if (month === 13) {
    // Pagumen month
    daysSinceNewYear = 360 + (day - 1)
  } else {
    daysSinceNewYear = ((month - 1) * 30) + (day - 1)
  }

  // Ethiopian New Year in Gregorian calendar
  const gregNewYearDay = isLeapYear(gregYear) ? 11 : 12
  const gregNewYear = new Date(gregYear, 8, gregNewYearDay) // Sept 11/12

  // Add days since Ethiopian New Year
  const result = new Date(gregNewYear)
  result.setDate(result.getDate() + daysSinceNewYear)

  return result
}

/**
 * Format Ethiopian date as string
 */
export function formatEthiopianDate(
  date: Date,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const ethDate = gregorianToEthiopian(date)
  const monthName = format === 'short' 
    ? ETHIOPIAN_MONTH_NAMES_SHORT[ethDate.month - 1]
    : ETHIOPIAN_MONTHS[ethDate.month - 1]

  if (format === 'short') {
    return `${ethDate.day} ${monthName} ${ethDate.year}`
  } else if (format === 'medium') {
    return `${ethDate.day} ${monthName} ${ethDate.year}`
  } else {
    return `${ethDate.day} ${monthName} ${ethDate.year} ዓ.ም`
  }
}

/**
 * Get Ethiopian month name
 */
export function getEthiopianMonthName(month: number, short = false): string {
  if (month < 1 || month > 13) {
    throw new Error('Invalid Ethiopian month')
  }
  return short ? ETHIOPIAN_MONTH_NAMES_SHORT[month - 1] : ETHIOPIAN_MONTHS[month - 1]
}

/**
 * Check if Gregorian year is leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Check if Ethiopian year is leap year
 */
function isEthiopianLeapYear(year: number): boolean {
  return (year + 1) % 4 === 0
}

/**
 * Get days since Ethiopian New Year
 */
function getDaysSinceEthiopianNewYear(date: Date): number {
  const year = date.getFullYear()
  const newYearDay = isLeapYear(year) ? 11 : 12
  const ethNewYear = new Date(year, 8, newYearDay) // Sept 11/12

  const diffTime = date.getTime() - ethNewYear.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Format relative time in Amharic
 */
export function formatRelativeTimeAmharic(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    if (diffDays === 1) return 'ነገ'
    if (diffDays < 7) return `በ${diffDays} ቀናት`
    if (diffDays < 30) return `በ${Math.floor(diffDays / 7)} ሳምንታት`
    if (diffDays < 365) return `በ${Math.floor(diffDays / 30)} ወራት`
    return `በ${Math.floor(diffDays / 365)} ዓመታት`
  } else if (diffDays < 0) {
    const absDays = Math.abs(diffDays)
    if (absDays === 1) return 'ትላንት'
    if (absDays < 7) return `ከ${absDays} ቀናት በፊት`
    if (absDays < 30) return `ከ${Math.floor(absDays / 7)} ሳምንታት በፊት`
    if (absDays < 365) return `ከ${Math.floor(absDays / 30)} ወራት በፊት`
    return `ከ${Math.floor(absDays / 365)} ዓመታት በፊት`
  }

  if (diffHours > 0) {
    return `በ${diffHours} ሰዓታት`
  } else if (diffHours < 0) {
    return `ከ${Math.abs(diffHours)} ሰዓታት በፊት`
  }

  if (diffMins > 0) {
    return `በ${diffMins} ደቂቃዎች`
  } else if (diffMins < 0) {
    return `ከ${Math.abs(diffMins)} ደቂቃዎች በፊት`
  }

  return 'አሁን'
}

/**
 * Format time in Amharic (12-hour format)
 */
export function formatTimeAmharic(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  
  // Convert to Ethiopian time (6 hours difference)
  let ethHours = hours - 6
  if (ethHours < 0) ethHours += 24
  if (ethHours >= 12) ethHours -= 12
  if (ethHours === 0) ethHours = 12

  const period = hours < 12 ? 'ጠዋት' : 'ከሰዓት'
  const minutesStr = minutes.toString().padStart(2, '0')

  return `${ethHours}:${minutesStr} ${period}`
}