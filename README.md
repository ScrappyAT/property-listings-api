# Property Listings API

A REST API for Nigerian property listings, built as a Product Engineering Bootcamp engineering task. It exposes realistic property data backed by PostgreSQL, and ships with a separate, dependency-free consumer app that proves the API is independently consumable.

## Live Deployment

| Resource | URL |
|---|---|
| API Base URL | https://property-listings-api.vercel.app |
| Health Check | https://property-listings-api.vercel.app/health |
| Consumer App | https://property-listings-consumer.vercel.app |

The consumer is a separate frontend deployment that fetches from the live API URL, not from localhost.

## Features

- Versioned REST API under `/api/v1`
- PostgreSQL database with UUID identifiers and foreign-key relationships
- Realistic Nigerian property data (Lagos, Abuja, Port Harcourt, Ibadan, Enugu, Kano)
- Four related resources: agents, properties, images, inquiries
- Server-side pagination (`limit` / `offset`) with `hasMore` metadata
- Filtering on properties, agents, images and inquiries
- Allowlisted sorting fields and sort order
- Input validation with Zod before creating inquiries
- Consistent JSON success and error envelopes
- Configurable API rate limiting with a JSON 429 response
- CORS enabled (development-friendly, all-origin)
- Publicly deployed API and a separate consumer app

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (compiled for Node.js) |
| Runtime | Node.js |
| Framework | Express 5 |
| Database | PostgreSQL via `pg` (node-postgres) |
| Validation | Zod 4 |
| Seed data | Faker (`@faker-js/faker`) with Nigerian locale |
| Rate limiting | `express-rate-limit` |
| CORS | `cors` |
| Hosting | API on Vercel, PostgreSQL on Neon |
| Consumer | Plain HTML, CSS, vanilla JavaScript |

## Resource Design

All resources use UUID primary keys and expose camelCase JSON fields.

### Agent

Represents an individual responsible for listing properties on the platform.

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Unique generated identifier |
| name | String | No | Full name of the agent |
| email | String | No | Contact email address (unique) |
| phone | String | No | Contact phone number |
| agencyName | String | Yes | Agency the agent represents |
| city | String | No | Primary operating city |
| state | String | No | Primary operating state |
| createdAt | DateTime | No | Record created timestamp |
| updatedAt | DateTime | No | Record last-updated timestamp |

### Property

Represents a property listed by an agent for sale or rent.

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Unique generated identifier |
| agentId | UUID | No | Agent who listed the property |
| title | String | No | Listing title |
| description | String | No | Detailed description |
| propertyType | Enum | No | `apartment`, `house`, `duplex`, `land` |
| listingType | Enum | No | `sale`, `rent` |
| price | Integer (BIGINT) | No | Listing price in Naira (NGN) |
| bedrooms | Integer | Yes | Number of bedrooms (null for land) |
| bathrooms | Integer | Yes | Number of bathrooms (null for land) |
| address | String | No | Street address |
| city | String | No | City of the property |
| state | String | No | State of the property |
| status | Enum | No | `available`, `sold`, `rented`, `unavailable` |
| createdAt | DateTime | No | Record created timestamp |
| updatedAt | DateTime | No | Record last-updated timestamp |

### Image

Represents an image associated with a property listing.

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Unique generated identifier |
| propertyId | UUID | No | Property the image belongs to |
| url | String | No | Image URL |
| altText | String | Yes | Alternative text |
| isPrimary | Boolean | No | Whether this is the primary image |
| createdAt | DateTime | No | Record created timestamp |

### Inquiry

Represents an expression of interest submitted for a property.

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | No | Unique generated identifier |
| propertyId | UUID | No | Property the inquiry relates to |
| name | String | No | Name of the inquirer |
| email | String | No | Email address of the inquirer |
| phone | String | Yes | Contact phone number |
| message | String | No | Inquiry message |
| createdAt | DateTime | No | Record created timestamp |
| updatedAt | DateTime | No | Record last-updated timestamp |

### Relationships

```
Agent  1 ──── * Property
Property 1 ──── * Image
Property 1 ──── * Inquiry
```

## API Response Format

