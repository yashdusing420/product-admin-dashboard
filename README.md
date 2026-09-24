# Pivotal Product Admin Dashboard

## Overview

Pivotal is a responsive product administration dashboard built with the Next.js App Router. It uses DummyJSON for authentication, catalog reads, categories, and simulated product mutations.

## Tech stack

- Next.js 16.3.6 with the App Router
- React 19.3.0
- TypeScript
- Tailwind CSS 3.4.17
- Axios 1.20.0 (one shared instance in `src/lib/api.ts`)
- DummyJSON API

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Demo credentials:

- Username: `emilys`
- Password: `emilyspass`

Production build and start:

```bash
npm run typecheck
npm run build
npm start
```

## API and architecture

All API calls go through the single Axios instance in `src/lib/api.ts`. Its request interceptor attaches the session Bearer token, and its response interceptor clears the session and redirects on a 401. Authentication, product, and category calls live in separate service modules under `src/lib/services/`; UI components do not call Axios directly.

The application uses:

- `POST /auth/login`
- `GET /products?limit=10&skip=0&sortBy=title&order=asc`
- `GET /products/search?q=...&limit=10&skip=0&sortBy=title&order=asc`
- `GET /products/category/:category?limit=10&skip=0&sortBy=title&order=asc`
- `GET /products/categories`
- `GET /products/:id`
- `POST /products/add`
- `PUT /products/:id`
- `DELETE /products/:id`

## URL state, search, filtering, and sorting

The product list keeps `search`, `category`, `sortBy`, `order`, `page`, and `limit` in the URL. Invalid page and limit values are normalized safely. Normal products, search-only results, and category-only results use DummyJSON pagination directly: `skip = (page - 1) * limit`, with the API response `total` driving the page count and range text. Page sizes are limited to 10, 20, and 50. Sorting by title, price, and rating is sent through DummyJSON's `sortBy` and `order` parameters.

Search updates the URL immediately, waits 450ms before loading, aborts the previous request, and uses a monotonically increasing request version so a stale response cannot overwrite the newest search. Categories are loaded dynamically from `/products/categories`.

DummyJSON has no combined search-and-category endpoint. When both filters are active, the dashboard requests the search result with `limit=0`, filters that result locally by category, then applies the session mutation overlay, sorts, and paginates the final result set in the browser. This avoids fetching the entire global product dataset, but true server-side pagination for the combined filters is impossible with DummyJSON because neither available endpoint accepts both constraints.

## DummyJSON mutation limitation

DummyJSON's POST, PUT, and DELETE calls are simulated and are not permanently persisted by the API. After a successful mutation, Pivotal stores a session overlay in `sessionStorage` containing created, updated, and deleted products. The overlay is applied to catalog reads and detail routes, so navigation and refresh in the current browser session remain consistent without claiming that DummyJSON has permanent storage.

## Project structure

```text
src/
  app/
    login/
    products/
      [id]/
        edit/
      add/
    layout.tsx
  components/
    ProductCard.tsx
    ProductForm.tsx
    Pagination.tsx
    ConfirmModal.tsx
    ui.tsx
  lib/
    api.ts
    session.ts
    services/
      auth.ts
      products.ts
  types/
    product.ts
```

## Completed features

- Protected login and logout flow
- Shared Axios client with auth and centralized 401 handling
- Responsive desktop table and mobile product cards
- API-based pagination with `limit` and `skip`, plus 10, 20, and 50 row options
- Debounced, stale-safe search
- Dynamic category loading
- Search + category behavior documented above
- URL-backed sorting, filtering, and pagination
- Product details, image gallery, reviews, and not-found state
- Add, edit, and delete flows with validation, confirmation, and duplicate-submit protection
- Session overlay for simulated DummyJSON mutations
- Loading, empty, API error, retry, and product not-found states

## Technical challenge and solution

The central challenge is combining API-based pagination with DummyJSON's missing combined search-and-category endpoint. Ordinary, search-only, and category-only views request only the active page using `limit` and `skip`; the combined case uses the search endpoint with `limit=0`, applies the category filter locally, and then applies sorting and pagination once to the final result set. DummyJSON mutations do not persist, so the browser-session overlay keeps created, edited, and deleted products consistent during the session. Request cancellation plus request versioning protects the debounced search UI from delayed responses arriving out of order. Loading, empty, API error, retry, and product not-found states keep the UI usable throughout.

## AI assistance

AI assistance was used to scaffold the application, implement the requested UI and service architecture, and review the assignment requirements. The implementation was manually checked against the brief and verified with TypeScript and the Next.js production build.