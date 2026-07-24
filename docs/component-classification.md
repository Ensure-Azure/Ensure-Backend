# Component Classification Table

## Overview

The Centinela backend follows the principles of Clean Architecture, separating responsibilities into independent layers.

| Component | Layer | Responsibility |
|----------|---------|----------------|
| Route Handlers | Presentation | Receive HTTP requests and return responses. |
| Validation Schemas | Infrastructure | Validate incoming request data using Zod. |
| Use Cases | Application | Execute business rules and orchestrate the application flow. |
| Repository Interfaces | Application | Define persistence contracts. |
| CosmosTransactionRepository | Infrastructure | Persist and retrieve transaction data from Azure Cosmos DB. |
| Blob Storage Service | Infrastructure | Upload and retrieve transaction evidence files. |
| Domain Models | Domain | Represent business entities and rules. |
| Cosmos Mapper | Infrastructure | Convert domain entities to Cosmos DB documents. |
| Environment Configuration | Configuration | Manage application environment variables. |

---

## Dependency Flow

Presentation

↓

Application

↓

Repository Interface

↓

Infrastructure

↓

Azure Services

---

## Azure Services

- Azure Cosmos DB
- Azure Blob Storage
- Supabase PostgreSQL (through Prisma)

---

## Benefits

- Separation of concerns
- Testability
- Easy replacement of infrastructure
- Maintainability
- Scalability