Successful collection responses use an envelope with `data` and `meta.pagination`:

```json
{
  "success": true,
  "data": [
    {
      "id": "8cb91603-6307-41ca-b681-0fdc5fc58843",
      "agentId": "1a233132-030c-4633-8a6a-791e94c74cf4",
      "title": "Newly Built 5 Bedroom Terraced Duplex in Oluyole Estate - For Sale",
      "propertyType": "duplex",
      "listingType": "sale",
      "price": 95000000,
      "bedrooms": 5,
      "bathrooms": 4,
      "city": "Ibadan",
      "state": "Oyo",
      "status": "available"
    }
  ],
  "meta": {
    "pagination": {
      "total": 500,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

Single-resource responses return the resource directly under `data`.

Error responses use a consistent error envelope:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Property not found."
  }
}
```

Validation errors add a `details` array with per-field messages:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body validation failed.",
    "details": [
      { "field": "email", "message": "Invalid email format." }
    ]
  }
}
```

## API Endpoints

All API endpoints are versioned under `/api/v1`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Health check (returns `{"status":"ok"}`) |
| GET | `/api/v1/properties` | List properties |
| GET | `/api/v1/properties/:id` | Fetch a single property by UUID |
| GET | `/api/v1/agents` | List agents |
| GET | `/api/v1/agents/:id` | Fetch a single agent by UUID |
| GET | `/api/v1/images` | List images |
| GET | `/api/v1/images/:id` | Fetch a single image by UUID |
| GET | `/api/v1/inquiries` | List inquiries |
| GET | `/api/v1/inquiries/:id` | Fetch a single inquiry by UUID |
| POST | `/api/v1/inquiries` | Create an inquiry |

Only the endpoints listed above exist. There is no public endpoint for updating or deleting resources.

### GET /api/v1/properties

Query parameters:

| Parameter | Values | Default | Description |
|---|---|---|---|
| limit | Positive integer, max 100 | 20 | Number of records to return (clamped to 100) |
| offset | Non-negative integer | 0 | Number of records to skip |
| city | String | - | Exact-match city filter |
| state | String | - | Exact-match state filter |
| propertyType | `apartment`, `house`, `duplex`, `land` | - | Type filter |
| listingType | `sale`, `rent` | - | Listing type filter |
| status | `available`, `sold`, `rented`, `unavailable` | - | Status filter |
| sort | `price`, `createdAt`, `bedrooms`, `bathrooms` | `createdAt` | Sort field |
| order | `asc`, `desc` | `desc` | Sort order |

### GET /api/v1/agents

Query parameters: `limit`, `offset`, `city`, `state`, `sort` (`name`, `createdAt`), `order`.

### GET /api/v1/images

Query parameters: `limit`, `offset`, `propertyId` (UUID), `isPrimary` (`true`/`false`), `sort` (`createdAt`), `order`.

### GET /api/v1/inquiries

Query parameters: `limit`, `offset`, `propertyId` (UUID), `sort` (`createdAt`, `updatedAt`), `order`.

## Pagination

All collection endpoints paginate server-side.

| Field | Meaning |
|---|---|
| `limit` | Records per page (default 20; maximum 100; higher values are clamped to 100) |
| `offset` | Number of records to skip (default 0; must be non-negative) |
| `total` | Total number of matching records |
| `hasMore` | Whether another page exists after the current one |

Example — the second page of 5 properties:

```
GET /api/v1/properties?limit=5&offset=5
```

## Filtering

Properties can be filtered by exact match on `city`, `state`, `propertyType`, `listingType` and `status`. Multiple filters combine with AND.

Example — rental properties in Lagos:

```
GET /api/v1/properties?city=Lagos&listingType=rent&limit=5
```

## Sorting

Properties support sorting by `price`, `createdAt`, `bedrooms` or `bathrooms` in `asc` or `desc` order (default `createdAt desc`). Invalid sort fields or orders are rejected with a 400 response.

Example — most expensive properties first:

```
GET /api/v1/properties?sort=price&order=desc&limit=5
```

## Creating an Inquiry

```
POST /api/v1/inquiries
```

Request body (validated with Zod; the schema is strict, so unknown fields are rejected):

| Field | Required | Rules |
|---|---|---|
| propertyId | Yes | Must be a valid UUID |
| name | Yes | 1–255 characters |
| email | Yes | Valid email format, 1–255 characters |
| phone | No | 1–50 characters; omitted or null means no phone |
| message | Yes | Non-empty string |

Request example:

```json
{
  "propertyId": "8cb91603-6307-41ca-b681-0fdc5fc58843",
  "name": "Ada Obi",
  "email": "ada.obi@example.com",
  "phone": "08031234567",
  "message": "Hello, is this property still available?"
}
```

- Invalid request bodies return `422` with `code: VALIDATION_ERROR` and a `details` array.
- A propertyId that is a valid UUID but does not exist returns `404` with `code: NOT_FOUND`.
- A successful creation returns `201` with the created inquiry under `data`.

## Validation and Error Handling

Confirmed behavior:

| Case | Status | Code |
|---|---|---|
| Negative or non-numeric `limit` / `offset` | 400 | `INVALID_QUERY` |
| Invalid `sort` field or `order` | 400 | `INVALID_QUERY` |
| Invalid `isPrimary` value on images | 400 | `INVALID_QUERY` |
| Malformed UUID in a path parameter | 400 | `INVALID_ID` |
| Well-formed UUID with no matching record | 404 | `NOT_FOUND` |
| Invalid inquiry request body | 422 | `VALIDATION_ERROR` |
| Inquiry for a nonexistent property | 404 | `NOT_FOUND` |
| Unknown route | 404 | `NOT_FOUND` |

## Rate Limiting

All `/api/v1` routes sit behind an `express-rate-limit` middleware.

| Environment variable | Default | Meaning |
|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | `60000` | Window duration in milliseconds |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

When the limit is exceeded the API returns `429` with a JSON body (`code: RATE_LIMIT_EXCEEDED`) and a `Retry-After` header. The limiter uses in-memory storage, so it is per-application-instance rather than globally distributed across instances.

## Seed Data

`npm run db:seed` repeats deterministically-styled demo data:

- 250 agents
- 500 properties
- 1000 images
- 600 inquiries

Before inserting, the seed truncates the seedable resource tables (`inquiries`, `images`, `properties`, `agents`) and restarts their identities, so rerunning the seed does not duplicate records.

> **Warning:** the seed is destructive — it clears existing rows in those tables before inserting fresh data. Do not casually run it against a production database that contains real submissions.

## Local Setup

```powershell
git clone <repository-url>
cd property-listings-api
npm install
Copy-Item .env.example .env
# edit .env and set DATABASE_URL to point at a local PostgreSQL database
npm run db:migrate
npm run db:seed
npm run dev
```

The development server runs on `http://localhost:3000` (override with `PORT`).

