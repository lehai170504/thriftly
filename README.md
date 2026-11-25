# Thriftly

Thriftly is a second-hand and vintage fashion/lifestyle e-commerce platform combining **Buy-Now**, **Real-time Auctions (STOMP WebSocket)**, **Live Commerce (Agora RTC)**, **Escrow Wallet Payments (PayOS)**, **1-to-1 Real-time Chat**, and **Logistics Tracking (GHN)**.

---

## Key Features

1. **Real-Time Auctions & Live Commerce**
   - Live auction rooms with real-time bidding and countdown updates over **STOMP WebSocket** (`/ws/auction`).
   - Automated auction settlement with pessimistic database locking (`FOR UPDATE`) and deposit tracking (`auction_deposits`).
   - **Agora RTC** live streaming integration with floating live widget and real-time live chat.

2. **Escrow Wallet & PayOS Integration**
   - Server-authoritative **PaymentIntent** checkout flow integrated with **PayOS** and HMAC-verified webhooks (`/api/v1/payment/payos/webhook`).
   - Centralized ledger commands in `WalletService` with database `CHECK` constraints (`balance >= 0`, `held_balance >= 0`) and atomic escrow hold, release, and dispute refund transitions.
   - Multi-wallet deadlock avoidance using deterministic lock ordering and **Bucket4j** rate limiting.

3. **Security & Session Architecture**
   - **Spring Session backed by Redis** with `HttpOnly` session cookies (`THRIFTLY_SESSION`), session fixation rotation, idle (`30m`) and absolute (`12h`) timeouts, and single/all-device logout (`/api/v1/auth/logout-all`).
   - Cookie-backed CSRF protection (`XSRF-TOKEN` / `X-XSRF-TOKEN`) and explicit credentialed CORS allowlists.
   - Role-based (`USER`, `STAFF`, `ADMIN`) and resource-ownership authorization across REST endpoints and STOMP WebSocket destinations, plus optional admin/staff 2FA via email OTP and Google / Facebook OAuth login.

4. **Real-Time 1-to-1 Chat & Notifications**
   - Messenger-style 1-to-1 chat over STOMP WebSocket with read receipts (`isRead`), one-way soft deletion, and media uploads validated by MIME/magic-bytes via **Cloudinary**.
   - Transactional `afterCommit` notifications so rolled-back actions never emit phantom alerts.

5. **AI Assistance, Logistics & Operations**
   - OpenAI-compatible AI integration (configured by default for **Groq / LLaMA 3**) for price and listing assistance.
   - **Giao Hang Nhanh (GHN)** logistics integration and token-authenticated shipping webhooks (`/api/v1/webhooks/**`).
   - Admin & Staff operational portal (disputes, withdrawals, user management, categories, vouchers, revenue analytics, and audit logs).
   - Spring Boot Actuator (`/actuator/health/liveness`, `/actuator/health/readiness`, `/actuator/prometheus`), correlation IDs, and masked structured JSON logs in `prod`.

---

## Tech Stack

### Backend (`/backend`)
- **Runtime & Framework:** Java 17, Spring Boot 3.3.0 (Modular Monolith: `core`, `features`)
- **Database & Migrations:** PostgreSQL 15+, Spring Data JPA / Hibernate (`ddl-auto: validate`), Flyway (`V1`–`V5`)
- **Session & Caching:** Redis 7+, Spring Session Data Redis, Spring Cache (safe read-model caching with outage fallback)
- **Security:** Spring Security 6, Redis Sessions, Cookie CSRF, Bucket4j 8.3.0
- **Real-Time & Integrations:** Spring WebSocket (STOMP), PayOS Java SDK 2.0.1, Cloudinary, Google API Client, Spring Mail, Springdoc OpenAPI
- **Observability & Testing:** Spring Boot Actuator, Micrometer Prometheus, JUnit 5, Testcontainers (PostgreSQL & Redis), ArchUnit 1.3.0

### Web Frontend (`/frontend`)
- **Framework:** Next.js 16.4.2 (App Router, `output: 'standalone'`), React 19.2.4, TypeScript 5
- **Styling & UI:** Tailwind CSS v4, shadcn/base-ui, Lucide Icons, Framer Motion, `Be Vietnam Pro` / `Playfair Display` / `Inter` fonts
- **Data & Real-Time:** TanStack React Query 5, Axios (`withCredentials` + `X-XSRF-TOKEN`), React Hook Form + Zod, `@stomp/stompjs`, Agora RTC React SDK, Recharts
- **Testing & Docs:** Vitest, ESLint 9, TypeScript (`tsc --noEmit`), Storybook 10

### Mobile App (`/mobile`)
- **Framework:** React Native 0.86.3, Expo ~57, Expo Router (typed routes), TypeScript
- **Data & Real-Time:** TanStack React Query 5, Axios (cookie + `X-XSRF-TOKEN` handling), `@stomp/stompjs`, Expo Secure Store, Lucide React Native

---

## Repository Structure

```text
thrift-swap/
├── .github/workflows/ci.yml   # GitHub Actions CI pipeline (security, tests, build, container scans)
├── backend/                   # Spring Boot API, Flyway migrations (V1-V5), Dockerfile
├── frontend/                  # Next.js 16 web app, Vitest tests, Storybook, Dockerfile
├── mobile/                    # Expo / React Native mobile app
├── docs/
│   ├── AI_KNOWLEDGE_BASE.md   # Business logic & architecture reference
│   └── production/            # Hardening roadmap, runbooks, env contract, launch checklist
└── docker-compose.prod.yml    # Production-like multi-container stack (PostgreSQL, Redis, BE, FE)
```

