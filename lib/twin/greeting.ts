// Returns the one-line greeting Hoku says at the top of the /home page.
// Pure function — no I/O. Time-of-day band + holiday-season overlay.

interface HolidayBand {
  name: string
  // month is 0-indexed; day is 1-indexed
  start: [month: number, day: number]
  end: [month: number, day: number]
  greeting: string
}

const HOLIDAYS: HolidayBand[] = [
  // New Year window
  { name: "new-year",   start: [11, 28], end: [0,  3],  greeting: "Happy new beginnings" },
  // Lunar New Year (approximate late-Jan to mid-Feb — varies by year)
  { name: "lunar-new-year", start: [0, 20], end: [1, 20], greeting: "Wishing you a joyful new year" },
  // Summer (Northern Hemisphere June–August)
  { name: "summer",     start: [5,  1],  end: [7, 31],  greeting: "Hope you're having a brilliant summer" },
  // Halloween/autumn warmth
  { name: "halloween",  start: [9, 24],  end: [10, 1],  greeting: "Spooky season greetings" },
  // Winter holidays (mid-Dec through Christmas)
  { name: "winter",     start: [11, 10], end: [11, 27], greeting: "Warmest wishes this season" },
]

function inHolidayBand(now: Date, band: HolidayBand): boolean {
  const month = now.getMonth()
  const day = now.getDate()
  const [sm, sd] = band.start
  const [em, ed] = band.end
  if (sm <= em) {
    return (month > sm || (month === sm && day >= sd)) && (month < em || (month === em && day <= ed))
  }
  // wraps year boundary (e.g. Dec 28 → Jan 3)
  return (month > sm || (month === sm && day >= sd)) || (month < em || (month === em && day <= ed))
}

function timeBand(hour: number): string {
  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  if (hour >= 17 && hour < 21) return "evening"
  return "night"
}

const TIME_GREETINGS: Record<string, string> = {
  morning:   "Good morning",
  afternoon: "Good afternoon",
  evening:   "Good evening",
  night:     "Good evening",
}

export function greeting(now: Date, name?: string | null): string {
  const holiday = HOLIDAYS.find((h) => inHolidayBand(now, h))
  const base = holiday ? holiday.greeting : TIME_GREETINGS[timeBand(now.getHours())]
  return name ? `${base}, ${name}` : base
}
