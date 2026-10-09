# TaskFlow

A simple project management app for small teams: track tasks per client, assign them to team members, and keep everyone organized and accountable.

Built with **Next.js 15 (App Router) · TypeScript · Prisma · PostgreSQL (Neon) · Tailwind CSS v4**.

## Features

- **Dashboard** — overdue, due this week, in progress, blocked, plus a preview of your own tasks
- **Board** — kanban view of all tasks across four statuses (To do → In progress → Blocked → Done)
- **Clients** — manage clients and see all tasks per client
- **My Tasks** — everything assigned to you, open and completed
- **Team (admin only)** — add members, change roles (Admin / Member), remove people
- Tasks have: title, description, client, priority (Low / Medium / High), due date, and one or more assigned members

## Getting started

### 1. Prerequisites

- [Node.js](https://nodejs.org) 18.17+ (20 LTS recommended)
- A free database — [Neon Postgres](https://neon.tech) works great (creates one in ~1 minute)
- A GitHub account (for hosting code) and a Vercel account (for hosting the app)

### 2. Install

```bash
npm install
```

### 3. Configure environment variables

Create a file called `.env` in the project root (copy `.env.example` and fill it in):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
AUTH_SECRET=any-long-random-string
```

- **DATABASE_URL** — from your Neon project settings (the "Pooled connection" string)
- **AUTH_SECRET** — any long random string; used to sign login sessions (e.g. `openssl rand -hex 32`)

### 4. Create the database tables

```bash
npx prisma migrate dev --name init
```

This creates the `User`, `Client`, `Task`, and `TaskAssignment` tables.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. First login

1. You'll see **Create the first account** — fill in your name, email, and a password.
2. The first account automatically becomes **Admin**.
3. After that, new team members are added by an admin from the **Team** page (they'll get the login details to set their own access).

## Deploying to Vercel

1. **Push the code to GitHub** (don't push the `.env` file — it's in `.gitignore`):
   ```bash
   git init
   git add .
   git commit -m "TaskFlow"
   # then add your GitHub remote and push
   ```
2. **Add the database to GitHub/Vercel**: in Neon, use the "Connect" tab to create the connection string. Store the same value in:
   - your local `.env`
   - Vercel → Project → Settings → Environment Variables (add `DATABASE_URL` and `AUTH_SECRET` for all environments)
3. **Import into Vercel**: go to [vercel.com/new](https://vercel.com/new), pick the repo, and deploy. The `postinstall` step (`prisma generate`) runs automatically.
4. **Run the migration on the production database** — Vercel has a terminal (Deployment → click the deployment → Terminal) where you can run:
   ```bash
   npx prisma migrate deploy
   ```
   (or run `npx prisma migrate deploy` locally once your production `DATABASE_URL` is set)
5. Visit your `https://your-app.vercel.app` URL, create the first account → you're the admin → add your team.

## Project structure

```
prisma/schema.prisma      # Database model (User, Client, Task, TaskAssignment)
src/app/api/              # API routes (auth, tasks, clients, users)
src/app/                  # Pages (dashboard, board, clients, my-tasks, users, login)
src/components/           # Reusable UI (Nav, TaskCard, forms, ...)
src/lib/                  # Prisma client, auth (cookies + sessions), utilities
```

## Notes

- **Roles**: Admins can manage the team and see everything. Members can create tasks and update statuses.
- **Security**: passwords are hashed with bcrypt; sessions use signed HTTP-only cookies.
- **WhatsApp stays for comms** — TaskFlow is the system of record for what's assigned to whom and when it's due.
