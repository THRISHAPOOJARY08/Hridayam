/**
 * ROUTELESS IST DateTime Utility
 * All display times use Asia/Kolkata (IST, UTC+5:30)
 * Storage: UTC (SQLite CURRENT_TIMESTAMP)
 * Display: IST via Intl.DateTimeFormat
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a date/timestamp to IST display string
 * @param {string|Date|number} input - UTC date string, Date object, or timestamp
 * @param {Object} options - Intl.DateTimeFormat options override
 * @returns {string} Formatted IST string e.g. "13 Nov 2026, 1:30 PM"
 */
function toIST(input, options = {}) {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : new Date(input);
  if (isNaN(date.getTime())) return '—';

  const defaultOptions = {
    timeZone: IST_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  return new Intl.DateTimeFormat('en-IN', { ...defaultOptions, ...options }).format(date);
}

/**
 * Format only the time in IST (12h format)
 * e.g. "7:45 AM IST"
 */
function toISTTime(input) {
  if (!input) return '—';
  const date = new Date(typeof input === 'string' ? input : input);
  if (isNaN(date.getTime())) return input; // return as-is if already a time string
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date) + ' IST';
}

/**
 * Format only the date in IST (day/month/year)
 * e.g. "13 Nov 2026"
 */
function toISTDate(input) {
  if (!input) return '—';
  const date = new Date(typeof input === 'string' ? input : input);
  if (isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Get current IST datetime string for storage/display
 * Returns ISO string — always store UTC in DB, display IST to users
 */
function nowIST() {
  return new Date().toLocaleString('en-IN', { timeZone: IST_TIMEZONE });
}

/**
 * Get current UTC ISO string for DB storage
 */
function nowUTC() {
  return new Date().toISOString();
}

/**
 * Format a bus schedule time string (already in IST like "07:45 AM") for display
 * Bus times in the seed data are already in IST — just append IST label
 */
function formatBusTime(timeStr) {
  if (!timeStr) return '—';
  if (typeof timeStr === 'string' && /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(timeStr.trim())) {
    return timeStr.trim() + ' IST';
  }
  return toISTTime(timeStr);
}

module.exports = { toIST, toISTTime, toISTDate, nowIST, nowUTC, formatBusTime, IST_TIMEZONE };
