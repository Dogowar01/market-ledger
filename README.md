# Signal9 Market Ledger

A small offline-first PWA for Signal9 Studio market days.

- **Markets** – each market is its own event with stock (products, prices, what sold), a packing list, expenses and notes.
- **Purchases** – things bought that are not tied to one market (display gear, stock, packaging).
- **Totals** – spend, takings and net across everything, by category and market by market, filterable by Australian financial year.

Data lives in the browser's `localStorage` on the device. Use **Totals → Back up** to save or move it.

## Files

- `index.html` – the whole app (built output, deploy this)
- `sw.js`, `manifest.webmanifest`, icons – offline support and home-screen install
- `src/app.html` – the source; run `python3 build.py` after editing to regenerate `index.html`

## Deploy

Push to GitHub, then Settings → Pages → Deploy from branch → `main` / root.
