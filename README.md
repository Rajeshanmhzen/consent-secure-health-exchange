# Consent-Based Secure Health Information Exchange System

## Tagline
Empowering Patients. Securing Records. Enabling Trusted Care.

---

# About the Project

The Consent-Based Secure Health Information Exchange System is a full-stack healthcare platform designed to enable secure, patient-controlled sharing of medical records across hospitals and doctors.

Built with a multi-tenant architecture, the system allows hospitals to onboard as tenants, manage their staff (doctors and receptionists), and handle patient medical records — all while ensuring that data access is governed by explicit patient and doctor consent.

The platform supports role-based access control, audit logging, emergency access workflows, OTP-based verification, and real-time notifications to ensure compliance, transparency, and security in health data exchange.

---

# Industry

Healthcare / Health Information Technology / Digital Health

---

# System Type

Multi-Tenant SaaS Platform (B2B — Hospital as Tenant)

---

# User Roles

- Super Admin — Platform-level management, tenant onboarding, plan management
- Hospital Admin — Manages hospital profile, staff, and subscriptions
- Doctor — Creates medical records, sends and receives data requests
- Receptionist — Assists with patient registration and scheduling
- Patient — Owns medical records, approves or rejects data sharing requests

---

# Core Features

## Consent-Based Data Sharing
- Doctors can request access to a patient's records held by another doctor
- Patient must approve the request before any data is shared
- Target doctor also provides approval, creating a dual-consent flow
- Shared records are tracked and auditable

## Medical Records Management
- Doctors create and manage patient medical records
- Records include diagnosis, prescription, notes, and attached files
- Soft delete support for records
- Paginated listing with filters by patient and doctor

## Emergency Access
- Doctors can request emergency access to patient records
- Emergency access is time-limited with an expiry timestamp
- Access is logged and flagged for audit review

## Multi-Tenant Architecture
- Each hospital operates as an isolated tenant
- Tenant-level subscription plans (Trialing, Active, Past Due, Canceled, Expired)
- Super Admin manages tenant onboarding and plan assignment

## Authentication & Security
- JWT-based access and refresh token authentication
- Hashed passwords using bcrypt
- OTP verification for sensitive operations
- Account lockout after failed login attempts
- Refresh token rotation and revocation

## Audit Logging
- Every critical action is logged (login, record view, consent approval, emergency access)
- Logs capture user, action type, entity, metadata, and IP address

## Notifications
- In-app, email, and SMS notification support
- Notification preferences configurable per user
- Notification types: Data Request, Consent Update, Emergency Access, System Alert

---

# Tech Stack

## Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Validation | Zod |
| Package Manager | pnpm |

## Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Package Manager | pnpm |

---

# Database Schema Overview

## Core Models
- User — Central identity model with role, tenant association, and security fields
- Patient — Patient profile linked to a User
- Doctor — Doctor profile linked to a User and Hospital
- Receptionist — Staff profile linked to a User and Hospital
- SuperAdmin — Platform administrator profile

## Health Data Models
- MedicalRecord — Diagnosis, prescription, notes per patient-doctor pair
- RecordFile — File attachments linked to medical records
- DataRequest — Cross-doctor record access request
- Consent — Dual-approval record (patient + target doctor) per request
- SharedRecord — Records shared under an approved request
- EmergencyAccess — Time-limited emergency record access

## Platform Models
- Tenant — Hospital tenant entity
- Hospital — Hospital profile linked to a Tenant
- Plan — Subscription plan with pricing and features
- Subscription — Tenant subscription with lifecycle status

## Supporting Models
- AuditLog — Immutable action log per user
- Notification — User notification with type and read status
- NotificationPreference — Per-user notification channel settings
- OTP — One-time password for verification flows
- RefreshToken — Hashed refresh token with revocation support
- EmailTemplate — Hospital-level customizable email templates

---

# Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── src/
│       ├── config/          # Prisma client setup
│       ├── controllers/     # Route handler logic
│       ├── middleware/       # Auth, error handling middleware
│       ├── repository/      # Database access layer
│       ├── routes/          # Express route definitions
│       ├── services/        # Business logic layer
│       ├── socket.io/       # Real-time event handling
│       ├── types/           # TypeScript type definitions
│       ├── utils/           # Helpers (JWT, pagination, response, errors)
│       ├── validation/      # Zod validation schemas
│       ├── workers/         # Background job workers
│       └── app.ts           # Express app setup
│
└── frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── App.tsx
        └── main.tsx
```

---

# Getting Started

## Prerequisites
- Node.js 18+
- PostgreSQL
- pnpm

## Backend Setup

```bash
cd backend
pnpm install
cp .env.example .env
# Fill in DATABASE_URL and JWT secrets in .env
pnpm db:migrate
pnpm dev
```

## Frontend Setup

```bash
cd frontend
pnpm install
cp src/.env.example .env
pnpm dev
```

---

# Environment Variables

## Backend `.env`
| Variable | Description |
|---|---|
| DATABASE_URL | PostgreSQL connection string |
| JWT_ACCESS_SECRET | Secret for signing access tokens |
| JWT_REFRESH_SECRET | Secret for signing refresh tokens |
| PORT | Server port |

---

# API Structure

| Prefix | Description |
|---|---|
| `/api/superadmin` | Super admin operations (tenant, plan management) |
| `/api/tenant` | Hospital tenant operations (staff, patients, records) |

---

# Key Design Decisions

- Dual-consent model ensures neither doctor nor hospital can access patient data unilaterally
- Soft deletes on medical records preserve audit history
- Tenant isolation at the database level via tenantId scoping on all queries
- Refresh token hashing prevents token theft from database compromise
- Emergency access is time-boxed and fully audited to prevent abuse

---

# Business Goals

- Provide hospitals with a compliant, consent-driven health data exchange platform
- Reduce unauthorized access to patient records through enforced consent workflows
- Enable cross-hospital collaboration while keeping patients in control of their data
- Build a scalable multi-tenant SaaS foundation for healthcare providers

---

# License

This project is developed as an academic project for educational purposes.
