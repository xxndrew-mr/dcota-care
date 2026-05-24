# Dcota Care - Helpdesk & Approval Management System

Dcota Care is an enterprise helpdesk and approval management system currently under active development.

The system is designed to support internal operational workflows such as ticket submission, approval handling, assignment tracking, role-based access control, activity logging, file attachment handling, and operational reporting.

## Project Status

🚧 **In Development**

This project is currently being developed and improved. Features, workflows, database schema, and UI components may change as the system evolves.

## Overview

Dcota Care is built to help internal teams manage operational requests through a structured ticketing and approval workflow.

The application enables users to submit tickets, attach supporting files, track request status, assign tickets to responsible users, and maintain an activity log for each ticket.

## Key Features

- User authentication
- Role-based access control (RBAC)
- User, role, and division management
- Ticket submission and tracking
- Ticket category and subcategory support
- Ticket assignment workflow
- PIC / handler relationship support
- Approval and status management
- Ticket activity logs and audit trail
- File attachment support
- Email notification support
- Reporting and analytics integration
- Database indexing for frequently queried fields
- Responsive web interface

## Tech Stack

### Frontend

- Next.js
- React
- Tailwind CSS
- Radix UI
- Headless UI
- Heroicons
- Lucide React
- Sonner

### Backend

- Next.js server-side logic
- NextAuth
- Prisma ORM
- bcryptjs
- Nodemailer

### Database & Storage

- PostgreSQL
- Prisma Client
- S3-compatible object storage
- Google BigQuery integration

### Tooling

- ESLint
- PostCSS
- npm
- Vercel configuration

## Core Modules

### Authentication & Authorization

The system includes login-based authentication and role-based access control to separate permissions across internal user roles.

### User & Division Management

Users can be associated with roles, divisions, status, and PIC / handler relationships to support internal operational workflows.

### Ticket Management

Users can submit and manage tickets with title, category, subcategory, description, contact information, store information, and status tracking.

### Assignment Workflow

Tickets can be assigned to responsible users with assignment type and assignment status tracking.

### Activity Logs

Each ticket can maintain an activity log containing actor information, action type, notes, and timestamp.

### Attachment Handling

Ticket details support attachment metadata through JSON-based storage, allowing the system to associate uploaded files with ticket records.

### Reporting & Analytics

The project includes integration support for analytics and reporting workflows using Google BigQuery.

## Database Design

The database is designed around the following core entities:

- `User`
- `Role`
- `Division`
- `Ticket`
- `TicketDetail`
- `TicketAssignment`
- `TicketLog`

Indexes are added to frequently accessed fields such as role, division, PIC handler, ticket submitter, ticket type, ticket status, actor, and assignment status to improve query performance.

## Architecture Highlights

- Full-stack web application using Next.js
- Relational database design using PostgreSQL and Prisma ORM
- RBAC-based authorization model
- Ticket lifecycle tracking with activity logs
- Assignment-based workflow for operational follow-up
- File attachment metadata support
- Email notification support
- Analytics integration using Google BigQuery
- Production-oriented architecture under active development

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL

## Author

Andre Marshandito  
Software Engineer  
GitHub: https://github.com/xxndrew-mr

### Installation

Clone the repository:

```bash
git clone https://github.com/xxndrew-mr/dcota-care.git
cd dcota-care
