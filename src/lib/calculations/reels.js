export function followsPer1k(follows, views) {
    if (follows == null || !views) return null
    return (follows / views) * 1000
  }
  
  export function engagementRate(accountsEngaged, views) {
    if (!views) return null
    return (accountsEngaged / views) * 100
  }
  
  export function shareRate(shares, views) {
    if (!views) return null
    return (shares / views) * 100
  }
  
  export function saveRate(saves, views) {
    if (!views) return null
    return (saves / views) * 100
  }
  
  export function classifyVerdict(reel, baselines) {
    if (!reel) return null
    const fp1k = followsPer1k(reel.follows, reel.views)
    if (fp1k == null) return null
    const { fp1kHigh = 3, fp1kLow = 0.5 } = baselines ?? {}
    if (fp1k >= fp1kHigh) return 'SCALE'
    if (fp1k < fp1kLow)   return 'KILL'
    return 'TEST'
  }
  
  /* ---------- aggregation helpers for analytics ---------- */
  
  export function aggregateBy(reels, keyFn, labelFn = keyFn) {
    const groups = new Map()
    for (const r of reels) {
      const key = keyFn(r)
      if (key == null) continue
      const label = labelFn(r)
      if (!groups.has(key)) {
        groups.set(key, { key, label, count: 0, views: 0, follows: 0, shares: 0, saves: 0, accountsEngaged: 0, followsKnown: 0 })
      }
      const g = groups.get(key)
      g.count += 1
      g.views += r.views || 0
      g.shares += r.shares || 0
      g.saves += r.saves || 0
      g.accountsEngaged += r.accounts_engaged || 0
      if (r.follows != null) {
        g.follows += r.follows
        g.followsKnown += 1
      }
    }
    return Array.from(groups.values()).map((g) => ({
      ...g,
      avgViews: g.count ? g.views / g.count : 0,
      avgFollows: g.followsKnown ? g.follows / g.followsKnown : null,
      followsPer1k: g.views > 0 && g.follows > 0 ? (g.follows / g.views) * 1000 : null,
      engagementRate: g.views > 0 ? (g.accountsEngaged / g.views) * 100 : null,
    }))
  }
  
  export function sortByMetric(reels, metric, direction = 'desc') {
    const dir = direction === 'asc' ? 1 : -1
    return reels.slice().sort((a, b) => {
      const av = a[metric]
      const bv = b[metric]
      if (av == null && bv == null) return 0
      if (av == null) return 1   // nulls last
      if (bv == null) return -1
      return (av - bv) * dir
    })
  }