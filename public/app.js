(function () {
  'use strict'
  var D = window.BossData
  var S = window.BossScreens
  var fake = document.getElementById('fake')
  var grid = document.getElementById('grid')
  var optFull = document.getElementById('optFull')
  var optDisguise = document.getElementById('optDisguise')
  var current = null
  var oldTitle = document.title
  var iconLink = null
  var oldIcon = null

  // remember the options on this device
  try {
    var saved = JSON.parse(localStorage.getItem('bosskey') || '{}')
    if (typeof saved.full === 'boolean') optFull.checked = saved.full
    if (typeof saved.disguise === 'string') optDisguise.value = saved.disguise
  } catch (e) { /* ignore */ }
  function persist() {
    try { localStorage.setItem('bosskey', JSON.stringify({ full: optFull.checked, disguise: optDisguise.value })) } catch (e) { /* private mode */ }
  }
  optFull.addEventListener('change', function () { persist(); optFull.blur() })
  optDisguise.addEventListener('change', function () { persist(); optDisguise.blur() })

  grid.innerHTML = D.SCREENS.map(function (s) {
    return '<button type="button" class="card" data-id="' + s.id + '">' +
      '<span class="key"><kbd>' + s.key.toUpperCase() + '</kbd></span>' +
      '<span class="icon" aria-hidden="true">' + s.icon + '</span>' +
      '<h2>' + s.name + '</h2><p>' + s.blurb + '</p></button>'
  }).join('')

  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.card')
    if (card) launch(card.getAttribute('data-id'))
  })

  function disguiseOn() {
    var t = optDisguise.value
    if (!t) return
    oldTitle = document.title
    document.title = t
    iconLink = document.querySelector('link[rel="icon"]')
    if (iconLink) {
      oldIcon = iconLink.getAttribute('href')
      iconLink.setAttribute('href', "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='12' y='6' width='40' height='52' rx='4' fill='%23fff' stroke='%23999' stroke-width='3'/%3E%3Cpath d='M20 20h24M20 30h24M20 40h16' stroke='%23999' stroke-width='4'/%3E%3C/svg%3E")
    }
  }
  function disguiseOff() {
    if (!optDisguise.value) return
    document.title = oldTitle
    if (iconLink && oldIcon) iconLink.setAttribute('href', oldIcon)
  }

  function launch(id) {
    var switching = !!current
    if (!S.start(id, fake)) return
    current = id
    fake.classList.add('on')
    fake.setAttribute('aria-hidden', 'false')
    if (!switching) disguiseOn()
    if (optFull.checked && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () { /* the overlay still covers the page */ })
    }
  }

  function leave() {
    if (!current) return
    current = null
    S.stop(fake)
    fake.classList.remove('on')
    fake.setAttribute('aria-hidden', 'true')
    disguiseOff()
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {})
  }

  // leaving fullscreen with Esc also leaves the fake screen
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && current) leave()
  })

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    var tg = e.target
    if (tg && (/^(select|textarea)$/i.test(tg.tagName) || (/^input$/i.test(tg.tagName) && !/^(checkbox|radio|button)$/i.test(tg.type)))) return
    if (e.key === 'Escape') { leave(); return }
    var k = e.key.length === 1 ? e.key.toLowerCase() : ''
    for (var i = 0; i < D.SCREENS.length; i++) {
      if (D.SCREENS[i].key === k) { e.preventDefault(); launch(D.SCREENS[i].id); return }
    }
  })

  // double-click (or double-tap) gets you out too
  fake.addEventListener('dblclick', leave)
  var lastTap = 0
  fake.addEventListener('touchend', function () {
    var now = Date.now()
    if (now - lastTap < 350) leave()
    lastTap = now
  })
})()
