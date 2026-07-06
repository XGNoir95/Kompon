import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  BellRing,
  Clock,
  ExternalLink,
  Globe2,
  Loader2,
  MapPin,
  RefreshCw,
  Ruler,
  X,
} from 'lucide-react'
import { api } from '../config/api.js'
import { type } from '../lib/typography.js'

const POLL_INTERVAL_MS = 60_000
const SEEN_STORAGE_KEY = 'kompon_seen_earthquake_ids_v2'

function readSeenIds() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SEEN_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSeenIds(ids) {
  try {
    window.localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(ids.slice(0, 100)))
  } catch {
    // localStorage can fail in strict privacy modes; notification UI should still work.
  }
}

function formatMagnitude(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Unknown'
  return Number(value).toFixed(1)
}

function formatDepth(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Unknown depth'
  return `${Number(value).toFixed(1)} km deep`
}

function formatAgo(isoDate) {
  if (!isoDate) return 'Time unavailable'

  const then = new Date(isoDate).getTime()
  if (Number.isNaN(then)) return 'Time unavailable'

  const diffMs = Date.now() - then
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function formatDateTime(isoDate) {
  if (!isoDate) return 'Unavailable'

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'Unavailable'

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function magnitudeTone(mag) {
  const value = Number(mag)
  if (Number.isNaN(value)) return 'bg-[#f4f4f4] text-[#5e5e5e] border-[#ddd]'
  if (value >= 6) return 'bg-[#121212] text-white border-[#121212]'
  if (value >= 5) return 'bg-[#ff5330] text-white border-[#ff5330]'
  if (value >= 4) return 'bg-[#fff0ed] text-[#ff5330] border-[#ffd4ca]'
  return 'bg-[#f4f4f4] text-[#5e5e5e] border-[#ddd]'
}

function regionTone(regionLevel) {
  if (regionLevel === 'south_asia') {
    return 'border-[#ff5330] bg-[#fff0ed] text-[#ff5330]'
  }

  if (regionLevel === 'asia') {
    return 'border-[#ffd4ca] bg-[#fff6f4] text-[#c4421a]'
  }

  return 'border-[#e8e8e8] bg-[#fafafa] text-[#777]'
}

function regionLabel(quake) {
  if (quake.region_label) return quake.region_label
  if (quake.region_level === 'south_asia') return 'South Asia'
  if (quake.region_level === 'asia') return 'Asia'
  return 'Global'
}

function EarthquakeCard({ quake, isNew }) {
  return (
    <motion.article
      className="relative overflow-hidden rounded-[22px] border border-[#e8e8e8] bg-white p-4 shadow-sm transition-colors hover:border-[#d6d6d6]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <span className="absolute left-0 top-0 h-full w-1 bg-[#121212]" />

      <div className="flex items-start gap-3.5 pl-2.5">
        <div
          className={`grid h-12 min-w-[58px] shrink-0 place-items-center rounded-2xl border px-2 text-[13px] font-black leading-none tracking-[-0.03em] ${magnitudeTone(
            quake.magnitude
          )}`}
          title={`Magnitude ${formatMagnitude(quake.magnitude)}`}
        >
          M{formatMagnitude(quake.magnitude)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className={`m-0 line-clamp-2 pr-1 text-[#121212] ${type.label}`}>
              {quake.place || 'Unknown location'}
            </h4>

            {isNew && (
              <span className={`shrink-0 rounded-full bg-[#fff0ed] px-2 py-0.5 text-[#ff5330] ${type.legal}`}>
                New
              </span>
            )}
          </div>

          <div className="mt-2.5 grid gap-1.5 text-[#666]">
            <span className={`inline-flex items-center gap-1.5 ${type.legal}`}>
              <Clock size={12} className="shrink-0 text-[#ff5330]" />
              {formatAgo(quake.time)} • {formatDateTime(quake.time)}
            </span>

            <span className={`inline-flex items-center gap-1.5 ${type.legal}`}>
              <Ruler size={12} className="shrink-0 text-[#ff5330]" />
              {formatDepth(quake.depth_km)}
            </span>

            {quake.coordinates && (
              <span className={`inline-flex items-center gap-1.5 ${type.legal}`}>
                <Globe2 size={12} className="shrink-0 text-[#ff5330]" />
                {Number(quake.coordinates.lat).toFixed(2)}, {Number(quake.coordinates.lon).toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${type.legal} ${regionTone(quake.region_level)}`}>
              <MapPin size={11} />
              {regionLabel(quake)}
            </span>

            {quake.tsunami ? (
              <span className={`inline-flex items-center gap-1 rounded-full bg-[#fff0ed] px-2.5 py-1 text-[#ff5330] ${type.legal}`}>
                <AlertTriangle size={11} />
                Tsunami flag
              </span>
            ) : null}

            {quake.status && (
              <span className={`rounded-full border border-[#e8e8e8] bg-[#fafafa] px-2.5 py-1 text-[#777] ${type.legal}`}>
                {quake.status}
              </span>
            )}

            {quake.url && (
              <a
                href={quake.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`ml-auto inline-flex items-center gap-1 text-[#888] no-underline transition-colors hover:text-[#ff5330] ${type.legal}`}
              >
                USGS
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function EarthquakeNotificationButton() {
  const [open, setOpen] = useState(false)
  const [earthquakes, setEarthquakes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [seenIds, setSeenIds] = useState(() => readSeenIds())
  const pollingRef = useRef(null)

  const unreadCount = useMemo(
    () => earthquakes.filter((quake) => quake?.id && !seenIds.includes(quake.id)).length,
    [earthquakes, seenIds]
  )

  const highlightedQuake = useMemo(() => {
    return (
      earthquakes.find((quake) => quake.region_level === 'south_asia') ||
      earthquakes.find((quake) => quake.region_level === 'asia') ||
      earthquakes[0]
    )
  }, [earthquakes])

  const fetchRecentEarthquakes = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError(null)

    try {
      const response = await api.get('/v1/earthquakes/recent', {
        params: {
          window: 'day',
          limit: 12,
          min_magnitude: 0,
          focus: 'south_asia',
        },
      })

      const items = response.data?.earthquakes || []
      setEarthquakes(items)
      setLastUpdated(response.data?.fetched_at || new Date().toISOString())
    } catch (err) {
      console.error('[EarthquakeNotification] Failed to fetch:', err)
      setError(
        err.response?.data?.error ||
          'Could not load recent earthquake updates. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentEarthquakes({ silent: false })

    pollingRef.current = window.setInterval(() => {
      fetchRecentEarthquakes({ silent: true })
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(pollingRef.current)
  }, [])

  useEffect(() => {
    if (!open || earthquakes.length === 0) return

    const nextSeen = Array.from(
      new Set([...earthquakes.map((quake) => quake.id).filter(Boolean), ...seenIds])
    )

    setSeenIds(nextSeen)
    saveSeenIds(nextSeen)
  }, [open, earthquakes])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside
            className="fixed bottom-[154px] right-4 z-50 flex max-h-[min(600px,calc(100vh-188px))] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-[#121212] bg-white shadow-[0_24px_80px_rgba(18,18,18,0.26)] md:bottom-[166px] md:right-7"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            aria-label="Recent earthquake notifications"
          >
            <header className="border-b border-[#121212] bg-[#121212] px-4 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#ff5330] text-white shadow-[0_12px_28px_rgba(255,83,48,0.24)]">
                    <BellRing size={21} />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#121212] bg-white px-1 text-[10px] font-black text-[#ff5330]">
                        {Math.min(unreadCount, 9)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="m-0 truncate text-[16px] font-extrabold leading-tight text-white">
                      Earthquake notifications
                    </p>
                    <p className={`m-0 mt-0.5 truncate text-[#cfcfcf] ${type.legal}`}>
                      South Asia and Asia prioritized
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-[#d8d8d8] transition-colors hover:border-[#ff5330] hover:bg-[#ff5330] hover:text-white"
                    aria-label="Refresh earthquake updates"
                    onClick={() => fetchRecentEarthquakes({ silent: false })}
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  </button>

                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-[#d8d8d8] transition-colors hover:border-[#ff5330] hover:bg-[#ff5330] hover:text-white"
                    aria-label="Close earthquake notifications"
                    onClick={() => setOpen(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </header>

            <div className="border-b border-[#e8e8e8] bg-[#fafafa] px-4 py-3">
              {highlightedQuake ? (
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#fff0ed] text-[#ff5330]">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className={`m-0 text-[#121212] ${type.label}`}>
                      {highlightedQuake.region_level === 'global' ? 'Latest' : 'Priority'}: M{formatMagnitude(highlightedQuake.magnitude)} near{' '}
                      {highlightedQuake.place || 'unknown area'}
                    </p>
                    <p className={`m-0 mt-1 text-[#777] ${type.legal}`}>
                      {regionLabel(highlightedQuake)} • {formatAgo(highlightedQuake.time)}
                      {lastUpdated ? ` • checked ${formatDateTime(lastUpdated)}` : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <p className={`m-0 text-[#777] ${type.bodySmall}`}>
                  Recent earthquake updates will appear here.
                </p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] p-4">
              {loading && earthquakes.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <Loader2 size={28} className="animate-spin text-[#ff5330]" />
                  <p className={`m-0 text-[#777] ${type.bodySmall}`}>Loading recent earthquakes...</p>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-[#ffd4ca] bg-[#fff6f4] p-4 text-center">
                  <AlertTriangle size={22} className="mx-auto mb-2 text-[#ff5330]" />
                  <p className={`m-0 text-[#5e5e5e] ${type.bodySmall}`}>{error}</p>
                </div>
              ) : earthquakes.length > 0 ? (
                <div className="grid gap-3">
                  {earthquakes.map((quake) => (
                    <EarthquakeCard
                      key={quake.id}
                      quake={quake}
                      isNew={!seenIds.includes(quake.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 text-center">
                  <p className={`m-0 text-[#777] ${type.bodySmall}`}>
                    No recent earthquakes were reported in the selected feed window.
                  </p>
                </div>
              )}
            </div>

            <footer className={`border-t border-[#e8e8e8] bg-[#fafafa] px-4 py-3 text-[#777] ${type.legal}`}>
              Source: USGS real-time GeoJSON feed. South Asian and Asian events are shown first when available.
            </footer>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.button
        className="fixed bottom-[88px] right-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-[#121212] bg-[#121212] text-white shadow-sm transition-colors hover:border-[#ff5330] hover:bg-[#ff5330] md:bottom-[96px] md:right-7"
        type="button"
        aria-label={open ? 'Close earthquake notifications' : 'Open earthquake notifications'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
      >
        {open ? <X size={22} /> : unreadCount > 0 ? <BellRing size={23} /> : <Bell size={23} />}

        {unreadCount > 0 && !open && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#fafafa] bg-[#ff5330] px-1 text-[10px] font-black text-white">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </motion.button>
    </>
  )
}
