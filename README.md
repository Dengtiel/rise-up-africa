# RiseUp Africa

> Empowering marginalized African youth with verified access to post-secondary opportunities

RiseUp Africa is a comprehensive platform that connects marginalized youth (Refugees, IDPs, Vulnerable, PWDs) with verified access to post-secondary education opportunities. The platform facilitates the connection between youth seeking opportunities and donors/organizations providing them.

## 🌟 Features

- **Multi-role System**: Support for Youth, Donors, Admins, and Field Agents
- **Verification Workflow**: Comprehensive document verification and field visit system
- **Opportunity Management**: Post and manage educational opportunities
- **Application Tracking**: Track applications from submission to selection
- **Search & Discovery**: Advanced search for verified youth and opportunities
- **Modern UI**: Beautiful, responsive interface built with Next.js and shadcn/ui

## 🏗️ Architecture

This is a **monorepo** built with:

- **Package Manager**: PNPM with workspaces
- **Build System**: Turbo
- **Frontend**: Next.js 15 (React 19)
- **Backend**: Express.js (Node.js 20+)
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: shadcn/ui + Tailwind CSS

### Project Structure

```
rise-up-africa/
├── apps/
│   ├── api/          # Express.js REST API
│   └── web/          # Next.js web application
├── packages/
│   ├── ui/           # Shared UI components
│   ├── eslint-config/
│   └── typescript-config/
├── docker-compose.yml
├── Dockerfile.*
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20
- **PNPM** >= 10.4.1
- **PostgreSQL** >= 16 (or use Docker)
- **Docker** & **Docker Compose** (optional, for containerized setup)

### Local Development Setup

#### Option 1: Traditional Setup (Recommended for Development)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rise-up-africa
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `.env` files:

   **`apps/api/.env`**:
## 📚 Documentation

## 🔔 Notes

This README contains the main setup, development and deployment instructions for the project. See the API-specific docs in `apps/api/README.md` for backend details.

This setup includes volume mounts for hot reload during development.

## 📦 Deployment

### Docker Deployment

#### Production Build

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

#### Individual Service Deployment

**API Service:**

```bash
cd apps/api
docker build -t riseup-api .
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  riseup-api
```

**Web Service:**

```bash
cd apps/web
docker build -t riseup-web \
  --build-arg NEXT_PUBLIC_API_URL="https://api.example.com" .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="https://api.example.com" \
  riseup-web
```

### Platform-Specific Deployment

#### Vercel (Web App)

1. Connect your repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your API URL
3. Deploy

#### Railway / Render / Fly.io

**API Deployment:**

1. Connect repository
2. Set build command: `cd apps/api && pnpm install && pnpm build`
3. Set start command: `cd apps/api && pnpm start`
4. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT`

**Web Deployment:**

1. Connect repository
2. Set build command: `cd apps/web && pnpm install && pnpm build`
3. Set start command: `cd apps/web && pnpm start`
4. Set environment variables:
   - `NEXT_PUBLIC_API_URL`

#### AWS / GCP / Azure

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed cloud deployment guides.

### Environment Variables

#### API (`apps/api/.env`)

| Variable       | Description                  | Required | Default     |
| -------------- | ---------------------------- | -------- | ----------- |
| `DATABASE_URL` | PostgreSQL connection string | Yes      | -           |
| `JWT_SECRET`   | Secret for JWT token signing | Yes      | -           |
| `PORT`         | API server port              | No       | 4000        |
| `NODE_ENV`     | Environment mode             | No       | development |

#### Web (`apps/web/.env.local`)

| Variable              | Description  | Required | Default |
| --------------------- | ------------ | -------- | ------- |
| `NEXT_PUBLIC_API_URL` | API base URL | Yes      | -       |

#### Docker Compose (`.env`)

| Variable              | Description         | Required | Default         |
| --------------------- | ------------------- | -------- | --------------- |
| `POSTGRES_USER`       | PostgreSQL username | No       | riseup          |
| `POSTGRES_PASSWORD`   | PostgreSQL password | No       | riseup_password |
| `POSTGRES_DB`         | Database name       | No       | riseup_africa   |
| `POSTGRES_PORT`       | PostgreSQL port     | No       | 5432            |
| `JWT_SECRET`          | JWT secret key      | Yes      | -               |
| `NEXT_PUBLIC_API_URL` | API URL for web app | Yes      | -               |
| `API_PORT`            | API server port     | No       | 4000            |
| `WEB_PORT`            | Web app port        | No       | 3000            |

## 🛠️ Development

### Available Scripts

**Root level:**

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

**API (`apps/api`):**

- `pnpm dev` - Start dev server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run migrations
- `pnpm prisma:seed` - Seed database
- `pnpm prisma:studio` - Open Prisma Studio

**Web (`apps/web`):**

- `pnpm dev` - Start Next.js dev server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database Management

```bash
# Generate Prisma client
cd apps/api
pnpm prisma:generate

# Create a new migration
pnpm prisma:migrate dev --name migration_name

# Apply migrations (production)
pnpm prisma:migrate deploy

# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Seed database
pnpm prisma:seed
```

