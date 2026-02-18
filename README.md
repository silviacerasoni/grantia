# Grantia - EU Project Management Platform

Grantia is a SaaS platform for managing European Projects (Horizon Europe).

## 🚀 Quick Start (Local Preview)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Deployment & Database

### 1. Push to GitHub
If you haven't already, create a new repository on GitHub and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/grantia.git
git branch -M main
git push -u origin main
```

### 2. Initialize Database (Supabase)
This project uses Supabase for the backend.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project.
3. Open the **SQL Editor**.
4. **Copy & Run** the content of [`supabase/schema.sql`](./supabase/schema.sql) to create tables.
5. **Copy & Run** the content of [`supabase/seed.sql`](./supabase/seed.sql) to populate sample data.

## Project Structure

- `src/app`: Next.js App Router
- `src/components`: Shadcn UI & Features
- `supabase/`: SQL Schemas & Seeds
