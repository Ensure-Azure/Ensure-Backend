# Architecture Decision Record (ADR)

## ADR-001

### Title

Use Azure Cosmos DB for Transaction Storage

### Status

Accepted

---

## Context

Financial transactions require:

- High availability
- Fast read and write operations
- Horizontal scalability
- Idempotent requests

A relational database was not the best option for this workload.

---

## Decision

Transaction persistence will be implemented using Azure Cosmos DB.

Application code interacts only with the TransactionRepository interface.

The infrastructure layer provides the CosmosTransactionRepository implementation.

---

## Consequences

### Advantages

- Horizontal scalability
- Low latency
- Native JSON storage
- High availability
- Flexible schema
- Easy partitioning

### Trade-offs

- Complex SQL joins are not available.
- Reporting is better suited for relational databases.

---

## Related Decisions

### ADR-002

Keep Prisma + Supabase PostgreSQL for relational data.

Examples:

- Users
- Roles
- Accounts
- Permissions

---

### ADR-003

Store transaction evidence in Azure Blob Storage.

Examples:

- Images
- PDFs
- Receipts
- Attachments

---

### ADR-004

Use Clean Architecture.

Layer separation:

Presentation

↓

Application

↓

Repository Interfaces

↓

Infrastructure

↓

Azure Services

---

## Current Architecture

Next.js API

↓

Clean Architecture

↓

Application Layer

↓

Infrastructure

↓

Azure Cosmos DB

Azure Blob Storage

Supabase PostgreSQL