### Testing

   - Document uploads: uploading a document of the same type will replace the existing file for that youth (prevents duplicate ID/transcript/recommendation entries).
   - External application link: donors can optionally provide an `applicationLink` (e.g. Google Form) when creating an opportunity. This requires a Prisma schema update/migration if your local database hasn't been migrated.
- **Field Agent**: `fieldagent@riseupafrica.org` / `password123`
- **Donor**: `donor@example.org` / `password123`
- **Youth**: `youth@example.com` / `password123`

## 📚 Documentation

## ▶️ When the app is running — Quick walkthrough

These steps assume the API and web servers are already running locally (default ports shown).

- **Open the web app:** `http://localhost:3000`
- **API base URL:** `http://localhost:4000` (used by the frontend)

- **Test accounts (seeded):**
   - Admin: `admin@riseupafrica.org` / `password123`
   - Field Agent: `fieldagent@riseupafrica.org` / `password123`
   - Donor: `donor@example.org` / `password123`
   - Youth: `youth@example.com` / `password123`

- **Admin workflow (verify youth):**
   1. Sign in as **Admin** and open `Dashboard → Pending Verifications` or visit `/dashboard/verifications`.
   2. Review uploaded documents and open the review dialog to set status to `VERIFIED` or `REJECTED` and add notes.

- **Youth workflow (upload & apply):**
   1. Sign in as **Youth** and go to `Dashboard → Documents` to upload ID, Transcript, or Recommendation Letter. Uploading a document of the same type replaces the previous one.
   2. After uploading, request verification (if your flow requires it) and wait for an Admin to approve.
   3. Browse `Opportunities` and apply: either use the internal apply dialog (attach files) or click `Apply via External Link` when a donor provided an external `applicationLink`.

- **Donor workflow (post opportunities):**
   1. Sign in as **Donor** and go to `Dashboard → Opportunities → New` to create an opportunity.
   2. Optionally paste an `Application Link` (Google Form or external URL) — applicants will see an `Apply via External Link` button.

- **Dev tips & logs:**
   - If running locally with `pnpm dev`, watch the terminal where each service is running for logs.
   - With Docker Compose, use `docker-compose logs -f` to follow logs.
   - If you encounter JavaScript heap OOM errors when running the web dev server, increase Node's heap before starting:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
cd apps/web
pnpm dev
```


## 🔔 Recent Changes

- **Document upload behavior:** Uploading a document of the same type now replaces the existing document for that youth instead of creating duplicates. Backend: `apps/api/src/modules/verification/verification.service.ts`, `apps/api/src/modules/verification/verification.controller.ts`. The API response now returns `{ document, action: "created" | "replaced" }` so the frontend can show appropriate feedback.
- **Frontend documents UI:** The documents page shows distinct messages when an upload replaces an existing document. Files: `apps/web/app/dashboard/documents/page.tsx`, `apps/web/lib/api.ts`.

- **Admin scheduling & assignment:** Admins can now schedule field visits and auto-assign nearby field agents. Backend: `POST /api/verification/schedule` implemented in `apps/api/src/modules/verification/verification.controller.ts` and `verification.service.ts`. The scheduling logic prefers a matching `camp` (or `community`), then `country`, and will return a helpful error if no matching agents exist.
- **Admin UI — Schedule & Assign:** The web admin UI includes a `Schedule Visit` action on `Dashboard → Pending Verifications` (`/dashboard/verifications`) and an `Assign Agent` modal to pick a FIELD_AGENT without leaving the page. Files: `apps/web/app/dashboard/verifications/page.tsx`, `apps/web/lib/api.ts`.
- **Field Agent views:** Field Agents will see assigned visits under `Dashboard → Field Visits` (`/dashboard/visits`) and `Dashboard → Assignments` (`/dashboard/assignments`). The visits page polls every 15s so admin-scheduled visits appear shortly after assignment. Files: `apps/web/app/dashboard/visits/page.tsx`, `apps/web/app/dashboard/assignments/page.tsx`.

Note: If you added the optional `applicationLink` field to the `Opportunity` model in the Prisma schema, run a migration and regenerate the client (example command below):

```bash
cd apps/api
pnpm prisma:migrate dev --name add-application-link
pnpm prisma:generate
```
- **Application controller fixes:** Fixed a missing import (`createApplicationWithDocuments`) and added validation so route params (`opportunityId`, `applicationId`) are checked before calling services. File: `apps/api/src/modules/application/application.controller.ts`.
- **Application service compatibility:** `getOpportunityApplications` now maps the Prisma `verifications` array to a single `verification` field on the returned youth object to maintain frontend compatibility. File: `apps/api/src/modules/application/application.service.ts`.
- **External application link (donor):** Support for an optional `applicationLink` on opportunities was added in code and types. This change requires a Prisma migration if not yet applied. Files touched: `apps/api/prisma/schema.prisma`, `apps/api/src/modules/opportunity/opportunity.schema.ts`, and frontend opportunity pages.


- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Next Themes** - Theme management
- **Sonner** - Toast notifications

### Backend

- **Node.js 20+** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Validation
- **bcrypt** - Password hashing

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Turbo** - Build system
- **PNPM** - Package manager

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- Environment variable management
- CORS configuration
- Role-based access control

## 📝 License

- MIT License

## 🤝 Contributing

---

## 📧 Contact

d.akol@alustudent.com

---

**Built with ❤️ for empowering African youth**
