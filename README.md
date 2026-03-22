# HALIA - Fleet Management Platform

HALIA is a comprehensive fleet management platform built with Next.js, integrating with Traccar GPS tracking system. It provides real-time vehicle tracking, fuel management, driver management, and more.

![HALIA Dashboard](./banner.png)

## Features

✅ **Real-time GPS Tracking**
- Live vehicle positions with Server-Sent Events (SSE)
- Interactive map with vehicle markers (Leaflet/React Leaflet)
- Map centered on Honduras (Tegucigalpa)
- Vehicle trails and history

✅ **Authentication & Authorization**
- JWT-based authentication with Traccar integration
- Session management with JSESSIONID
- Role-based access control (Admin, User, Read-only)
- User profile with real data display

✅ **Vehicle Management**
- Vehicle CRUD operations
- Real-time vehicle status
- Integration with Traccar devices

✅ **Driver Management**
- Driver CRUD operations
- PostgreSQL database integration
- Driver assignment to vehicles

✅ **Fuel Management Module** (requires PostgreSQL)
- Fuel log tracking (liters, cost, odometer, fuel type)
- Monthly budget management
- Fuel efficiency calculations (km/L)
- Statistics and analytics
- Filters by vehicle, driver, date range

✅ **Modern UI/UX**
- Dark mode support
- Responsive design (mobile-first)
- TailwindCSS 4 + custom theming
- Loading states and error handling

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5.9.3
- **UI:** React 19, TailwindCSS 4.1.17
- **Database:** PostgreSQL with Prisma ORM 6.19.2
- **State Management:** Zustand 5.0.12, TanStack Query 5.91.0
- **Auth:** JWT with jose 6.2.2
- **Maps:** Leaflet 1.9.4 + React Leaflet 5.0.0
- **GPS Integration:** Traccar REST API + SSE
- **Charts:** ApexCharts 4.7.0

## Prerequisites

- Node.js 18.x or later (recommended 20.x+)
- PostgreSQL database (local or cloud: Neon, Supabase, Railway)
- Traccar server instance with API access

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/HALIA.git
cd HALIA
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Traccar API Configuration
TRACCAR_URL=https://your-traccar-server.com
TRACCAR_USER=your_email@example.com
TRACCAR_PASS=your_traccar_password

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_random_secret_key_here

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@host:5432/halia

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Easypanel (Recommended) ⭐

HALIA is designed to deploy on **Easypanel** with Docker.

**Quick Start:**

1. Create PostgreSQL service in Easypanel
2. Create App connected to GitHub: `BRYAN-RODRIGUEZ-243/halia`
3. Configure environment variables (see below)
4. Easypanel builds with Dockerfile automatically
5. Access your app at your Easypanel domain

📖 **Full Guide:** See [EASYPANEL.md](EASYPANEL.md) for step-by-step instructions

### Docker (VPS/Cloud)

Deploy on any server with Docker:

```bash
git clone https://github.com/BRYAN-RODRIGUEZ-243/halia.git
cd halia
cp .env.production.example .env.production
# Edit .env.production with your credentials
docker compose --env-file .env.production up -d
```

📖 **Full Guide:** See [DOCKER.md](DOCKER.md) for production setup

### Vercel (Frontend Only)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `TRACCAR_URL`
   - `TRACCAR_USER`
   - `TRACCAR_PASS`
   - `JWT_SECRET`
   - `DATABASE_URL` (use Neon or Supabase)
4. Deploy!

### Railway

