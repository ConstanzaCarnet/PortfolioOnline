# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server at http://localhost:5173
npm run build     # production build
npm run preview   # preview production build
npm run lint      # ESLint (js/jsx files)
```

There are no tests. The project has no test runner configured.

### Optional backend (ASP.NET Core)

```bash
cd backend
dotnet run        # starts on http://localhost:5000
```

## Environment variables

Copy `.env.example` to `.env.local`:

```
VITE_API_URL=http://localhost:5000   # ASP.NET Core backend; leave empty to skip backend
VITE_FINNHUB_API_KEY=               # reserved, not actively used in current code
```

The frontend works fully without the backend — all API calls fall back to direct third-party requests or static data.

## Architecture

### Frontend (`src/`)

Single-page React 19 app with no routing. `App.jsx` renders all sections in order: Navbar → Hero → About → FinanceDashboard → Projects → Skills → Experience → Contact → Footer, all wrapped in `LanguageProvider`.

**Internationalization** — `src/context/LanguageContext.jsx` exposes `{ language, toggle }` (values: `"es"` | `"en"`). All UI copy lives in `src/data/translations.js` as an object keyed with `{ es, en }` pairs. Components destructure `language` from `useLanguage()` and index into the translation object.

The Finance Dashboard UI lives in its own nested folder `src/components/FinanceComponents/` (FinanceDashboard, MarketDemo, CurrencyConverter, EconomicIndicators); all other components are flat in `src/components/`.

**Data layer** — Static data for projects, experiences, skills, and certificates lives in `src/data/`. The `usePortfolioData` hook (`src/hooks/usePortfolioData.js`) tries the backend first, caches the response in `sessionStorage` for 1 hour, and falls back to the static files (this is portfolio *content*, not market data, so a static fallback is acceptable here).

**Service layer** (`src/services/`) — The backend is the **single source of truth** for all finance/market data. The frontend never calls a third-party API and never fabricates data: services just `apiFetch` the backend, and on failure throw so the component renders a neutral "data unavailable" + retry state. No mocks, no static market fallbacks, no client-side cache (the cache lives in the backend).
- `apiService.js` — `apiFetch(path, { timeout })` (default 10s; finance calls pass 60s to survive a Render cold start) and `hasBackend() = !!VITE_API_URL`. Throws a generic `HTTP <status>` error; never surfaces the response body.
- `marketService.js` — `fetchDefaultAssets()` → `GET /api/market/defaults`; `refreshMarket()` → `GET /api/market/refresh` (the "Actualizar" button).
- `currencyService.js` → `GET /api/currency/dolar`
- `economicIndicatorsService.js` → `GET /api/indicators/economic`

**Finance Dashboard data flow** — On mount `MarketDemo` loads all default assets once from the backend's warm cache into local state; the checkboxes then only toggle which rows are shown — **toggling makes no network calls**. The backend pre-computes every field the table renders (price, daily change, volatility, alert level). `CurrencyConverter` and `EconomicIndicators` each load once and show an empty/retry state on failure.

**Scroll animations** — `useScrollAnimation` (`src/hooks/useScrollAnimation.js`) returns a ref that, when attached to a DOM element, adds the CSS class `visible` once the element enters the viewport via `IntersectionObserver`. Animated sections must have corresponding CSS rules for the `.visible` state in `src/styles.css`. Other hooks: `useCopyToClipboard` (`src/hooks/useCopyToClipboard.js`).

**Styling** — All styles live in a single global stylesheet `src/styles.css` (imported once in `App.jsx`). There are no CSS modules, scoped styles, or CSS-in-JS; components reference plain class names that resolve against this one file. The design system (colors, spacing, glows) is driven by CSS custom properties defined at the top of that file.

### Backend (`backend/`)

ASP.NET Core 8 minimal API. `Program.cs` defines all endpoints inline — there are no controllers. Responsibilities:
- Owns all third-party data (DolarAPI, CoinGecko, Yahoo Finance, ArgentinaDatos): proxies it, **filters it down to flat DTOs** (`backend/Models/MarketModels.cs` — only the fields the UI renders; raw upstream JSON never leaves the server) and **computes derived fields** (volatility, alert level).
- **Owns the cache and prefetch.** `Services/MarketDataService.cs` (singleton) holds the `IMemoryCache`, dedupes concurrent fetches per dataset (`SemaphoreSlim`) and retains the last known real values if a refresh fails. `Services/MarketRefreshBackgroundService.cs` (`BackgroundService`) warms every dataset on startup and re-fetches every `Market:RefreshMinutes` (default 20). The "Actualizar" button forces a refresh via `/api/market/refresh`.
- **Never leaks errors.** Upstream failures are logged with `ILogger` and translated to a generic `{ "error": "service_unavailable" }` 500 — no exception message or stack ever reaches the client. `app.UseExceptionHandler` is the global backstop for anything unhandled.
- Fixed-window rate limiting per IP (default: 60 req/min); CORS restricted to `AllowedOrigins`.
- Serves portfolio content (projects + experiences) from `PortfolioDataStore.cs`.

Stock quotes use Yahoo's **v8 chart** endpoint (`/v8/finance/chart/{symbol}`), not the v7 quote API — v7 now returns 401 without a session crumb. Crypto and dólar are single batched/list calls; stocks fan out one chart call per symbol in parallel.

Backend endpoints:
| Path | Source |
|---|---|
| `GET /api/portfolio/data` | `PortfolioDataStore` (static C# data) |
| `GET /api/market/defaults` | cached default watchlist (CoinGecko + Yahoo), pre-computed |
| `GET /api/market/refresh` | forces a cache refresh, returns fresh defaults |
| `GET /api/currency/dolar` | DolarAPI (cached) |
| `GET /api/indicators/economic` | ArgentinaDatos (parsed/aggregated + cached) |
| `GET /health` | status check |

## Deployment

`vercel.json` configures the Vite build (`outputDirectory: dist`) and sets explicit headers on `/cv.pdf` so the CV opens inline as `application/pdf` rather than downloading. The static `public/cv.pdf` is served as-is.