- `npm run build` compiles TypeScript to `dist/`; `npm start` runs the compiled server.
- On Windows, if PowerShell blocks `npm.ps1` scripts due to an execution policy, use the `npm.cmd` equivalents (for example `npm.cmd install`, `npm.cmd run dev`).

No real database credentials are included anywhere in this repository.

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port for the local development server |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

`NODE_ENV` is also read: when set to `production`, Express is configured to trust the immediate proxy (needed behind Vercel so rate limiting sees real client IPs). Values are never committed; copy `.env.example` to `.env` for local use.

## Example Requests

All examples target the public deployment.

```powershell
# Health check
curl.exe https://property-listings-api.vercel.app/health

# Paginated properties (page 2 of 5)
curl.exe "https://property-listings-api.vercel.app/api/v1/properties?limit=5&offset=5"

# Filtered properties (rental properties in Lagos)
curl.exe "https://property-listings-api.vercel.app/api/v1/properties?city=Lagos&listingType=rent&limit=5"

# Sorted properties (most expensive first)
curl.exe "https://property-listings-api.vercel.app/api/v1/properties?sort=price&order=desc&limit=5"

# Agents
curl.exe "https://property-listings-api.vercel.app/api/v1/agents?limit=5"

# Creating an inquiry
$body = '{"propertyId":"8cb91603-6307-41ca-b681-0fdc5fc58843","name":"Ada Obi","email":"ada.obi@example.com","message":"Is this property still available?"}'
curl.exe -X POST "https://property-listings-api.vercel.app/api/v1/inquiries" `
  -H "Content-Type: application/json" `
  -d $body
```

