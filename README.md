# Ensure-Backend - Centinela API

This is the backend for **Centinela**.

Centinela is a fraud check system for a fintech app. It checks card transactions and transfers in near real time. It is built with Next.js App Router and Clean Architecture.

## Contents

- [Project Context](#project-context)
- [What This Service Does](#what-this-service-does)
- [Technology](#technology)
- [Architecture](#architecture)
- [Fraud Scoring Engine](#fraud-scoring-engine)
- [Data Model](#data-model)
- [Endpoints](#endpoints)
- [Requirements](#requirements)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [npm Scripts](#npm-scripts)
- [Security](#security)
- [CI/CD](#cicd)
- [Current State](#current-state)

## Project Context

A fintech app processes card transactions and transfers. Fraud can cost money if nobody sees it in time.

Centinela watches this flow. It decides which transactions look suspicious:

- **Low score**: the transaction continues.
- **High score**: the transaction is flagged. A fraud case is opened. A human analyst reviews the case.

The system uses clear rules. It does not use Machine Learning. It does not use a language model. Each rule adds points to a score. If the score is higher than a configured limit, the system opens a case.

The customer must not wait for the fraud analysis. The API saves the transaction and answers fast. The fraud check runs after that, using an event flow.

The transaction flow is:

```text
intake -> event -> scoring -> decision -> case -> explanation -> analyst review
```

## What This Service Does

This repository has the transaction intake layer and the fraud scoring engine.

- It receives transactions with `POST /api/transactions`.
- It uses rate limit control.
- It validates the request data.
- It saves the raw transaction.
- It answers fast with an accepted response.
- It sends a "transaction received" event after saving.
- It scores transactions with `POST /api/events/transactions`.
- It uses four fraud rules.
- It opens fraud cases when the score is high.
- It creates a clear text explanation from a fixed template.
- It uploads, downloads, deletes, and saves metadata for identity verification documents.
- It gets and lists transactions with pagination and filters.

## Technology

| Area | Tool |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) with App Router and API Route Handlers |
| Language | TypeScript 5 |
| UI | React 19 and Tailwind CSS 4 |
| Validation | Zod 4 |
| Relational database | Prisma 6 and PostgreSQL with Supabase |
| NoSQL database | Azure Cosmos DB |
| File storage | Azure Blob Storage |
| Logging | Pino |
| Lint | ESLint 9 |
| CI/CD | GitHub Actions and Azure App Service |

Use Node.js 20 or newer. The CI pipeline uses Node 25. The project does not set `engines` in `package.json`, so using the same major version as CI can help avoid problems.

## Architecture

The code uses Clean Architecture. Each layer has a clear job.

```text
Presentation: Next.js routes and rate limit
        |
Application: use cases and ports
        |
Repository interfaces
        |
Infrastructure: Cosmos DB, Prisma, Blob Storage, events
```

- `src/app/api/**`: Next.js route handlers. They receive HTTP requests and return HTTP responses.
- `src/application/`: use cases and ports. Ports are interfaces for storage and events.
- `src/domain/`: entities, value objects, and pure fraud rules.
- `src/infrastructure/`: real implementations for databases, storage, events, validation, and security.
- `src/main.ts`: dependency setup. It creates the use cases with the infrastructure classes.

### Where Data Lives

| Data | Store | Why |
|---|---|---|
| Transactions and scores | Azure Cosmos DB | Good for many writes and fast recent reads. |
| Fraud cases, rules, risky merchants, settings | PostgreSQL with Prisma | Good for relations, reports, and data integrity. |
| Identity verification documents | Azure Blob Storage | Good for binary files. |

See `docs/architecture-decision-record.md` and `docs/component-classification.md` for more details.

## Fraud Scoring Engine

The engine has four rules in `src/domain/fraud/rules.ts`.

Each rule saves the real detail that triggered it. This helps the explanation code create a readable text.

| Rule | What It Detects | Points |
|---|---|---|
| `HIGH_VELOCITY` | Too many transactions from one account in a short time. | 35 |
| `ATYPICAL_AMOUNT` | The amount is much higher than the account average. | 30 |
| `IMPOSSIBLE_LOCATION` | Two transactions need impossible travel speed. | 25 |
| `RISKY_MERCHANT` | The merchant or category is risky. | Variable |

Example explanation:

```text
Transaction flagged with score 82 (threshold: 60).
3 transactions in 4 minutes. (+35 points).
Amount is 84.00x over the account average. (+30 points).
Required travel speed is 48000 km/h. (+25 points).
```

The engine does not use default values. Before it scores a transaction, the table `fraud_settings` must have these positive number keys:

- `scoreThreshold`
- `velocityWindowMinutes`
- `velocityMaxTransactions`
- `atypicalAmountMultiplier`
- `atypicalAmountMinimumSamples`
- `impossibleTravelMaxKmh`
- `riskyMerchantDefaultPoints`

If one key is missing, the transaction gets the `FAILED` status. `POST /api/events/transactions` returns `503`. This is an explicit error.

The first values are in `docs/fraud-settings.sql`. The script only adds missing keys. It does not replace values changed by an admin.

## Data Model

The PostgreSQL models are in `prisma/schema.prisma`.

- `transactions`: relational copy of the transaction.
- `fraud_cases`: a case opened for a flagged transaction.
- `rule_executions`: rule details for a fraud case.
- `risk_merchants`: merchants or categories marked as risky.
- `fraud_settings`: configurable engine values.

## Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/transactions` | Receives a transaction, validates it, saves it, and sends an event. Returns `202` for new data or `200` for a duplicate. Returns `429` when the rate limit is passed. |
| `GET` | `/api/transactions?transactionId=&accountId=` | Gets one transaction. |
| `GET` | `/api/transactions?accountId=&status=&limit=&offset=` | Lists transactions with pagination and optional filters. |
| `POST` | `/api/events/transactions` | Runs the scoring engine for a received transaction. Opens a case when needed. Returns `503` if scoring settings are missing. |
| `POST` | `/api/storage/upload` | Uploads a verification document to Blob Storage and saves metadata. Supports PDF, JPG, PNG, and CSV up to 10 MB. |
| `GET` | `/api/storage/download?id=&accountId=` | Downloads a document file. |
| `DELETE` | `/api/storage/delete?id=&accountId=` | Deletes the blob and marks metadata as `DELETED`. |
| `POST` / `GET` | `/api/documents/metadata` | Creates or reads document metadata. |

## Requirements

- Node.js 20 or newer.
- npm.
- A PostgreSQL database. This project uses Supabase.
- An Azure Cosmos DB database and containers.
- An Azure Storage Account with a Blob Storage container.
- Optional: an HTTP endpoint for the "transaction received" webhook.

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/Ensure-Azure/Ensure-Backend.git
cd Ensure-Backend

# 2. Install dependencies
npm install
```

Create a `.env` file in the project root. Add the variables from [Environment Variables](#environment-variables).

```bash
# 3. Generate the Prisma client
npx prisma generate

# 4. Sync the schema with the database
npx prisma db push

# 5. Start the development server
npm run dev
```

The API runs at `http://localhost:3000`.

Before scoring transactions, run `docs/fraud-settings.sql` in the database. Without these values, the scoring engine rejects the process.

## Environment Variables

The variables are checked in `src/config/env.ts` with Zod. Secrets are not stored in the code.

| Variable | Use |
|---|---|
| `DATABASE_URL` | PostgreSQL connection for Prisma. |
| `DIRECT_URL` | Direct PostgreSQL connection for Prisma commands like `db push` and `generate`. |
| `COSMOS_ENDPOINT`, `COSMOS_KEY`, `COSMOS_DATABASE_ID`, `COSMOS_CONTAINER_ID`, `COSMOS_DOCUMENTS_CONTAINER_ID` | Azure Cosmos DB settings for transactions and document metadata. |
| `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER_NAME` | Azure Blob Storage settings for verification documents. |
| `TRANSACTION_EVENT_WEBHOOK_URL` | Optional URL for the transaction received event. If it is not set, the publisher does nothing. |
| `NODE_ENV` | `development`, `test`, or `production`. |

## npm Scripts

```bash
npm run dev     # start the development server
npm run build   # create a production build
npm run start   # start the production build
npm run lint    # run ESLint
```

## Security

- Rate limit: `POST /api/transactions` accepts up to 60 requests from one origin in 60 seconds. The origin uses `X-Forwarded-For`. If the limit is passed, the API returns `429 Too Many Requests`.
- Secrets: credentials are not in the code or in the repository. Local development uses `.env`. CI/CD uses GitHub Actions Secrets.
- Explicit errors: if scoring settings are missing, the system returns `503`. It does not use silent default values.

More detail is in `docs/security-controls.md`.

## CI/CD

The pipeline is in `.github/workflows/deploy.yml`.

On each push to `main`, GitHub Actions:

- Installs dependencies with `npm ci`.
- Generates the Prisma client.
- Builds the project.
- Uses environment variables from GitHub Secrets.
- Deploys to Azure App Service `appservicecentineladev`.

## Current State

This repository has:

- Transaction intake with rate limit.
- Fraud scoring with four rules.
- Deterministic explanation text.
- Verification document storage and metadata.

These items are not implemented in this repository yet:

- A managed queue or topic for guaranteed event delivery. Today it uses an HTTP webhook.
- Automatic document data extraction.
- Container scaling.
- Distributed tracing and observability.
- A complete dashboard. `src/app/dashboard` is still a placeholder page.

These items can be part of other Centinela components or future work. See `ensure-infrastructure` for infrastructure as code.
