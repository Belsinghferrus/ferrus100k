import { differenceInCalendarDays, addDays } from 'date-fns'

export function dailyTargetForDate(profile, date = new Date()) {
  if (!profile) return 0
  const start    = new Date(profile.starting_date)
  const deadline = new Date(profile.deadline)
  const totalDays = Math.max(1, differenceInCalendarDays(deadline, start))
  const totalGrowth = profile.target_followers - profile.starting_followers
  return Math.ceil(totalGrowth / totalDays)
}

export function buildDateRange(startDate, endDate) {
  const days = []
  let d = new Date(startDate)
  const end = new Date(endDate)
  while (d <= end) { days.push(new Date(d)); d = addDays(d, 1) }
  return days
}