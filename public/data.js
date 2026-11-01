/* Boss Key data: screen list, seeded randomness and the fake content the screens show.
   Works in the browser (window.BossData) and in Node (require) so it can be tested. */
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.BossData = factory()
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict'

  // One hotkey per screen. All names are generic on purpose: no real logos or product names.
  var SCREENS = [
    { id: 'update', key: '1', icon: '🔄', name: 'System update', blurb: 'Spinning dots, a slow percentage, "don\'t turn off your computer".' },
    { id: 'bsod', key: '2', icon: '😵', name: 'Blue crash screen', blurb: 'A sad face, a stop code and a counter that never quite finishes.' },
    { id: 'classic', key: '3', icon: '💾', name: 'Classic blue crash', blurb: 'Old school white text on dark blue, with a hex dump.' },
    { id: 'terminal', key: '4', icon: '⌨️', name: 'Compiling…', blurb: 'A terminal scrolling through a huge build. Nobody dares interrupt.' },
    { id: 'sheet', key: '5', icon: '📊', name: 'Spreadsheet', blurb: 'Rows of quarterly numbers and a very busy cursor.' },
    { id: 'code', key: '6', icon: '👨‍💻', name: 'Code editor', blurb: 'Dark editor that types serious-looking code on its own.' },
    { id: 'email', key: '7', icon: '📧', name: 'Inbox', blurb: 'Boring corporate emails. New ones keep arriving.' },
    { id: 'defrag', key: '8', icon: '🧩', name: 'Disk cleanup', blurb: 'Coloured blocks shuffling into place, like it is 1998.' },
    { id: 'dashboard', key: '9', icon: '📈', name: 'Server dashboard', blurb: 'Live graphs and "all systems operational". Looks very responsible.' },
    { id: 'call', key: '0', icon: '📞', name: 'Reconnecting call', blurb: 'A video meeting that is "trying to reconnect". Again.' },
    { id: 'printer', key: 'q', icon: '🖨️', name: 'Stuck print job', blurb: 'Page 1 of 4,871. Please wait. Please keep waiting.' },
  ]

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0
      var t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  function pick(rng, list) { return list[Math.floor(rng() * list.length)] }

  /** A progress value that moves in believable lurches and slows down near the end. */
  function nextProgress(p, rng) {
    if (p >= 100) return 100
    var step = p < 60 ? 1 + rng() * 5 : p < 90 ? rng() * 3 : rng() * 1.2
    if (rng() < 0.18) step = 0 // sometimes nothing happens, which feels real
    return Math.min(100, Math.round((p + step) * 10) / 10)
  }

  var MODULES = ['core', 'net', 'auth', 'render', 'storage', 'sync', 'parser', 'cache', 'scheduler', 'crypto', 'billing', 'search']
  var FILES = ['connection_pool', 'request_handler', 'token_store', 'layout_engine', 'index_builder', 'retry_policy', 'schema_check',
    'event_queue', 'config_loader', 'telemetry', 'session_manager', 'batch_writer', 'rate_limiter', 'metrics_agg', 'job_runner']
  var WARNINGS = ['unused variable', 'deprecated call', 'implicit conversion', 'shadowed declaration', 'missing return']

  /** n fake build log lines like "[ 42%] Building object src/net/request_handler.o". */
  function buildLog(rng, n, startPct) {
    var out = []
    var pct = startPct || 0
    for (var i = 0; i < n; i++) {
      pct = Math.min(99, pct + rng() * 0.8)
      var tag = ('[' + String(Math.floor(pct)).padStart(3, ' ') + '%]')
      var file = 'src/' + pick(rng, MODULES) + '/' + pick(rng, FILES)
      var r = rng()
      if (r < 0.06) out.push(tag + ' warning: ' + file + '.c:' + (10 + Math.floor(rng() * 480)) + ': ' + pick(rng, WARNINGS))
      else if (r < 0.14) out.push(tag + ' Linking library lib' + pick(rng, MODULES) + '.a')
      else out.push(tag + ' Building object ' + file + '.o')
    }
    return out
  }

  var STOP_CODES = ['CRITICAL_PROCESS_DIED', 'MEMORY_MANAGEMENT', 'KERNEL_DATA_INPAGE_ERROR', 'SYSTEM_SERVICE_EXCEPTION',
    'IRQL_NOT_LESS_OR_EQUAL', 'PAGE_FAULT_IN_NONPAGED_AREA', 'UNEXPECTED_STORE_EXCEPTION']

  function hexLine(rng) {
    var parts = []
    for (var i = 0; i < 6; i++) parts.push(('0000000' + Math.floor(rng() * 0xffffffff).toString(16)).slice(-8).toUpperCase())
    return parts.join(' ')
  }

  var EMAILS = [
    ['Facilities', 'Reminder: the third-floor kettle is for tea only', 'Please stop descaling it with the other thing.'],
    ['Priya (Finance)', 'Re: Re: Re: FW: Q3 alignment', 'Circling back on the circling back from last week.'],
    ['IT Helpdesk', 'Your password expires in 3 days', 'Please choose a new one that is not your old one with a 2 on the end.'],
    ['HR', 'Mandatory training: Slides about slides', 'Estimated time 45 minutes. Cameras on.'],
    ['Daniel', 'Quick sync?', 'Fifteen minutes. Maybe an hour. Bring snacks.'],
    ['Office Manager', 'Parking: we have decided to have fewer spaces', 'Thank you for your understanding in advance.'],
    ['Leadership Team', 'Exciting news about our exciting future', 'Details to follow, if there are any.'],
    ['Meera', 'Updated deck (v14 final REAL)', 'Only the font changed. Please do not open on mobile.'],
    ['Calendar', 'Invitation: Weekly status of the status meeting', 'Recurring every weekday until further notice.'],
    ['Procurement', 'Re: Request for one stapler', 'Your request has moved to step 4 of 19.'],
    ['Security', 'Please do not click the link in the previous email', 'We sent it ourselves, as a test. You failed.'],
    ['Ravi', 'Lunch?', 'Same place. Do not mention it to the others.'],
  ]

  var CODE = [
    'import { createPool } from "./db/pool";',
    'import { retry } from "./util/retry";',
    '',
    'export interface Invoice {',
    '  id: string;',
    '  total: number;',
    '  lines: InvoiceLine[];',
    '}',
    '',
    'const pool = createPool({ max: 12, idleTimeoutMs: 30_000 });',
    '',
    'export async function loadInvoice(id: string): Promise<Invoice> {',
    '  const rows = await retry(3, () =>',
    '    pool.query("select * from invoices where id = $1", [id])',
    '  );',
    '  if (rows.length === 0) {',
    '    throw new NotFoundError(`invoice ${id} not found`);',
    '  }',
    '  return mapInvoice(rows[0]);',
    '}',
    '',
    'function mapInvoice(row: Row): Invoice {',
    '  const lines = JSON.parse(row.lines) as InvoiceLine[];',
    '  const total = lines.reduce((sum, l) => sum + l.qty * l.price, 0);',
    '  return { id: row.id, total: Math.round(total * 100) / 100, lines };',
    '}',
    '',
    '// TODO: ask someone why this works',
    'export function isOverdue(inv: Invoice, now = Date.now()): boolean {',
    '  return now - inv.dueAt > 30 * 24 * 60 * 60 * 1000;',
    '}',
  ]

  /** Deterministic spreadsheet cell: row 0 is a header, column 0 holds labels. */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var LABELS = ['North', 'South', 'East', 'West', 'Central', 'Online', 'Partners', 'Retail', 'Wholesale', 'Export', 'Support', 'Services']
  function sheetCell(r, c) {
    if (r === 0) return c === 0 ? 'Region' : c <= 12 ? MONTHS[c - 1] : 'Total'
    if (c === 0) return LABELS[(r - 1) % LABELS.length] + (r > LABELS.length ? ' ' + Math.ceil(r / LABELS.length) : '')
    var rng = mulberry32(r * 977 + c * 131)
    if (c === 13) {
      var sum = 0
      for (var k = 1; k <= 12; k++) sum += Math.floor(mulberry32(r * 977 + k * 131)() * 90000 + 4000)
      return sum
    }
    return Math.floor(rng() * 90000 + 4000)
  }

  return {
    SCREENS: SCREENS, mulberry32: mulberry32, pick: pick, nextProgress: nextProgress, buildLog: buildLog,
    STOP_CODES: STOP_CODES, hexLine: hexLine, EMAILS: EMAILS, CODE: CODE, sheetCell: sheetCell, MONTHS: MONTHS,
  }
})
