# Signal9 Market Ledger

A small offline-first PWA for Signal9 Studio market days.

- **Markets** – each market is its own event with stock (products, prices, what sold), a packing list, expenses and notes.
- **Purchases** – things bought that are not tied to one market (display gear, stock, packaging).
- **Totals** – spend, takings and net across everything, by category and market by market, filterable by Australian financial year. Ranks markets you go back to by average net, and shows how much of each product sold and, where a product has a cost, its profit.
- **At the stall** – tap + as things sell; record other takings and discounts (bundle deals, haggling) in the Stock tab.

Data lives in the browser's `localStorage` on the device. The app reminds you to back up after a market day or a week of changes; **Back up now** sends the file through the phone's share sheet (or downloads it). On iPhone the home-screen app and Safari keep separate data, so back up in one and restore in the other to move across.

## Files

- `index.html` – the whole app (built output, deploy this)
- `sw.js`, `manifest.webmanifest`, icons – offline support and home-screen install
- `src/app.html` – the source; run `python3 build.py` after editing to regenerate `index.html`

## Deploy

Push to GitHub, then Settings → Pages → Deploy from branch → `main` / root.
