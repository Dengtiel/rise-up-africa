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

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/riseup_africa?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   PORT=4000
   NODE_ENV=development
   ```

   **`apps/web/.env.local`**:

   ```env
   NEXT_PUBLIC_API_URL="http://localhost:4000"
   ```

4. **Set up the database**

   ```bash
   cd apps/api
   pnpm prisma:generate
   pnpm prisma:migrate
   pnpm prisma:seed  # Optional: seed with test data
   ```

5. **Start development servers**

   ```bash
   # From root directory
   pnpm dev
   ```

   This will start:
   - API server at `http://localhost:4000`
   - Web app at `http://localhost:3000`

#### Option 2: Docker Compose (Quick Start)

1. **Create environment file**

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Start all services**

   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database
   - API server
   - Web application

3. **Run database migrations**

   ```bash
   docker-compose exec api pnpm prisma:migrate:deploy
   ```

4. **Seed database (optional)**

   ```bash
   docker-compose exec api pnpm prisma:seed
   ```

5. **Access the application**
   - Web: http://localhost:3000
   - API: http://localhost:4000

#### Option 3: Docker Compose (Development with Hot Reload)

```bash
docker-compose -f docker-compose.dev.yml up
```

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

**Notes about recent schema changes**

- A new optional `applicationLink` field was added to the `Opportunity` model to allow external application URLs. If you pull the latest schema, run a migration and regenerate the Prisma client:

```bash
cd apps/api
pnpm prisma:migrate dev --name add-application-link
pnpm prisma:generate
```

If you run the production migrations use `pnpm prisma:migrate deploy` as usual.

### Testing

Test credentials (from seed data):

- **Admin**: `admin@riseupafrica.org` / `password123`
- **Field Agent**: `fieldagent@riseupafrica.org` / `password123`
- **Donor**: `donor@example.org` / `password123`
- **Youth**: `youth@example.com` / `password123`

## 📚 Documentation

- [API Documentation](./apps/api/README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🏛️ Tech Stack

### Frontend

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Next Themes** - Theme management
- **Sonner** - Toast notifications

#### Opportunity / Application UX

- Donor create form: donors can now optionally include an `External Application Link` when posting an opportunity. The web UI surfaces this as an "Apply Externally" button on the opportunity detail page.
- Apply gating: Youth users will see the Apply button but it will be disabled until the youth is verified. The API will also reject application attempts from unverified users.


### Backend

- **Node.js 20+** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Validation

#### Verification & Documents

- Upload behavior: uploading a document of the same `type` for a youth will replace the existing document instead of creating duplicates. The verification APIs return the document and an `action` value so the UI can display whether the upload created or replaced a record.
- The server accepts `size: 0` values on upload (some clients report zero); the frontend should prefer to omit `size` if unknown. The API validates uploads and will enforce non-empty content where necessary.

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

##  Deployment Link

Deployment Link: https://riseupafrica.lajiktech.com/

---

## 📧 Contact

d.akol@alustudent.com

---

**Built with ❤️ for empowering African youth**
