# Property Listings Demo Consumer

A tiny, dependency-free browser consumer that proves a separate application can consume the deployed Property Listings API.

It uses plain HTML, CSS, and vanilla JavaScript only. No frameworks, no build step, no backend, no secrets.

## What it demonstrates

- **Listing** — fetches the live property feed and renders property cards (title, property/listing type, status, price, bedrooms, bathrooms, city, state).
- **Filtering** — filters against the API's real query parameters: `city` (exact match) and `listingType` (`sale` / `rent`).
- **Pagination** — uses the API's `limit` and `offset` parameters (page size 6) and drives the Previous/Next buttons from the API's `meta.pagination.hasMore` metadata. It never downloads all records and paginates client-side.
- **States** — loading, empty-results, and error states.
- **Currency** — prices formatted as Nigerian Naira (`NGN`) via `Intl.NumberFormat`.

## API consumed

- Live base URL: `https://property-listings-api.vercel.app`
- Endpoint used: `GET https://property-listings-api.vercel.app/api/v1/properties`
- Query parameters used: `limit`, `offset`, `city`, `listingType`

All requests are built with `URLSearchParams` and `fetch()`.

## Running locally

The consumer is static and needs no server-side backend. Any of these work:

1. Serve the `consumer/` directory with a tiny static server, then open the printed URL. For example with `npx`:

   ```
   npx serve consumer
   ```

   or with Python:

   ```
   python -m http.server 8080 --directory consumer
   ```

   then open `http://localhost:8080`.

2. Open `consumer/index.html` directly in a browser by double-clicking it (the live API returns `Access-Control-Allow-Origin: *`, so file:// pages may also fetch it).

## Notes

- The city dropdown lists the cities present in the seeded API data (`Abuja`, `Enugu`, `Ibadan`, `Kano`, `Lagos`, `Port Harcourt`). The API matches `city` exactly.
- `bedrooms`/`bathrooms` are `null` for land listings and are rendered as `-`.
- Only the public API URL appears in the frontend code; no credentials are used.