## Consumer App

`consumer/` contains a minimal, dependency-free frontend built with plain HTML, CSS and vanilla JavaScript. It fetches the live deployed API and demonstrates that the API is consumable from a separate application:

- displays property listings as cards
- filters by city and listing type using the API's query parameters
- uses server-side offset pagination (page size 6, driven by `hasMore`)
- formats prices as Nigerian Naira (NGN) with `Intl.NumberFormat`
- handles loading, empty and error states

Public URL: https://property-listings-consumer.vercel.app

See `consumer/README.md` for details.

## Design Decisions

- **UUID identifiers** instead of sequential public IDs reduce enumeration risk and are generated at the database level.
- **PostgreSQL `BIGINT` prices** because Nigerian property prices can far exceed ordinary 32-bit integer ranges.
- **Parameterized SQL queries** — all database access uses `$1`-style bound parameters to prevent SQL injection.
- **Allowlisted sort fields** — sort input maps to a fixed set of columns rather than passing user input into `ORDER BY`.
- **Server-side pagination** rather than returning the entire dataset, so the API stays responsive with 500+ properties.
- **Repeatable/destructive seed strategy** for development and demo data — truncates resource tables and re-inserts known counts.
- **Separate consumer app** to prove the API is independently consumable from another origin.

## Deployment

- The API is deployed on **Vercel** as a single Express application (Fluid compute).
- PostgreSQL is hosted on **Neon** and reached over a TLS-required connection string.
- `DATABASE_URL` (and rate-limit overrides, if any) are configured as Vercel environment variables.
- Migrations and the seed were run **once** against the production database; they do not run automatically on deployment.
- The consumer is deployed separately on Vercel from the `consumer/` root directory.

No credentials appear in this repository.

## Testing / Evidence

The following behaviors were manually verified against the deployed API:

- `GET /health` returns `{"status":"ok"}`
- property collection returns production seed data with pagination metadata
- pagination works (`limit`, `offset`, `total`, `hasMore`)
- `limit` above 100 is clamped to 100
- filtering by `city` and `listingType` returns only matching records
- sorting by `price desc` returns expected ordering
- negative `offset` returns `400 INVALID_QUERY`
- invalid `sort` field returns `400 INVALID_QUERY`
- malformed property UUID returns `400 INVALID_ID`
- well-formed but missing property UUID returns `404 NOT_FOUND`
- agents endpoint returns data
- the consumer app successfully loads the live API

No automated test suite is included. Submission screenshots, if desired, can be kept separately outside the repository.

## Project Structure

```
property-listings-api/
├── consumer/                 # dependency-free frontend demo consumer
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── README.md
├── src/
│   ├── app.ts                # Express app setup (CORS, routes, 404, error handler)
│   ├── server.ts             # local server entry (listen)
│   ├── config/               # env-derived configuration
│   ├── db/
│   │   ├── index.ts          # pg connection pool
│   │   ├── migrate.ts        # SQL migration runner
│   │   ├── seed.ts           # repeatable demo seed
│   │   └── migrations/       # SQL migration files
│   ├── middleware/           # rate limiter, error handler
│   ├── utils/errors.ts       # AppError
│   └── modules/              # properties, agents, images, inquiries
│       └── <resource>/       # router, controller, service, types
├── .env.example
├── package.json
└── tsconfig.json
```

## Security / Production Notes

- Secrets are supplied through environment variables, never hardcoded.
- `.env` is gitignored and not committed.
- SQL values are parameterized (bound parameters).
- Sort fields are allowlisted; unknown fields/orders are rejected.
- Input validation runs before inquiry creation (Zod).
- CORS is enabled to allow the public consumer use case.
- Production traffic runs over HTTPS in front of Express's proxy configuration.

This project was built as a Product Engineering Bootcamp engineering task.