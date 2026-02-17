# Grantia - EU Project Management Platform

Grantia is a SaaS platform for managing European Projects (Horizon Europe), designed for Project Managers, Researchers, and Accounting Departments.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── layout.tsx    # Dashboard layout with Sidebar
│   │   └── page.tsx      # Main Dashboard view
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles & Tailwind config
├── components/
│   ├── ui/               # Shadcn UI primitives (Button, Card, etc.)
│   ├── features/         # Domain-specific components (Charts, Widgets)
│   └── layout/           # Layout components (Sidebar, Navbar)
├── lib/                  # Utilities & Libraries
│   ├── supabase.ts       # Supabase client configuration
│   └── utils.ts          # Helper functions (cn, etc.)
└── types/                # TypeScript definitions
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Key Features

- **Resource Planning**: Manage team allocation and timesheets.
- **Finance & Costs**: Track expenses and budget burn rates.
- **Reporting**: Generate compliant reports for EU bodies.
- **Compliance**: Monitor project health and audit readiness.
