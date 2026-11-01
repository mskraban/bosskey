const test = require('node:test')
const assert = require('node:assert/strict')
const D = require('../public/data.js')

test('screens have unique ids and hotkeys, and short names', () => {
  assert.ok(D.SCREENS.length >= 10)
  assert.equal(new Set(D.SCREENS.map((s) => s.id)).size, D.SCREENS.length)
  assert.equal(new Set(D.SCREENS.map((s) => s.key)).size, D.SCREENS.length)
  for (const s of D.SCREENS) {
    assert.match(s.key, /^[0-9a-z]$/)
    assert.ok(s.name.length <= 24 && s.blurb.length > 10)
  }
})

test('no real company or product names sneak into the screens list', () => {
  const text = JSON.stringify(D.SCREENS).toLowerCase()
  for (const brand of ['windows', 'microsoft', 'apple', 'macos', 'google', 'zoom', 'teams', 'slack', 'excel', 'outlook', 'linux', 'ubuntu', 'vscode', 'github']) {
    assert.ok(!text.includes(brand), brand)
  }
})

test('rng is deterministic', () => {
  const a = D.mulberry32(42), b = D.mulberry32(42)
  for (let i = 0; i < 20; i++) assert.equal(a(), b())
})

test('progress never goes backwards, never exceeds 100 and eventually finishes', () => {
  const rng = D.mulberry32(7)
  let p = 0
  let steps = 0
  while (p < 100 && steps < 5000) {
    const next = D.nextProgress(p, rng)
    assert.ok(next >= p && next <= 100)
    p = next
    steps++
  }
  assert.equal(p, 100)
  assert.ok(steps > 40, 'should take a while: ' + steps)
  assert.equal(D.nextProgress(100, rng), 100)
})

test('build log lines look like build lines and the percentage only grows', () => {
  const lines = D.buildLog(D.mulberry32(1), 300, 0)
  assert.equal(lines.length, 300)
  let last = 0
  for (const l of lines) {
    const m = /^\[\s*(\d+)%\]/.exec(l)
    assert.ok(m, l)
    assert.ok(+m[1] >= last && +m[1] <= 99)
    last = +m[1]
  }
  assert.ok(lines.some((l) => l.includes('warning')))
})

test('hex lines have six 8-digit groups', () => {
  assert.match(D.hexLine(D.mulberry32(3)), /^([0-9A-F]{8} ){5}[0-9A-F]{8}$/)
})

test('spreadsheet cells are stable and totals add up', () => {
  assert.equal(D.sheetCell(0, 0), 'Region')
  assert.equal(D.sheetCell(0, 3), 'Mar')
  assert.equal(D.sheetCell(0, 13), 'Total')
  assert.equal(D.sheetCell(4, 5), D.sheetCell(4, 5))
  for (const r of [1, 2, 9]) {
    let sum = 0
    for (let c = 1; c <= 12; c++) sum += D.sheetCell(r, c)
    assert.equal(D.sheetCell(r, 13), sum)
  }
})

test('emails and code are present', () => {
  assert.ok(D.EMAILS.length >= 10)
  for (const e of D.EMAILS) assert.equal(e.length, 3)
  assert.ok(D.CODE.length > 20)
})
