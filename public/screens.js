/* The fake screens. Each one is a function (root, rng) that fills `root` and returns a cleanup function.
   All of them are original lookalikes: generic wording, no logos, no real product names. */
;(function () {
  'use strict'
  var D = window.BossData
  var timers = []
  var sets = []

  function every(ms, fn) { var id = setInterval(fn, ms); timers.push(id); return id }
  function later(ms, fn) { var id = setTimeout(fn, ms); sets.push(id); return id }
  function reset() { timers.forEach(clearInterval); sets.forEach(clearTimeout); timers = []; sets = [] }
  function el(root, sel) { return root.querySelector(sel) }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] }) }

  /* --------------------------------------------------------------- 1 update */
  function update(root, rng) {
    root.innerHTML =
      '<div class="scr upd"><div class="spin"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<p class="t1">Working on updates</p><p class="t2"><span class="pct">0</span>% complete</p>' +
      '<p class="t3">Don\'t turn off your computer</p></div>'
    var pct = 0
    var t1 = el(root, '.t1'), p = el(root, '.pct'), t3 = el(root, '.t3')
    every(900, function () {
      pct = D.nextProgress(pct, rng)
      p.textContent = Math.floor(pct)
      if (pct >= 100) {
        t1.textContent = 'Restarting'; t3.textContent = 'This might take a few minutes'
        el(root, '.t2').style.visibility = 'hidden'
        later(6000, function () { pct = 0; p.textContent = 0; t1.textContent = 'Working on updates'; t3.textContent = 'Don\'t turn off your computer'; el(root, '.t2').style.visibility = '' })
      }
    })
  }

  /* ----------------------------------------------------------------- 2 bsod */
  function drawFakeQr(canvas, rng) {
    var n = 29, s = 4
    canvas.width = canvas.height = n * s
    var g = canvas.getContext('2d')
    g.fillStyle = '#fff'; g.fillRect(0, 0, n * s, n * s)
    g.fillStyle = '#0a4d9e'
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (rng() < 0.5) g.fillRect(x * s, y * s, s, s)
    function finder(x0, y0) {
      g.fillStyle = '#fff'; g.fillRect(x0 * s - s, y0 * s - s, 9 * s, 9 * s)
      g.fillStyle = '#0a4d9e'; g.fillRect(x0 * s, y0 * s, 7 * s, 7 * s)
      g.fillStyle = '#fff'; g.fillRect((x0 + 1) * s, (y0 + 1) * s, 5 * s, 5 * s)
      g.fillStyle = '#0a4d9e'; g.fillRect((x0 + 2) * s, (y0 + 2) * s, 3 * s, 3 * s)
    }
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7)
  }

  function bsod(root, rng) {
    function render() {
      root.innerHTML =
        '<div class="scr bsod"><div class="face">:(</div>' +
        '<p class="b1">Your PC ran into a problem and needs to restart. We\'re just collecting some error info, and then we\'ll restart for you.</p>' +
        '<p class="b2"><span class="pct">0</span>% complete</p>' +
        '<div class="b3"><canvas class="qr"></canvas><div><p>For more information about this issue and possible fixes, visit the help site for your device.</p>' +
        '<p class="small">If you call a support person, give them this info:<br>Stop code: ' + D.pick(rng, D.STOP_CODES) + '</p></div></div></div>'
      drawFakeQr(el(root, '.qr'), rng)
    }
    render()
    var pct = 0
    every(1100, function () {
      pct = D.nextProgress(pct, rng)
      var p = el(root, '.pct'); if (p) p.textContent = Math.floor(pct)
      if (pct >= 100) { pct = 0; root.innerHTML = '<div class="scr black"></div>'; later(2500, render) }
    })
  }

  /* -------------------------------------------------------------- 3 classic */
  function classic(root, rng) {
    var lines = []
    for (var i = 0; i < 5; i++) lines.push(D.hexLine(rng))
    root.innerHTML =
      '<div class="scr classic"><pre>A problem has been detected and your computer has been shut down to prevent damage.\n\n' +
      D.pick(rng, D.STOP_CODES) + '\n\nIf this is the first time you have seen this error screen, restart your computer. If this screen appears again, follow these steps:\n\n' +
      'Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or software manufacturer for any updates you might need.\n\n' +
      'If problems continue, disable or remove any newly installed hardware or software. Disable BIOS memory options such as caching or shadowing.\n\n' +
      'Technical information:\n\n*** STOP: 0x0000007E (0xC0000005, 0xF7A5B2C1, 0xF78E3A04, 0xF78E3700)\n\n' +
      '*** driver.sys - Address F7A5B2C1 base at F7A50000, DateStamp 4a1d3c92\n\n' + lines.join('\n') +
      '\n\nBeginning dump of physical memory\nPhysical memory dump complete.\nContact your system administrator or technical support group for further assistance.<span class="cur">_</span></pre></div>'
    every(500, function () { var c = el(root, '.cur'); if (c) c.style.visibility = c.style.visibility === 'hidden' ? '' : 'hidden' })
  }

  /* ------------------------------------------------------------ 4 terminal */
  function terminal(root, rng) {
    root.innerHTML = '<div class="scr term"><pre class="log"></pre></div>'
    var log = el(root, '.log')
    var buf = ['$ make -j8 all', 'Scanning dependencies of target core', '']
    var pct = 0
    every(55, function () {
      var batch = D.buildLog(rng, 1 + Math.floor(rng() * 3), pct)
      var m = /\[\s*(\d+)%\]/.exec(batch[batch.length - 1])
      if (m) pct = +m[1]
      if (pct >= 98) pct = 0
      batch.forEach(function (l) { buf.push(l) })
      if (buf.length > 70) buf = buf.slice(buf.length - 70)
      log.textContent = buf.join('\n')
    })
  }

  /* -------------------------------------------------------------- 5 sheet */
  function sheet(root, rng) {
    var cols = 14, rows = 38
    var html = '<div class="scr sheet"><div class="bar"><b>Q3_forecast_final_v7.xlsx</b><span>File&nbsp;&nbsp;Edit&nbsp;&nbsp;View&nbsp;&nbsp;Insert&nbsp;&nbsp;Format&nbsp;&nbsp;Data&nbsp;&nbsp;Tools</span></div>' +
      '<div class="fx"><span class="name">B4</span><span class="formula">=SUM(B2:B13)</span></div><div class="gridwrap"><table><thead><tr><th></th>'
    for (var c = 0; c < cols; c++) html += '<th>' + String.fromCharCode(65 + c) + '</th>'
    html += '</tr></thead><tbody>'
    for (var r = 0; r < rows; r++) {
      html += '<tr><th>' + (r + 1) + '</th>'
      for (c = 0; c < cols; c++) {
        var v = D.sheetCell(r, c)
        html += '<td' + (r === 0 || c === 0 ? ' class="hd"' : typeof v === 'number' ? ' class="n"' : '') + ' data-r="' + r + '" data-c="' + c + '">' +
          (typeof v === 'number' ? v.toLocaleString('en-US') : esc(v)) + '</td>'
      }
      html += '</tr>'
    }
    html += '</tbody></table></div><div class="tabs"><span class="on">Q3 forecast</span><span>Actuals</span><span>Notes</span></div></div>'
    root.innerHTML = html
    var name = el(root, '.name'), formula = el(root, '.formula'), sel = null
    function move() {
      if (sel) sel.classList.remove('sel')
      var r = 1 + Math.floor(rng() * (rows - 2)), c = 1 + Math.floor(rng() * (cols - 2))
      sel = root.querySelector('td[data-r="' + r + '"][data-c="' + c + '"]')
      if (!sel) return
      sel.classList.add('sel')
      name.textContent = String.fromCharCode(65 + c) + (r + 1)
      formula.textContent = rng() < 0.5 ? '=SUM(' + String.fromCharCode(65 + c) + '2:' + String.fromCharCode(65 + c) + '13)' : sel.textContent.replace(/,/g, '')
      sel.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
    move()
    every(1400, move)
  }

  /* --------------------------------------------------------------- 6 code */
  var KW = /\b(import|from|export|const|async|function|return|if|throw|new|await|interface)\b/g
  function hl(line) {
    var s = esc(line)
    if (/^\s*\/\//.test(line)) return '<span class="c">' + s + '</span>'
    s = s.replace(/("[^"]*"|`[^`]*`)/g, '<span class="s">$1</span>')
    s = s.replace(KW, '<span class="k">$1</span>')
    s = s.replace(/\b(string|number|boolean|Promise|Invoice|Row)\b/g, '<span class="t">$1</span>')
    return s
  }
  function code(root) {
    root.innerHTML =
      '<div class="scr code"><div class="side"><b>EXPLORER</b><p>▾ src</p><p class="i">▾ db</p><p class="i2">pool.ts</p><p class="i">▾ util</p><p class="i2">retry.ts</p><p class="i on">invoice.ts</p><p class="i">errors.ts</p></div>' +
      '<div class="main"><div class="tabs"><span class="on">invoice.ts</span><span>pool.ts</span><span>retry.ts</span></div><div class="lines"></div>' +
      '<div class="status"><span>main</span><span>0 errors, 2 warnings</span><span>Ln <i class="ln">1</i>, Col 1</span><span>TypeScript</span></div></div></div>'
    var box = el(root, '.lines'), ln = el(root, '.ln')
    var i = 0
    function addLine() {
      var d = document.createElement('div')
      d.innerHTML = '<span class="num">' + (i + 1) + '</span>' + hl(D.CODE[i]) + ' '
      box.appendChild(d)
      ln.textContent = i + 1
      i++
    }
    for (var pre = 0; pre < 14; pre++) addLine()
    every(420, function () {
      if (i >= D.CODE.length) { i = 0; box.innerHTML = '' }
      var line = D.CODE[i]
      var n = i + 1
      var d = document.createElement('div')
      d.innerHTML = '<span class="num">' + n + '</span>' + hl(line) + ' '
      box.appendChild(d)
      ln.textContent = n
      box.scrollTop = box.scrollHeight
      i++
    })
  }

  /* -------------------------------------------------------------- 7 email */
  function email(root, rng) {
    var items = D.EMAILS.slice()
    root.innerHTML = '<div class="scr mail"><div class="folders"><b>Mail</b><p class="on">Inbox <i class="cnt">3</i></p><p>Drafts</p><p>Sent</p><p>Archive</p></div>' +
      '<div class="list"></div><div class="prev"><h2></h2><p class="from"></p><p class="body"></p></div></div>'
    var list = el(root, '.list'), count = el(root, '.cnt')
    var unread = 3
    var shown = []
    function show(e, i) {
      el(root, '.prev h2').textContent = e[1]
      el(root, '.prev .from').textContent = 'From: ' + e[0]
      el(root, '.prev .body').textContent = e[2] + '\n\nKind regards,\n' + e[0]
      list.querySelectorAll('.row').forEach(function (r) { r.classList.remove('sel') })
      if (list.children[i]) list.children[i].classList.add('sel')
    }
    function row(e, unreadRow) { return '<div class="row' + (unreadRow ? ' un' : '') + '"><b>' + esc(e[0]) + '</b><span>' + esc(e[1]) + '</span><em>' + esc(e[2]) + '</em></div>' }
    function draw() {
      list.innerHTML = shown.map(function (e, i) { return row(e, i < unread) }).join('')
      count.textContent = unread
    }
    shown = items.slice(0, 8)
    draw(); show(shown[0], 0)
    var next = 8
    every(14000, function () {
      shown.unshift(items[next % items.length]); next++; unread++
      if (shown.length > 14) shown.pop()
      draw(); show(shown[0], 0)
    })
    every(5000, function () { var i = Math.floor(rng() * Math.min(shown.length, 6)); show(shown[i], i) })
  }

  /* ------------------------------------------------------------- 8 defrag */
  function defrag(root, rng) {
    var cols = 46, rowsN = 15, total = cols * rowsN
    root.innerHTML = '<div class="scr defrag"><div class="win"><div class="title">Disk Cleanup and Optimiser</div>' +
      '<p>Optimising drive C: <span class="pct">0</span>% complete</p><div class="blocks"></div>' +
      '<div class="meter"><i></i></div><p class="sm">Please wait while your files are reorganised. This may take several hours.</p>' +
      '<div class="legend"><b class="a"></b>Optimised <b class="b"></b>Fragmented <b class="c"></b>Free</div></div></div>'
    var box = el(root, '.blocks')
    var state = []
    for (var i = 0; i < total; i++) { var r = rng(); state.push(r < 0.72 ? 1 : r < 0.8 ? 0 : 2) }
    var cells = []
    for (i = 0; i < total; i++) { var b = document.createElement('i'); b.className = 'k' + state[i]; box.appendChild(b); cells.push(b) }
    var done = 0
    every(120, function () {
      for (var k = 0; k < 6; k++) {
        var idx = Math.floor(rng() * total)
        if (state[idx] === 1) { state[idx] = 0; cells[idx].className = 'k0 flash' } else if (state[idx] === 0) { state[idx] = 1; cells[idx].className = 'k1' }
      }
      var good = state.filter(function (s) { return s === 0 }).length
      var bad = state.filter(function (s) { return s === 1 }).length
      done = Math.min(100, Math.round((good / (good + bad)) * 100))
      el(root, '.pct').textContent = done
      el(root, '.meter i').style.width = done + '%'
    })
  }

  /* --------------------------------------------------------- 9 dashboard */
  function spark(canvas, data, color) {
    var w = canvas.width = canvas.clientWidth * 2, h = canvas.height = canvas.clientHeight * 2
    var g = canvas.getContext('2d')
    g.clearRect(0, 0, w, h)
    g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 2
    for (var y = 1; y < 4; y++) { g.beginPath(); g.moveTo(0, (h / 4) * y); g.lineTo(w, (h / 4) * y); g.stroke() }
    g.strokeStyle = color; g.lineWidth = 4; g.beginPath()
    data.forEach(function (v, i) { var x = (i / (data.length - 1)) * w, yy = h - v * (h - 10) - 5; i ? g.lineTo(x, yy) : g.moveTo(x, yy) })
    g.stroke()
    g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fillStyle = color.replace('rgb', 'rgba').replace(')', ',.12)'); g.fill()
  }
  function dashboard(root, rng) {
    var cards = [['CPU load', 'rgb(88,166,255)', '%'], ['Memory', 'rgb(163,113,247)', '%'], ['Requests / s', 'rgb(63,185,80)', ''], ['Error rate', 'rgb(240,136,62)', '%']]
    root.innerHTML = '<div class="scr dash"><div class="head"><b>Production</b><span class="ok">● All systems operational</span><span class="when"></span></div><div class="cards">' +
      cards.map(function (c, i) { return '<div class="card"><h3>' + c[0] + '</h3><div class="val" data-i="' + i + '"></div><canvas></canvas></div>' }).join('') +
      '</div><div class="feed"></div></div>'
    var data = cards.map(function () { var a = []; for (var i = 0; i < 60; i++) a.push(0.4 + rng() * 0.3); return a })
    var canvases = root.querySelectorAll('canvas'), vals = root.querySelectorAll('.val'), feed = el(root, '.feed')
    var events = ['deploy completed', 'cache warmed', 'health check passed', 'autoscaled to 6 nodes', 'backup finished', 'certificate renewed', 'queue drained']
    function tick() {
      data.forEach(function (a, i) {
        var last = a[a.length - 1]
        var v = Math.max(0.08, Math.min(0.95, last + (rng() - 0.5) * 0.14 - (i === 3 ? 0.01 : 0)))
        a.push(v); a.shift()
        spark(canvases[i], a, cards[i][1])
        var shown = i === 2 ? Math.round(900 + v * 1800).toLocaleString('en-US') : (v * (i === 3 ? 2 : 100)).toFixed(i === 3 ? 2 : 0)
        vals[i].textContent = shown + cards[i][2]
      })
      el(root, '.when').textContent = new Date().toLocaleTimeString()
    }
    function addEvent(ago) {
      var d = document.createElement('div')
      d.textContent = new Date(Date.now() - ago).toLocaleTimeString() + '  service-' + (1 + Math.floor(rng() * 9)) + ': ' + D.pick(rng, events)
      feed.insertBefore(d, feed.firstChild)
      while (feed.children.length > 12) feed.removeChild(feed.lastChild)
    }
    for (var h = 8; h >= 1; h--) addEvent(h * 37000)
    tick(); every(1000, tick)
    every(4000, function () { addEvent(0) })
  }

  /* ---------------------------------------------------------------- 10 call */
  function call(root, rng) {
    var names = ['Daniel', 'Priya', 'Ravi', 'Meera', 'Chen', 'Sofia']
    root.innerHTML = '<div class="scr call"><div class="banner"><span class="ring"></span>Poor connection. Trying to reconnect…</div><div class="tiles">' +
      names.map(function (n, i) { return '<div class="tile t' + i + '"><div class="av">' + n[0] + '</div><span>' + n + '</span></div>' }).join('') +
      '</div><div class="ctrl"><b>🎤</b><b>📷</b><b>🖥️</b><b class="end">✕</b></div></div>'
    var tiles = root.querySelectorAll('.tile')
    every(1800, function () {
      tiles.forEach(function (t) { t.classList.remove('talk') })
      tiles[Math.floor(rng() * tiles.length)].classList.add('talk')
    })
  }

  /* -------------------------------------------------------------- 11 printer */
  function printer(root, rng) {
    root.innerHTML = '<div class="scr print"><div class="win"><div class="title">Print queue</div>' +
      '<p><b>Q3_Report_FINAL_v7_REAL.pdf</b></p><p class="sm">Status: <span class="st">Printing</span></p>' +
      '<p class="pg">Page <span class="n">1</span> of 4,871</p><div class="meter"><i></i></div>' +
      '<p class="sm">Do not close this window. Closing it may cancel the job, or not.</p><div class="btns"><button>Pause</button><button>Cancel</button></div></div></div>'
    var page = 1
    var states = ['Printing', 'Printing', 'Printing', 'Waiting for the printer', 'Printing', 'Retrying']
    every(2600, function () {
      page += rng() < 0.7 ? 1 : 0
      el(root, '.n').textContent = page
      el(root, '.meter i').style.width = Math.min(99, (page / 4871) * 100 * 40 + 1) + '%'
    })
    every(7000, function () { el(root, '.st').textContent = D.pick(rng, states) })
  }

  var MAP = { update: update, bsod: bsod, classic: classic, terminal: terminal, sheet: sheet, code: code, email: email, defrag: defrag, dashboard: dashboard, call: call, printer: printer }

  window.BossScreens = {
    start: function (id, root, seed) {
      reset()
      var fn = MAP[id]
      if (!fn) return false
      root.innerHTML = ''
      fn(root, D.mulberry32(seed || Date.now()))
      return true
    },
    stop: function (root) { reset(); if (root) root.innerHTML = '' },
    ids: Object.keys(MAP),
  }
})()