---

## Local Development Guide

### Prerequisites
- **Java 17** (Temurin or compatible JDK)
- **Node.js 20+** (`>= 20.19.0` recommended for Vite/Vitest) and `npm`
- **PostgreSQL 15+** running on `localhost:5432`
- **Redis 7+** running on `localhost:6379` (required for Spring Session)
- **Docker** (required if running Testcontainers-backed backend integration tests)

### 1. Database & Redis Setup
Create a PostgreSQL database named `thrift_auction`:

```sql
CREATE DATABASE thrift_auction;
```

Ensure Redis is running locally on `localhost:6379`. Flyway automatically runs migrations (`backend/src/main/resources/db/migration/V1__baseline.sql` through `V5`) on startup.

### 2. Backend (`http://localhost:8081`)
Copy the example environment file and fill in any third-party credentials you want to test locally:

```bash
cp backend/.env.example backend/.env
```

Start the Spring Boot server (defaults to the `dev` profile on port `8081`; non-`prod` profiles seed sample categories, products, voucher `WELCOME2026`, and dev admin/staff accounts):

```bash
# macOS / Linux
cd backend
./mvnw spring-boot:run
```

```powershell
# Windows (PowerShell)
cd backend
.\mvnw.cmd spring-boot:run
```

- **API Base URL:** `http://localhost:8081/api/v1`
- **Swagger UI (`dev` profile only):** `http://localhost:8081/swagger-ui.html`
- **WebSocket STOMP Endpoint:** `ws://localhost:8081/ws/auction`

### 3. Web Frontend (`http://localhost:3000`)
Copy the frontend environment template to `frontend/.env.local`:

```bash
cp frontend/.env.example frontend/.env.local
```

Install dependencies using `--legacy-peer-deps` and start the dev server:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:3000`.

### 4. Mobile App (Expo)
Copy the mobile environment template and start Expo:

```bash
cp mobile/.env.example mobile/.env
cd mobile
npm install
npx expo start
```

---

## Verification & Quality Checks

### Backend
Requires Docker running for PostgreSQL/Redis Testcontainers suites (`FlywayMigrationTests`, `ConcurrencyAndIdempotencyTests`, `LedgerInvariantTests`, `PerformanceAndCachingTests`, `ProductionReadinessTests`, `RedisSharedSessionIntegrationTests`, etc.):

```bash
cd backend
./mvnw clean test -B
```

### Frontend
```bash
cd frontend
npm ci --legacy-peer-deps
npm run lint
npm run typecheck
npm run test:run
npm run build
```

### Mobile
```bash
cd mobile
npm run lint
```

---

## Docker & Production Deployment

Production orchestration is defined in [docker-compose.prod.yml](docker-compose.prod.yml) (`db`, `redis`, `backend`, `frontend` running as non-root container users on port `8080` for backend and `3000` for frontend).

Before deploying:
1. Review [docs/production/ENVIRONMENT_VARIABLES.md](docs/production/ENVIRONMENT_VARIABLES.md) and provide all required secrets via your deployment environment (never commit `.env` or `.env.local`).
2. Validate the Compose configuration:
   ```bash
   docker compose --env-file <production-env> -f docker-compose.prod.yml config --quiet
   ```
3. Follow [docs/production/DEPLOYMENT_AND_MIGRATION_RUNBOOK.md](docs/production/DEPLOYMENT_AND_MIGRATION_RUNBOOK.md) and [docs/production/LAUNCH_CHECKLIST.md](docs/production/LAUNCH_CHECKLIST.md).

---

## CI/CD Pipeline (GitHub Actions)

Workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) runs on `push` to `main`, `master`, `release/*` and on `pull_request` to `main`, `master`:

1. **`repository-security-gate`**: Scans the repository filesystem with Trivy (`vuln,secret,misconfig`, failing on unfixed-ignored `CRITICAL`/`HIGH` findings).
2. **`backend-gate`**: Runs `./mvnw clean test -B` on Java 17 (Temurin), packages the production JAR, and uploads `thriftly-backend-jar`.
3. **`frontend-gate`**: Runs `npm ci --legacy-peer-deps`, `npm run lint`, `npm run typecheck`, `npm run test:run`, and `npm run build` on Node.js 20.
4. **`container-scan-gate`**: After the three gates pass, builds both `backend/Dockerfile` and `frontend/Dockerfile` with Buildx and scans both images with Trivy (`CRITICAL`/`HIGH`).

---

## Documentation Index

- [docs/AI_KNOWLEDGE_BASE.md](docs/AI_KNOWLEDGE_BASE.md) — Core business flows and engineering rules
- [docs/production/ROADMAP.md](docs/production/ROADMAP.md) — Production hardening roadmap (Phases 01–10)
- [docs/production/IMPLEMENTATION_STATUS.md](docs/production/IMPLEMENTATION_STATUS.md) — Phase implementation evidence and gate records
- [docs/production/ENVIRONMENT_VARIABLES.md](docs/production/ENVIRONMENT_VARIABLES.md) — Production environment and cookie/CORS contract
- [docs/production/SESSION_SECURITY.md](docs/production/SESSION_SECURITY.md) — Redis session, CSRF, and CORS security notes
