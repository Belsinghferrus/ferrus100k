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

export function computeDailyRows(profile, entries = []) {
  if (!profile) return []
  const start = new Date(profile.starting_date)
  const deadline = new Date(profile.deadline)
  const totalDays = Math.max(1, differenceInCalendarDays(deadline, start))
  const totalGrowth = profile.target_followers - profile.starting_followers
  const dailyTarget = totalGrowth / totalDays

  return entries
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => {
      const dayIndex = differenceInCalendarDays(new Date(e.date), start) + 1
      const netGrowth = e.end_followers - e.start_followers
      const variance = netGrowth - dailyTarget
      const cumulative = e.end_followers - profile.starting_followers
      const targetAtDate = Math.round(profile.starting_followers + dailyTarget * (dayIndex - 1))
      const progressPct = totalGrowth > 0 ? (cumulative / totalGrowth) * 100 : 0
      return { ...e, dayIndex, netGrowth, variance, cumulative, targetAtDate, progressPct }
    })
}