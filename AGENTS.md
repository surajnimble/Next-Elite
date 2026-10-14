# Next Elite — Project Guide, Structure & Change Rules

> **This is the single source of truth for this repository.**
> Read it before you change anything. Follow it so every change (yours or an AI agent's) lands in the same shape and never breaks the build, the lint gates, the routing, or the auth model.
>
> **Maintenance rule:** when you add/remove/move a file, a route, a permission, a locale, a component, or a script, update the matching section here in the same PR. If this file is out of date, it is a bug.

- **Project:** `next-elite` (v2.1.0)
- **Type:** Frontend-first, API-driven Next.js starter kit (no bundled database / ORM)
- **Scope:** API-driven auth app: login (`/`), password reset, and a **protected area** (`/dashboard`, `/profile`, `/settings`, `/analytics`, `/unauthorized`) rendered in a sidebar shell. There is no marketing site or demo module.
- **Runtime:** Node.js `>=22.12.0`, npm 11
- **Dev server port:** `6767` (everywhere: dev, start, tests, Docker)
- **Aliases:** `@/*` → `src/*`, `@tests/*` → `tests/*`

---

## Table of contents

1. [How to use this file](#1-how-to-use-this-file)
2. [Project at a glance](#2-project-at-a-glance)
3. [Tech stack & versions](#3-tech-stack--versions)
4. [Golden rules (non-negotiables)](#4-golden-rules-non-negotiables)
5. [Commands](#5-commands)
6. [Repository structure (annotated tree)](#6-repository-structure-annotated-tree)
7. [File-by-file reference](#7-file-by-file-reference)
8. [Architecture & request flow](#8-architecture--request-flow)
9. [Routing & layouts deep dive](#9-routing--layouts-deep-dive)
10. [Auth & RBAC deep dive](#10-auth--rbac-deep-dive)
11. [Internationalization (i18n) deep dive](#11-internationalization-i18n-deep-dive)
12. [Styling, theming & design tokens](#12-styling-theming--design-tokens)
13. [Components & code conventions](#13-components--code-conventions)
14. [Data fetching (TanStack Query)](#14-data-fetching-tanstack-query)
15. [Forms & validation](#15-forms--validation)
16. [Environment variables](#16-environment-variables)
17. [SEO, PWA & agentic discovery](#17-seo-pwa--agentic-discovery)
18. [Testing strategy](#18-testing-strategy)
19. [Quality gates & git workflow](#19-quality-gates--git-workflow)
20. [Docker & deployment](#20-docker--deployment)
21. [Recipes (step-by-step how-tos)](#21-recipes-step-by-step-how-tos)
22. ["Where do I put this?" table](#22-where-do-i-put-this-table)
23. [Change checklist (definition of done)](#23-change-checklist-definition-of-done)
24. [Gotchas & CI landmines](#24-gotchas--ci-landmines)
25. [Known inconsistencies / drift](#25-known-inconsistencies--drift)
26. [Glossary](#26-glossary)

---

## 1. How to use this file

- **Humans:** skim §2–§5 for orientation, then use §21 (recipes) and §22 ("where do I put this?") for day-to-day work.
- **AI agents:** treat §4 (golden rules), §6–§7 (structure), §13 (conventions) and §24 (gotchas) as hard constraints. When a request is ambiguous, prefer the pattern already used in the nearest similar file.
- **Never** invent a new folder, alias, naming style, or state library. If something seems missing, extend the existing pattern (see §21) instead of adding a parallel one.

---

## 2. Project at a glance

| Item                  | Value                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Framework             | Next.js 16 (App Router, Turbopack)                                                                                        |
| UI runtime            | React 19                                                                                                                  |
| Language              | TypeScript (strict, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`)                                                   |
| Styling               | Tailwind CSS v4 (`@tailwindcss/postcss`) + `tw-animate-css` + CSS vars                                                    |
| UI primitives         | shadcn/ui (`new-york` style) built on Radix UI + CVA                                                                      |
| Icons                 | Phosphor (`@phosphor-icons/react`) + Lucide (`lucide-react`)                                                              |
| Auth                  | API-driven email/password — posts to the backend, stores an httpOnly session cookie (no BetterAuth, no social/OAuth)      |
| Access control        | Permission-based RBAC model (`user`, `admin`) — enforced on the `(protected)` group via `requireUser`/`requirePermission` |
| i18n                  | `next-intl`, cookie-based, **2 locales (English + Hindi)**, compile-time key checking                                     |
| Server state (client) | TanStack Query (React Query)                                                                                              |
| Forms                 | React Hook Form + Zod                                                                                                     |
| Env validation        | `@t3-oss/env-nextjs` + Zod                                                                                                |
| Error/monitoring      | Sentry (client + server), Vercel Analytics                                                                                |
| Tests                 | Vitest + React Testing Library; Playwright for E2E                                                                        |
| Lint/format           | Oxlint + Oxfmt; Knip for dead code; Lefthook git hooks; Commitlint                                                        |
| Deploy                | Vercel or standalone Docker (Distroless Node 22)                                                                          |

**The core idea:** a page renders on the server; identity is resolved there; live data is fetched on the client with TanStack Query against _your_ external backend (REST, GraphQL or BFF). This repo ships **no database**.

---

## 3. Tech stack & versions

Authoritative list lives in `package.json`. Highlights (do not downgrade without reason):

- `next@16.4.0`, `react@19.3.0`, `react-dom@19.3.0`
- `typescript@7.0.2`
- `tailwindcss@4.3.3`, `@tailwindcss/postcss@4.3.3`, `tw-animate-css`
- `next-intl@4.14.7`
- `@tanstack/react-query@5`, `@tanstack/react-table@9`
- `react-hook-form@7`, `zod@4`
- `@sentry/nextjs@11`, `@vercel/analytics@2`
- Tooling: `oxlint@1.80`, `oxfmt@0.70`, `knip@6`, `lefthook@2`, `vitest@5`, `@playwright/test@1.64`

> **Note:** the README says "Next.js 16.3" in prose; `package.json` pins `16.4.0`. Trust `package.json`.

`package.json` also pins **`overrides`** (`kysely`, `postcss`, `sharp`, `uuid`, `@swc/helpers`) — leave them unless you are deliberately resolving an audit/advisory.

> **Component library:** `src/components/ui/**` is vendored (Knip-ignored). The protected shell now uses several of them (`sidebar`, `sheet`, `tooltip`, `breadcrumb`, `dialog`, `collapsible`, `avatar`, `dropdown-menu`, `separator`), and their `@radix-ui/*` deps were removed from Knip's `ignoreDependencies` (§19). The rest (table, chart, carousel, calendar, select, tabs, …) stay retained but unreferenced — import them normally if you need them.

---

## 4. Golden rules (non-negotiables)

1. **Feature-first architecture.** New domain logic goes in `src/features/<feature>/`. Reusable, domain-agnostic UI goes in `src/components/`. Cross-cutting infra goes in `src/libs/`. React hooks shared app-wide go in `src/hooks/`.
2. **Use path aliases.** Import with `@/...` (and `@tests/...` in tests). Do not add `../../../` chains in new files. (A few older files use relative paths — don't copy that; follow `@/`.)
3. **Identity is resolved on the server.** Any page that needs the user calls `getCurrentUser()` (server-only, request-cached) — or the server guards `requireUser()` / `requirePermission()` — and branches/redirects there. Client-side `useAuth().hasPermission()` is UX only, never security. See §10.
4. **Route pages are thin.** `src/app/**/page.tsx` composes components and does server work (user/translations); the real UI lives in `src/components/**`. See `src/app/(auth)/page.tsx`.
5. **All user-facing text is translated.** Use `useTranslations()` / `getTranslations()`; never hardcode visible copy in new components. Add keys to **both** `messages/en.json` and `messages/hi.json`.
6. **No inline Tailwind color hexes.** Use design tokens (`bg-background`, `text-muted-foreground`, `border-border/40`, `text-primary`, …). Update tokens in `src/app/styles/tokens.css` if a new color is truly needed.
7. **Respect RTL.** Use logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `border-s`) instead of `left/right/pl/pr/ml/mr`, and `rtl:` variants where an icon/arrow must flip. Both current locales are LTR, but the plumbing supports RTL.
8. **`'use client'` only when needed.** Default to Server Components. Add the directive only for hooks, event handlers, browser APIs, or context providers.
9. **Run `npm run check` before pushing.** The pre-push hook runs `typecheck + lint + knip + test`. If it fails locally, it fails in CI.
10. **Conventional Commits only.** Commitlint enforces it (`feat:`, `fix:`, `docs:`, `chore:`, …). Body lines max 200 chars.
11. **Don't break the type-contract of i18n/auth.** `src/global.d.ts` makes `t()` keys and locales compile-time typed. Renaming a key without updating every message file breaks `tsc`.
12. **Keep Knip green.** New files must be reachable from an entry (a route, the alias graph, or an explicit `knip.json` entry). Orphaned files fail `npm run knip`. `src/components/ui/**` is currently the only ignore.
13. **All backend traffic goes through `@/libs/api`.** Never `fetch` the API directly, never re-create a feature-local `api.ts`, and never let a call throw — handle the `ApiResult<T>` union. See §7.5.

---

## 5. Commands

| Command                           | What it does                                                |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                     | Dev server on `http://localhost:6767`                       |
| `npm run build`                   | Production build (standalone output unless on Vercel)       |
| `npm run start`                   | Serve the production build on port 6767                     |
| `npm run start:standalone`        | Run `.next/standalone/server.js` (used by Playwright in CI) |
| `npm run analyze`                 | Build with `@next/bundle-analyzer`                          |
| `npm run typecheck`               | `tsc --noEmit`                                              |
| `npm run lint`                    | `oxlint && oxfmt --check`                                   |
| `npm run lint:fix`                | `oxlint --fix && oxfmt`                                     |
| `npm run format`                  | `oxfmt` (write)                                             |
| `npm run format:check`            | `oxfmt --check`                                             |
| `npm run knip`                    | Detect unused files/exports/deps                            |
| `npm run test`                    | Vitest run (`config/vitest.config.ts`)                      |
| `npm run test:watch`              | Vitest watch                                                |
| `npm run check`                   | **CI gate:** typecheck → lint → knip → test                 |
| `npm run e2e`                     | Playwright (all browsers locally, Chromium in CI)           |
| `npm run e2e:ui`                  | Playwright UI mode                                          |
| `npm run e2e:webkit`              | Playwright WebKit only                                      |
| `npm run playwright:install`      | Download Playwright browsers                                |
| `npm run playwright:install:deps` | Install OS deps for browsers (Linux)                        |
| `npm run prepare`                 | Installs Lefthook git hooks (runs on `npm install`)         |

**Port discipline:** everything (dev, prod start, E2E `webServer`, Docker `EXPOSE`) assumes **6767**. If you change it, change all of them.

---

## 6. Repository structure (annotated tree)

```
.
├── .github/
│   ├── workflows/check.yml         CI: typecheck → lint → knip → test → build
│   ├── workflows/playwright.yml    CI: build → Playwright E2E (Chromium)
│   ├── dependabot.yml              Weekly npm + GitHub Actions updates
│   ├── renovate.json               Grouped dependency updates + automerge patches
│   └── nodejs.version              "22"
├── .vscode/settings.json           Oxc formatter on save + Tailwind classRegex
├── config/
│   ├── vitest.config.ts            jsdom, tsconfigPaths, includes **/*.test.{ts,tsx}
│   └── vitest.setup.ts             jest-dom, localStorage/matchMedia mocks, module mocks
├── e2e/
│   ├── auth.spec.ts                Auth smoke tests (root/login, health, dashboard redirect, reset)
│   └── playwright.config.ts        webServer on 127.0.0.1:6767
├── messages/                       next-intl catalogs (source of i18n types)
│   ├── en.json                     ← type source for `Messages`
│   └── hi.json
├── public/                         Static assets (logos, OG images, llms.txt, favicon)
├── src/
│   ├── app/                        Next.js App Router (routes, layouts, SEO files)
│   │   ├── (auth)/                 Route group: split-pane auth shell
│   │   │   ├── layout.tsx          Split-pane shell + WebGL animation/globe + AuthTopbar
│   │   │   ├── page.tsx            `/` → LoginForm (redirects signed-in users to /dashboard)
│   │   │   └── password-reset/page.tsx → PasswordResetForm (redirects logged-in users)
│   │   ├── (protected)/            Route group: sidebar shell (requireUser in layout)
│   │   │   ├── layout.tsx          AppShell + User/AdminSidebar + Topbar + `<main>` (picks @user/@admin slot)
│   │   │   ├── default.tsx         null
│   │   │   ├── unauthorized/page.tsx  403 screen (requirePermission redirect target)
│   │   │   ├── @user/              Slot: userRole === 'user' pages
│   │   │   │   ├── default.tsx     null
│   │   │   │   └── {dashboard,profile,settings,analytics}/page.tsx
│   │   │   └── @admin/             Slot: userRole === 'admin' pages
│   │   │       ├── default.tsx     null
│   │   │       └── {dashboard,profile,settings,analytics}/page.tsx
│   │   ├── api/auth/login/         POST → backend login + set session cookie
│   │   ├── api/auth/logout/        POST → backend logout + clear session cookie
│   │   ├── api/health/             Liveness probe → { status: 'ok' }
│   │   ├── styles/                 tokens.css, base.css, components.css
│   │   ├── fonts.ts                Font config
│   │   ├── globals.css             CSS entry (imports tailwind + styles/*)
│   │   ├── layout.tsx              Root layout: html/body, i18n, providers, SEO, JSON-LD
│   │   ├── providers.tsx           Theme + Query + Auth providers + toaster
│   │   ├── error.tsx  not-found.tsx
│   │   ├── manifest.ts  robots.ts  sitemap.ts
│   ├── components/
│   │   ├── auth/                   Auth building blocks (forms, topbar, WebGL bg)
│   │   ├── icons/                  app-icons (Phosphor `Icon`), loader-icon, barrel
│   │   ├── layout/                 App shell pieces (app-brand, app-shell, topbar, user-sidebar, admin-sidebar)
│   │   ├── shared/                 Cross-app reusable pieces (theme, i18n, page-header, user-dropdown, primitives)
│   │   └── ui/                     shadcn/ui primitives (vendored, Knip-ignored)
│   ├── features/                   Vertical slices (domain logic)
│   │   ├── auth/                   API auth client, session/server helpers, RBAC (incl. require), schemas
│   │   ├── dashboard/              Admin dashboard stats (server fetch + stat-card grid)
│   │   ├── i18n/                   next-intl request config, routing, RTL helper
│   │   └── site/                   siteConfig (JSON + Zod), locale utilities
│   ├── hooks/                      Shared React hooks
│   ├── libs/                       Cross-cutting infra (env, query client, api layer, cn)
│   ├── global.d.ts                 next-intl type augmentation
│   ├── instrumentation.ts          Server Sentry init
│   └── instrumentation-client.ts   Client Sentry init
├── tests/                          Vitest specs + shared render helper
│   ├── auth/  i18n/
│   └── utils/render.tsx            renderWithProviders()
├── .env.example                    Documented env vars (copy to .env)
├── .oxfmtrc.json  .oxlintrc.json   Formatter / linter config
├── components.json                 shadcn/ui CLI config (aliases, style)
├── knip.json                       Dead-code entry list + ignores
├── lefthook.yml                    pre-commit / commit-msg / pre-push hooks
├── next.config.mjs                 next-intl plugin, standalone output, strict mode
├── postcss.config.mjs              Tailwind v4 PostCSS plugin
├── proxy.ts                        Next 16 network proxy (currently a pass-through)
├── tsconfig.json                   Strict TS + path aliases
├── Dockerfile  docker-compose.yml  Distroless production image
└── AGENTS.md                       ← you are here
```

> **The `(auth)` route group does not add to the URL.** `src/app/(auth)/page.tsx` serves `/`, `(auth)/password-reset/page.tsx` serves `/password-reset`, etc.

> **`(protected)` uses parallel routes.** `@user` / `@admin` are slots (not URL segments), so `(protected)/@user/dashboard/page.tsx` and `(protected)/@admin/dashboard/page.tsx` both serve `/dashboard`; the layout picks one by role. Every slot needs a `default.tsx`.

---

## 7. File-by-file reference

### 7.1 Root & config

| File                                | Purpose / notes                                                                                                                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                      | Scripts, deps, `overrides`, Commitlint config. `"type": "module"`. Node `>=22.12`.                                                                                                                                                                      |
| `tsconfig.json`                     | Strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`. Aliases: `@/*`→`./src/*`, `@tests/*`→`./tests/*`.                                                                                                                                           |
| `next.config.mjs`                   | `output: 'standalone'` (skipped on Vercel), `reactStrictMode`, `poweredByHeader: false`, `allowedDevOrigins: ['127.0.0.1']`, `optimizePackageImports: ['lucide-react']`, wraps `next-intl` plugin (`./src/features/i18n/request.ts`) + bundle analyzer. |
| `postcss.config.mjs`                | Tailwind v4 via `@tailwindcss/postcss`.                                                                                                                                                                                                                 |
| `proxy.ts`                          | Next 16 **network proxy** (renamed middleware). Currently `NextResponse.next()`; matcher excludes api/static/images. Add cross-cutting request logic here.                                                                                              |
| `components.json`                   | shadcn/ui: style `new-york`, `rsc: true`, `tsx: true`, cssVars, **utils alias is `@/libs/utils`**, ui `@/components/ui`, lib `@/libs`, hooks `@/hooks`, icon library `lucide`.                                                                          |
| `.oxlintrc.json`                    | Oxlint with `nextjs`, `typescript`, `react`, `unicorn` plugins. `no-unused-vars` ignores `_`-prefixed.                                                                                                                                                  |
| `.oxfmtrc.json`                     | Oxfmt: single quotes, semicolons, printWidth 80, tabWidth 2, **sorts Tailwind classes** using `src/app/globals.css`, `clsx`/`cn` functions. Ignores `.next`, `node_modules`, `public`, `.agents`, lockfiles.                                            |
| `knip.json`                         | Entry points + `project` globs. **`ignore: ["src/components/ui/**"]`** plus `ignoreDependencies` for the still-unused table/chart/carousel/select/tabs packages.                                                                                        |
| `lefthook.yml`                      | pre-commit: `oxlint --fix` + `oxfmt` on staged (stage fixes). commit-msg: commitlint. pre-push: `npm run check`.                                                                                                                                        |
| `.env.example`                      | Documented env template (copy to `.env`).                                                                                                                                                                                                               |
| `.gitignore` / `.dockerignore`      | Standard ignores; `.env*` ignored except `.env.example`.                                                                                                                                                                                                |
| `Dockerfile` / `docker-compose.yml` | Distroless production image (see §20).                                                                                                                                                                                                                  |
| `LICENSE`                           | MIT.                                                                                                                                                                                                                                                    |
| `README.md`                         | Public-facing overview (marketing + docs). Can drift from code — this `AGENTS.md` wins.                                                                                                                                                                 |

### 7.2 `src/app` — routing, layouts, SEO

| File                                | Purpose / notes                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `layout.tsx`                        | Root layout. Async Server Component. Resolves `getLocale()`, `getMessages()`, `getCurrentUser()`; sets `<html lang dir class>` (theme from `theme` cookie), wraps children in `NextIntlClientProvider` → `Providers`. Builds `metadata`/`viewport` from `siteConfig`; injects Organization / WebApplication / WebSite JSON-LD (guarded by `shouldRenderStructuredData`).       |
| `providers.tsx`                     | `'use client'` provider stack: `ThemeProvider` → `TopLoader` + `QueryClientProvider` → `AuthProvider` → children + `Toaster` + `ThemeOverlay`. Props: `initialUser`, `defaultTheme`.                                                                                                                                                                                           |
| `fonts.ts`                          | `Inter` via `next/font/google`, exported as `fontSans`.                                                                                                                                                                                                                                                                                                                        |
| `globals.css`                       | CSS entry: `@import 'tailwindcss'`, `tw-animate-css`, `@custom-variant dark`, then `styles/tokens.css`, `styles/base.css`, `styles/components.css`.                                                                                                                                                                                                                            |
| `styles/tokens.css`                 | **Design system source.** `:root` light + `.dark` overrides for all colors, spacing (`--app-header-height`), radii, glows. Then `@theme` maps tokens to Tailwind (`--color-*`, `--spacing-app-header`, `--radius-*`, `--animate-*`).                                                                                                                                           |
| `styles/base.css`                   | `@layer base`: borders/outline reset, typography scale, focus rings, selection, scrollbars, animations, RTL dir rules, print.                                                                                                                                                                                                                                                  |
| `styles/components.css`             | View-Transition theme-reveal (radial wave) used by `ThemeProvider`.                                                                                                                                                                                                                                                                                                            |
| `error.tsx`                         | Client error boundary (dev-only console error; retry + home).                                                                                                                                                                                                                                                                                                                  |
| `not-found.tsx`                     | 404 page.                                                                                                                                                                                                                                                                                                                                                                      |
| `manifest.ts`                       | PWA manifest derived from `siteConfig` (`start_url: '/'`, icons, shortcut `/`).                                                                                                                                                                                                                                                                                                |
| `robots.ts`                         | Robots rules; allows `/`, disallows `/api/`; points to sitemap.                                                                                                                                                                                                                                                                                                                |
| `sitemap.ts`                        | Returns `[]` (auth-only app has no public pages). Add entries when public routes exist.                                                                                                                                                                                                                                                                                        |
| `(auth)/layout.tsx`                 | Split-pane auth shell: WebGL particle animation + globe + `AppBrand` on the left, `AuthTopbar` + children on the right. Does **not** redirect.                                                                                                                                                                                                                                 |
| `(auth)/page.tsx`                   | `/` → `getCurrentUser()`; redirects signed-in users to `/dashboard`, else renders `LoginForm`.                                                                                                                                                                                                                                                                                 |
| `(auth)/password-reset/page.tsx`    | `/password-reset` → redirects authenticated users to `/`, else `PasswordResetForm`.                                                                                                                                                                                                                                                                                            |
| `(protected)/layout.tsx`            | `requireUser()`; renders `AppShell` + `UserSidebar`/`AdminSidebar` (by role) + `Topbar`, then `<main>` with the `@user`/`@admin` slot (falling back to `children`).                                                                                                                                                                                                            |
| `(protected)/@user/**`              | Slot pages for `role === 'user'`: `dashboard` (renders a "welcome back, {name}" heading), `analytics`, `settings` (title/subtitle only) and `profile` (renders the signed-in `AuthUser` — avatar, name, email, phone, id, role badge, API roles, permissions — using `@/components/ui/*` inline). Each calls `requirePermission('dashboard.view:user')`. `default.tsx` = null. |
| `(protected)/@admin/**`             | Slot pages for `role === 'admin'`: same four (the `dashboard` one renders `<DashboardStatsSection />` from `@/features/dashboard` inside `<Suspense>`; the `profile` one likewise renders the `AuthUser`), guarded by `requirePermission('dashboard.view:admin')`. `default.tsx` = null.                                                                                       |
| `(protected)/unauthorized/page.tsx` | 403 fallback (the `requirePermission` redirect target). Rendered via `children` (both slots fall back to `default.tsx`).                                                                                                                                                                                                                                                       |
| `api/auth/login/route.ts`           | `POST` → validates the body, calls the backend `POST /api/v1/auth/login`, sets the httpOnly session cookie, returns `{ user, message }`.                                                                                                                                                                                                                                       |
| `api/auth/logout/route.ts`          | `POST` → calls the backend `POST /api/v1/auth/logout`, clears the cookie, returns `{ ok, message }`.                                                                                                                                                                                                                                                                           |
| `api/health/route.ts`               | `GET` → `{ status: 'ok' }`. Used by Docker healthcheck and E2E `webServer` wait.                                                                                                                                                                                                                                                                                               |

### 7.3 `src/features` — domain logic

**`features/auth`**

| File                      | Purpose                                                                                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/session.ts`       | `'server-only'`. `createSession()`, `setSessionCookie()`/`clearSessionCookie()` (httpOnly cookie `next-elite.session`), and the request-cached `getSession()` / `getCurrentUser()`.                         |
| `lib/map-user.ts`         | `buildAuthUser(userData, rolesList)` maps the API `userData` payload to `AuthUser` (role + permissions). Pure, unit-tested.                                                                                 |
| `lib/device.ts`           | `getDeviceData(locale)` builds the `deviceData` block the login endpoint expects (persists a device id in `localStorage`). Client-only.                                                                     |
| `hooks/auth-provider.tsx` | `'use client'`. `AuthProvider` (holds user + auth actions) and `useAuth()`. Seeds from `initialUser`; exposes `signIn` (`POST /api/auth/login`), `signOut`, `hasPermission`.                                |
| `rbac/permissions.ts`     | `UserRole = 'admin' \| 'user'`; `AuthPermission = 'dashboard.view:user' \| 'dashboard.view:admin'`. **Add new permissions here.**                                                                           |
| `rbac/roles.ts`           | `ROLE_PERMISSIONS` map (`as const satisfies Record<UserRole, readonly AuthPermission[]>`), `getPermissionsForRole()`, `getRoleFromApiRoles(roles)` (admin when any API role contains `ADMIN`, else `user`). |
| `rbac/can.ts`             | `hasPermission(permissions, permission)` — pure. Used on server _and_ client.                                                                                                                               |
| `rbac/require.ts`         | `'server-only'` (calls `redirect()`). `requireUser(redirectTo = '/')` and `requirePermission(permission, redirectTo = '/unauthorized')` for the `(protected)` group.                                        |
| `types.ts`                | `AuthUser { id, name, email, phone, avatarUrl, role, apiRoles, permissions }`; re-exports `AuthPermission`, `UserRole`.                                                                                     |
| `schemas/login.ts`        | Zod login schema + `LoginInput` type.                                                                                                                                                                       |
| `*.test.ts`               | Colocated unit tests (`roles.test.ts`, `login.test.ts`, `map-user.test.ts`).                                                                                                                                |

> **Removed:** the `demo/` module, all social-login code and the entire BetterAuth integration (`lib/auth.ts`, `lib/auth-client.ts`, `api/auth/[...all]`). `rbac/require.ts` was re-added for the `(protected)` group (§10).
>
> **Moved:** `server/api.ts` (`loginWithApi`, `logoutWithApi`, `ApiError`) is gone — every backend call now goes through the global `@/libs/api` layer (§7.5). Only the session cookie lives in `server/session.ts`.

**`features/i18n`**

| File                | Purpose                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request.ts`        | `getRequestConfig`: reads `NEXT_LOCALE` cookie → `resolveLocale` → dynamically imports `messages/<locale>.json`. Wired into `next.config.mjs`.            |
| `routing.ts`        | `LOCALE_COOKIE_NAME = 'NEXT_LOCALE'`, `routing` object (`locales`, `defaultLocale`, `cookieName`), `isValidLocale`, `resolveLocale`. Re-exports `Locale`. |
| `locale-actions.ts` | `'use server'`. `setLocaleAction(locale)` validates, sets the cookie, `revalidatePath('/', 'layout')`.                                                    |
| `use-is-rtl.ts`     | `'use client'`. `useIsRtl()` from current locale direction.                                                                                               |

**`features/site`**

| File               | Purpose                                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site.config.json` | **Single source for SEO/branding/locales.** Validated by `config.ts`. Edit here for app name, domain, keywords, features, languages, organization, socials, images, icons, theme, pricing.                                         |
| `config.ts`        | Zod-validates `site.config.json` → `siteConfig`. Derives `baseUrl` (env `NEXT_PUBLIC_APP_URL` → JSON `domain` → fallback), `Locale` type (`keyof languages.locales`), `supportedLocales`, `defaultLocale`, `getLocaleDirection()`. |

**`features/dashboard`**

| File                                       | Purpose                                                                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/dashboard-stats-section.tsx`   | Server component. Reads the session, calls `getDashboardStats()` from `@/libs/api`, and renders the grid or a translated error `Alert` (`dashboard.stats.errorTitle` / `errorDescription`). |
| `components/dashboard-stats-grid.tsx`      | `'use client'`. `DashboardStatsGrid` renders the `StatCard` grid with locale-formatted values; `DashboardStatsSkeleton` is the loading placeholder used by `<Suspense>`.                    |
| `components/dashboard-stats-grid.test.tsx` | Colocated component test (card count, labels + number formatting).                                                                                                                          |

> The `DashboardStats` type and the `getDashboardStats()` call both live in the global API layer (§7.5), **not** here. Keys live under `dashboard.stats.*` in both message catalogs.

> The `(protected)/@admin/dashboard` page renders `<DashboardStatsSection />` inside `<Suspense fallback={<DashboardStatsSkeleton />}>`. Keys live under `dashboard.stats.*` in both message catalogs.

### 7.4 `src/components`

> **`src/components/ui/**` is treated as vendor code** and is excluded from Knip. You may edit it, but avoid renaming exports (many files import them). Follow the existing `data-slot` + `cva` + `cn` style.

| Group     | Files                                                                                                                                                                                                      | Notes                                                                                                                                                                                                                                                                                                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth/`   | `login-form.tsx`, `password-reset-form.tsx`, `auth-topbar.tsx`, `auth-animation.tsx`, `auth-globe.tsx`                                                                                                     | Auth composition + WebGL particles/globe. `auth-animation.tsx` is a Knip entry (dynamic/WebGL). `password-reset-form.tsx` has a Back control (`router.back()` with `/` fallback).                                                                                                                                                                                                   |
| `icons/`  | `app-icons.tsx`, `index.ts`, `loader-icon.tsx`                                                                                                                                                             | `app-icons.tsx` exports `Icons` map, `IconName`, and `<Icon name=.../>` (Phosphor). `index.ts` barrels `LoaderIcon`. **All brand/social SVG icons were removed with the OAuth buttons.**                                                                                                                                                                                            |
| `layout/` | `app-brand.tsx`, `app-shell.tsx`, `topbar.tsx`, `user-sidebar.tsx`, `admin-sidebar.tsx`                                                                                                                    | Protected shell pieces. `app-shell.tsx` wraps `SidebarProvider` (or a plain column for `variant="header"`); `topbar.tsx` renders breadcrumbs + theme/language/`UserDropdown`; the two sidebars render role-specific nav from `navigation.*` and gate items with `hasPermission`.                                                                                                    |
| `shared/` | `case.tsx`, `blur-glow.tsx`, `logo.tsx`, `text-link.tsx`, `theme-provider.tsx`, `theme-toggle.tsx`, `theme-overlay.tsx`, `top-loader.tsx`, `language-switcher.tsx`, `page-header.tsx`, `user-dropdown.tsx` | Cross-app pieces. `theme-toggle` and `language-switcher` are rendered by `auth-topbar.tsx` and the `topbar.tsx`. `page-header.tsx` exports `PageHeader`/`PageLayout` (used by every `(protected)` page). `user-dropdown.tsx` shows the avatar menu (name + email; initials derived from the name) and signs out via `useAuth().signOut()`.                                          |
| `ui/`     | ~50 primitives                                                                                                                                                                                             | shadcn/ui + custom. Includes `button.tsx` (extended with `loading` + i18n), `card.tsx` (`flat`/`nested`/`variant="glow"`), `form.tsx` (RHF wrapper), `input-error.tsx`, `password-input.tsx`, `dropdown-menu.tsx`, `switch.tsx`, `icon.tsx` (Lucide passthrough), plus a large set of primitives kept as a component library even though the auth screens don't currently use them. |

**Two `<Icon>` components exist — pick deliberately:**

- `@/components/icons/app-icons` → `<Icon name="dashboard" />` (Phosphor, name-based). **Use this in app UI.**
- `@/components/ui/icon` → `<Icon iconNode={SomeLucideIcon} />` (Lucide passthrough). Used by the vendored UI kit.

### 7.5 `src/hooks` & `src/libs`

| File                         | Purpose                                                                                                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/use-mobile.ts`        | `useIsMobile()` via `useSyncExternalStore` (breakpoint 768). Consumed by `src/components/ui/sidebar.tsx` (reachable via the `(protected)` shell).                                                                            |
| `hooks/use-is-dark-theme.ts` | `useIsDarkTheme()` observing `<html class>`.                                                                                                                                                                                 |
| `libs/env.ts`                | `@t3-oss/env-nextjs` schema. Server: `API_BASE_URL` (backend auth base URL, defaults to `DEFAULT_API_BASE_URL`), `SENTRY_DSN`. Client: `NEXT_PUBLIC_APP_URL`. Skips validation when `SKIP_ENV_VALIDATION` or `npm run lint`. |
| `libs/query-client.ts`       | `getQueryClient()`: fresh client on server, singleton in browser. Defaults: `staleTime 60s`, `gcTime 5min`, `refetchOnWindowFocus false`, `retry 1`.                                                                         |
| `libs/utils.ts`              | `cn(...)` = `twMerge(clsx(...))`.                                                                                                                                                                                            |
| `libs/api/**`                | **The one global API layer.** See the table below.                                                                                                                                                                           |
| `libs/*.test.ts`             | `env.test.ts`, `utils.test.ts`.                                                                                                                                                                                              |
| `instrumentation.ts`         | Server Sentry init (node + edge), `onRequestError`.                                                                                                                                                                          |
| `instrumentation-client.ts`  | Client Sentry init, router transition hook.                                                                                                                                                                                  |
| `global.d.ts`                | Augments `next-intl` with `Locale` (from routing) and `Messages` (from `messages/en.json`).                                                                                                                                  |

#### The API layer — `src/libs/api/`

One global, **server-only** layer for every backend call. It deliberately mirrors the `nails-ar-android` project (`rest/` + `data/` packages) so both codebases read the same way.

| File              | Android equivalent                                                         | Purpose                                                                                                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api-urls.ts`     | `rest/ApiUrls.kt`                                                          | Flat `API_URLS` object — **every** endpoint path in one place, each key named after the function that calls it. Bare paths; the version prefix lives in `API_BASE_URL`.                                                                 |
| `requests.ts`     | `data/requests/ApiRequest.kt`                                              | Everything **sent** to the backend: the shared `ApiRequest` (all fields optional) and `LoginDeviceData`.                                                                                                                                |
| `responses.ts`    | `data/responses/BaseResponse.kt`                                           | The `BaseResponse<T>` envelope, plus each response as a **defaults object** (`API_USER_DATA`, `LOGIN_RESULT`, `DASHBOARD_STATS`, …) that defines both its shape and its fallback values. `withDefaults()` merges a raw payload into it. |
| `defaults.ts`     | Kotlin `data class` defaults                                               | `Normalized<D>` (derive a response type from its defaults object) + `withDefaults()` (merge a raw payload into it). Pure mechanics, no API knowledge.                                                                                   |
| `types.ts`        | `rest/ServerCallback.kt`, `rest/Exceptions.kt`, `data/model/Encrypted*.kt` | Transport plumbing shared by both sides: `ApiResult<T>` + `isApiSuccess()`, `ApiErrorKind`, `EncryptedRequest`/`EncryptedResponse`, `HttpMethod`, `ApiRequestOptions`.                                                                  |
| `rest-adapter.ts` | `rest/RestAdapter.kt`                                                      | The single HTTP client: base URL, default headers, automatic `Authorization: Bearer`, 15 s timeout, dev logging, `handleResponse()` and HTTP-status → `ApiErrorKind` mapping. Never throws.                                             |
| `rest.ts`         | `rest/Rest.kt`                                                             | **One exported function per endpoint** (`login`, `logout`, `getDashboardStats`, …). The only file you edit to add a call.                                                                                                               |
| `crypto.ts`       | `pref/encrypt/GCMEncryptor.kt`, `encrytion/EncryptionExt.kt`               | AES-256-GCM `encryptPayload()` / `decryptPayload()` using the Android wire format `base64(iv)]base64(ciphertext‖authTag)`. Needs `API_ENCRYPTION_KEY`.                                                                                  |
| `index.ts`        | —                                                                          | Public barrel. Always `import { … } from '@/libs/api'`.                                                                                                                                                                                 |
| `*.test.ts`       | —                                                                          | Colocated tests (crypto round-trip, URL building, bearer header, status → error-kind mapping, default filling).                                                                                                                         |

> **Request aur response kabhi ek file me nahi.** Jo type bhejte ho → `requests.ts`; jo type receive karte ho (ya envelope) → `responses.ts`. `types.ts` sirf transport plumbing ke liye hai.

**Response me `null`?** Har response ek **defaults object** se define hota hai — bilkul Android ke `data class ProfileData(val name: String = String.empty)` jaisa. `handleResponse()` har field ko us default se bharta hai, to `null`, missing field ya poora `result: null` bhi aaye to UI ko hamesha ready value milta hai:

```ts
export const DASHBOARD_STATS = {
  totalUsers: 0,
  totalVendors: 0,
  revenue30d: 0,
  /* … */
} as const;

export type DashboardStats = Normalized<typeof DASHBOARD_STATS>; // sab fields number, kabhi null nahi
```

`string → ''`, `number → 0`, `boolean → false`, `array → []`. Naya response add karte waqt defaults likh do — wahi se uska TypeScript type bhi banta hai, dobara likhna nahi padta.

**API version badalna (v1 → v2):** sirf **ek** jagah edit karo — `API_BASE_URL` (`.env`), kyunki version prefix base URL me hai aur `API_URLS` me sirf bare paths hain:

```
API_BASE_URL=https://projectname-api.onrender.com/api/v1   # ← v2 ke liye api/v2
```

```ts
export const API_URLS = {
  login: 'auth/login',
  logout: 'auth/logout',
  getDashboardStats: 'admin/getDashboardStats',
} as const satisfies Record<string, `${string}/${string}`>;
```

`ApiUrlPattern`-style guard yahan nahi chahiye kyunki version `API_URLS` me nahi hai. Default `DEFAULT_API_BASE_URL` `src/libs/env.ts` me hai.

**Usage**

```ts
import { getDashboardStats, isApiSuccess } from '@/libs/api';
import { getSession } from '@/features/auth/server/session';

const session = await getSession();
const result = await getDashboardStats({ token: session?.accessToken });

if (!isApiSuccess(result)) return <Error message={result.message} />;
return <Grid stats={result.data} />;
```

**Rules**

- **Never** call `fetch` for the backend outside this layer, and never add a feature-local `api.ts` again.
- The layer returns `ApiResult<T>` and **never throws** — branch on `isApiSuccess()` instead of `try/catch`.
- Pass the access token explicitly via `{ token }`; it comes from `getSession()` and is never exposed to the browser.
- `ApiRequestOptions`: `token`, `query`, `headers`, `timeoutMs`, `encrypted`.

### 7.6 `messages/`

Two catalogs: `en` and `hi`. Namespace tree (see `en.json`): `common`, `navigation`, `auth.{login,logout,passwordReset,toast}`, `dashboard.{user,admin,stats}`, `profile`, `settings`, `sidebar`, `errors`.

> `messages/en.json` is the **type source**. Adding a key only there and not in `hi.json` still compiles, but Hindi will fall back / render the key path — keep both in sync (see §21.4).

### 7.7 `tests/`, `e2e/`, `config/`

| File                               | Purpose                                                                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/utils/render.tsx`           | `renderWithProviders(ui, { locale, initialUser })` wrapping `NextIntlClientProvider` → `ThemeProvider` → `QueryClientProvider` → `AuthProvider`; re-exports all of `@testing-library/react`. |
| `tests/auth/authorization.test.ts` | Permission-granting tests.                                                                                                                                                                   |
| `tests/auth/roles.test.ts`         | Role resolution tests (distinct from `src/features/auth/rbac/roles.test.ts`).                                                                                                                |
| `tests/i18n/routing.test.ts`       | `resolveLocale` / `isValidLocale`.                                                                                                                                                           |
| `config/vitest.config.ts`          | jsdom, `tsconfigPaths: true`, `include: ['**/*.test.{ts,tsx}']`, excludes e2e/.next, sets `SKIP_ENV_VALIDATION=true`.                                                                        |
| `config/vitest.setup.ts`           | jest-dom, RTL `cleanup()` after each test, `localStorage` + `matchMedia` mocks, and a `next/navigation` mock.                                                                                |
| `config/server-only.ts`            | Stub aliased over `server-only` in `vitest.config.ts` so server modules (the API layer) can be unit tested.                                                                                  |
| `e2e/playwright.config.ts`         | `testDir: '.'`, `baseURL http://127.0.0.1:6767`, `webServer` = `npm run dev` (local) / `npm run start:standalone` (CI), waits on `/api/health`.                                              |
| `e2e/auth.spec.ts`                 | Smoke: home/login screen, `/api/health` 200, `/dashboard` guest redirect, password-reset screen.                                                                                             |

### 7.8 `.github/`

| File                       | Purpose                                                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workflows/check.yml`      | push/PR → `setup-node` (from `nodejs.version`) → npm 11 → `npm ci` → `typecheck` → `lint` → `knip` → `test` → `build`. `SKIP_ENV_VALIDATION=true`. |
| `workflows/playwright.yml` | push/PR → `npm ci` → `build` → install Chromium → `npm run e2e` → upload report. Sets `SKIP_ENV_VALIDATION=true`.                                  |
| `dependabot.yml`           | Weekly npm + actions updates.                                                                                                                      |
| `renovate.json`            | Grouped non-major, automerge patch/minor, `next`/`react` grouped, major manual.                                                                    |

---

## 8. Architecture & request flow

```
User
 └─▶ Server Component (src/app/**/page.tsx or layout.tsx)      ← runs first
        ├─ getCurrentUser()  → reads session cookie → AuthUser (server-only, cached)
        │        └─ branch/redirect in the page when needed
        ├─ getTranslations() → messages/<locale>.json (next-intl)
        └─▶ HTML to browser
                └─▶ Client Components
                       └─▶ useAuth() / useQuery / useMutation (TanStack Query)
                              └─▶ YOUR backend (REST / GraphQL / BFF)
```

**Facts to internalise:**

- Identity is decided **on the server** (`getCurrentUser`). Client checks are cosmetic.
- `getCurrentUser` is request-cached via React `cache()` — call it freely.
- The login route stores the API access token **and** the mapped user in an httpOnly cookie (`next-elite.session`); `getCurrentUser` reads it back.
- Locale is a **cookie** (`NEXT_LOCALE`); there is no `/en/...` prefix.
- Theme is a **cookie + localStorage** (`theme`), applied as a class on `<html>`.
- Providers order matters: Theme → Query → Auth. Auth uses Query indirectly; keep this order.

---

## 9. Routing & layouts deep dive

### Route groups

| Group         | Layout provides                                      | URLs                                                                 |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| `(auth)`      | Split-pane shell + WebGL bg + `AuthTopbar`           | `/`, `/password-reset`                                               |
| `(protected)` | `requireUser` + `AppShell` + role sidebar + `Topbar` | `/dashboard`, `/profile`, `/settings`, `/analytics`, `/unauthorized` |
| (no group)    | Root layout + SEO/JSON-LD + providers                | `/api/auth/login`, `/api/auth/logout`, `/api/health`                 |

- `(protected)` uses **parallel routes**: `@user` / `@admin` are slots, so `(protected)/@user/dashboard/page.tsx` and `(protected)/@admin/dashboard/page.tsx` both serve `/dashboard`; `layout.tsx` renders the `@admin` slot when the user has `dashboard.view:admin`, the `@user` slot when they have `dashboard.view:user`, else `children`. Each slot and the group have a `default.tsx` returning `null`.
- Every auth page other than `/` redirects already-authenticated users to `/`.
- `/` redirects already-authenticated users to `/dashboard`.

### Adding a route (summary — full recipe in §21.1)

1. Create `src/app/(auth)/<segment>/page.tsx`, `src/app/(protected)/@user|@admin/<segment>/page.tsx`, or `src/app/api/<path>/route.ts`.
2. Keep it thin: server work (user/translations) + render a component.
3. Add translation keys to **both** `messages/en.json` and `messages/hi.json`.
4. Add it to `sitemap.ts` if it is public (none are today).
5. If it should be protected, add the page to **both** `(protected)/@user/<segment>` and `(protected)/@admin/<segment>` and guard with `requirePermission(...)` (§10).

---

## 10. Auth & RBAC deep dive

### How identity is resolved

1. `src/components/auth/login-form.tsx` posts credentials + a `deviceData` block (built by `lib/device.ts`) to the app's own `POST /api/auth/login`.
2. `src/app/api/auth/login/route.ts` validates the body with Zod and calls `loginWithApi()` (`features/auth/server/api.ts`), which hits the backend `POST /api/v1/auth/login`.
3. On success it maps `result.userData` → `AuthUser` (`lib/map-user.ts`), stores `{ accessToken, expiresAt, user }` in the httpOnly cookie `next-elite.session`, and returns `{ user, message }` (the backend's `message`).
4. `getCurrentUser()` (server, request-cached) reads that cookie and returns the `AuthUser` (or `null` when missing/expired).
5. Role comes from `getRoleFromApiRoles(apiRoles)`:
   - any API role containing `ADMIN` (e.g. `SUPER_ADMIN`) → `admin`
   - otherwise → `user`

`POST /api/auth/logout` calls the backend logout, clears the cookie, and returns `{ ok, message }`. The cookie is `httpOnly`, `sameSite: lax`, `secure` in production, and its `maxAge` comes from the API's `expiresIn` (fallback 1 hour).

### Guards

Protection is enforced on the server by `src/features/auth/rbac/require.ts` (`requireUser` / `requirePermission`). The `(protected)/layout.tsx` calls `requireUser()` for the whole group:

```ts
// src/app/(protected)/layout.tsx
import { requireUser } from '@/features/auth/rbac/require';

const currentUser = await requireUser(); // redirects to '/' when anonymous
const userRole = hasPermission(currentUser.permissions, 'dashboard.view:admin')
  ? 'admin'
  : 'user';
// ...renders the matching @user / @admin slot
```

Each `(protected)` page additionally calls `requirePermission('dashboard.view:user' | 'dashboard.view:admin')`, which redirects to `/unauthorized` when the permission is missing. Both helpers are server-only (they call `redirect()`).

```ts
// src/features/auth/rbac/require.ts
export async function requireUser(redirectTo = '/') {
  /* getCurrentUser + redirect */
}
export async function requirePermission(
  permission,
  redirectTo = '/unauthorized',
) {
  /* requireUser + hasPermission */
}
```

Public auth pages do the inverse in the page itself (`if (user) redirect('/dashboard')`).

### Permission model

- Permissions are string literals in `rbac/permissions.ts` (`AuthPermission`).
- Role→permission mapping is `ROLE_PERMISSIONS` in `rbac/roles.ts`.
- Membership check is `hasPermission()` in `rbac/can.ts` (works client + server).
- Gate new UI with `useAuth().hasPermission(...)` (client, UX only) and `requirePermission(...)` (server, authoritative).

**Adding a permission / role** — full recipe in §21.3. Never hardcode a role check like `user.role === 'admin'` for authorization; check a **permission**.

### Toasts

Login and logout fire [sonner](https://sonner.emilkowal.ski/) toasts showing the **backend's `message`** when present, with the `auth.toast.*` keys as fallback. The login toast lives in `login-form.tsx`; the logout toast is fired inside `AuthProvider.signOut` (`auth-provider.tsx`) using the message returned by `POST /api/auth/logout`. The `<Toaster richColors />` is mounted once in `src/app/providers.tsx`.

### Social / OAuth login

**Not supported.** There are no Google/GitHub sign-in buttons, no social providers, and no `GOOGLE_*` env vars. To add an OAuth provider, add the provider's env vars (§21.7), a server route that exchanges the code, a client action in `auth-provider.tsx` (mirror `signIn`), and a translated button in `login-form.tsx`.

---

## 11. Internationalization (i18n) deep dive

- Library: `next-intl`, **cookie-based** (`NEXT_LOCALE`), no URL locales.
- **Locales:** `en` (default) and `hi` (Hindi). Both are LTR; the RTL plumbing still exists.
- Request config: `src/features/i18n/request.ts` (registered in `next.config.mjs`).
- Server: `getTranslations('namespace')` (from `next-intl/server`).
- Client: `useTranslations('namespace')` (from `next-intl`).
- Direction: `getLocaleDirection(locale)` from `src/features/site/config`; client helper `useIsRtl()`.
- Switching: `setLocaleAction(locale)` (server action) from `language-switcher.tsx` (renders `supportedLocales`, so it adapts automatically).
- Type safety: `src/global.d.ts` binds `Messages` to `messages/en.json` and `Locale` to `routing.locales`. A typo key fails `tsc`.

**Key naming convention:** dot-path namespaces matching UI area (`auth.login.title`, `auth.toast.logoutSuccess`, `common.toggleTheme`).

---

## 12. Styling, theming & design tokens

### Tailwind v4

- No `tailwind.config.js`. Configuration is **CSS-first** in `src/app/styles/tokens.css` via `@theme`.
- `globals.css` imports Tailwind, animations, the dark variant, then the three style files.
- Oxfmt **auto-sorts Tailwind classes** (using `globals.css`) inside `cn()`/`clsx()` and `cva()`. Don't fight the ordering.

### Tokens

Add or change colors only in `tokens.css` (`:root` and `.dark`), then expose them in the `@theme` block as `--color-*`. Common ones: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `border`, `input`, `ring`, `chart-1..5`, `sidebar*`.

Consume via utilities: `bg-background`, `text-muted-foreground`, `border-border/40`, `ring-ring/50`, `text-primary`, etc. **Never** use raw hex in components.

### Layout tokens

- `--app-header-height: 3.8125rem` → utility `h-app-header`, and `pt-app-header`. Use it for anything that must line up with the topbar.

### `cn()` and variants

- Always merge classes with `cn()` from `@/libs/utils`.
- Variant styling via `class-variance-authority` (`cva`) — see `button.tsx`, `badge.tsx`, etc.

### Dark mode & theme

- `.dark` class on `<html>`, driven by `ThemeProvider` (cookie `theme` + `localStorage`).
- `@custom-variant dark (&:where(.dark, .dark *))` in `globals.css`.
- Theme switch uses the View Transition API (see `styles/components.css`). `ThemeProvider` also paints browser safe-area chrome via `--browser-chrome-top`.
- `ThemeToggle` renders a neutral skeleton until mounted to avoid hydration mismatch. Follow that pattern for anything theme/browser-dependent.

### RTL

Use logical properties: `ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `border-s`, and `rtl:` variants where needed (e.g. the reset form's back arrow uses `rtl:rotate-180`). The base `.dark`/`dir` rules live in `base.css`.

---

## 13. Components & code conventions

**Naming**

- Files: `kebab-case.tsx` / `kebab-case.ts`.
- Components: `PascalCase`, default export for page-level/one-off components; **named exports** for reusable/`ui` components.
- Hooks: `use-something.ts`, exported `useSomething`.
- Tests: `<name>.test.ts(x)`.

**Server vs Client**

- Default: Server Component. Add `'use client'` at the very top only when using hooks/handlers/browser APIs/context.
- Data/providers live in `'use client'` files under `src/components/shared` or `src/features/**/hooks`.

**TypeScript**

- `verbatimModuleSyntax` is on → use `import type { X }` for type-only imports.
- `noUncheckedIndexedAccess` is on → guard array/index access (`arr[i] ?? fallback`, optional chaining).
- Prefer `interface` for props; use `React.ComponentProps<'tag'>` to extend DOM props (see `button.tsx`, `card.tsx`).
- No `any`. Prefer `unknown` + narrowing.

**Import order** (Oxfmt/sort handles most of it):

1. `'use client'` directive (if any, then blank line)
2. External packages
3. `@/` internal aliases
4. relative imports

**Component shape** (match neighbours):

```tsx
'use client';

import { cn } from '@/libs/utils';
import type { ReactNode } from 'react';

interface ThingProps {
  children: ReactNode;
  className?: string;
}

export function Thing({ children, className }: ThingProps) {
  return (
    <div className={cn('rounded-md border border-border/40', className)}>
      {children}
    </div>
  );
}
```

**Accessibility** — buttons need `type` and `aria-label` (icon-only) or text; inputs need a `Label htmlFor`; errors use `aria-invalid` + `InputError`. `aria-invalid` styling is wired in `button.tsx`/`input.tsx`.

---

## 14. Data fetching (TanStack Query)

- Provider: `QueryClientProvider` in `src/app/providers.tsx` using `getQueryClient()` from `@/libs/query-client`.
- Defaults: `staleTime 60s`, `gcTime 5min`, `refetchOnWindowFocus false`, `retry 1`. Override per query when needed.
- **Where hooks go:** create `src/features/<feature>/hooks/use-<thing>.ts` (or `api/`) with `useQuery`/`useMutation`. Keep fetch functions beside them.
- Server Components can fetch directly for initial render; use TanStack Query for client interactivity/caching, then hydrate if needed.
- Server-side calls to your backend **must** go through the global `@/libs/api` layer (§7.5): add the path to `api-urls.ts`, the function to `rest.ts`, the types to `types.ts`. It returns `ApiResult<T>` and never throws — branch with `isApiSuccess()`. There is **no** raw `fetch` for the backend anywhere else.

---

## 15. Forms & validation

- Schemas live in `src/features/<feature>/schemas/*.ts` (Zod). Export the schema **and** the inferred input type.
- Form components are `'use client'`, use `useForm<Input>({ resolver: zodResolver(schema), defaultValues })`.
- Use `handleSubmit`; on error use `error instanceof Error ? error.message : t('fallback')`.
- Inline errors: `<InputError message={errors.field?.message} />` with `aria-invalid={!!errors.field}`.
- There is also a shadcn `Form`/`FormField` API in `src/components/ui/form.tsx` for complex forms; the auth forms use the simpler `register(...)` approach — match whichever the surrounding code uses.

Reference implementations: `src/components/auth/login-form.tsx`, `src/components/auth/password-reset-form.tsx`.

---

## 16. Environment variables

Declared and validated in `src/libs/env.ts` (T3 Env + Zod). `.env.example` documents them.

**Current variables**

| Variable              | Scope  | Rule                                                                       |
| --------------------- | ------ | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | client | Public URL (SEO, absolute links). Optional.                                |
| `API_BASE_URL`        | server | Backend auth base URL. Defaults to `DEFAULT_API_BASE_URL`.                 |
| `SENTRY_DSN`          | server | Enables server Sentry.                                                     |
| `API_ENCRYPTION_KEY`  | server | Base64 32-byte key for the `{ encryptedData }` API layer (§7.5). Optional. |
| `SKIP_ENV_VALIDATION` | build  | Skips T3 validation (used by tests/lint/CI).                               |

> **Removed:** `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `AUTH_ADMIN_EMAILS` (no BetterAuth), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` (no OAuth) and `NEXT_PUBLIC_DEMO_MODE` (no demo module).

**Adding a variable (recipe in §21.7):** add to `env.ts` schema (+ `runtimeEnv` for client vars), add to `.env.example`, and (if it must reach the Docker build) add an `ARG`/`ENV` pair in `Dockerfile`.

> **Gotcha:** `src/instrumentation-client.ts` reads `process.env.NEXT_PUBLIC_SENTRY_DSN`, which is **not** in the T3 schema. If you enable client Sentry, add it to `env.ts` and `.env.example`.

---

## 17. SEO, PWA & agentic discovery

- **`src/features/site/site.config.json`** drives all metadata. Change branding/SEO there, not in `layout.tsx`.
- Root `metadata`/`viewport` and JSON-LD (Organization, WebApplication, Website) are built in `src/app/layout.tsx`; JSON-LD only renders when `baseUrl` is real (no `yourdomain.com`).
- `sitemap.ts` returns `[]` (auth-only app). `robots.ts` allows `/` and disallows `/api/`. `manifest.ts` uses `start_url: '/'`.
- `public/llms.txt` is the AI-crawler summary served at `/llms.txt`. Keep it in sync with the actual auth-only structure.
- Per-route metadata: add `export const generateMetadata` where useful.

---

## 18. Testing strategy

### Unit / component (Vitest + RTL)

- Config: `config/vitest.config.ts`. Setup: `config/vitest.setup.ts` (jest-dom, `localStorage`/`matchMedia` mocks, and a `next/navigation` mock).
- Test files are colocated **or** under `tests/` — both are picked up. Prefer colocating next to the unit under test; use `tests/` for cross-cutting suites.
- For components that need app context, use `renderWithProviders` from `@tests/utils/render`. Plain `@testing-library/react` `render` is fine for isolated primitives.
- `AuthProvider` seeds from `initialUser`; pass it when a test needs a user (there is no session polling anymore).
- `env` is mocked per-test where needed (see `src/features/auth/rbac/roles.test.ts`).

Run: `npm run test` (or `:watch`).

### E2E (Playwright)

- Config: `e2e/playwright.config.ts`, port 6767, waits on `/api/health`.
- Local: `npm run dev` is auto-started (all browsers). CI: production standalone build (Chromium only).
- Always `npm run playwright:install` once. On Linux, WebKit needs `npm run playwright:install:deps`.
- Stop your own `npm run dev` before `npm run e2e` (Playwright starts its own server).

---

## 19. Quality gates & git workflow

### Hooks (`lefthook.yml`)

- **pre-commit:** runs `oxlint --fix` then `oxfmt` on staged files and re-stages them.
- **commit-msg:** `commitlint` — Conventional Commits.
- **pre-push:** `npm run check`.

### CI

- `.github/workflows/check.yml`: typecheck → lint → knip → test → build (push & PR).
- `.github/workflows/playwright.yml`: build → E2E Chromium (push & PR).

### The one command that matters

```bash
npm run check   # typecheck && lint && knip && test
```

Green locally ⇒ green CI. Commit with a conventional message, e.g. `feat(auth): add password reset back button`.

### Knip specifics

- `knip.json` ignores `src/components/ui/**`.
- `ignoreDependencies` lists the UI-kit-only packages that are **still unreferenced** (`@radix-ui/react-accordion`, `…-checkbox`, `…-navigation-menu`, `…-popover`, `…-progress`, `…-radio-group`, `…-select`, `…-tabs`, `…-toggle`, `…-toggle-group`, `@tanstack/react-table`, `apexcharts`, `embla-carousel-react`, `input-otp`, `react-apexcharts`, `react-day-picker`, plus `tw-animate-css`, `tailwindcss`).
- The primitives the `(protected)` shell uses (`avatar`, `collapsible`, `dialog`, `separator`, `tooltip`, and `sidebar` → `use-mobile.ts`) were **removed** from the ignore lists so Knip watches them.
- When you wire up another of the ignored packages/primitives, remove it from `ignoreDependencies` too.

---

## 20. Docker & deployment

- `Dockerfile` is multi-stage: `node:22-alpine` deps → builder → **`gcr.io/distroless/nodejs22-debian12`** runner, non-root.
- Next builds `output: 'standalone'` (auto-skipped on Vercel). Only `.next/standalone`, `.next/static`, and `public` are copied.
- Runtime env baked at build time (must be `ARG`+`ENV`): `NEXT_PUBLIC_APP_URL`. Server-only vars come from `.env` at run time.
- `PORT=6767`, `HOSTNAME=0.0.0.0`. Healthcheck hits `/api/health`.
- `docker compose up --build` reads `.env` and maps `6767:6767`.
- Multi-arch: `docker buildx build --platform linux/amd64,linux/arm64 ...`.

> **Reminder:** `NEXT_PUBLIC_*` values are inlined at build time. To change them you must **rebuild** the image.

---

## 21. Recipes (step-by-step how-tos)

### 21.1 Add a page/route

1. Create `src/app/(auth)/<segment>/page.tsx` (public auth pages) or `src/app/(protected)/@user|@admin/<segment>/page.tsx` (protected pages).
2. Keep it thin. Typical shape:
   ```tsx
   import { getTranslations } from 'next-intl/server';
   import { requirePermission } from '@/features/auth/rbac/require';

   export default async function MyPage() {
     const [, t] = await Promise.all([
       requirePermission('dashboard.view:user'),
       getTranslations('myFeature'),
     ]);
     return <MyComponent title={t('title')} />;
   }
   ```
   For a public auth page, resolve identity with `getCurrentUser()` and `redirect('/dashboard')` when a user exists.
3. Move the real UI into `src/components/auth/...`, `src/components/shared/...`, or a feature.
4. Add translation keys to **both** `messages/en.json` and `messages/hi.json`.
5. Public route? add it to `sitemap.ts`.
6. `npm run check`; `npm run e2e` if it affects smoke flows.

### 21.2 Add a feature (vertical slice)

```
src/features/<feature>/
├── components/        UI specific to this feature
├── hooks/             use<Feature>() hooks (React Query, etc.)
├── lib/               service/api clients for this feature
├── schemas/           Zod schemas + inferred types
├── server/            server-only data access ('server-only')
├── types.ts
└── <name>.test.ts     colocated tests
```

Only create the folders you actually need. Then wire it into a route (§21.1). Ensure the feature is reachable so Knip stays green.

### 21.3 Add a permission or a role

**Permission:**

1. Add the literal to `AuthPermission` in `src/features/auth/rbac/permissions.ts`.
2. Map it to the role(s) in `ROLE_PERMISSIONS` in `roles.ts`.
3. Gate UI with `hasPermission(...)` / `useAuth().hasPermission(...)`; enforce on the server with `requirePermission(...)` (§10).
4. Add a test in `tests/auth/*` or the feature's `.test.ts`.

**Role:**

1. Add to the `UserRole` union (`permissions.ts`).
2. Add a `ROLE_PERMISSIONS` entry (`roles.ts`).
3. Update role resolution in `getRoleFromApiRoles` (`roles.ts`) if the new role needs its own rule.
4. Add UI/guard logic where the role is used.

### 21.4 Add a language/locale

1. Add the code to `languages.supported` **and** an entry under `languages.locales` in `src/features/site/site.config.json` (with `name`, `nativeName`, `locale`, `direction`).
2. Create `messages/<code>.json` mirroring `messages/en.json`.
3. Types update automatically (`global.d.ts`). Verify `npm run typecheck`.
4. No other code changes needed — the switcher and request config read `supportedLocales`.

Keep all locale files structurally identical; missing keys degrade UX and can surface raw key paths.

### 21.5 Add a UI primitive/component

- **Reusable, domain-agnostic** → `src/components/ui/<name>.tsx` (shadcn style: `data-slot`, `cva`, `cn`). Knip ignores `ui/**`.
- **Cross-app but opinionated** → `src/components/shared/<name>.tsx`.
- **Feature-specific** → `src/features/<feature>/components/<name>.tsx`.
- Export named (e.g. `export function Foo`).
- Add a `.test.tsx` for it.

### 21.6 Add a client data hook

1. Create `src/features/<feature>/hooks/use-<thing>.ts` (`'use client'` not required for a hook file unless it uses client-only APIs; hooks are client by usage).
2. Use `useQuery`/`useMutation` from `@tanstack/react-query`; keep the fetch fn nearby.
3. Consume in a `'use client'` component. Rely on the global defaults unless you have a reason to override.

### 21.7 Add an env var

1. Add to the correct group in `src/libs/env.ts` (server vs client) and to `experimental__runtimeEnv` if it is client-side.
2. Add it to `.env.example` with a comment.
3. If it is `NEXT_PUBLIC_*` and needed in Docker prod, add `ARG` + `ENV` in `Dockerfile`.
4. Reference it only via `env.X` (never `process.env.X` in app code) so validation applies.

### 21.8 Add an API route (route handler)

1. Create `src/app/api/<path>/route.ts`.
2. Export HTTP handlers (`export async function GET/POST/...`), return `Response.json(...)` / `NextResponse`.
3. Validate input with Zod; guard with `getCurrentUser()` (route handlers can't use `redirect()` the same way — return `401/403` responses).
4. Call the backend through `@/libs/api` (§7.5) and branch on `isApiSuccess()` — do **not** wrap it in `try/catch`, it never throws.
5. Add Playwright coverage if it is a public contract.

### 21.9 Add / remove a social login provider

1. Add the provider's env vars (§21.7) and a server route (`src/app/api/auth/<provider>/route.ts`) that completes the OAuth exchange and calls `setSessionCookie()` (§10).
2. Expose a client action in `src/features/auth/hooks/auth-provider.tsx` (mirror `signIn`).
3. Add the button + a translated label to `login-form.tsx` and both message catalogs.
4. To **remove** one, delete the button, the client action, the server route, the env vars, and any brand SVG icon.

### 21.10 Add a backend endpoint (the `@/libs/api` layer)

1. Add one line to `API_URLS` in `src/libs/api/api-urls.ts` (bare path, no `api/v1` prefix — that lives in `API_BASE_URL`), with the key named after the function you'll add.
2. Add a defaults object to `src/libs/api/responses.ts` and derive the type from it — that doubles as the "response me null" fallback.
3. Add its request fields to `ApiRequest` in `src/libs/api/requests.ts`.
4. Add one exported function in `src/libs/api/rest.ts` that calls `apiFetch(DEFAULTS, method, API_URLS.yourKey, body, options)` and returns `ApiResult<T>`. Pass the bearer token as `{ token }`.
5. Add a colocated test in `src/libs/api/*.test.ts`.
6. Consume it from a Server Component with `isApiSuccess(result)` — never from a client component (the layer is server-only).

---

## 22. "Where do I put this?" table

| I'm adding…                         | Put it in                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| A new public/auth page              | `src/app/(auth)/segment/page.tsx` (thin)                                            |
| A new protected page                | `src/app/(protected)/@user/segment/page.tsx` **and** `@admin/…`                     |
| The page's real UI                  | `src/components/auth/`, `src/components/shared/`, or `src/features/<f>/components/` |
| A reusable dumb primitive           | `src/components/ui/`                                                                |
| A cross-app shared widget           | `src/components/shared/`                                                            |
| A protected-shell piece             | `src/components/layout/`                                                            |
| A server-only guard                 | `src/features/auth/rbac/require.ts`                                                 |
| Domain logic / service / schema     | `src/features/<feature>/`                                                           |
| A server-only data helper           | `src/features/<feature>/server/` (mark `import 'server-only'`)                      |
| A shared app-wide hook              | `src/hooks/`                                                                        |
| Infra (env, query client, cn, http) | `src/libs/`                                                                         |
| A backend endpoint path             | `src/libs/api/api-urls.ts`                                                          |
| A backend call / method             | `src/libs/api/rest.ts` (returns `ApiResult<T>`)                                     |
| A **request** type                  | `src/libs/api/requests.ts`                                                          |
| A **response** type / envelope      | `src/libs/api/responses.ts`                                                         |
| Default-value / normalization logic | `src/libs/api/defaults.ts`                                                          |
| Transport plumbing (`ApiResult`, …) | `src/libs/api/types.ts`                                                             |
| A permission literal                | `src/features/auth/rbac/permissions.ts`                                             |
| A role→permission rule              | `src/features/auth/rbac/roles.ts`                                                   |
| A translation key                   | both `messages/en.json` and `messages/hi.json`                                      |
| A brand/SEO/locale value            | `src/features/site/site.config.json`                                                |
| A design color/token                | `src/app/styles/tokens.css`                                                         |
| A unit test                         | colocated `<name>.test.ts(x)` or `tests/`                                           |
| An E2E test                         | `e2e/*.spec.ts`                                                                     |
| A CI step                           | `.github/workflows/*.yml`                                                           |

---

## 23. Change checklist (definition of done)

Before you open a PR:

- [ ] `npm run check` passes (typecheck + lint + knip + test).
- [ ] New user-facing strings exist in **both** `messages/en.json` and `messages/hi.json`.
- [ ] Server code resolves identity via `getCurrentUser()`; any protected logic redirects server-side.
- [ ] Colors use tokens; layout uses logical (RTL-safe) utilities.
- [ ] New files are reachable (Knip green); no unused files/exports/deps.
- [ ] Tests added/adjusted for new behaviour.
- [ ] Public route added to `sitemap.ts` (there are none today).
- [ ] Env var added to `env.ts` + `.env.example` (+ `Dockerfile` if `NEXT_PUBLIC_*`).
- [ ] Commit message is Conventional (`feat:`, `fix:`, `docs:`, `chore:`, …).
- [ ] **This `AGENTS.md` updated if structure/commands/permissions/locales changed.**

---

## 24. Gotchas & CI landmines

1. **Knip is strict.** A new file that nothing imports will fail `npm run knip` unless it is an entry (a route/metadata file, or listed in `knip.json`). Colocated `.test.ts` and `src/components/ui/**` are fine.
2. **i18n type contract.** `global.d.ts` derives `Messages` from `messages/en.json`. Renaming/removing a key used in code breaks `tsc`; adding a key to only one locale silently leaves the other untranslated.
3. **`NEXT_PUBLIC_*` is build-time.** Changing it in a running Docker container does nothing — rebuild.
4. **`output: 'standalone'`** is disabled on Vercel automatically. Don't remove it; Playwright CI depends on it.
5. **Tailwind class sorting.** Oxfmt reorders classes inside `cn()`/`cva()`. Commit the sorted output; don't hand-order.
6. **`'use client'` leaks.** Putting it high up drags server components into the client bundle. Add it at the lowest possible node.
7. **Hydration.** Theme/browser-dependent UI must render a stable placeholder until mounted (see `ThemeToggle`, `TopLoader`).
8. **Port changes ripple.** `6767` is hardcoded in `package.json`, `playwright.config.ts`, and `Dockerfile`. Change all or none.
9. **`getCurrentUser` is cached per request** — don't rely on it re-reading the session mid-request.
10. **`noUncheckedIndexedAccess`** — array/index access is `T | undefined`. Handle it or TS fails.
11. **`verbatimModuleSyntax`** — type-only imports must use `import type`, or the build errors.
12. **Auth API lives under `/api/auth/*`** — don't add a conflicting route segment there.
13. **Client Sentry DSN mismatch** — `instrumentation-client.ts` reads `NEXT_PUBLIC_SENTRY_DSN` which isn't in the env schema (see §16).
14. **Two `Icon` components** — `@/components/icons/app-icons` (Phosphor, `name`) vs `@/components/ui/icon` (Lucide, `iconNode`). Import the right one.
15. **Knip ignores can hide real dead code.** If you start using a UI-kit dependency, drop it from `ignoreDependencies` (§19).
16. **Parallel-route slots need `default.tsx`.** Every `@user` / `@admin` slot (and the `(protected)` group) must keep its `default.tsx`, or hard navigation to a page without a matching slot file breaks.

---

## 25. Known inconsistencies / drift

These are real and worth fixing opportunistically (not blockers):

- `README.md` and `public/llms.txt` are marketing/summary docs that can lag the code; when in doubt this `AGENTS.md` wins.
- A few files use relative imports (`../../features/...`) instead of `@/` (e.g. `language-switcher.tsx`). Prefer `@/` in new code.
- Two role test files exist (`src/features/auth/rbac/roles.test.ts` and `tests/auth/roles.test.ts`) with overlapping intent.
- The full `src/components/ui/**` kit is retained; the `(protected)` shell uses a subset (sidebar/sheet/tooltip/breadcrumb/dialog/collapsible/avatar/dropdown-menu/separator), the rest are parked in Knip's `ignoreDependencies`.
- The `dashboard.view:*` RBAC permission names gate both the sidebar shell and every `(protected)` page, but you may want finer-grained permissions as the app grows.
- `deviceData` values are clamped to **80 characters** by the backend (`lib/device.ts`); watch that limit if you add fields or lengthen `model`.

---

## 26. Glossary

| Term                  | Meaning                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------- |
| **Route group**       | Folder in `()` that groups routes **without** affecting the URL: `(auth)` and `(protected)`. |
| **Parallel route**    | A `@slot` folder that renders a route as a prop of the parent layout (`@user` / `@admin`).   |
| **Guard**             | Server check (`requireUser` / `requirePermission`) that redirects when needed.               |
| **Permission**        | A string literal (`dashboard.view:admin`) checked by `hasPermission`.                        |
| **T3 Env**            | `@t3-oss/env-nextjs` — runtime-validated, typed environment variables.                       |
| **Knip**              | Dead-code/dependency detector gated in CI.                                                   |
| **Standalone output** | Next's self-contained server bundle used by the Docker image and Playwright CI.              |
| **Lefthook**          | Git-hook manager (pre-commit, commit-msg, pre-push).                                         |
| **View Transition**   | Browser API used for the radial theme-switch reveal.                                         |

---

_Last reviewed against the repository contents: Next Elite v2.1.0 (API auth + protected sidebar area, English + Hindi). Update this file whenever the structure, commands, permissions, locales, or conventions change._
