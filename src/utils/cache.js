const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const PREFIX = 'mfd_'

export function getCached(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > TTL_MS) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function setCached(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // Quota exceeded or private browsing — silently skip
  }
}

export function clearCache() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k))
  } catch { /* noop */ }
}

export function getCacheAge(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const { ts } = JSON.parse(raw)
    return Date.now() - ts
  } catch {
    return null
  }
}
