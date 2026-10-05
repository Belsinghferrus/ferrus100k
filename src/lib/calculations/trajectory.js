import { differenceInCalendarDays, addDays } from 'date-fns'

export function computeTrajectory(profile, currentFollowers, today = new Date()) {
  if (!profile) return null
  const starting = profile.starting_followers
  const target   = profile.target_followers
  const start    = new Date(profile.starting_date)
  const deadline = new Date(profile.deadline)

  const totalDays    = Math.max(1, differenceInCalendarDays(deadline, start))
  const daysElapsed  = Math.max(0, differenceInCalendarDays(today, start))
  const daysRemaining = Math.max(0, differenceInCalendarDays(deadline, today))

  const totalGrowth = target - starting
  const remaining   = Math.max(0, target - currentFollowers)

  const requiredPerDay   = totalGrowth / totalDays
  const requiredPerWeek  = requiredPerDay * 7
  const requiredPerMonth = requiredPerDay * 30

  const requiredToday = starting + requiredPerDay * daysElapsed
  const delta = currentFollowers - requiredToday

  const achievedGrowth = currentFollowers - starting
  const progressPct = totalGrowth > 0 ? (achievedGrowth / totalGrowth) * 100 : 0

  const actualPerDay   = daysElapsed > 0 ? achievedGrowth / daysElapsed : 0
  const actualPerWeek  = actualPerDay * 7
  const actualPerMonth = actualPerDay * 30

  let projectedFinal = currentFollowers
  let projectedDateToTarget = null
  if (actualPerDay > 0 && daysRemaining > 0) {
    projectedFinal = Math.round(currentFollowers + actualPerDay * daysRemaining)
    const daysToTarget = Math.ceil(remaining / actualPerDay)
    projectedDateToTarget = addDays(today, daysToTarget)
  }

  let status = 'ON_TRACK'
  if (delta > 50) status = 'AHEAD'
  else if (delta < -50) status = 'BEHIND'

  const shortfallPerWeek =
    daysRemaining > 0 && projectedFinal < target
      ? (target - projectedFinal) / (daysRemaining / 7)
      : 0

  return {
    starting, target, currentFollowers,
    totalGrowth, remaining, progressPct,
    totalDays, daysElapsed, daysRemaining,
    requiredPerDay, requiredPerWeek, requiredPerMonth,
    actualPerDay, actualPerWeek, actualPerMonth,
    requiredToday, delta, status,
    projectedFinal, projectedDateToTarget,
    shortfallPerWeek,
  }
}

export function requiredTrajectory(profile) {
  if (!profile) return []
  const start    = new Date(profile.starting_date)
  const deadline = new Date(profile.deadline)
  const starting = profile.starting_followers
  const target   = profile.target_followers
  const totalDays = Math.max(1, differenceInCalendarDays(deadline, start))

  const points = []
  for (let i = 0; i <= totalDays; i++) {
    points.push({
      date: addDays(start, i).toISOString().slice(0, 10),
      required: Math.round(starting + (target - starting) * (i / totalDays)),
    })
  }
  return points
}