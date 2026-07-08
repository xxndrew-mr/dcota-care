# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dcota Care — an internal helpdesk & approval management system (Next.js App Router + PostgreSQL/Prisma), deployed on Vercel. All UI text, API error messages, and code comments are written in **Indonesian** — keep new user-facing strings and log notes in Indonesian.

## Project Structure

```
src/
  app/
    login/                # Halaman login (NextAuth credentials)
    dashboard/            # Semua halaman setelah login (dilindungi middleware)
      submit/             #   Form pengajuan tiket (Salesman/Agen)
      queue/              #   Antrian tugas user (assignment Pending)
      my-tickets/         #   Tiket yang disubmit user
      history/, my-history# +  Riwayat tiket
      feedback/           #   Review feedback (role User Feedback)
      bookmarks/, archive/#   Hasil aksi feedback-process
      admin/              #   Manajemen user + analytics (BigQuery)
      change-password/
    api/                  # Route handlers (semua cek role sendiri)
      auth/               #   [...nextauth] + change-password
      tickets/            #   submit, archive, bookmarks, history,
                          #   [ticketId]/triage|sm-process|am-process|ap-process
      assignments/        #   [assignmentId]/feedback-process (bookmark/archive)
      queue/my-queue/     #   Antrian tugas user login
      admin/              #   users CRUD, master-data, import-salesman (CSV)
      cron/sync-bigquery/ #   Dipanggil Vercel Cron tiap menit
  lib/                    # prisma (singleton), auth (NextAuth options),
                          # smartRouting (map kategori→divisi),
                          # email + email-template, utils (cn)
  middleware.js           # Proteksi halaman /dashboard/*
prisma/                   # schema.prisma, migrations/, seed.js
api/go-upload.go          # Go Vercel function: presigned URL upload ke R2
scripts/etl-to-bigquery.js# ETL manual ke BigQuery
vercel.json               # Jadwal cron sync-bigquery
```

## Commands

```bash
npm run dev              # Next.js dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # ESLint (eslint-config-next)

npx prisma migrate dev   # Create/apply migrations (uses DATABASE_URL + DIRECT_URL)
npx prisma generate      # Regenerate client after schema changes
npx prisma db seed       # Runs prisma/seed.js (roles, divisions, admin + routing users)

node scripts/etl-to-bigquery.js   # Manual ETL run to BigQuery
```

There is no test framework configured. Note: `npm run dev:go` references an `upload-service/` directory that does not exist — the Go code actually lives at `api/go-upload.go` and runs as a Vercel serverless function, not locally.

Copy `.env.example` to `.env` before running (Postgres, NextAuth, SMTP, Cloudflare R2, GCP BigQuery, Google Drive credentials).

## Architecture

Plain JavaScript (`.js`/`.jsx`, not TypeScript) with `@/*` aliased to `./src/*`. UI is built directly with `@headlessui/react` (Dialog/Transition/Menu), `@heroicons/react` + `lucide-react` icons, and raw Tailwind CSS 4; Sonner for toasts. `cn()` from [src/lib/utils.js](src/lib/utils.js) merges classes.

### Auth & authorization

- NextAuth credentials provider (username + bcrypt password) in [src/lib/auth.js](src/lib/auth.js); JWT session enriched with `id`, `role`, `divisionName`, `divisionId`, `phone`.
- [src/middleware.js](src/middleware.js) only guards `/dashboard/*` pages; **every API route does its own role check** against `session.user.role` (string match on role names).
- Roles: `Administrator`, `Salesman`, `Agen`, `PIC OMI`, `PIC OMI (SS)`, `Sales Manager`, `Acting Manager`, `Acting PIC`, `User Feedback`. Roles and divisions are matched by exact string name throughout the code (`role_name`, `division_name`), so routing breaks if DB names drift. (`PIC OMI (SS)` is used in code but not created by the seed.)

### Ticket lifecycle (the core domain)

Tickets move through a chain of `TicketAssignment` rows (assignment_type `Active` or `Feedback_Review`; status `Pending` → `Done`/`Rejected`/`Bookmarked`/`Archived`). A user's work queue (`/api/queue/my-queue`) is simply their `Pending` assignments. Every transition writes a `TicketLog` row (action types: `Submit`, `Triase`, `sm_*`, `am_*`, `ap_*`).

1. **Submit** (`/api/tickets/submit`, Salesman/Agen only) — creates Ticket (`type: Pending`) + TicketDetail + assignments to the submitter's personal `pic_omi_id` handler **and** all `PIC OMI (SS)` users. Kategori `PRODUK` requires attachments.
2. **Triage** (`/api/tickets/[ticketId]/triage`, PIC OMI / PIC OMI (SS)) — classifies as `Request` or `Feedback`. Request → assigns the Sales Manager of the submitter's division; Feedback → assigns `User Feedback` users (`Feedback_Review`).
3. **Request approval chain**: Sales Manager (`sm-process`) → Acting Manager (`am-process`) → Acting PIC (`ap-process`, can complete or bounce back to AM). Which AM/AP division handles a ticket comes from the kategori→division map in [src/lib/smartRouting.js](src/lib/smartRouting.js).
4. **Feedback path**: `Feedback_Review` assignees bookmark/archive via `/api/assignments/[assignmentId]/feedback-process`.

### Cross-cutting conventions

- **BigInt IDs**: `Ticket`, `TicketLog`, `TicketAssignment` use BigInt primary keys — they cannot be JSON-serialized directly; routes convert with a custom serializer (see `serialize()` in [src/app/api/tickets/submit/route.js](src/app/api/tickets/submit/route.js)) and cast route params with `BigInt(...)`.
- **Prisma client**: import the singleton from `@/lib/prisma` (uses the Accelerate extension); never instantiate `PrismaClient` in routes.
- **Emails and follow-up assignments are fire-and-forget**: sent after the main transaction with `.catch(console.error)`, never awaited in the response path ([src/lib/email.js](src/lib/email.js), nodemailer/SMTP).
- **File uploads**: [api/go-upload.go](api/go-upload.go) (Go, Vercel function) issues presigned PUT URLs to Cloudflare R2; tickets store only attachment metadata in `TicketDetail.attachments_json`.
- **BigQuery sync**: `/api/cron/sync-bigquery` (scheduled every minute via [vercel.json](vercel.json)) pushes tickets to the `helpdesk_data.tickets_analytics` table; the analytics dashboard reads from BigQuery. The route requires `Authorization: Bearer <CRON_SECRET>` when the `CRON_SECRET` env var is set (it is set in Vercel production; leave unset locally to call the endpoint manually).
- **Disabled feature**: change-password is intentionally disabled for the `Salesman` role at three layers (API 403, hidden nav links, page guard) per management request — the code is guarded, not removed; search for `DINONAKTIFKAN` comments to re-enable.
