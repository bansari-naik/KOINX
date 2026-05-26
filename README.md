# KoinX Tax Loss Harvesting

Responsive Next.js interface for previewing tax-loss harvesting impact across holdings, short-term gains, and long-term gains.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app locally:

```text
http://localhost:3000
```

4. For production verification:

```bash
npm run build
npm run start
```

## Data Source

- Holdings data is stored in `src/data/holdings.json`
- Capital gains data is stored in `src/data/capital-gains.json`
- API routes read through `src/server/mock-api.ts`
- Frontend fetches only from:
  - `/api/holdings`
  - `/api/capital-gains`

## Assumptions

- All monetary values are displayed in USD in the product UI, except the tax-savings impact copy which is shown in INR as requested.
- Mock API JSON files are the source of truth for this assignment and are intentionally local for predictable demo behavior.
- The app is designed for responsive use, but the holdings section remains a horizontally scrollable data table on smaller screens rather than collapsing into cards.
- Financial calculations preserve internal precision using bigint-scaled arithmetic and round only for display.
- Invalid numeric API values such as `null`, `undefined`, `NaN`, and `Infinity` are sanitized to `0`.
- Savings and tax-impact comparisons are based on raw internal values, not rounded UI values.

## Notes

- If mobile testing is done over LAN during development, `allowedDevOrigins` is configured in `next.config.ts`.
- If you see stale dev behavior, stop the dev server, delete `.next`, and restart `npm run dev`.

