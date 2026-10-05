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
  
  /**
   * Auto-classify a Reel verdict.
   * Priority: follows → follows/1k → shares → saves → engagement → views
   * Returns null if insufficient signal (needs manual verdict).
   */
  export function classifyVerdict(reel, baselines) {
    if (!reel) return null
    const fp1k = followsPer1k(reel.follows, reel.views)
    if (fp1k == null) return null
  
    const { fp1kHigh = 3, fp1kLow = 0.5 } = baselines ?? {}
    if (fp1k >= fp1kHigh) return 'SCALE'
    if (fp1k < fp1kLow)   return 'KILL'
    return 'TEST'
  }