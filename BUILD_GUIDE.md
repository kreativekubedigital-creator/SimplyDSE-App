# SimplyDSE Build Guide

This document serves as the architectural and design compass for the SimplyDSE platform. It must be followed strictly by all contributors and AI agents to ensure enterprise-grade quality and consistency.

## Project Vision
SimplyDSE is a scalable, multi-tenant enterprise compliance and DSE assessment platform. The goal is to build a production-grade operational tool, not a marketing website.

---

## 1. Core Platform Overview
- **Product Name:** SimplyDSE
- **Type:** Enterprise SaaS Platform
- **Purpose:** Workplace DSE (Display Screen Equipment) assessment and compliance management.
- **Primary Users:** HR Teams, Compliance Officers, Operations, Health & Safety, Enterprise/Government Organizations.

---

## 2. Architectural Principles
- **Scalability & Maintainability:** Built for long-term growth and easy maintenance.
- **Tenant Isolation:** Critical requirement. Every organization must have isolated data, users, and workflows.
- **Enterprise Security:** Focus on RBAC, audit logging, and secure session handling.
- **Operational Clarity:** High information density without clutter; designed for daily professional use.

---

## 3. Technology Stack
- **Frontend:** Next.js, React, Tailwind CSS, TypeScript, shadcn/ui.
- **Backend:** NestJS, TypeScript.
- **Database:** PostgreSQL with Prisma ORM.
- **Infrastructure:** Redis, BullMQ, Cloudflare-compatible, Wildcard subdomain support.
- **Auth:** Enterprise RBAC (tenant-aware sessions, organization roles).

---

## 4. Multi-Tenant Requirements
The system must be architected as multi-tenant from day one.
- **Wildcard Subdomains:** `tenant.simplydse.com`, `org.simplydse.com`.
- **Data Scoping:** Every major data model must include a `tenant_id`.
- **Isolated Experiences:** Organization-specific dashboards, reports, and branding.

---

## 5. Design & UX Philosophy
**Principle:** Clarity > Creativity.
- **Look & Feel:** Premium, calm, trustworthy, stable. Similar to Linear, Stripe, or Vercel.
- **Animations:** Subtle and purposeful only. Avoid flashy or cinematic effects.
- **Layout:** Balanced whitespace, structured grids, and realistic SaaS proportions.

---

## 6. Dashboard & Workflows
- **Core Components:** Metrics cards, compliance summaries, assessment pipelines, employee tables, risk alerts, audit logs.
- **Performance:** Optimized for fast scanning and operational efficiency.
- **RBAC:** Multi-level permissions (Super Admin, Org Owner, Compliance Officer, Employee, etc.).

---

## 7. Development Philosophy
- Plan architecture before execution.
- Build reusable and composable systems.
- Prioritize production-scale patterns over temporary hacks or "startup-style" shortcuts.
- No WordPress or Firebase-centric architectures.

---

## 8. Final Emotional Tone
SimplyDSE should feel like **trusted operational software** used daily by serious organizations. It should communicate **professionalism, reliability, and calm confidence.**
