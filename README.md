# 🔑 Boss Key

The panic button for your screen. Open the page, pick a fake screen, press its key, and look extremely busy. Press **Esc** or **double-click** to come back.

| Key | Screen |
| --- | --- |
| `1` | System update (spinning dots, slow percentage) |
| `2` | Blue crash screen (sad face, stop code, counter) |
| `3` | Classic blue crash (white text, hex dump) |
| `4` | Compiling… (terminal scrolling through a huge build) |
| `5` | Spreadsheet (quarterly numbers, a busy cursor) |
| `6` | Code editor (types code by itself) |
| `7` | Inbox (boring corporate emails, new ones arrive) |
| `8` | Disk cleanup (retro block shuffling) |
| `9` | Server dashboard (live graphs, "all systems operational") |
| `0` | Reconnecting call (video meeting that never quite works) |
| `Q` | Stuck print job (page 1 of 4,871) |

Options: fullscreen on or off, and a **tab disguise** that changes the browser tab title and icon (for example "Untitled document") while a fake screen is showing. Both are remembered on your device.

The screens are original lookalikes with generic wording: no logos and no real company or product names. Nothing is collected. The hosted site uses [Vercel Web Analytics](https://vercel.com/docs/analytics) for anonymous page views only.

## Develop

Plain HTML, CSS and JavaScript with no build step.

```bash
python3 -m http.server 8000 --directory public   # then open http://localhost:8000
npm test                                          # tests for the data and logic
```

| File | What it does |
| --- | --- |
| `public/data.js` | Screen list, seeded randomness, fake logs, emails, code and spreadsheet data |
| `public/screens.js` | The 11 screens |
| `public/app.js` | Launcher: hotkeys, fullscreen, tab disguise |