1. Create new project in [Railway](https://railway.app)
2. Add PostgreSQL service
3. Deploy from GitHub repository
4. Add environment variables
5. Run `npx prisma migrate deploy` in Railway terminal

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TRACCAR_URL` | Traccar server URL | ✅ Yes |
| `TRACCAR_USER` | Traccar login email | ✅ Yes |
| `TRACCAR_PASS` | Traccar password | ✅ Yes |
| `JWT_SECRET` | Secret for JWT tokens | ✅ Yes |
| `DATABASE_URL` | PostgreSQL connection string | ⚠️ For fuel module |
| `NEXT_PUBLIC_APP_URL` | App base URL | ❌ Optional |

## Database Schema

The project uses Prisma with the following models:

- **Driver** - Driver information (name, license, phone, email)
- **FuelLog** - Fuel entries (vehicle, driver, liters, cost, odometer, date)
- **MonthlyBudget** - Budget management per month

See `prisma/schema.prisma` for details.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with Traccar credentials
- `GET /api/auth/me` - Get current user session

### Vehicles
- `GET /api/vehicles` - List all vehicles from Traccar

### Drivers
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Create new driver
- `GET /api/drivers/[id]` - Get single driver
- `PUT /api/drivers/[id]` - Update driver
- `DELETE /api/drivers/[id]` - Delete driver

### GPS Tracking
- `GET /api/positions/stream` - SSE stream for real-time positions

### Fuel Management (requires PostgreSQL)
- `GET /api/fuel` - List fuel logs (with filters)
- `POST /api/fuel` - Create fuel entry
- `GET /api/fuel/[id]` - Get single fuel log
- `PUT /api/fuel/[id]` - Update fuel log
- `DELETE /api/fuel/[id]` - Delete fuel log
- `GET /api/fuel/stats` - Get statistics
- `PUT /api/fuel/stats` - Update monthly budget

## Project Structure

```
HALIA/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin dashboard pages
│   │   ├── (auth)/            # Auth pages (login/signup)
│   │   ├── api/               # API routes
│   │   └── globals.css
│   ├── components/            # React components
│   │   ├── auth/             # Auth forms
│   │   ├── fuel/             # Fuel module components
│   │   ├── header/           # Header & user dropdown
│   │   ├── map/              # Fleet map
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities & helpers
│   ├── types/                # TypeScript definitions
│   └── context/              # React contexts
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
└── .env.local               # Local environment (gitignored)
```

## Features in Detail

### Real-time Tracking
- SSE stream with 5-second polling
- Automatic position updates on map
- Vehicle markers with custom icons
- Centered on Honduras (Tegucigalpa)

### Fuel Module
- Complete CRUD for fuel logs
- Auto-calculation of total cost (liters × price)
- Odometer validation (must be > last reading)
- Monthly budget tracking with progress indicators
- Fuel efficiency calculations (km/L)
- Statistics dashboard with charts

### User Management
- Profile displays real user data from Traccar
- Role badges (Administrador, Usuario, Solo Lectura)
- Avatar with user initials
- Session-based authentication

## Known Limitations

- Fuel module requires PostgreSQL (not available without DB)
- Traccar WebSocket not used (SSE polling instead)
- Real-time updates every 5 seconds (not instant)

## Support & Documentation

- [Traccar API Docs](https://www.traccar.org/api-reference/)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## License

This project is built on TailAdmin Next.js template.

## Credits

- Traccar GPS tracking backend
- TailAdmin Next.js dashboard template
- Leaflet for mapping

### Pro Version

* 7 Unique Dashboards: Analytics, Ecommerce, Marketing, CRM, SaaS, Stocks, Logistics (more coming soon)
* 500+ dashboard components and UI elements
* Complete Figma design file
* Email support

To learn more about pro version features and pricing, visit our [pricing page](https://tailadmin.com/pricing).

## Changelog

### Version 2.2.3 - [March 15, 2026]

* update ESLint configuration and dependencies; upgrade Next.js to version 16.1.6

### Version 2.2.2 - [December 30, 2025]

* Fixed date picker positioning and functionality in Statistics Chart.


### Version 2.1.0 - [November 15, 2025]

* Updated to Next.js 16.x
* Fixed all reported minor bugs

### Version 2.0.2 - [March 25, 2025]

* Upgraded to Next.js 16.x for [CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927) concerns
* Included overrides vectormap for packages to prevent peer dependency errors during installation.
* Migrated from react-flatpickr to flatpickr package for React 19 support

### Version 2.0.1 - [February 27, 2025]

#### Update Overview

* Upgraded to Tailwind CSS v4 for better performance and efficiency.
* Updated class usage to match the latest syntax and features.
* Replaced deprecated class and optimized styles.

#### Next Steps

* Run npm install or yarn install to update dependencies.
* Check for any style changes or compatibility issues.
* Refer to the Tailwind CSS v4 [Migration Guide](https://tailwindcss.com/docs/upgrade-guide) on this release. if needed.
* This update keeps the project up to date with the latest Tailwind improvements. 🚀

### v2.0.0 (February 2025)

A major update focused on Next.js 16 implementation and comprehensive redesign.

#### Major Improvements

* Complete redesign using Next.js 16 App Router and React Server Components
* Enhanced user interface with Next.js-optimized components
* Improved responsiveness and accessibility
* New features including collapsible sidebar, chat screens, and calendar
* Redesigned authentication using Next.js App Router and server actions
* Updated data visualization using ApexCharts for React

#### Breaking Changes

* Migrated from Next.js 14 to Next.js 16
* Chart components now use ApexCharts for React
* Authentication flow updated to use Server Actions and middleware

[Read more](https://tailadmin.com/docs/update-logs/nextjs) on this release.

### v1.3.4 (July 01, 2024)

* Fixed JSvectormap rendering issues

### v1.3.3 (June 20, 2024)

* Fixed build error related to Loader component

### v1.3.2 (June 19, 2024)

* Added ClickOutside component for dropdown menus
* Refactored sidebar components
* Updated Jsvectormap package

### v1.3.1 (Feb 12, 2024)

* Fixed layout naming consistency
* Updated styles

### v1.3.0 (Feb 05, 2024)

* Upgraded to Next.js 14
* Added Flatpickr integration
* Improved form elements
* Enhanced multiselect functionality
* Added default layout component

## License

TailAdmin Next.js Free Version is released under the MIT License.

## Support
If you find this project helpful, please consider giving it a star on GitHub. Your support helps us continue developing and maintaining this template.
